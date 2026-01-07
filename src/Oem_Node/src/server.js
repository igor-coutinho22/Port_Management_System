require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const https = require('http');
const fs = require('fs');
const path = require('path');

// Import Routes
const vesselVisitExecutionRoutes = require('./routes/vesselVisitExecutionRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const schedulingRoutes = require('./routes/schedulingRoutes');
const operationPlanRoutes = require('./routes/operationPlanRoutes');
const complementaryTaskRoutes = require('./routes/complementaryTaskRoutes');
const privacyRoutes = require('./routes/privacyPolicyRoutes');
const userRoutes = require('./routes/userRoutes');

// Initialize App
const app = express();
const PORT = process.env.PORT || 6001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// Basic Route
app.get('/', (req, res) => {
    res.send('OEM Node API is running securely on HTTPS...');
});

// Routes
app.use('/api/vesselvisitexecution', vesselVisitExecutionRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/scheduling', schedulingRoutes);

app.use('/api/operationplan', operationPlanRoutes);
app.use('/api/complementarytasks', complementaryTaskRoutes);

app.use('/api/privacy', privacyRoutes);
app.use('/api/user-profiles', userRoutes);

// --- START SERVER (Standard HTTP for VM Deployment) ---

// Replace the https.createServer block with a standard app.listen
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});