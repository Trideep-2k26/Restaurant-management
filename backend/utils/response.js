
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const sendError = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors })
  });
};

const sendValidationError = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors
  });
};

const sendNotFound = (res, message = 'Resource not found') => {
  return res.status(404).json({
    success: false,
    message
  });
};

const sendUnauthorized = (res, message = 'Unauthorized') => {
  return res.status(401).json({
    success: false,
    message
  });
};

const sendForbidden = (res, message = 'Forbidden') => {
  return res.status(403).json({
    success: false,
    message
  });
};

const sendCreated = (res, data, message = 'Created successfully') => {
  return res.status(201).json({
    success: true,
    message,
    data
  });
};

const sendPaginated = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendCreated,
  sendPaginated
};