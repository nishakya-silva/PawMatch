// Server restarted after email config update
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('--- Environment Check ---');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'NOT SET (using default)');
console.log('-------------------------');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api', apiRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('PawMatch Backend is running');
});

// 404 Handler
app.use((req, res) => {
    console.log(`404 - Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Route not found', path: req.url });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Fatal Error:', err);
    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        details: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
