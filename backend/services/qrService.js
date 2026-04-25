const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');

const generateSecureQR = async (visitId) => {
  // Create a payload with visitId and expiry (e.g., valid for 24 hours)
  const payload = {
    visitId,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours from now
  };

  // Sign the payload
  const token = jwt.sign(payload, process.env.QR_SECRET || 'qr_secure_secret');

  // The final string to be encoded in the QR
  const qrData = JSON.stringify({
    visitId,
    token
  });

  // Generate Base64 QR Image
  try {
    const qrImage = await QRCode.toDataURL(qrData);
    return { token, qrImage };
  } catch (error) {
    throw new Error('Failed to generate QR Code');
  }
};

const verifySecureQR = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.QR_SECRET || 'qr_secure_secret');
    return decoded; // returns { visitId, exp, iat }
  } catch (error) {
    return null; // Token is invalid or expired
  }
};

module.exports = { generateSecureQR, verifySecureQR };
