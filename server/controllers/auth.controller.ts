import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'nestly-super-secret-key-for-dev';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, phone, password } = req.body;

    // Validate
    if (!fullName || !email || !password) {
      res.status(400).json({ error: 'Full name, email, and password are required' });
      return;
    }

    // Check existing
    const existingCustomer = await prisma.customer.findUnique({ where: { email } });
    if (existingCustomer) {
      res.status(400).json({ error: 'Email already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const customer = await prisma.customer.create({
      data: {
        fullName,
        email,
        phone: phone || '',
        passwordHash,
      },
    });

    // Generate token
    const token = jwt.sign({ id: customer.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: customer.id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        status: customer.status,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, customer.passwordHash);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    if (customer.status === 'Blocked') {
      res.status(403).json({ error: 'Account is blocked. Please contact support.' });
      return;
    }

    // Update lastLogin
    await prisma.customer.update({
      where: { id: customer.id },
      data: { lastLogin: new Date() },
    });

    // Generate token
    const token = jwt.sign({ id: customer.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      token,
      user: {
        id: customer.id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        status: customer.status,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.user?.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        address: true,
        zipCode: true,
        profileImage: true,
        status: true,
        createdAt: true,
      },
    });

    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fullName, phone, address, zipCode } = req.body;

    const updated = await prisma.customer.update({
      where: { id: req.user?.id },
      data: {
        fullName: fullName !== undefined ? fullName : undefined,
        phone: phone !== undefined ? phone : undefined,
        address: address !== undefined ? address : undefined,
        zipCode: zipCode !== undefined ? zipCode : undefined,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        address: true,
        zipCode: true,
        profileImage: true,
        status: true,
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
