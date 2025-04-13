const crypto = require("crypto");
const { aesKey, aesIv } = require("../config/config");

/**
 * Encrypts a message using AES-128 encryption in CBC mode.
 * 
 * @param {string} message - The plaintext message to encrypt.
 * @returns {string} The encrypted message in hexadecimal format.
 */
const encryptMessage = (message) => {
  try {
  // Create a new cipher using AES-128-CBC algorithm with the specified key and IV
  const cipher = crypto.createCipheriv("aes-128-cbc", Buffer.from(aesKey, "utf8"), Buffer.from(aesIv, "utf8"));
  
  // Encrypt the message and convert the output to hexadecimal format
  let encrypted = cipher.update(message, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  // Return the encrypted message
  return encrypted;
  }
  catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Encryption failed");
  }
};

/**
 * Decrypts an encrypted message using AES-128 decryption in CBC mode.
 * 
 * @param {string} encryptedMessage - The encrypted message in hexadecimal format.
 * @returns {string} The decrypted plaintext message.
 */
const decryptMessage = (encryptedMessage) => {
  try {
  // Create a new decipher using AES-128-CBC algorithm with the specified key and IV
  const decipher = crypto.createDecipheriv("aes-128-cbc", Buffer.from(aesKey, "utf8"), Buffer.from(aesIv, "utf8"));
  
  // Decrypt the message and convert the output to UTF-8 format
  let decrypted = decipher.update(encryptedMessage, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  // Return the decrypted message
  return decrypted;
  }
  catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Decryption failed");
  }
};

module.exports = { encryptMessage, decryptMessage };
