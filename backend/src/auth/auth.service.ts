import bcrypt from 'bcrypt';
import { UserModel } from '../user/user.model';

export class AuthService {
  static async register(email: string, password: string, name: string) {
    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await UserModel.create(email, hashedPassword, name);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async login(email: string, password: string) {
    // Find user
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async getUserById(id: number) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}