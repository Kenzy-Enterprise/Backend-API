import jwt from "jsonwebtoken";
import admin from "../models/admin.js";


export const protect = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Not authorized' });

    
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await admin.findById(decoded.id);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};