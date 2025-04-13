require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3033,
  mongoURI: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  aesKey: process.env.AES_KEY,
  aesIv: process.env.AES_IV
};
