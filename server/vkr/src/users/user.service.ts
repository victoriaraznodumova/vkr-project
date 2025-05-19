import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity'; 
import e from 'express';

@Injectable()
export class UserService{
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}


    async findById(userId: number): Promise<User | null> {
        if (!Number.isInteger(userId) || userId <= 0 || !userId || typeof userId !== "number")
            return null
        // Используем findOne с условием по userId
        const user = await this.userRepository.findOne({where: {userId}})
        return user;
    }

    //Используется, например, при аутентификации в AuthService.
    async findByEmail(email: string): Promise<User | null> {
        if (!email || typeof email !== "string" || !email.includes('@'))
            return null
        // Используем findOne с условием по userId
        const user = await this.userRepository.findOne({where: {email}})
        return user;
    }

    async create(userData: Partial<User>): Promise<User> {
        const newUser = this.userRepository.create(userData);
        return this.userRepository.save(newUser);
  }
}