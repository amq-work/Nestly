import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import dataRoutes from './routes/data.routes';
import bookingRoutes from './routes/booking.routes';
import labourRoutes from './routes/labour.routes';

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/labour', labourRoutes);

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Nestly Server running on port ${PORT}`);
  });
}

export default app;
