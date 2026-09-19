const db = require('./backend/db');
db.get('SELECT * FROM requests ORDER BY id DESC LIMIT 5', (err, rows) => {
    if (err) console.error(err);
    else console.log(rows);
    process.exit(0);
});
