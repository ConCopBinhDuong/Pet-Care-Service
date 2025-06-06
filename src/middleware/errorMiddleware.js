// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation Error', 
      details: err.message 
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      message: 'Invalid token' 
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      message: 'Token expired' 
    });
  }
  
  // Database errors
  if (err.message && err.message.includes('UNIQUE constraint failed')) {
    return res.status(409).json({ 
      message: 'Resource already exists' 
    });
  }
  
  // Rate limiting errors
  if (err.status === 429) {
    return res.status(429).json({
      message: 'Too many requests, please try again later'
    });
  }
  
  // Default server error
  res.status(500).json({ 
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
};

// 404 handler for undefined routes
export const notFoundHandler = (req, res) => {
  res.status(404).json({ 
    message: `Route ${req.originalUrl} not found` 
  });
};
