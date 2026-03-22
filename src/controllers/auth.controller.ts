import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { signToken } from '../utils/jwt';
import { AuthRequest } from '../types/auth';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ success: false, message: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, passwordHash, role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const token = signToken({ userId: user.id, role: user.role });

    res.status(201).json({
      success: true,
      message: 'Registered successfully',
      data: { user, token },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed', error: String(error) });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const token = signToken({ userId: user.id, role: user.role });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed', error: String(error) });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    res.json({ success: true, message: 'Profile fetched', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};