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
