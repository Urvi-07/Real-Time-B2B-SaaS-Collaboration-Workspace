import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../../domain/entities/User';

const users: User[] = [];

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    return res.status(400).json({
      status: 'error',
      message: 'User already exists',
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user: User = {
    id: Date.now().toString(),
    name,
    email,
    password: hashedPassword,
  };

  users.push(user);

  return res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = users.find((user) => user.email === email);

  if (!user) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid email or password',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid email or password',
    });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '7d' }
  );

  return res.status(200).json({
    status: 'success',
    message: 'Login successful',
    token,
  });
};

export const profile = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Protected profile accessed successfully',
    user: (req as any).user,
  });
};