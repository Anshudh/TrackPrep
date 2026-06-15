// Centralized Error Handling Middleware

export const errorHandler = (err, req, res, next) => {
  console.error('SERVER ERROR:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

// Route not found fallback middleware
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route Not Found - ${req.originalUrl}`,
  });
};
