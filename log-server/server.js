const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Setup
const dbPath = path.resolve(__dirname, 'logs.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        createTable();
    }
});

function createTable() {
    db.run(`CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        action_type TEXT NOT NULL,
        details TEXT,
        username TEXT,
        status TEXT,
        user_agent TEXT
    )`, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Logs table ready.');
        }
    });
}

// Routes

// GET /api/logs - Retrieve logs with filters
app.get('/api/logs', (req, res) => {
    const { action_type, status, limit = 100 } = req.query;

    let query = 'SELECT * FROM logs';
    const params = [];
    const conditions = [];

    if (action_type && action_type !== 'all') {
        conditions.push('action_type = ?');
        params.push(action_type);
    }

    if (status && status !== 'all') {
        conditions.push('status = ?');
        params.push(status);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(limit);

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            data: rows
        });
    });
});

// POST /api/logs - Create a new log
app.post('/api/logs', (req, res) => {
    const { action_type, details, username, status, user_agent } = req.body;

    if (!action_type) {
        return res.status(400).json({ error: 'action_type is required' });
    }

    const sql = `INSERT INTO logs (action_type, details, username, status, user_agent) VALUES (?, ?, ?, ?, ?)`;
    const params = [
        action_type,
        typeof details === 'object' ? JSON.stringify(details) : details,
        username || 'Anonymous',
        status || 'info',
        user_agent || ''
    ];

    db.run(sql, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'Log entry created',
            id: this.lastID
        });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Log server running on http://localhost:${PORT}`);
});
