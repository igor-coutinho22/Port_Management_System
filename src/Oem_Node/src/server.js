require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const https = require('https');
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

// --- START SERVER (HTTPS) ---

// 4. Load the Certificate Files
// Adjust the path string if you didn't move them to src/config/
const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'config', 'localhost-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'config', 'localhost.pem'))
};

// 5. Create HTTPS Server instead of app.listen
https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`🚀 Secure Server running on https://localhost:${PORT}`);
});