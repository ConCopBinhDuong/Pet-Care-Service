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
import notificationsRoutes from './routes/notifications.js'
import chatRoutes from './routes/chat.js'
import ticketsRoutes from './routes/ticket.js'

// Service imports
import notificationScheduler from './services/notificationScheduler.js'
import { testConnection } from './db.js'

const app = express() ; 
const PORT = process.env.PORT || 10000;  // Render uses PORT env var
const NODE_ENV = process.env.NODE_ENV || 'production';  // Default to production for Render

console.log(`🚀 Starting Pet Care Service Server (${NODE_ENV})`) ; 
console.log(`📍 Port: ${PORT}`);
console.log(`🌍 Environment variables loaded:`, {
    DB_HOST: process.env.DB_HOST ? '✅ Set' : '❌ Missing',
    DB_USER: process.env.DB_USER ? '✅ Set' : '❌ Missing', 
    DB_NAME: process.env.DB_NAME ? '✅ Set' : '❌ Missing',
    JWT_SECRET: process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'
}); 

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// SSL Configuration - Skip for Render (handles HTTPS at load balancer)
let useHTTPS = false;
let httpsOptions = null;

if (NODE_ENV === 'development') {
    console.log('🔐 Loading self-signed SSL certificates (development only)');
    
    const sslDir = path.join(__dirname, '../ssl');
    const sslKeyPath = path.join(sslDir, 'server.key');
    const sslCertPath = path.join(sslDir, 'server.cert');
    
    try {
        // Verify self-signed certificate files exist
        if (fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
            httpsOptions = {
                key: fs.readFileSync(sslKeyPath),
                cert: fs.readFileSync(sslCertPath)
            };
            useHTTPS = true;
        } else {
            console.log('📝 SSL certificates not found - running HTTP in development');
        }
    } catch (error) {
        console.log('📝 SSL certificates not available - running HTTP in development');
    }
} else {
    console.log('🌐 Production mode: HTTP server (Render handles HTTPS)');
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

// Force HTTPS redirect for production (Render handles HTTPS)
if (NODE_ENV === 'production') {
    app.use((req, res, next) => {
        // Render sets x-forwarded-proto header
        if (req.get('x-forwarded-proto') !== 'https') {
            return res.redirect(301, `https://${req.get('host')}${req.url}`);
        }
        next();
    });
}

// API Routes with specific rate limiting for auth routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/profile', authMiddleware,  profileRoutes);
app.use('/api/pets', authMiddleware,  petsRoutes);
app.use('/api/diet', authMiddleware,  dietRoutes);
app.use('/api/activity', authMiddleware,  activityRoutes);
app.use('/api/pet-schedule', authMiddleware,  petScheduleRoutes);
app.use('/api/schedule', scheduleDashboardRoutes);  // Schedule dashboard with embedded auth
app.use('/api/services', servicesRoutes);  // Public access for browsing services
app.use('/api/bookings', authMiddleware,  bookingsRoutes);  // Requires full verification
app.use('/api/reviews', authMiddleware,  reviewsRoutes);  // Requires full verification
app.use('/api/reports', authMiddleware, reportsRoutes);  // Requires full verification
app.use('/api/notifications', notificationsRoutes);  // Notification management
app.use('/api/chat', authMiddleware, chatRoutes);  // Chat between pet owners and service providers
app.use('/api/ticket', authMiddleware,  ticketsRoutes);  // Ticket management for support

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        
        res.status(dbConnected ? 200 : 503).json({
            success: true,
            message: 'Pet Care Service is running',
            secure: req.secure,
            protocol: req.protocol,
            environment: NODE_ENV,
            database: dbConnected ? 'connected' : 'disconnected',
            port: PORT,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            message: 'Health check failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Debug endpoint for troubleshooting Render deployment
app.get('/debug', (req, res) => {
    res.json({
        success: true,
        message: 'Debug information',
        environment: {
            NODE_ENV: process.env.NODE_ENV,
            PORT: process.env.PORT,
            DB_HOST: process.env.DB_HOST ? 'Set' : 'Missing',
            DB_USER: process.env.DB_USER ? 'Set' : 'Missing',
            DB_NAME: process.env.DB_NAME ? 'Set' : 'Missing',
            JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Missing'
        },
        server: {
            port: PORT,
            nodeEnv: NODE_ENV,
            platform: process.platform,
            nodeVersion: process.version
        },
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware (should be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server (HTTPS in development, HTTP in production via Render)
if (useHTTPS && httpsOptions && NODE_ENV === 'development') {
    // Development with HTTPS
    https.createServer(httpsOptions, app).listen(PORT, async () => {
        console.log(`HTTPS Server running on port: ${PORT} (development)`);
        console.log(`Secure API: https://localhost:${PORT}/api`);
        console.log(`Health check: https://localhost:${PORT}/health`);
        console.log(`Browser warning expected with self-signed certificates`);
        
        // Start notification scheduler
        console.log('🔔 Starting notification scheduler...');
        try {
            notificationScheduler.start();
        } catch (error) {
            console.error('⚠️ Notification scheduler failed to start:', error.message);
        }
        
        console.log('\n💡 Development Tips:');
        console.log('   • Accept browser security warning for self-signed certs');
        console.log('   • Use "Advanced" → "Proceed to localhost" in browsers');
        console.log('   • Add certificate exception for testing');
    });
} else {
    // Production HTTP (Render handles HTTPS) - Always bind to 0.0.0.0
    const server = app.listen(PORT, '0.0.0.0', async () => {
        console.log(`✅ Server successfully started!`);
        console.log(`🌐 Running on port: ${PORT}`);
        console.log(`📍 Environment: ${NODE_ENV}`);
        console.log(`🔗 Health check: /health`);
        
        if (NODE_ENV === 'production') {
            console.log('🔒 HTTPS handled by Render load balancer');
        }
        
        // Test database connection
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ Database connection failed - server may not work properly');
            // Don't exit in production, let the server try to handle requests
        }
        
        // Start notification scheduler with error handling
        console.log('🔔 Starting notification scheduler...');
        try {
            notificationScheduler.start();
            console.log('✅ Notification scheduler started successfully');
        } catch (error) {
            console.error('⚠️ Notification scheduler failed to start:', error.message);
            // Don't crash the server if scheduler fails
        }
        
        console.log('🎉 Server ready to accept connections!');
    });

    // Handle server errors
    server.on('error', (error) => {
        console.error('❌ Server error:', error);
        if (error.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use`);
        }
        process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('📴 Received SIGTERM, shutting down gracefully');
        server.close(() => {
            console.log('✅ Server closed');
            process.exit(0);
        });
    });
}

// Global error handlers to prevent crashes
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    // Don't exit in production - let the process continue
    if (NODE_ENV !== 'production') {
        process.exit(1);
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit in production - let the process continue
    if (NODE_ENV !== 'production') {
        process.exit(1);
    }
});


// app.listen(HTTP_PORT, '0.0.0.0', async () => {
//     console.log(`✅ Server running on http://0.0.0.0:${PORT}`);

//     // Start notification scheduler
//     console.log('🔔 Starting notification scheduler...');
//     notificationScheduler.start();
// });
