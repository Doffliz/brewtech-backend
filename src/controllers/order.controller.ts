import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { validateOrderData } from '../schemas/order.schema';

export class OrderController {
  static async getAll(req: Request, res: Response) {
    try {
      const orders = await OrderService.getAllOrders();
      return res.status(200).json(orders);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const errors = validateOrderData(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const newOrder = await OrderService.createOrder(req.body);
      return res.status(201).json(newOrder);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const updatedOrder = await OrderService.updateOrderStatus(req.params.id, req.body.status);
      if (!updatedOrder) return res.status(404).json({ error: 'Замовлення не знайдено' });
      return res.status(200).json(updatedOrder);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}