import { Router, Request, Response } from 'express';
import { Product } from '../models/Product';

const router = Router();

// Отримати всі позиції меню
router.get('/', async (_req: Request, res: Response) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Не вдалося отримати меню' });
  }
});

// Додати нову позицію в меню
router.post('/', async (req: Request, res: Response) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: 'Помилка створення позиції меню' });
  }
});

export default router;