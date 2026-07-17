/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BookingStatus = 'Request' | 'Assigned' | 'En Route' | 'Arrived' | 'In Progress' | 'Completed' | 'Paid' | 'Cancelled';

export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string;
  priceValue: number;
  iconName: string;
  badge?: 'Standard' | 'Priority';
  isEmergency?: boolean;
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceTitle: string;
  category: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  address: string;
  zipCode: string;
  date: string;
  time: string;
  status: BookingStatus;
  notes?: string;
  price: string;
  priceValue: number;
  createdAt: string;
  assignedPro?: {
    name: string;
    avatarUrl: string;
    rating: number;
    phone: string;
  };
}
