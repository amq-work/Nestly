/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Service, Booking } from './types';

export const POPULAR_CATEGORIES = [
  {
    id: 'cleaning',
    title: 'Deep Cleaning',
    description: 'From $120',
    icon: 'Brush',
    bgColor: 'bg-mint-cream/30',
  },
  {
    id: 'plumbing',
    title: 'Plumbing Repair',
    description: 'Hourly rates apply',
    icon: 'Wrench',
    bgColor: 'bg-mint-cream/30',
  },
  {
    id: 'electrical',
    title: 'Electrical Fixes',
    description: 'Certified Pros',
    icon: 'Bolt',
    bgColor: 'bg-mint-cream/30',
  },
  {
    id: 'handyman',
    title: 'General Handyman',
    description: 'Book by the hour',
    icon: 'Hammer',
    bgColor: 'bg-mint-cream/30',
  },
];

export const SERVICES_CATALOG: Service[] = [
  {
    id: 'kitchen-sink',
    title: 'Kitchen Sink Repair',
    description: 'Fix leaks, clogs, or replace standard fixtures. Parts not included.',
    category: 'Plumbing',
    price: '$145',
    priceValue: 145,
    iconName: 'Droplet',
    badge: 'Standard',
  },
  {
    id: 'emergency-electrical',
    title: 'Emergency Electrical',
    description: 'Immediate dispatch for power outages or dangerous faults. 1hr response.',
    category: 'Electrical',
    price: '$250/hr',
    priceValue: 250,
    iconName: 'Zap',
    badge: 'Priority',
    isEmergency: true,
  },
  {
    id: 'yard-cleanup',
    title: 'Yard Cleanup',
    description: 'Mowing, edging, and debris removal for standard suburban lots.',
    category: 'Yard Care',
    price: '$85',
    priceValue: 85,
    iconName: 'Leaf',
    badge: 'Standard',
  },
  {
    id: 'full-house-cleaning',
    title: 'Full House Deep Cleaning',
    description: 'Thorough cleaning of all rooms, bathrooms, kitchen, dusting, and vacuuming.',
    category: 'Cleaning',
    price: '$180',
    priceValue: 180,
    iconName: 'Brush',
    badge: 'Standard',
  },
  {
    id: 'faucet-replacement',
    title: 'Faucet Replacement',
    description: 'Remove old faucet and install a new owner-provided unit. Includes supply line hookup.',
    category: 'Plumbing',
    price: '$120',
    priceValue: 120,
    iconName: 'Wrench',
    badge: 'Standard',
  },
  {
    id: 'light-fixture-install',
    title: 'Light Fixture Installation',
    description: 'Safely replace existing ceiling fans, chandeliers, or light fixtures.',
    category: 'Electrical',
    price: '$95',
    priceValue: 95,
    iconName: 'Bolt',
    badge: 'Standard',
  },
  {
    id: 'tv-mounting',
    title: 'TV Mounting Service',
    description: 'Secure wall mount installation for TVs up to 85". Custom drywall or brick mounting.',
    category: 'Handyman',
    price: '$110',
    priceValue: 110,
    iconName: 'Hammer',
    badge: 'Standard',
  }
];

export interface Pro {
  id: string;
  name: string;
  avatarColor: string;
  avatarText: string;
  rating: number;
  phone: string;
  reviewsCount: number;
  badge: string;
  specialties: string[];
  bio: string;
  completedJobs: number;
  experienceYears: number;
  languages: string[];
  services: string[];
}

export const DEFAULT_PRO: Pro = {
  id: 'pro-default',
  name: 'Nestly Certified Specialist',
  avatarColor: 'bg-[#6B9080] text-white',
  avatarText: 'NC',
  rating: 4.9,
  phone: '(800) 555-NEST',
  reviewsCount: 120,
  badge: 'Verified Specialist',
  specialties: ['Residential Maintenance', 'Custom Installations'],
  bio: 'Certified, background-screened Nestly trade professional.',
  completedJobs: 250,
  experienceYears: 8,
  languages: ['English'],
  services: [],
};

// PROS_POOL provides fallback specialist profiles for estimate calculators and quote forms
export const PROS_POOL: Pro[] = [
  {
    id: 'pro-marcus',
    name: 'Marcus Vance',
    avatarColor: 'bg-[#6B9080] text-white',
    avatarText: 'MV',
    rating: 4.9,
    phone: '(555) 321-4321',
    reviewsCount: 142,
    badge: 'Nestly Certified Premium',
    specialties: ['Plumbing Repair', 'General Handyman', 'Fixtures'],
    bio: 'Licensed plumber with over a decade of residential experience. Dedicated to pristine installations and prompt leak prevention.',
    completedJobs: 489,
    experienceYears: 12,
    languages: ['English', 'Spanish'],
    services: ['kitchen-sink', 'faucet-replacement', 'tv-mounting'],
  },
  {
    id: 'pro-elena',
    name: 'Elena Rostova',
    avatarColor: 'bg-[#2c5d58] text-white',
    avatarText: 'ER',
    rating: 4.8,
    phone: '(555) 432-8765',
    reviewsCount: 98,
    badge: 'Premium Care Master',
    specialties: ['Deep Cleaning', 'Organization', 'Disinfection'],
    bio: 'Sanitation and hygiene specialist. Focused on eco-friendly, detailed home deep cleaning and botanical organic scents.',
    completedJobs: 320,
    experienceYears: 8,
    languages: ['English', 'Russian'],
    services: ['full-house-cleaning', 'yard-cleanup'],
  },
  {
    id: 'pro-devon',
    name: 'Devon Carter',
    avatarColor: 'bg-[#F4A261] text-[#1D2422]',
    avatarText: 'DC',
    rating: 4.7,
    phone: '(555) 876-1234',
    reviewsCount: 64,
    badge: 'Verified Elite Craftsman',
    specialties: ['Electrical Fixes', 'General Handyman', 'Mounting'],
    bio: 'Vetted electrician and technical technician. Passionate about safety standards, smart home integrations, and clean wiring.',
    completedJobs: 180,
    experienceYears: 6,
    languages: ['English'],
    services: ['emergency-electrical', 'light-fixture-install', 'tv-mounting'],
  },
  {
    id: 'pro-sasha',
    name: 'Sasha Mendoza',
    avatarColor: 'bg-[#1C2B24] text-[#E8E6E1]',
    avatarText: 'SM',
    rating: 4.9,
    phone: '(555) 234-5678',
    reviewsCount: 115,
    badge: 'Nestly Elite Specialist',
    specialties: ['Deep Cleaning', 'Yard Care', 'General Handyman'],
    bio: 'All-rounder caretaker specializing in garden overhaul, comprehensive debris extraction, and detailing standard cleaning.',
    completedJobs: 295,
    experienceYears: 9,
    languages: ['English', 'Spanish'],
    services: ['yard-cleanup', 'full-house-cleaning', 'tv-mounting'],
  }
];

// INITIAL_BOOKINGS is intentionally empty — bookings are stored in and fetched from the database
export const INITIAL_BOOKINGS: Booking[] = [];

