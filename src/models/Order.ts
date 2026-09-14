import { Schema, model, Document } from 'mongoose';

export interface IOrderItem {
  productId: Schema.Types.ObjectId;
  title?: string;
  milk: string;
  syrup: string;
  quantity: number;
}

export interface IOrder extends Document {
  customerName: string;
  phone: string;
  pickupTime: string;
  items: IOrderItem[];
  totalPrice: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  createdAt: Date;
}

const orderSchema = new Schema<IOrder>({
  customerName: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  pickupTime: { type: String, required: true },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String },
    milk: { type: String, default: 'Стандартне' },
    syrup: { type: String, default: 'Без сиропу' },
    quantity: { type: Number, required: true, min: 1 }
  }],
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'completed'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

export const Order = model<IOrder>('Order', orderSchema);