import { Request, Response } from 'express';
import { MenuService } from '../services/menu.service';

export class MenuController {
  static async getAll(req: Request, res: Response) {
    try {
      const items = await MenuService.getAllItems();
      return res.status(200).json(items);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const item = await MenuService.getItemById(req.params.id);
      if (!item) return res.status(404).json({ error: 'Позицію не знайдено' });
      return res.status(200).json(item);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const newItem = await MenuService.createItem(req.body);
      return res.status(201).json(newItem);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}