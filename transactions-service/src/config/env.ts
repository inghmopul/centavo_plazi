import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3002', 10),
  jwtSecret: process.env.JWT_SECRET || 'centavo_dev_jwt_secret_change_in_production_987654321',
  nodeEnv: process.env.NODE_ENV || 'development'
};
