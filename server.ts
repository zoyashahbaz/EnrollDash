import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { initDb } from './db/index';
import { enrollmentService } from './services/enrollmentService';
import { predictionService } from './services/predictionService';
import { enrollmentSchema } from './schemas/enrollmentSchema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db/index';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

async function startServer() {
  // Initialize Database
  initDb();

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Forbidden: Invalid token' });
      req.user = user;
      next();
    });
  };

  // Auth Routes
  app.post('/api/auth/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const result = db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)').run(username, email, password_hash);
      
      const user = { id: result.lastInsertRowid, username, email, role: null, bio: null };
      const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
      
      res.status(201).json({ user, token });
    } catch (err: any) {
      console.error('Signup error:', err);
      res.status(500).json({ error: 'Server error during signup' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const userData = { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role,
        bio: user.bio
      };
      const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '24h' });

      res.json({ user: userData, token });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Server error during login' });
    }
  });

  app.put('/api/auth/profile', authenticateToken, async (req: any, res) => {
    const { username, role, bio } = req.body;
    const userId = req.user.id;

    try {
      db.prepare('UPDATE users SET username = ?, role = ?, bio = ? WHERE id = ?')
        .run(username, role, bio, userId);
      
      const updatedUser = db.prepare('SELECT id, username, email, role, bio FROM users WHERE id = ?').get(userId);
      res.json({ user: updatedUser });
    } catch (err: any) {
      console.error('Profile update error:', err);
      res.status(500).json({ error: 'Server error during profile update' });
    }
  });

  app.put('/api/auth/password', authenticateToken, async (req: any, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
      
      const isValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid current password' });
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newPasswordHash, userId);
      
      res.json({ success: true, message: 'Password updated successfully' });
    } catch (err: any) {
      console.error('Password update error:', err);
      res.status(500).json({ error: 'Server error during password update' });
    }
  });

  app.post('/api/auth/verify-password-instant', authenticateToken, async (req: any, res) => {
    const { password } = req.body;
    const userId = req.user.id;

    try {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
      const isValid = await bcrypt.compare(password, user.password_hash);
      res.json({ isValid });
    } catch (err: any) {
      res.json({ isValid: false });
    }
  });

  // API Routes
  app.get('/api/enrollments', authenticateToken, (req, res) => {
    console.log('API: Fetching enrollments...');
    try {
      const rows = enrollmentService.getAll();
      console.log(`API: Found ${rows.length} enrollments`);
      res.json(rows);
    } catch (err: any) {
      console.error('API Error /api/enrollments:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/enrollments', authenticateToken, (req, res) => {
    console.log('API: Adding/Updating enrollment...');
    try {
      // Validate with Zod
      const validation = enrollmentSchema.safeParse(req.body);
      
      if (!validation.success) {
        res.status(400).json({ 
          error: 'Invalid data format.', 
          details: validation.error.format() 
        });
        return;
      }

      const { id, year, total_enrolled, class_name, college_name, city_name } = validation.data;
      enrollmentService.upsert(year, total_enrolled, class_name, college_name, city_name, id);
      
      console.log('API: Enrollment saved');
      res.json({ success: true });
    } catch (err: any) {
      console.error('API Error /api/enrollments (POST):', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/enrollments/:id', authenticateToken, (req, res) => {
    console.log(`API: Deleting enrollment ${req.params.id}`);
    try {
      enrollmentService.delete(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      console.error('API Error /api/enrollments (DELETE):', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/prediction', authenticateToken, (req, res) => {
    console.log('API: Calculating prediction...');
    try {
      const result = predictionService.calculatePrediction();
      console.log('API: Prediction calculated');
      res.json(result);
    } catch (err: any) {
      console.error('API Error /api/prediction:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Server] Initializing Vite middleware...');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          port: 24679
        }
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Critical error starting server:", err);
});
