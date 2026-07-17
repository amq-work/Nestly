import { Request, Response } from 'express';
import prisma from '../config/db';
import { SERVICES_CATALOG, POPULAR_CATEGORIES } from '../../src/data';

export const getServices = async (req: Request, res: Response): Promise<void> => {
  try {
    // Merge static catalog + live labour services
    const labourServices = await prisma.labourService.findMany({
      where: { isActive: true },
      include: { labour: { select: { fullName: true, id: true } } },
    });

    const live = labourServices.map(s => ({
      id: s.id,
      title: s.title,
      description: s.description,
      category: s.category,
      price: s.price,
      priceValue: s.priceValue,
      iconName: s.iconName,
      badge: s.badge,
      isEmergency: s.isEmergency,
      labourId: s.labourId,
      labourName: s.labour.fullName,
    }));

    // Static catalog items always shown (as platform defaults)
    res.json([...SERVICES_CATALOG, ...live]);
  } catch (e) {
    // Fallback to static
    res.json(SERVICES_CATALOG);
  }
};

export const getCategories = (req: Request, res: Response) => {
  res.json(POPULAR_CATEGORIES);
};

export const getLabour = async (req: Request, res: Response): Promise<void> => {
  try {
    const labour = await prisma.labour.findMany({
      where: { status: 'Active' },
      include: { services: { where: { isActive: true } } },
      orderBy: { rating: 'desc' },
    });

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
      services: l.services.map(s => s.id),
    }));

    res.json(shaped);
  } catch (e) {
    // Return empty array if no labour in DB yet
    res.json([]);
  }
};
