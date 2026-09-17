import { Request, Response } from 'express';
import { OrdersService } from '../services/order.service';
import { validateOrderData } from '../schemas/order.schema';

export class OrderController {
    static async getAll(req: Request, res: Response) {
        try {
            const email = req.query.email as string;
            const orders = await OrdersService.getAllOrders(email);
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

            const newOrder = await OrdersService.createOrder(req.body);
            return res.status(201).json(newOrder);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async updateStatus(req: Request, res: Response) {
        try {
            const updatedOrder = await OrdersService.updateOrderStatus(req.params.id, req.body.status);
            if (!updatedOrder) return res.status(404).json({ error: 'Замовлення не знайдено' });
            return res.status(200).json(updatedOrder);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}