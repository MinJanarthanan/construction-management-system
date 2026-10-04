const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0].msg;
    return res.status(400).json({
      error: firstError,
      details: errors.array()
    });
  }
  next();
};

module.exports = {
  validateRequest
};
