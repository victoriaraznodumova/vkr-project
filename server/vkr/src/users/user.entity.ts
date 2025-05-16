import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';



@Entity('users')
export class User {


    user_id: number

    email

    password_hash

    registration_date


    //ЗАКОНЧИТЬ СУЩНОСТИ








}