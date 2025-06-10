import express from 'express';
import db from './src/Database_sqlite.js';
import authRoutes from './src/routes/auth.js';
import servicesRoutes from './src/routes/services.js';

const app = express();
const PORT = 8383;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for testing
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Pet Care Service API is running' });
});

// Start server
async function startServer() {
    try {
        console.log('🔄 Starting server...');
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log('📋 Available endpoints:');
            console.log('   GET  /health - Health check');
            console.log('   POST /api/auth/login - User login');
            console.log('   GET  /api/services - Public services (approved only)');
            console.log('   POST /api/services/submit - Submit service (provider only)');
            console.log('   GET  /api/services/my-services - Provider dashboard');
            console.log('   GET  /api/services/pending-review - Manager pending services');
            console.log('   POST /api/services/:id/review - Manager approve/reject');
            console.log('   GET  /api/services/review-summary - Manager dashboard');
            console.log('');
            console.log('🔑 Test credentials:');
            console.log('   Provider: provider@test.com / password123');
            console.log('   Manager: manager@test.com / password123');
            console.log('   Pet Owner: testblacklist@example.com / testPassword123');
            console.log('');
            console.log('🧪 Ready for testing!');
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
    }
}

startServer();
