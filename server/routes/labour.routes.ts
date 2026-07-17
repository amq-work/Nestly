import { Router } from 'express';
import {
  apply,
  loginLabour,
  getMe,
  updateLabourProfile,
  getAnalytics,
  getMyBookings,
  updateBookingStatus,
  getMyServices,
  createService,
  toggleService,
  deleteService,
  getAllLabour,
} from '../controllers/labour.controller';
import { labourAuthMiddleware } from '../middleware/labourAuth.middleware';

const router = Router();

// Public
router.post('/apply', apply);
router.post('/login', loginLabour);
router.get('/all', getAllLabour);

// Protected (Labour JWT)
router.get('/me', labourAuthMiddleware, getMe);
router.put('/profile', labourAuthMiddleware, updateLabourProfile);
router.get('/analytics', labourAuthMiddleware, getAnalytics);
router.get('/bookings', labourAuthMiddleware, getMyBookings);
router.patch('/bookings/:id/status', labourAuthMiddleware, updateBookingStatus);
router.get('/services', labourAuthMiddleware, getMyServices);
router.post('/services', labourAuthMiddleware, createService);
router.patch('/services/:id', labourAuthMiddleware, toggleService);
router.delete('/services/:id', labourAuthMiddleware, deleteService);

export default router;
