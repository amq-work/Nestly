import { Router } from 'express';
import { getMyBookings, createBooking } from '../controllers/booking.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);
router.get('/', getMyBookings);
router.post('/', createBooking);

export default router;
