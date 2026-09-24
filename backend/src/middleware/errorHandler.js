import ApiError from '../utils/ApiError.js';

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error.name === 'ValidationError' ? 400 : 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    ...(error.errors?.length > 0 && { errors: error.errors }),
  };

  if (process.env.NODE_ENV === 'development') {
    console.error(`[API Error] ${req.method} ${req.originalUrl}:`, error);
  }

  res.status(error.statusCode).json(response);
};

export default errorHandler;
