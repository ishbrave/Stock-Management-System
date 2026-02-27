const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 5000;
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();

//Middlewares
console.log('Setting up CORS...');
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

//API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    status: err.status || 500
  });
});

// 404 handler
app.use((req, res) => {
  console.warn(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ message: 'Route not found' });
});

//MongoDB connection
console.log('Connecting to MongoDB at:', process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
    .then(async () =>{
         console.log('✓ MongoDB connected successfully');
    app.listen(PORT, () => {
        console.log(`✓ Server running on port ${PORT}`);
        console.log(`✓ API available at http://localhost:${PORT}/api`);
    });
    })
    .catch(err => {
        console.error('✗ Could not connect to MongoDB:', err.message);
        process.exit(1);
    });

    