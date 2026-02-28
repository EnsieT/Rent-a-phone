import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import './db'; // initializes DB on startup
import authRoutes from './routes/auth';
import phonesRoutes from './routes/phones';
import rentalsRoutes from './routes/rentals';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/phones', phonesRoutes);
app.use('/api/rentals', rentalsRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
