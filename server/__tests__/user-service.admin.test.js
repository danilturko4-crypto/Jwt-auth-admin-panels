jest.mock('../models/user-model', () => ({
  findById: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

jest.mock('../service/token-service', () => ({
  generateTokens: jest.fn(),
  saveToken: jest.fn(),
}));

const userModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const userService = require('../service/user-service');

describe('user-service admin logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAdmin', () => {
    it('throws when creator is not found', async () => {
      userModel.findById.mockResolvedValue(null);

      await expect(userService.createAdmin('admin@test.com', '123456', 'creator-id')).rejects.toMatchObject({
        status: 400,
        message: 'Только суперадмин может создавать админов',
      });

      expect(userModel.findById).toHaveBeenCalledWith('creator-id');
    });

    it('throws when creator is not superadmin', async () => {
      userModel.findById.mockResolvedValue({ _id: 'creator-id', role: 'admin' });

      await expect(userService.createAdmin('admin@test.com', '123456', 'creator-id')).rejects.toMatchObject({
        status: 400,
        message: 'Только суперадмин может создавать админов',
      });
    });

    it('throws when admin email already exists', async () => {
      userModel.findById.mockResolvedValue({ _id: 'creator-id', role: 'superadmin' });
      userModel.findOne.mockResolvedValue({ _id: 'existing-admin' });

      await expect(userService.createAdmin('admin@test.com', '123456', 'creator-id')).rejects.toMatchObject({
        status: 400,
        message: 'Админ с email admin@test.com уже существует',
      });

      expect(userModel.findOne).toHaveBeenCalledWith({ email: 'admin@test.com' });
    });

    it('creates admin when creator is superadmin and email is unique', async () => {
      const createdAdmin = {
        _id: 'new-admin-id',
        email: 'newadmin@test.com',
        role: 'admin',
        createdBy: 'creator-id',
      };

      userModel.findById.mockResolvedValue({ _id: 'creator-id', role: 'superadmin' });
      userModel.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed-password');
      userModel.create.mockResolvedValue(createdAdmin);

      const result = await userService.createAdmin('newadmin@test.com', '123456', 'creator-id');

      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 3);
      expect(userModel.create).toHaveBeenCalledWith({
        email: 'newadmin@test.com',
        password: 'hashed-password',
        role: 'admin',
        createdBy: 'creator-id',
      });
      expect(result).toEqual(createdAdmin);
    });
  });

  describe('getAllAdmins', () => {
    it('maps admin entities to response dto shape', async () => {
      userModel.find.mockResolvedValue([
        {
          _id: { toString: () => 'a1' },
          email: 'a1@test.com',
          role: 'admin',
          assignedTatami: [{ toString: () => 't1' }, { toString: () => 't2' }],
        },
        {
          _id: { toString: () => 'a2' },
          email: 'a2@test.com',
          role: 'admin',
          assignedTatami: null,
        },
      ]);

      const result = await userService.getAllAdmins();

      expect(userModel.find).toHaveBeenCalledWith({ role: 'admin' });
      expect(result).toEqual([
        {
          id: 'a1',
          email: 'a1@test.com',
          role: 'admin',
          assignedTatami: ['t1', 't2'],
        },
        {
          id: 'a2',
          email: 'a2@test.com',
          role: 'admin',
          assignedTatami: [],
        },
      ]);
    });
  });
});
