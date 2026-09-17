import { Order } from '../models/Order';

export class OrdersService {
    static async getAllOrders(email?: string) {
        const filter = email ? { email } : {};
        return await Order.find(filter).populate('items.productId');
    }

    static async createOrder(data: any) {
        const order = new Order(data);
        return await order.save();
    }

    static async updateOrderStatus(id: string, status: string) {
        return await Order.findByIdAndUpdate(id, { status }, { new: true });
    }
}