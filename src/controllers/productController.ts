import { Request, Response } from 'express';
import { Product } from '../models/Product';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { category } = req.query;
        let filter: any = {};

        if (category && category !== 'all') {
            filter.category = category;
        }

        const products = await Product.find(filter);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера при отриманні товарів', error });
    }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ message: 'Помилка при створенні товару', error });
    }
};