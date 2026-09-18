import express from 'express';
import cors from 'cors';
import path from 'path';
import connectDB from './config/db';
import menuRoutes from './routes/menu';
import orderRoutes from './routes/orders';
import { authRoutes } from './routes/auth';
import productRoutes from './routes/productRoutes';

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(process.cwd(), 'public')));

app.use('/api/v1/menu', menuRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});