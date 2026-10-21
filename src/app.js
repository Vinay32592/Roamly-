const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const apiRoutes = require('./routes');
const { errorHandler } = require('./middleware');

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static frontend assets
app.use(express.static(path.join(__dirname, '..', 'public')));

// Mount unified API routes
app.use('/api', apiRoutes);

// Page routes
const pages = ['explore', 'destination', 'login', 'register', 'write-review', 'profile', 'admin'];
pages.forEach(page => {
  app.get(`/${page}`, (req, res) => res.sendFile(path.join(__dirname, '..', 'public', `${page}.html`)));
  app.get(`/${page}.html`, (req, res) => res.sendFile(path.join(__dirname, '..', 'public', `${page}.html`)));
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));

// 404 for API endpoints
app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'API endpoint not found.' }));

// 404 for frontend pages
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html')));

// Global error handler
app.use(errorHandler);

module.exports = app;
