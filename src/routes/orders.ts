import { Router, Request, Response } from 'express';
import { Order } from '../models/Order';

const router = Router();

// Створити нове замовлення
router.post('/', async (req: Request, res: Response) => {
  try {
    const { customerName, phone, pickupTime, items, totalPrice } = req.body;

    if (!customerName || !phone || !items || items.length === 0) {
      return res.status(400).json({ error: 'Заповніть усі обов’язкові поля' });
    }

    const newOrder = new Order({
      customerName,
      phone,
      pickupTime,
      items,
      totalPrice
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ error: 'Не вдалося оформити замовлення' });
  }
});

// Отримати список усіх замовлень
router.get('/', async (_req: Request, res: Response) => {
  try {
    const orders = await Order.find().populate('items.productId');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Не вдалося отримати список замовлень' });
  }
});

export default router;