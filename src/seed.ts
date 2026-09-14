import 'dotenv/config';
import connectDB from './config/db';
import { Product } from './models/Product';


const initialDrinks = [
  { title: 'Еспресо', category: 'Кава', basePrice: 40 },
  { title: 'Допіо', category: 'Кава', basePrice: 55 },
  { title: 'Американо', category: 'Кава', basePrice: 45 },
  { title: 'Капучино', category: 'Кава', basePrice: 60 },
  { title: 'Лате', category: 'Кава', basePrice: 65 },
  { title: 'Флет Уайт', category: 'Кава', basePrice: 75 },
  { title: 'Раф Кава', category: 'Авторські', basePrice: 80 },
  { title: 'Матча Лате', category: 'Чай & Матча', basePrice: 85 },
  { title: 'Какао', category: 'Гарячі напої', basePrice: 60 },
  { title: 'Апельсиновий Джміль', category: 'Холодні напої', basePrice: 90 }
];

const seedDB = async () => {
  try {
    await connectDB();
    
    await Product.deleteMany({});
    await Product.insertMany(initialDrinks);
    
    console.log('✅ Товари успішно завантажені в колекцію Product!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Помилка заповнення бази:', error);
    process.exit(1);
  }
};

seedDB();