# Secure Group Messaging (Backend)

## Overview

This project is the backend for a secure group messaging system. It supports user authentication, group management (with private and open groups), message encryption using AES-128, and simulated real-time messaging acknowledgments.

## Features

- **User Authentication:**  
  - **Registration:** Create an account using email and password (with email validation and secure password hashing).  
  - **Login:** Obtain a JWT token for accessing protected endpoints.

- **Group Management:**  
  - Create groups with a name, type (open or private), and maximum number of members.  
  - Open groups allow immediate join/leave while private groups require join requests and owner approval.  
  - Additional features include banishment of members, owner role transfer, and deletion of groups under certain conditions.

- **Messaging:**  
  - Send and retrieve messages within a group.  
  - All messages are encrypted using AES-128 before storage and decrypted upon retrieval.  
  - Simulated real-time behavior is provided via timestamped acknowledgments.

- **Security Considerations:**  
  - Sensitive data is securely managed using environment variables.  
  - Input validations, error handling, and secure coding practices have been implemented.

## Setup Instructions

1. **Clone the Repository:**

   ```bash
   git clone git@github.com:LokeshBoran/secure-group-messaging-backend.git
   cd secure-group-messaging-backend

2. ```bash

    npm install
3. **Environment Variables:**

   Create a `.env` file in the root directory and add the following variables:
    - PORT : Port number for the server (default: 3033)
    - MONGODB_URI: MongoDB connection string (default: mongodb://localhost:27017/chatapp)
    - JWT_SECRET: Secret key for JWT token generation
    - AES_KEY: AES encryption key (16 characters)
    - AES_IV: AES initialization vector (16 characters)

4. **Start the Server:**

   ```bash
   npm run dev
5. **API Endpoints:**

   - POST /api/auth/register: Register a new user.
   - POST /api/auth/login: Login a user.

### Features Summary

- User registration & authentication (JWT-based)
- Secure group management (create, join, leave, approve, banish, transfer ownership, delete)
- Encrypted messaging using AES-128
- Real-time messaging via Socket.io
- Input validation (to be further implemented using express-validator or Joi)
- Rate limiting middleware to prevent abuse
- Structured logging using Winston (JSON logging with file/console transports)
- API documentation available via Swagger at `/api-docs`

## Production Enhancements

### Logging and Monitoring

- Uses Winston for structured, JSON-based logging.
- Logs are written both to the console and a file (`logs/app.log`).
- Integrate with external monitoring services (e.g., Sentry) as needed.

### Security

- Input validation and sanitization should be applied to all endpoints.
- Rate limiting middleware is in place.
- Sensitive environment variables (JWT secret, MongoDB URI, AES keys) are managed via environment variables.
- It is recommended to run behind a reverse proxy (such as Nginx) for HTTPS termination and load balancing.

Example Nginx configuration:

```nginx
server {
  listen 443 ssl;
  server_name yourdomain.com;

  ssl_certificate /path/to/certificate.crt;
  ssl_certificate_key /path/to/private.key;

  location / {
    proxy_pass http://localhost:3033;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

---

### Additional Notes

- **Input Validation:**  
  It is recommended to add input validation middleware using [express-validator](https://express-validator.github.io/docs/) or [Joi](https://joi.dev/). For example, in your auth routes you may add:

  ```js
  const { body, validationResult } = require('express-validator');
  
  router.post(
    '/register',

---

## 9. Additional Notes

- **Input Validation:**  
  It is recommended to add input validation middleware using [express-validator](https://express-validator.github.io/docs/) or [Joi](https://joi.dev/). For example, in your auth routes you may add:

  ```js
  const { body, validationResult } = require('express-validator');
  
  router.post(
    '/register',
    [
      body('email').isEmail(),
      body('password').isLength({ min: 6 })
    ],
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
    registerController
  );

    [
      body('email').isEmail(),
      body('password').isLength({ min: 6 })
    ],
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
    registerController
  );
