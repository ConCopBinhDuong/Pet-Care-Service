import express from 'express'
import path, {dirname} from 'path' 
import {fileURLToPath} from 'url'

// Middleware imports
import corsMiddleware from './middleware/corsMiddleware.js'
import securityMiddleware from './middleware/securityMiddleware.js'
import { generalLimiter, authLimiter } from './middleware/rateLimitMiddleware.js'
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js'
import authMiddleware from './middleware/authMiddleware.js'

// Route imports
import authRoutes from './routes/authRoutes.js' 
import todoRoutes from './routes/todoRoutes.js' 
import userAuthRoutes from './routes/userAuth.js' 

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
app.use('/auth', authLimiter, authRoutes);
app.use('/api/users', authLimiter, userAuthRoutes);
app.use('/todos', authMiddleware, todoRoutes);

// Error handling middleware (should be last)
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`server has started on port: ${PORT}`) ; 
}) 
