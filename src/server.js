import express from 'express'
import https from 'https'
import http from 'http'
import fs from 'fs'
import path, {dirname} from 'path' 
import {fileURLToPath} from 'url'

// Middleware imports
import corsMiddleware from './middleware/corsMiddleware.js'
import securityMiddleware from './middleware/securityMiddleware.js'
import { generalLimiter, authLimiter } from './middleware/rateLimitMiddleware.js'
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js'
import authMiddleware from './middleware/authMiddleware.js'
import { requireEmailVerification, requireFullVerification } from './middleware/verificationMiddleware.js'

// Route imports
import authRoutes from './routes/auth.js'
import profileRoutes from './routes/profile.js'
import petsRoutes from './routes/pets.js'
import dietRoutes from './routes/diet.js'
import activityRoutes from './routes/activity.js'
import petScheduleRoutes from './routes/petSchedule.js' 
import scheduleDashboardRoutes from './routes/scheduleDashboard.js'
import servicesRoutes from './routes/services.js'
import bookingsRoutes from './routes/bookings.js'
import reviewsRoutes from './routes/reviews.js'
import reportsRoutes from './routes/reports.js'

const app = express() ; 
const HTTP_PORT = process.env.PORT || 8383 ;
const HTTPS_PORT = process.env.HTTPS_PORT || 8443 ;
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log(`🚀 Starting Pet Care Service Server (${NODE_ENV})`) ; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// SSL Configuration - Using self-signed certificates (temporary)
console.log('🔐 Loading self-signed SSL certificates (temporary configuration)');

const sslDir = path.join(__dirname, '../ssl');
const sslKeyPath = path.join(sslDir, 'server.key');
const sslCertPath = path.join(sslDir, 'server.cert');

let httpsOptions = null;

try {
    // Verify self-signed certificate files exist
    if (!fs.existsSync(sslKeyPath)) {
        throw new Error(`SSL private key not found at: ${sslKeyPath}`);
    }
    if (!fs.existsSync(sslCertPath)) {
        throw new Error(`SSL certificate not found at: ${sslCertPath}`);
    }

    httpsOptions = {
        key: fs.readFileSync(sslKeyPath),
        cert: fs.readFileSync(sslCertPath)
    };
    

} catch (error) {
    console.error('Failed to load self-signed SSL certificates:', error.message);
    console.log('\n To generate self-signed certificates, run:');
    console.log('   chmod +x generate_ssl.sh');
    console.log('   ./generate_ssl.sh');
    console.log('\n Files should be located at:');
    console.log(`   Key: ${sslKeyPath}`);
    console.log(`   Cert: ${sslCertPath}`);
    process.exit(1);
}

// Security middleware (should be first)
app.use(securityMiddleware);
app.use(corsMiddleware);
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use(express.static(path.join(__dirname, '../public')));

// Force HTTPS in production
if (NODE_ENV === 'production' && httpsOptions) {
    app.use((req, res, next) => {
        if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
            return res.redirect(301, `https://${req.get('host')}${req.url}`);
        }
        next();
    });
}

// API Routes with specific rate limiting for auth routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/profile', authMiddleware, requireEmailVerification, profileRoutes);
app.use('/api/pets', authMiddleware, requireFullVerification, petsRoutes);
app.use('/api/diet', authMiddleware, requireFullVerification, dietRoutes);
app.use('/api/activity', authMiddleware, requireFullVerification, activityRoutes);
app.use('/api/pet-schedule', authMiddleware, requireFullVerification, petScheduleRoutes);
app.use('/api/schedule', scheduleDashboardRoutes);  // Schedule dashboard with embedded auth
app.use('/api/services', servicesRoutes);  // Public access for browsing services
app.use('/api/bookings', authMiddleware, requireFullVerification, bookingsRoutes);  // Requires full verification
app.use('/api/reviews', authMiddleware, requireFullVerification, reviewsRoutes);  // Requires full verification
app.use('/api/reports', authMiddleware, requireFullVerification, reportsRoutes);  // Requires full verification

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Pet Care Service is running',
        secure: req.secure,
        protocol: req.protocol,
        environment: NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware (should be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start HTTPS server only
if (!httpsOptions) {
    console.error(' SSL certificates are required. Server cannot start without HTTPS.');
    process.exit(1);
}

https.createServer(httpsOptions, app).listen(HTTPS_PORT, async () => {
    console.log(`HTTPS Server running on port: ${HTTPS_PORT} (self-signed certificates)`);
    console.log(`Secure API: https://localhost:${HTTPS_PORT}/api`);
    console.log(`Health check: https://localhost:${HTTPS_PORT}/health`);
    console.log(`Browser warning expected with self-signed certificates`);
    console.log(`Access via: https://localhost:${HTTPS_PORT}`);
    console.log(`HTTPS-only mode: No HTTP server running`);
    
    if (NODE_ENV === 'development') {
        console.log('\n💡 Development Tips:');
        console.log('   • Accept browser security warning for self-signed certs');
        console.log('   • Use "Advanced" → "Proceed to localhost" in browsers');
        console.log('   • Add certificate exception for testing');
    }
});
