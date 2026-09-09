import { Product } from '../models/Product';

export class MenuService {
  static async getAllItems() {
    return await Product.find();
  }

  static async getItemById(id: string) {
    return await Product.findById(id);
  }

  static async createItem(data: any) {
    const product = new Product(data);
    return await product.save();
  }
}