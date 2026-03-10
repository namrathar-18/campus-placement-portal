import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import companyRoutes from './routes/companies.js';
import applicationRoutes from './routes/application.js';
import notificationRoutes from './routes/notifications.js';
import statsRoutes from './routes/stats.js';
import userRoutes from './routes/users.js';
import representativeRoutes from './routes/representative.js';
import zenithRoutes from './routes/zenith.js';

dotenv.config();

const startServer = async () => {
  const app = express();

  // Connect to MongoDB
  await connectDB();

  // Middleware
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      // Allow localhost (any port) and any *.vercel.app domain
      if (
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Allow all for now; restrict if needed
    },
    credentials: true,
  }));
  app.use(express.json({ limit: '50mb' })); // Increase limit for base64 files
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/companies', companyRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/representative', representativeRoutes);
  app.use('/api/zenith', zenithRoutes);

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Server Error' 
    });
  });

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
