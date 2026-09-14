import { Order } from '../models/Order';

export class OrderService {
  static async getAllOrders() {
    return await Order.find().populate('items.productId');
  }

  static async createOrder(data: any) {
    const order = new Order(data);
    return await order.save();
  }

  static async updateOrderStatus(id: string, status: string) {
    return await Order.findByIdAndUpdate(id, { status }, { new: true });
  }
}