
import jwt from 'jsonwebtoken'; // Enure this is at the very top
import { UserModel } from '../models/user_models.js';
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'fail',
        message: 'Missing or invalid authorization header format',
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // <-- This line was failing

    const currentUser = await UserModel.findById(decoded.id)
      .select('-password -__v -resetToken -resetExpires');

    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'User no longer exists',
      });
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'fail',
        message: 'Password changed recently. Login again.',
      });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    let message = 'Invalid token';
    if (error instanceof jwt.TokenExpiredError) {
      message = 'Token expired. Login again.';
    }
    res.status(401).json({ status: 'fail', message });
  }
};