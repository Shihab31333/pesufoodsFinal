export function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  const status = error.status || (error.name === 'ValidationError' ? 400 : 500);
  const message = status === 500 ? 'Something went wrong on the server' : error.message;
  if (status === 500) console.error(error);
  res.status(status).json({ success: false, message });
}
