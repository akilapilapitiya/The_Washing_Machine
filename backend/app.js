import express from 'express';
import {PORT} from './src/configs/env.js';
import authRouter from './src/routes/auth.routes.js'
const app = express();

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Hello, World!');
});
app.use('/auth', authRouter);

// Error handling Middleware

// Server Running
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;