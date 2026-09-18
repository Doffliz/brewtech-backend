import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
    title: string;
    category: string;
    basePrice: number;
    description?: string;
    imageUrl?: string;
    options: {
        milk: string[];
        syrups: string[];
    };
}

const productSchema = new Schema<IProduct>({
    title: { type: String, required: true },
    category: { type: String, required: true },
    basePrice: { type: Number, required: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    options: {
        milk: { type: [String], default: ["Стандартне", "Вівсяне", "Мигдалеве"] },
        syrups: { type: [String], default: ["Без сиропу", "Ваніль", "Карамель"] }
    }
});

export const Product = model<IProduct>('Product', productSchema);