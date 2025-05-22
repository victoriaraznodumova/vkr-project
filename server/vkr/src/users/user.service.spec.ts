// src/users/user.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from './entity/user.entity'; // Make sure the path to User entity is correct
import { RegisterUserDto } from '../auth/dto/register-user.dto'; // Import your RegisterUserDto

// Mock object for the User entity, which includes all necessary properties
// including relations, to conform to the full User type.
// For tests where relations are not important, you can simply assign them undefined or an empty array.
const mockUser: User = {
  userId: 1,
  email: 'test@example.com',
  passwordHash: 'hashedpassword',
  registrationDate: new Date(),
  // Add all relation properties that exist in your User entity (src/users/entity/user.entity.ts)
  // Even if they are not loaded in a specific scenario, their type must be present.
  entries: [], // Assuming entries is a ManyToOne/OneToMany relation, initialize as empty array
  administrators: [], // Initialize as empty array
  queues: [], // Initialize as empty array
  initiatedEvents: [], // Initialize as empty array
  passwordResetTokens: [], // Initialize as empty array
  // ... any other relations that exist in your User entity
};

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository, // Use the real Repository class, but mock its methods
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    // Mock the methods of userRepository
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser); // Return the full mockUser
    jest.spyOn(userRepository, 'create').mockReturnValue(mockUser); // create usually returns a partial entity, but for simplicity mock a full one
    jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser); // save returns the saved entity
    jest.spyOn(userRepository, 'delete').mockResolvedValue({ affected: 1, raw: [] });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find a user by ID', async () => {
    const user = await service.findOne(1);
    expect(user).toEqual(mockUser);
    expect(userRepository.findOne).toHaveBeenCalledWith({ where: { userId: 1 } });
  });

  it('should create a user', async () => {
    const registerUserDto: RegisterUserDto = {
      email: 'newuser@example.com',
      password: 'newhashedpass', // Use 'password' as per RegisterUserDto
    };
    // Note: The 'create' method in UserService would typically hash the password.
    // Here, we're just testing the interaction with the repository.
    const createdUser = await service.create(registerUserDto as any); // Cast to any if UserService.create expects User entity directly
    expect(createdUser).toEqual(mockUser); // Or more precise comparison with expected result of create/save
    expect(userRepository.create).toHaveBeenCalledWith(registerUserDto); // Check that create was called with DTO
    expect(userRepository.save).toHaveBeenCalledWith(mockUser); // Check that save was called with the entity
  });

  // Add other tests for findByEmail, update, remove as needed
});
