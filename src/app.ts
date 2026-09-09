import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import menuRouter from './routes/menu';
import ordersRouter from './routes/orders';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Підключення бази даних
connectDB();

// Маршрути REST API
app.use('/api/v1/menu', menuRouter);
app.use('/api/v1/orders', ordersRouter);

// Базовий тестовий ендпоїнт
app.get('/', (_req, res) => {
  res.send('BrewTech System API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});