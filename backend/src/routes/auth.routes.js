import {Router} from 'express';

const authRouter = Router();

authRouter.post('/signup', (req, res) => {
    // Handle user signup
    res.send('User signed up');
});

authRouter.post('/login', (req, res) => {
    // Handle user login
    res.send('User logged in');
});

authRouter.post('/logout', (req, res) => {
    // Handle user logout
    res.send('User logged out');
});

export default authRouter;