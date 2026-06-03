import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'default_secret',
  jwtExpiresIn: '2h',
  bcryptRounds: 12,
};
