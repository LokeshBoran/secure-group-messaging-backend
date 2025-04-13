const { body, validationResult } = require('express-validator');

/**
 * Validation rules for user registration.
 */
const validateRegistration = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

/**
 * Validation rules for user login.
 */
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .exists()
    .withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

/**
 * Validation rules for group creation.
 */
const validateGroupCreation = [
  body('name')
    .notEmpty()
    .withMessage('Group name is required'),
  body('type')
    .isIn(['open', 'private'])
    .withMessage('Group type must be either open or private'),
  body('maxMembers')
    .isInt({ min: 2 })
    .withMessage('Maximum members must be an integer of at least 2'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateGroupCreation
};
