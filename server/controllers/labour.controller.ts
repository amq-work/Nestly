import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { LabourAuthRequest } from '../middleware/labourAuth.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'nestly-super-secret-key-for-dev';

// ─── Public: Apply to become a seller ─────────────────────────────────────
export const apply = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, phone, specialties, experienceYears, languages, bio, password } = req.body;

    if (!fullName || !email || !phone || !password) {
      res.status(400).json({ error: 'Full name, email, phone and password are required.' });
      return;
    }

    // Email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email address.' });
      return;
    }

    const existing = await prisma.labour.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ error: 'An account with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const nameParts = fullName.trim().split(' ');
    const avatarText = nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : fullName.substring(0, 2).toUpperCase();

    const labour = await prisma.labour.create({
      data: {
        fullName,
        email,
        phone,
        passwordHash,
        bio: bio || '',
        specialties: Array.isArray(specialties) ? specialties.join(',') : (specialties || ''),
        languages: Array.isArray(languages) ? languages.join(',') : (languages || 'English'),
        experienceYears: parseInt(experienceYears) || 0,
        avatarText,
      },
    });

    const token = jwt.sign({ id: labour.id, role: 'labour' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      labour: {
        id: labour.id,
        fullName: labour.fullName,
        email: labour.email,
        phone: labour.phone,
        avatarText: labour.avatarText,
        status: labour.status,
      },
    });
  } catch (error) {
    console.error('Labour apply error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── Public: Labour Login ──────────────────────────────────────────────────
export const loginLabour = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const labour = await prisma.labour.findUnique({ where: { email } });
    if (!labour) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, labour.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    if (labour.status === 'Blocked') {
      res.status(403).json({ error: 'Account suspended. Contact support.' });
      return;
    }

    await prisma.labour.update({ where: { id: labour.id }, data: { lastLogin: new Date() } });

    const token = jwt.sign({ id: labour.id, role: 'labour' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      token,
      labour: {
        id: labour.id,
        fullName: labour.fullName,
        email: labour.email,
        phone: labour.phone,
        avatarText: labour.avatarText,
        avatarColor: labour.avatarColor,
        rating: labour.rating,
        reviewsCount: labour.reviewsCount,
        completedJobs: labour.completedJobs,
        status: labour.status,
      },
    });
  } catch (error) {
    console.error('Labour login error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── Protected: Get current labour profile ────────────────────────────────
export const getMe = async (req: LabourAuthRequest, res: Response): Promise<void> => {
  try {
    const labour = await prisma.labour.findUnique({
      where: { id: req.labour?.id },
      select: {
        id: true, fullName: true, email: true, phone: true,
        bio: true, specialties: true, badge: true, languages: true,
        experienceYears: true, completedJobs: true, rating: true,
        reviewsCount: true, avatarColor: true, avatarText: true, status: true, createdAt: true,
      },
    });
    if (!labour) { res.status(404).json({ error: 'Not found.' }); return; }
    res.json(labour);
  } catch (e) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const updateLabourProfile = async (req: LabourAuthRequest, res: Response): Promise<void> => {
  try {
    const { fullName, phone, bio, specialties, languages, experienceYears } = req.body;
    const updated = await prisma.labour.update({
      where: { id: req.labour?.id },
      data: {
        fullName: fullName !== undefined ? fullName : undefined,
        phone: phone !== undefined ? phone : undefined,
        bio: bio !== undefined ? bio : undefined,
        specialties: specialties !== undefined ? specialties : undefined,
        languages: languages !== undefined ? languages : undefined,
        experienceYears: typeof experienceYears === 'number' ? experienceYears : undefined,
      },
      select: {
        id: true, fullName: true, email: true, phone: true,
        bio: true, specialties: true, badge: true, languages: true,
        experienceYears: true, completedJobs: true, rating: true,
        reviewsCount: true, avatarColor: true, avatarText: true, status: true,
      },
    });
    res.json(updated);
  } catch (e) {
    console.error('Update labour profile error:', e);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── Protected: Get analytics ─────────────────────────────────────────────
export const getAnalytics = async (req: LabourAuthRequest, res: Response): Promise<void> => {
  try {
    const labourId = req.labour?.id!;
    const [total, pending, completed, cancelled, bookings] = await Promise.all([
      prisma.booking.count({ where: { labourId } }),
      prisma.booking.count({ where: { labourId, status: 'Request' } }),
      prisma.booking.count({ where: { labourId, status: 'Completed' } }),
      prisma.booking.count({ where: { labourId, status: 'Cancelled' } }),
      prisma.booking.findMany({
        where: { labourId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { customer: { select: { fullName: true, email: true } } },
      }),
    ]);

    const revenue = await prisma.booking.aggregate({
      where: { labourId, status: 'Completed' },
      _sum: { priceValue: true },
    });

    res.json({ total, pending, completed, cancelled, revenue: revenue._sum.priceValue || 0, recentBookings: bookings });
  } catch (e) {
    console.error('Analytics error:', e);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── Protected: Get this labour's bookings ────────────────────────────────
export const getMyBookings = async (req: LabourAuthRequest, res: Response): Promise<void> => {
  try {
    const labourUser = req.labour?.id ? await prisma.labour.findUnique({ where: { id: req.labour.id } }) : null;
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { labourId: req.labour?.id },
          { labourId: null },
          ...(labourUser ? [{ assignedProName: labourUser.fullName }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { fullName: true, email: true, phone: true } } },
    });
    res.json(bookings);
  } catch (e) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── Protected: Update booking status ────────────────────────────────────
export const updateBookingStatus = async (req: LabourAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['Request', 'Assigned', 'En Route', 'Arrived', 'In Progress', 'Completed', 'Paid', 'Cancelled'];
    if (!allowed.includes(status)) {
      res.status(400).json({ error: 'Invalid status.' }); return;
    }
    const booking = await prisma.booking.updateMany({
      where: { id, labourId: req.labour?.id },
      data: { status },
    });
    if (booking.count === 0) { res.status(404).json({ error: 'Booking not found.' }); return; }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── Protected: Get this labour's services ───────────────────────────────
export const getMyServices = async (req: LabourAuthRequest, res: Response): Promise<void> => {
  try {
    const services = await prisma.labourService.findMany({
      where: { labourId: req.labour?.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(services);
  } catch (e) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── Protected: Create a new service ─────────────────────────────────────
export const createService = async (req: LabourAuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, category, price, priceValue, iconName, badge, isEmergency } = req.body;
    if (!title || !description || !category || !price || priceValue === undefined) {
      res.status(400).json({ error: 'title, description, category, price and priceValue are required.' });
      return;
    }
    const service = await prisma.labourService.create({
      data: {
        labourId: req.labour!.id,
        title, description, category,
        price, priceValue: parseFloat(priceValue),
        iconName: iconName || 'Wrench',
        badge: badge || 'Standard',
        isEmergency: !!isEmergency,
      },
    });
    res.status(201).json(service);
  } catch (e) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── Protected: Toggle service active/inactive ────────────────────────────
export const toggleService = async (req: LabourAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    await prisma.labourService.updateMany({
      where: { id, labourId: req.labour?.id },
      data: { isActive: !!isActive },
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── Protected: Delete a service ─────────────────────────────────────────
export const deleteService = async (req: LabourAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.labourService.deleteMany({ where: { id, labourId: req.labour?.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── Public: All active labour profiles (for customer frontend) ───────────
export const getAllLabour = async (req: Request, res: Response): Promise<void> => {
  try {
    const labour = await prisma.labour.findMany({
      where: { status: 'Active' },
      include: { services: { where: { isActive: true } } },
      orderBy: { rating: 'desc' },
    });
    // Shape to match frontend Pro interface
    const shaped = labour.map(l => ({
      id: l.id,
      name: l.fullName,
      avatarColor: l.avatarColor,
      avatarText: l.avatarText,
      rating: l.rating,
      phone: l.phone,
      reviewsCount: l.reviewsCount,
      badge: l.badge,
      specialties: l.specialties ? l.specialties.split(',').map(s => s.trim()) : [],
      bio: l.bio,
      completedJobs: l.completedJobs,
      experienceYears: l.experienceYears,
      languages: l.languages ? l.languages.split(',').map(s => s.trim()) : ['English'],
      services: l.services.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description,
        category: s.category,
        price: s.price,
        priceValue: s.priceValue,
        iconName: s.iconName,
        badge: s.badge,
        isEmergency: s.isEmergency,
      })),
    }));
    res.json(shaped);
  } catch (e) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};
