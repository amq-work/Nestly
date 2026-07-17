import { Request, Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';

export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const customer = await prisma.customer.findUnique({ where: { id: userId } });
    const bookings = await prisma.booking.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: 'desc' },
      include: { labour: true },
    });

    const formatted = bookings.map((b) => ({
      id: b.id,
      serviceId: b.serviceType,
      serviceTitle: b.serviceType,
      category: 'Residential Specialist Service',
      userName: customer?.fullName || 'Customer',
      userEmail: customer?.email || '',
      userPhone: customer?.phone || '',
      address: b.address,
      zipCode: '',
      date: b.date,
      time: b.time,
      status: (b.status as any) || 'Assigned',
      notes: b.notes || '',
      price: b.price || '$120.00',
      priceValue: b.priceValue || 120,
      createdAt: b.createdAt.toISOString(),
      assignedPro: {
        name: b.assignedProName || b.labour?.fullName || 'Assigned Specialist',
        avatarUrl: b.assignedProAvatar || b.labour?.avatarText || 'PR',
        rating: b.assignedProRating || b.labour?.rating || 4.9,
        phone: b.assignedProPhone || b.labour?.phone || '(800) 555-NEST',
      },
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const {
      serviceType,
      serviceTitle,
      date,
      time,
      address,
      notes,
      price,
      priceValue,
      labourId,
      assignedProName,
      assignedProAvatar,
      assignedProRating,
      assignedProPhone,
    } = req.body;

    const title = serviceTitle || serviceType || 'Home Care Specialist Service';

    if (!date || !time || !address) {
      res.status(400).json({ error: 'Missing required fields (date, time, address)' });
      return;
    }

    let targetLabourId = labourId || null;
    if (!targetLabourId && assignedProName) {
      const matchedLabour = await prisma.labour.findFirst({
        where: { fullName: assignedProName },
      });
      if (matchedLabour) {
        targetLabourId = matchedLabour.id;
      }
    }
    if (!targetLabourId) {
      const anyLabour = await prisma.labour.findFirst();
      if (anyLabour) {
        targetLabourId = anyLabour.id;
      }
    }

    const customer = await prisma.customer.findUnique({ where: { id: userId } });
    const newBooking = await prisma.booking.create({
      data: {
        customerId: userId,
        serviceType: title,
        date,
        time,
        address,
        notes: notes || null,
        price: price || '$120.00',
        priceValue: typeof priceValue === 'number' ? priceValue : 120,
        status: 'Assigned',
        labourId: targetLabourId,
        assignedProName: assignedProName || null,
        assignedProAvatar: assignedProAvatar || null,
        assignedProRating: typeof assignedProRating === 'number' ? assignedProRating : null,
        assignedProPhone: assignedProPhone || null,
      },
      include: { labour: true },
    });

    const formatted = {
      id: newBooking.id,
      serviceId: newBooking.serviceType,
      serviceTitle: newBooking.serviceType,
      category: 'Residential Specialist Service',
      userName: customer?.fullName || 'Customer',
      userEmail: customer?.email || '',
      userPhone: customer?.phone || '',
      address: newBooking.address,
      zipCode: '',
      date: newBooking.date,
      time: newBooking.time,
      status: (newBooking.status as any) || 'Assigned',
      notes: newBooking.notes || '',
      price: newBooking.price || '$120.00',
      priceValue: newBooking.priceValue || 120,
      createdAt: newBooking.createdAt.toISOString(),
      assignedPro: {
        name: newBooking.assignedProName || newBooking.labour?.fullName || assignedProName || 'Assigned Specialist',
        avatarUrl: newBooking.assignedProAvatar || newBooking.labour?.avatarText || assignedProAvatar || 'PR',
        rating: newBooking.assignedProRating || newBooking.labour?.rating || assignedProRating || 4.9,
        phone: newBooking.assignedProPhone || newBooking.labour?.phone || assignedProPhone || '(800) 555-NEST',
      },
    };

    res.status(201).json(formatted);
  } catch (error) {
    console.error('Failed to create booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};
