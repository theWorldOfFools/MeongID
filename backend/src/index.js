require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const pool = require('./config/db');
const { DIR_UPLOAD } = require('./middleware/upload');

const authRoutes = require('./routes/auth');
const petRoutes = require('./routes/pets');
const reminderRoutes = require('./routes/reminders');
const expenseRoutes = require('./routes/expenses');
const dashboardRoutes = require('./routes/dashboard');
const passportRoutes = require('./routes/passport');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Foto hewan & galeri (volume uploads).
app.use('/uploads', express.static(DIR_UPLOAD, { maxAge: '7d' }));

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'sehat', aplikasi: 'MeongID' });
  } catch (e) {
    res.status(500).json({ status: 'db-terputus', pesan: e.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/passport', passportRoutes);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[api]', err);
  res.status(500).json({ pesan: 'Terjadi kesalahan di server.' });
});

const PORT = process.env.PORT || 3001;
if (require.main === module) {
  app.listen(PORT, () => console.log(`[MeongID] backend jalan di :${PORT}`));
}

module.exports = app;
