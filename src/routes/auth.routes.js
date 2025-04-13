const express = require("express");
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { register, login } = require("../controllers/auth.controller");

router.post("/register",
    [
        body('email').isEmail().withMessage('Invalid email address'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    register);
router.post("/login", login);

module.exports = router;
