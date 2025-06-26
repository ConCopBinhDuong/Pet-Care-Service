import express from 'express'
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
// Force production mode on Render (Render doesn't set NODE_ENV by default)
const NODE_ENV = process.env.NODE_ENV || (process.env.RENDER || process.env.RENDER_SERVICE_ID ? 'production' : 'development');

console.log(`🚀 Starting Pet Care Service Server (${NODE_ENV})`) ; 
console.log(`📍 Port: ${PORT}`);
console.log(`🔍 Render Detection: ${process.env.RENDER_SERVICE_ID ? 'Running on Render' : 'Local environment'}`);
console.log(`🌍 Environment variables loaded:`, {
    DB_HOST: process.env.DB_HOST ? '✅ Set' : '❌ Missing',
    DB_USER: process.env.DB_USER ? '✅ Set' : '❌ Missing', 
    DB_NAME: process.env.DB_NAME ? '✅ Set' : '❌ Missing',
    JWT_SECRET: process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'
}); 

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// HTTP Configuration - HTTP only for development and Render deployment
const isRender = process.env.RENDER_SERVICE_ID || process.env.RENDER;

if (isRender) {
    console.log('🌐 Render deployment: HTTP server (Render load balancer handles HTTPS)');
} else {
    console.log('🌐 Local development: HTTP server');
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


//Dong ma HM keu them
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// Force HTTPS redirect only for Render production (Render handles SSL termination)
if (isRender && NODE_ENV === 'production') {
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

// Start HTTP server for both local development and Render
const server = app.listen(PORT, '0.0.0.0', async () => {
    console.log(`✅ Server successfully started!`);
    console.log(`🌐 Running on port: ${PORT} (HTTP)`);
    console.log(`📍 Environment: ${NODE_ENV}`);
    
    if (isRender) {
        console.log('� HTTPS handled by Render load balancer');
        console.log('� Server bound to 0.0.0.0 for Render compatibility');
        console.log(`🔗 Public URL: https://your-app-name.onrender.com`);
    } else {
        console.log(`🔗 Local URL: http://localhost:${PORT}`);
        console.log(`🔗 Health check: http://localhost:${PORT}/health`);
        console.log(`🔗 Debug info: http://localhost:${PORT}/debug`);
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
