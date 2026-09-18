// Hospital endpoints to append to server.js
app.post('/api/hospital/auth/login', (req, res) => {
    const { hospitalId, password } = req.body;
    // Mock login for prototype
    res.json({ id: 1, hospitalName: 'St. Jude Memorial Hospital', role: 'hospital_admin' });
});

app.get('/api/hospital/dashboard-stats', (req, res) => {
    db.get(`SELECT COUNT(*) as activeRequests FROM requests WHERE status != 'fulfilled'`, (err, reqResult) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.get(`SELECT COUNT(*) as totalDonors FROM donors WHERE available = 1`, (err, donorResult) => {
            if (err) return res.status(500).json({ error: err.message });
            
            res.json({
                activeRequests: reqResult.activeRequests || 0,
                totalDonors: donorResult.totalDonors || 0,
                criticalReserveUnits: 18 // Mock
            });
        });
    });
});

app.get('/api/hospital/requests', (req, res) => {
    db.all(`SELECT requests.*, users.name as patientName FROM requests LEFT JOIN users ON requests.userId = users.id ORDER BY requests.createdAt DESC LIMIT 10`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/hospital/requests', (req, res) => {
    const { bloodGroup, units, urgency, patientName } = req.body;
    const hospital = 'St. Jude Memorial Hospital';
    const status = 'searching';
    
    // First ensure patient is in users table if needed, or just insert request
    db.run(
        `INSERT INTO requests (userId, bloodGroup, units, urgency, hospital, status) VALUES (NULL, ?, ?, ?, ?, ?)`,
        [bloodGroup, units, urgency, hospital, status],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, bloodGroup, units, urgency, hospital, status });
        }
    );
});
