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
import scheduleRoutes from './routes/schedule.js' 
import servicesRoutes from './routes/services.js'
import bookingsRoutes from './routes/bookings.js'

const app = express() ; 
const PORT = process.env.PORT || 8383 ;
console.log("hello world") ; 




const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Security middleware (should be first)
app.use(securityMiddleware);
app.use(corsMiddleware);
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use(express.static(path.join(__dirname, '../public')));

// API Routes with specific rate limiting for auth routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/profile', authMiddleware, requireEmailVerification, profileRoutes);
app.use('/api/pets', authMiddleware, requireFullVerification, petsRoutes);
app.use('/api/diet', authMiddleware, requireFullVerification, dietRoutes);
app.use('/api/activity', authMiddleware, requireFullVerification, activityRoutes);
app.use('/api/schedule', authMiddleware, requireFullVerification, scheduleRoutes);
app.use('/api/services', servicesRoutes);  // Public access for browsing services
app.use('/api/bookings', authMiddleware, requireFullVerification, bookingsRoutes);  // Requires full verification


// Error handling middleware (should be last)
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`server has started on port: ${PORT}`) ; 
})
