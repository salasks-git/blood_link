const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware — allow frontend origin (set FRONTEND_URL env var in production)
const allowedOrigins = [
  'https://blood-link-ten-lilac.vercel.app',  // production
  'http://localhost:5173',                      // dev: user frontend
  'http://localhost:5174',                      // dev: hospital frontend
];
if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use('/admin', express.static(path.join(__dirname, '../admin')));

const db = require('./db');
console.log('Connected to the PostgreSQL database.');
// Initialize tables here
db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                phone TEXT UNIQUE,
                password TEXT,
                name TEXT,
                role TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Add locality column if not exists (sqlite ALTER TABLE syntax for simplicity)
            // But we'll just redefine it with IF NOT EXISTS. If it already exists, sqlite won't complain.
            // Actually, we'll try to alter table to add locality safely.

            db.run(`CREATE TABLE IF NOT EXISTS requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER,
                patientName TEXT,
                bloodGroup TEXT,
                units INTEGER,
                urgency TEXT,
                hospital TEXT,
                locality TEXT,
                status TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(userId) REFERENCES users(id)
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS donors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER,
                name TEXT,
                phone TEXT,
                bloodGroup TEXT,
                radius INTEGER,
                available BOOLEAN,
                locality TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(userId) REFERENCES users(id)
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS user_locations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER,
                latitude DECIMAL(10, 8) NOT NULL,
                longitude DECIMAL(11, 8) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(userId) REFERENCES users(id)
            )`);

            // Hospital staff table for real authentication
            db.run(`CREATE TABLE IF NOT EXISTS hospital_staff (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                hospitalId TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                hospitalName TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'hospital_admin',
                locality TEXT,
                latitude DECIMAL(10,8),
                longitude DECIMAL(11,8),
                status TEXT DEFAULT 'pending',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Attempt to add locality columns in case tables already exist without them
            db.run(`ALTER TABLE requests ADD COLUMN locality TEXT`, () => { });
            db.run(`ALTER TABLE requests ADD COLUMN patientName TEXT`, () => { });
            db.run(`ALTER TABLE requests ADD COLUMN latitude REAL`, () => { });
            db.run(`ALTER TABLE requests ADD COLUMN longitude REAL`, () => { });
            db.run(`ALTER TABLE requests ADD COLUMN donorId INTEGER`, () => { }); // tracks which donor accepted
            db.run(`ALTER TABLE donors ADD COLUMN locality TEXT`, () => { });
            db.run(`ALTER TABLE hospital_staff ADD COLUMN locality TEXT`, () => { });
            db.run(`ALTER TABLE users ADD COLUMN password TEXT`, () => { });
            db.run(`ALTER TABLE hospital_staff ADD COLUMN status TEXT DEFAULT 'pending'`, (err) => {
                // If the column was just added successfully (or already existed), let's ensure existing accounts get approved
                // Wait, running this every time might approve accounts that are actually pending.
                // We'll just run it once.
            });
        });


// Basic route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'LifeLink Backend API is running' });
});

// Auth / Signup (Donor)
app.post('/api/auth/signup', async (req, res) => {
    const { phone, name, password, role } = req.body;

    if (!phone || !/^\d{10}$/.test(phone)) {
        return res.status(400).json({ error: 'Please provide a valid 10-digit mobile number' });
    }
    if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(`INSERT INTO users (phone, name, password, role) VALUES (?, ?, ?, ?)`,
            [phone, name, hashedPassword, role],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Phone number already registered. Please login.' });
                    }
                    return res.status(500).json({ error: err.message });
                }
                res.json({ id: this.lastID, phone, name, role });
            }
        );
    } catch (err) {
        res.status(500).json({ error: 'Failed to hash password' });
    }
});

// Auth / Login (Donor)
app.post('/api/auth/login', async (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        return res.status(400).json({ error: 'Please provide phone and password' });
    }

    db.get(`SELECT * FROM users WHERE phone = ?`, [phone], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Invalid phone number or password' });

        if (user.password) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ error: 'Invalid phone number or password' });
        } else {
            // Backward compatibility
            if (password !== 'default') return res.status(401).json({ error: 'Invalid phone number or password' });
        }

        res.json({ id: user.id, phone: user.phone, name: user.name, role: user.role });
    });
});

// Admin endpoints
app.get('/api/admin/hospitals', (req, res) => {
    db.all(`SELECT id, hospitalId, hospitalName, role, locality, status, createdAt FROM hospital_staff WHERE role != 'system_admin'`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.patch('/api/admin/hospitals/:id/approve', (req, res) => {
    const id = req.params.id;
    db.run(`UPDATE hospital_staff SET status = 'approved' WHERE id = ?`, [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Hospital not found' });
        res.json({ message: 'Hospital approved successfully' });
    });
});

app.get('/api/admin/users', (req, res) => {
    db.all(`SELECT id, name, phone, role, createdAt FROM users`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/admin/requests', (req, res) => {
    db.all(`
        SELECT requests.*, users.name AS requesterName, users.phone AS requesterPhone 
        FROM requests 
        LEFT JOIN users ON requests.userId = users.id 
        ORDER BY requests.createdAt DESC
    `, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Update User Role
app.patch('/api/users/:id/role', (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    db.run(
        `UPDATE users SET role = ? WHERE id = ?`,
        [role, id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, role });
        }
    );
});

// Create Donor
app.post('/api/donors', (req, res) => {
    const { userId, bloodGroup, radius, available } = req.body;
    db.run(
        `INSERT INTO donors (userId, bloodGroup, radius, available) VALUES (?, ?, ?, ?)`,
        [userId, bloodGroup, radius, available],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, userId, bloodGroup, radius, available });
        }
    );
});

// Get Donors (optionally filter by bloodGroup)
app.get('/api/donors', (req, res) => {
    const { bloodGroup } = req.query;
    let query = `SELECT donors.*, users.name, users.phone FROM donors JOIN users ON donors.userId = users.id`;
    let params = [];
    if (bloodGroup) {
        query += ` WHERE donors.bloodGroup = ? AND donors.available = 1`;
        params.push(bloodGroup);
    }
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get open requests matching a donor's blood group
app.get('/api/requests/for-donor/:userId', (req, res) => {
    const { userId } = req.params;
    db.get(`SELECT bloodGroup, radius FROM donors WHERE userId = ?`, [userId], (err, donor) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!donor) return res.json({ bloodGroup: null, requests: [] });

        // Get donor's latest location
        db.get(`SELECT latitude, longitude FROM user_locations WHERE userId = ? ORDER BY created_at DESC LIMIT 1`, [userId], (errLoc, loc) => {
            if (errLoc) return res.status(500).json({ error: errLoc.message });

            db.all(
                `SELECT requests.*, users.name AS requesterName, users.phone AS requesterPhone,
                 COALESCE(requests.latitude, hospital_staff.latitude) as hospLat, 
                 COALESCE(requests.longitude, hospital_staff.longitude) as hospLon
                 FROM requests 
                 LEFT JOIN users ON requests.userId = users.id
                 LEFT JOIN hospital_staff ON requests.hospital = hospital_staff.hospitalName
                 WHERE requests.bloodGroup = ? AND requests.status = 'searching'
                 ORDER BY requests.createdAt DESC`,
                [donor.bloodGroup],
                (err2, rows) => {
                    if (err2) return res.status(500).json({ error: err2.message });

                    // Filter rows by distance
                    let filteredRows = rows;
                    if (loc && loc.latitude && loc.longitude) {
                        const radius = donor.radius || 15;
                        filteredRows = rows.filter(r => {
                            if (!r.hospLat || !r.hospLon) return true; // Include if hospital has no location
                            const dist = getDistanceFromLatLonInKm(r.hospLat, r.hospLon, loc.latitude, loc.longitude);
                            return dist <= radius;
                        });
                    }

                    res.json({ bloodGroup: donor.bloodGroup, requests: filteredRows });
                }
            );
        });
    });
});

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = (lat2 - lat1) * (Math.PI / 180);
    var dLon = (lon2 - lon1) * (Math.PI / 180);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}

// Notify matching donors for a request
app.post('/api/requests/:id/notify-donors', (req, res) => {
    const requestId = req.params.id;
    // Get the request and the hospital coordinates
    db.get(`
        SELECT requests.*, 
        COALESCE(requests.latitude, hospital_staff.latitude) as hospLat, 
        COALESCE(requests.longitude, hospital_staff.longitude) as hospLon 
        FROM requests 
        LEFT JOIN hospital_staff ON requests.hospital = hospital_staff.hospitalName
        WHERE requests.id = ?
    `, [requestId], (err, request) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!request) return res.status(404).json({ error: 'Request not found' });

        // Get donors and their latest location
        db.all(
            `SELECT donors.*, users.name, users.phone, 
                (SELECT latitude FROM user_locations WHERE userId = donors.userId ORDER BY created_at DESC LIMIT 1) as lat,
                (SELECT longitude FROM user_locations WHERE userId = donors.userId ORDER BY created_at DESC LIMIT 1) as lon
             FROM donors
             JOIN users ON donors.userId = users.id
             WHERE donors.bloodGroup = ? AND donors.available = 1`,
            [request.bloodGroup],
            (err2, allDonors) => {
                if (err2) return res.status(500).json({ error: err2.message });

                // Filter by distance if hospital has coordinates
                let notifiedDonors = allDonors;
                if (request.hospLat && request.hospLon) {
                    notifiedDonors = allDonors.filter(donor => {
                        if (!donor.lat || !donor.lon) return false; // skip if donor has no location
                        const dist = getDistanceFromLatLonInKm(request.hospLat, request.hospLon, donor.lat, donor.lon);
                        return dist <= (donor.radius || 15); // Default to 15km if not set
                    });
                }

                res.json({
                    requestId,
                    bloodGroup: request.bloodGroup,
                    notifiedCount: notifiedDonors.length,
                    donors: notifiedDonors
                });
            }
        );
    });
});

// Create Request
app.post('/api/requests', (req, res) => {
    const { userId, bloodGroup, units, urgency, hospital, latitude, longitude } = req.body;
    db.run(
        `INSERT INTO requests (userId, bloodGroup, units, urgency, hospital, status, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, bloodGroup, units, urgency, hospital, 'searching', latitude || null, longitude || null],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, userId, bloodGroup, units, urgency, hospital, status: 'searching' });
        }
    );
});

// Get Requests
app.get('/api/requests', (req, res) => {
    const status = req.query.status;
    const userId = req.query.userId;
    let query = `SELECT requests.*, COALESCE(users.name, requests.hospital) as requesterName, users.phone as requesterPhone FROM requests LEFT JOIN users ON requests.userId = users.id WHERE 1=1`;
    let params = [];
    if (status) {
        query += ` AND requests.status = ?`;
        params.push(status);
    }
    if (userId) {
        query += ` AND requests.userId = ?`;
        params.push(userId);
    }
    query += ` ORDER BY requests.createdAt DESC`;

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get Request by ID
app.get('/api/requests/:id', (req, res) => {
    const { id } = req.params;
    db.get(
        `SELECT requests.*, COALESCE(users.name, requests.hospital) as requesterName, users.phone as requesterPhone 
         FROM requests LEFT JOIN users ON requests.userId = users.id 
         WHERE requests.id = ?`,
        [id],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Not found' });
            res.json(row);
        }
    );
});

// Update Request Status (donor side — also saves donorId when accepting)
app.patch('/api/requests/:id', (req, res) => {
    const { status, donorId } = req.body;
    let query = `UPDATE requests SET status = ?`;
    const params = [status];
    if (donorId) {
        query += `, donorId = ?`;
        params.push(donorId);
    }
    query += ` WHERE id = ?`;
    params.push(req.params.id);
    db.run(query, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, changes: this.changes });
    });
});

// API Endpoint to receive GPS data
app.post('/api/location', (req, res) => {
    const { userId, latitude, longitude } = req.body;

    if (!latitude || !longitude) {
        return res.status(400).json({ error: "Missing latitude or longitude" });
    }

    const query = `INSERT INTO user_locations (userId, latitude, longitude) VALUES (?, ?, ?)`;

    db.run(query, [userId || null, latitude, longitude], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Failed to save location" });
        }
        res.status(201).json({ message: "Location saved!", recordId: this.lastID });
    });
});

// Get User Profile
app.get('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Get latest location
        db.get(`SELECT * FROM user_locations WHERE userId = ? ORDER BY created_at DESC LIMIT 1`, [userId], (err, location) => {
            if (err) return res.status(500).json({ error: err.message });

            // Get donor info if donor
            db.get(`SELECT * FROM donors WHERE userId = ?`, [userId], (err, donorInfo) => {
                if (err) return res.status(500).json({ error: err.message });

                // Map PostgreSQL lowercase columns to camelCase for the frontend
                const mappedDonorInfo = donorInfo ? {
                    ...donorInfo,
                    bloodGroup: donorInfo.bloodGroup || donorInfo.bloodgroup,
                    lastDonation: donorInfo.lastDonation || donorInfo.lastdonation
                } : null;

                res.json({
                    ...user,
                    location: location ? { latitude: location.latitude, longitude: location.longitude } : null,
                    donorInfo: mappedDonorInfo
                });
            });
        });
    });
});

// Update User Profile
app.put('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const { name, role, location, donorInfo } = req.body;

    db.serialize(() => {
        // Update user
        if (name || role) {
            db.run(`UPDATE users SET name = COALESCE(?, name), role = COALESCE(?, role) WHERE id = ?`, [name, role, userId], (err) => {
                if (err) console.error(err.message);
            });
        }

        // Update location (insert new record)
        if (location && location.latitude && location.longitude) {
            db.run(`INSERT INTO user_locations (userId, latitude, longitude) VALUES (?, ?, ?)`,
                [userId, location.latitude, location.longitude], (err) => {
                    if (err) console.error(err.message);
                });
        }

        // Update donor info
        if (donorInfo && donorInfo.bloodGroup) {
            db.get(`SELECT * FROM donors WHERE userId = ?`, [userId], (err, existing) => {
                if (existing) {
                    db.run(`UPDATE donors SET bloodGroup = ?, radius = ?, available = ? WHERE userId = ?`,
                        [donorInfo.bloodGroup, donorInfo.radius, donorInfo.available, userId]);
                } else {
                    db.run(`INSERT INTO donors (userId, bloodGroup, radius, available) VALUES (?, ?, ?, ?)`,
                        [userId, donorInfo.bloodGroup, donorInfo.radius, donorInfo.available]);
                }
            });
        }
    });

    res.json({ success: true, message: 'Profile updated' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
// ─── Hospital Endpoints ──────────────────────────────────────────────────────

// Helper to get staff details
const getStaffContext = (hospitalId, callback) => {
    if (!hospitalId) return callback(new Error('Missing hospitalId'));
    db.get(`SELECT * FROM hospital_staff WHERE hospitalId = ?`, [hospitalId], (err, staff) => {
        if (err) return callback(err);
        if (!staff) return callback(new Error('Staff not found'));
        callback(null, staff);
    });
};

// Hospital Auth Signup
app.post('/api/hospital/auth/signup', async (req, res) => {
    const { hospitalId, hospitalName, password, locality } = req.body;

    if (!hospitalId || !hospitalName || !password) {
        return res.status(400).json({ error: 'Hospital ID, Hospital Name, and password are required' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(`INSERT INTO hospital_staff (hospitalId, hospitalName, password, locality) VALUES (?, ?, ?, ?)`,
            [hospitalId, hospitalName, hashedPassword, locality || null],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Hospital ID already taken' });
                    }
                    return res.status(500).json({ error: err.message });
                }
                res.json({ id: this.lastID, hospitalId, hospitalName, locality, role: 'hospital_admin', status: 'pending' });
            }
        );
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Hospital Auth Login
app.post('/api/hospital/auth/login', (req, res) => {
    const { hospitalId, password } = req.body;
    if (!hospitalId || !password) {
        return res.status(400).json({ error: 'Hospital ID and password are required' });
    }
    db.get(`SELECT * FROM hospital_staff WHERE hospitalId = ?`, [hospitalId], async (err, staff) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!staff) return res.status(401).json({ error: 'Invalid credentials' });

        try {
            const isMatch = await bcrypt.compare(password, staff.password);
            if (!isMatch) {
                if (staff.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
            }
        } catch (e) {
            if (staff.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (staff.status === 'pending') {
            return res.status(403).json({ error: 'Account pending admin approval' });
        }

        res.json({ id: staff.id, hospitalName: staff.hospitalName, role: staff.role, hospitalId: staff.hospitalId, locality: staff.locality, latitude: staff.latitude, longitude: staff.longitude, status: staff.status });
    });
});

// Hospital: Set Location
app.put('/api/hospital/location', (req, res) => {
    const { hospitalId, latitude, longitude } = req.body;
    if (!hospitalId || !latitude || !longitude) {
        return res.status(400).json({ error: 'hospitalId, latitude, and longitude are required' });
    }
    db.run(
        `UPDATE hospital_staff SET latitude = ?, longitude = ? WHERE hospitalId = ?`,
        [latitude, longitude, hospitalId],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, changes: this.changes });
        }
    );
});

// Hospital Dashboard Stats (all live from DB)
app.get('/api/hospital/dashboard-stats', (req, res) => {
    const { hospitalId } = req.query;
    getStaffContext(hospitalId, (err, staff) => {
        if (err) return res.status(401).json({ error: err.message });

        let reqQuery = `SELECT COUNT(*) as activeRequests FROM requests WHERE status != 'fulfilled'`;
        let reqArgs = [];
        let donQuery = `SELECT COUNT(*) as totalDonors FROM donors WHERE available = 1`;
        let donArgs = [];
        let critQuery = `SELECT COUNT(*) as criticalUnits FROM donors WHERE (bloodGroup = 'O-' OR bloodGroup = 'O Negative') AND available = 1`;
        let critArgs = [];

        if (staff.role !== 'system_admin' && staff.locality) {
            reqQuery += ` AND locality = ?`; reqArgs.push(staff.locality);
            donQuery += ` AND locality = ?`; donArgs.push(staff.locality);
            critQuery += ` AND locality = ?`; critArgs.push(staff.locality);
        }

        db.get(reqQuery, reqArgs, (err, reqResult) => {
            if (err) return res.status(500).json({ error: err.message });
            db.get(donQuery, donArgs, (err, donorResult) => {
                if (err) return res.status(500).json({ error: err.message });
                db.get(critQuery, critArgs, (err, critResult) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({
                        activeRequests: reqResult.activeRequests || 0,
                        totalDonors: donorResult.totalDonors || 0,
                        criticalReserveUnits: critResult.criticalUnits || 0
                    });
                });
            });
        });
    });
});

// Hospital: Get requests (patientName from both requests table and joined users)
app.get('/api/hospital/requests', (req, res) => {
    const { status, hospitalId } = req.query;
    getStaffContext(hospitalId, (err, staff) => {
        if (err) return res.status(401).json({ error: err.message });

        let query = `SELECT requests.*, 
            COALESCE(requests.patientName, users.name) as patientName
            FROM requests 
            LEFT JOIN users ON requests.userId = users.id WHERE 1=1`;
        const params = [];

        // Filter by this hospital's name — locality is shared across hospitals in a city
        if (staff.role !== 'system_admin') {
            query += ` AND requests.hospital = ?`;
            params.push(staff.hospitalName);
        }
        if (status) {
            query += ` AND requests.status = ?`;
            params.push(status);
        }
        query += ` ORDER BY requests.createdAt DESC LIMIT 50`;

        db.all(query, params, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });
});

// Hospital: Get single request detail + accepting donor info
app.get('/api/hospital/requests/:id/detail', (req, res) => {
    const { id } = req.params;
    db.get(
        `SELECT requests.*,
            COALESCE(requests.patientName, users.name) as patientName,
            donor_user.name  as donorName,
            donor_user.phone as donorPhone,
            donors.bloodGroup as donorBloodGroup
         FROM requests
         LEFT JOIN users ON requests.userId = users.id
         LEFT JOIN users donor_user ON requests.donorId = donor_user.id
         LEFT JOIN donors ON donors.userId = requests.donorId
         WHERE requests.id = ?`,
        [id],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Not found' });
            res.json(row);
        }
    );
});

// Hospital: Create a blood request (stores patientName directly)
app.post('/api/hospital/requests', (req, res) => {
    const { bloodGroup, units, urgency, patientName, hospitalId, latitude, longitude } = req.body;
    if (!bloodGroup || !units || !urgency) {
        return res.status(400).json({ error: 'bloodGroup, units, and urgency are required' });
    }

    getStaffContext(hospitalId, (err, staff) => {
        if (err) return res.status(401).json({ error: err.message });

        const hospital = staff.hospitalName;
        const locality = staff.locality;
        const status = 'searching';

        db.run(
            `INSERT INTO requests (userId, patientName, bloodGroup, units, urgency, hospital, locality, status, latitude, longitude) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [patientName || null, bloodGroup, units, urgency, hospital, locality, status, latitude || null, longitude || null],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: this.lastID, patientName, bloodGroup, units, urgency, hospital, locality, status, latitude, longitude });
            }
        );
    });
});

// Hospital: Update (confirm/fulfill) a specific request
app.patch('/api/hospital/requests/:id', (req, res) => {
    const { status, hospitalId } = req.body;
    const validStatuses = ['searching', 'found', 'confirmed', 'fulfilled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    getStaffContext(hospitalId, (err, staff) => {
        if (err) return res.status(401).json({ error: err.message });

        // A proper system would check if the request belongs to this hospital/locality before updating
        // Skipping for prototype speed
        db.run(
            `UPDATE requests SET status = ? WHERE id = ?`,
            [status, req.params.id],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                if (this.changes === 0) return res.status(404).json({ error: 'Request not found' });
                res.json({ success: true, id: req.params.id, status });
            }
        );
    });
});

// Hospital: Get all donors (for donor records page)
app.get('/api/hospital/donors', (req, res) => {
    const { bloodGroup, available, hospitalId } = req.query;
    getStaffContext(hospitalId, (err, staff) => {
        if (err) return res.status(401).json({ error: err.message });

        let query = `SELECT donors.*, users.name as userName, users.phone as userPhone,
                        (SELECT latitude FROM user_locations WHERE userId = donors.userId ORDER BY created_at DESC LIMIT 1) as lat,
                        (SELECT longitude FROM user_locations WHERE userId = donors.userId ORDER BY created_at DESC LIMIT 1) as lon
                     FROM donors 
                     LEFT JOIN users ON donors.userId = users.id WHERE 1=1`;
        const params = [];

        if (staff.role !== 'system_admin' && (!staff.latitude || !staff.longitude) && staff.locality) {
            query += ` AND donors.locality = ?`;
            params.push(staff.locality);
        }
        if (bloodGroup) {
            query += ` AND donors.bloodGroup = ?`;
            params.push(bloodGroup);
        }
        if (available !== undefined) {
            query += ` AND donors.available = ?`;
            params.push(available === 'true' ? 1 : 0);
        }
        query += ` ORDER BY donors.createdAt DESC`;

        db.all(query, params, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            
            let filteredDonors = rows;
            if (staff.role !== 'system_admin' && staff.latitude && staff.longitude) {
                filteredDonors = rows.filter(donor => {
                    if (!donor.lat || !donor.lon) return false;
                    const dist = getDistanceFromLatLonInKm(staff.latitude, staff.longitude, donor.lat, donor.lon);
                    donor.distanceKm = dist;
                    return dist <= 30;
                });
            }
            res.json(filteredDonors);
        });
    });
});

// Hospital: Register a new donor directly
app.post('/api/hospital/donors', (req, res) => {
    const { name, phone, bloodGroup, radius, available, hospitalId } = req.body;
    if (!name || !bloodGroup) {
        return res.status(400).json({ error: 'name and bloodGroup are required' });
    }

    getStaffContext(hospitalId, (err, staff) => {
        if (err) return res.status(401).json({ error: err.message });

        db.run(
            `INSERT INTO donors (userId, name, phone, bloodGroup, radius, available, locality) VALUES (NULL, ?, ?, ?, ?, ?, ?)`,
            [name, phone || null, bloodGroup, radius || 5, available !== false ? 1 : 0, staff.locality],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: this.lastID, name, phone, bloodGroup, radius, available, locality: staff.locality });
            }
        );
    });
});

