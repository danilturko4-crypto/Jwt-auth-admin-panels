jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

jest.mock('../models/token-model', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  deleteOne: jest.fn(),
}));

const jwt = require('jsonwebtoken');
const tokenModel = require('../models/token-model');
const tokenService = require('../service/token-service');

describe('token-service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      JWT_ACCESS_SECRET: 'access-secret',
      JWT_REFRESH_SECRET: 'refresh-secret',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('generateTokens returns access and refresh tokens', () => {
    jwt.sign
      .mockReturnValueOnce('access-token')
      .mockReturnValueOnce('refresh-token');

    const payload = { id: 'u1', role: 'admin' };
    const result = tokenService.generateTokens(payload);

    expect(jwt.sign).toHaveBeenNthCalledWith(1, payload, 'access-secret', { expiresIn: '15m' });
    expect(jwt.sign).toHaveBeenNthCalledWith(2, payload, 'refresh-secret', { expiresIn: '30d' });
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('validateAccessToken returns decoded user data', () => {
    const decoded = { id: 'u1' };
    jwt.verify.mockReturnValue(decoded);

    const result = tokenService.validateAccessToken('valid-access');

    expect(jwt.verify).toHaveBeenCalledWith('valid-access', 'access-secret');
    expect(result).toEqual(decoded);
  });

  it('validateAccessToken returns null for invalid token', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid token');
    });

    const result = tokenService.validateAccessToken('broken-access');

    expect(result).toBeNull();
  });

  it('validateRefreshToken returns decoded user data', () => {
    const decoded = { id: 'u1' };
    jwt.verify.mockReturnValue(decoded);

    const result = tokenService.validateRefreshToken('valid-refresh');

    expect(jwt.verify).toHaveBeenCalledWith('valid-refresh', 'refresh-secret');
    expect(result).toEqual(decoded);
  });

  it('saveToken updates existing refresh token', async () => {
    const save = jest.fn().mockResolvedValue({ _id: 'token-id', refreshToken: 'new-refresh' });
    tokenModel.findOne.mockResolvedValue({ refreshToken: 'old-refresh', save });

    const result = await tokenService.saveToken('u1', 'new-refresh');

    expect(tokenModel.findOne).toHaveBeenCalledWith({ user: 'u1' });
    expect(save).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ _id: 'token-id', refreshToken: 'new-refresh' });
  });

  it('saveToken creates token if none exists', async () => {
    tokenModel.findOne.mockResolvedValue(null);
    tokenModel.create.mockResolvedValue({ _id: 'new-id', user: 'u1', refreshToken: 'refresh' });

    const result = await tokenService.saveToken('u1', 'refresh');

    expect(tokenModel.create).toHaveBeenCalledWith({ user: 'u1', refreshToken: 'refresh' });
    expect(result).toEqual({ _id: 'new-id', user: 'u1', refreshToken: 'refresh' });
  });

  it('removeToken deletes refresh token record', async () => {
    tokenModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

    const result = await tokenService.removeToken('refresh');

    expect(tokenModel.deleteOne).toHaveBeenCalledWith({ refreshToken: 'refresh' });
    expect(result).toEqual({ deletedCount: 1 });
  });

  it('findToken returns token model entry', async () => {
    tokenModel.findOne.mockResolvedValue({ _id: 'token-id', refreshToken: 'refresh' });

    const result = await tokenService.findToken('refresh');

    expect(tokenModel.findOne).toHaveBeenCalledWith({ refreshToken: 'refresh' });
    expect(result).toEqual({ _id: 'token-id', refreshToken: 'refresh' });
  });
});
