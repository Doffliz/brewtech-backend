import express from 'express';
import cors from 'cors';
import path from 'path';
import connectDB from './config/db';
import menuRoutes from './routes/menu';
import orderRoutes from './routes/orders';

const app = express();


connectDB();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(process.cwd(), 'public')));

app.use('/api/v1/menu', menuRoutes);
app.use('/api/v1/orders', orderRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});