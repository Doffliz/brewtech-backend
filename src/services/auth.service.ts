import { User } from '../models/User';
import bcrypt from 'bcryptjs';

export class AuthService {
    
    static async register(email: string, password: string) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('Користувач з такою поштою вже існує');
        }

        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            password: hashedPassword
        });

        await newUser.save();
        return { message: 'Успішна реєстрація', email: newUser.email };
    }

    
    static async login(email: string, password: string) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Невірний email або пароль');
        }

       
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Невірний email або пароль');
        }

        return { message: 'Успішний вхід', email: user.email };
    }
}