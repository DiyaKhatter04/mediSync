const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/logs',      require('./routes/logs'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/followups', require('./routes/followups'));

app.get('/', (req, res) => res.json({ message: 'MediSync API running' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    require('./utils/reminderCron');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB failed:', err.message);
    process.exit(1);
  });