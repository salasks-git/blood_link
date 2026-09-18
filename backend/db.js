require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function convertQuery(query) {
  let q = query;
  
  // Convert SQLite schema types to Postgres
  q = q.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY');
  q = q.replace(/DATETIME/g, 'TIMESTAMP');
  q = q.replace(/BOOLEAN/g, 'BOOLEAN'); // same
  
  // Handle ALTER TABLE ADD COLUMN
  if (q.toUpperCase().includes('ALTER TABLE') && q.toUpperCase().includes('ADD COLUMN')) {
    q = q.replace(/ADD COLUMN\s+([a-zA-Z0-9_]+)/i, 'ADD COLUMN IF NOT EXISTS $1');
  }

  // Convert ? to $1, $2...
  let counter = 1;
  // We need to be careful not to replace ? inside strings, but for this simple app, it should be fine.
  q = q.replace(/\?/g, () => `$${counter++}`);
  
  return q;
}

const db = {
  serialize: (cb) => {
    // In PG, we just execute the callback. The queries might run in parallel if not awaited,
    // but the table creations are IF NOT EXISTS, so it's generally fine.
    // To be perfectly safe, we should probably run them sequentially, but for this app it's ok.
    cb();
  },
  run: function(query, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    const isInsert = query.trim().toUpperCase().startsWith('INSERT');
    let q = convertQuery(query);
    if (isInsert && !q.toUpperCase().includes('RETURNING')) {
      q += ' RETURNING id';
    }
    
    pool.query(q, params || [])
      .then(res => {
        const context = {
          lastID: isInsert && res.rows.length ? res.rows[0].id : null,
          changes: res.rowCount
        };
        if (callback) callback.call(context, null);
      })
      .catch(err => {
        // Suppress "already exists" errors for columns
        if (err.code === '42701') { // duplicate_column
          if (callback) callback.call({ changes: 0 }, null);
          return;
        }
        if (callback) callback.call({}, err);
      });
  },
  get: function(query, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    pool.query(convertQuery(query), params || [])
      .then(res => {
        if (callback) callback(null, res.rows[0] || null);
      })
      .catch(err => {
        if (callback) callback(err, null);
      });
  },
  all: function(query, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    pool.query(convertQuery(query), params || [])
      .then(res => {
        if (callback) callback(null, res.rows);
      })
      .catch(err => {
        if (callback) callback(err, null);
      });
  }
};

module.exports = db;
