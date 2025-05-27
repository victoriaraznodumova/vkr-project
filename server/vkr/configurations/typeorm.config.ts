import { DataSource } from 'typeorm';

import * as dotenv from 'dotenv';
dotenv.config(); // ОБЯЗАТЕЛЬНО в самом верху!


export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: false,        
  logging: true,
  // entities: ['dist/**/*.entity{.ts,.js}'],
  // migrations: ['src/migration/*.ts'],

  entities: ['dist/**/*.entity{.js,.ts}'], // если билд запускается
  migrations: ['dist/src/migrations/migrations/*.js'], 

  migrationsTableName: 'migrations',
});