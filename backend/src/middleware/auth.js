const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ pesan: 'Belum login. Masuk dulu yuk 😺' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = payload; // { id, email, nama, tier }
    next();
  } catch {
    return res.status(401).json({ pesan: 'Sesi habis. Silakan masuk lagi ya.' });
  }
}

module.exports = { authRequired };
