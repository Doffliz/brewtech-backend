import 'dotenv/config';
import connectDB from './config/db';
import { Product } from './models/Product';

const initialDrinks = [
  { 
    title: 'Еспресо', 
    category: 'Кава', 
    basePrice: 40, 
    description: 'Міцний чорний кавовий напій, основа класичних кавових напоїв.',
    imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=500&q=80'
  },
  { 
    title: 'Допіо', 
    category: 'Кава', 
    basePrice: 55, 
    description: 'Подвійна порція насиченого еспресо для справжніх поціновувачів.',
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=500&q=80'
  },
  { 
    title: 'Американо', 
    category: 'Кава', 
    basePrice: 45, 
    description: 'Еспресо, розбавлене гарячою водою, з м\'якшим та збалансованим смаком.',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80'
  },
  { 
    title: 'Капучино', 
    category: 'Кава', 
    basePrice: 60, 
    description: 'Ідеальний баланс еспресо, гарячого молока та ніжної пишної молочної пінки.',
    imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=500&q=80'
  },
  { 
    title: 'Лате', 
    category: 'Кава', 
    basePrice: 65, 
    description: 'Ніжний шаруватий напій на основі еспресо з великою кількістю гарячого молока.',
    imageUrl: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=500&q=80](https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=500&q=80'
  },
  { 
    title: 'Флет Уайт', 
    category: 'Кава', 
    basePrice: 75, 
    description: 'Подвійна порція еспресо з тонким шаром мікропені, що підкреслює кавовий смак.',
    imageUrl: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=500&q=80'
  },
  { 
    title: 'Раф Кава', 
    category: 'Авторські', 
    basePrice: 80, 
    description: 'Особливий напій з еспресо, вершків та ванільного цукру, збитий до кремової текстури.',
    imageUrl: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=500&q=80'
  },
  { 
    title: 'Матча Лате', 
    category: 'Чай & Матча', 
    basePrice: 85, 
    description: 'Японський зелений чай матча з додаванням гарячого спіненого молока.',
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=500&q=80'
  },
  { 
    title: 'Какао', 
    category: 'Гарячі напої', 
    basePrice: 60, 
    description: 'Густий та зігріваючий шоколадний напій з насиченим смаком.',
    imageUrl: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=500&q=80'
  },
  { 
    title: 'Апельсиновий Джміль', 
    category: 'Холодні напої', 
    basePrice: 90, 
    description: 'Освіжаючий холодний кавовий коктейль на основі апельсинового соку та еспресо.',
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80'
  }
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