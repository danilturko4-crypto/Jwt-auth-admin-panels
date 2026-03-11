jest.mock('../service/user-service', () => ({
  createAdmin: jest.fn(),
  getAllAdmins: jest.fn(),
}));

jest.mock('../middlewares/auth-middleware', () => {
  const ApiError = require('../exceptions/api-error');

  return (req, res, next) => {
    if (req.headers['x-test-auth'] === 'fail') {
      return next(ApiError.UnauthorizedError());
    }

    req.user = { id: req.headers['x-test-user-id'] || 'superadmin-id' };
    return next();
  };
});

const express = require('express');
const request = require('supertest');
const ApiError = require('../exceptions/api-error');
const router = require('../router');
const errorMiddleware = require('../middlewares/error-middleware');
const userService = require('../service/user-service');

describe('admin routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api', router);
  app.use(errorMiddleware);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/create-admin', () => {
    it('returns 401 when auth middleware rejects request', async () => {
      const response = await request(app)
        .post('/api/create-admin')
        .set('x-test-auth', 'fail')
        .send({ email: 'admin@test.com', password: '123456' });

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        message: 'Пользователь не авторизован',
      });
    });

    it('returns 400 when request body validation fails', async () => {
      const response = await request(app)
        .post('/api/create-admin')
        .send({ email: 'bad-email', password: '12' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Ошибка при валидации');
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(userService.createAdmin).not.toHaveBeenCalled();
    });

    it('returns 200 and created admin on success', async () => {
      const createdAdmin = {
        _id: 'admin-id',
        email: 'admin@test.com',
        role: 'admin',
        createdBy: 'superadmin-id',
      };
      userService.createAdmin.mockResolvedValue(createdAdmin);

      const response = await request(app)
        .post('/api/create-admin')
        .send({ email: 'admin@test.com', password: '123456' });

      expect(response.status).toBe(200);
      expect(userService.createAdmin).toHaveBeenCalledWith('admin@test.com', '123456', 'superadmin-id');
      expect(response.body).toEqual(createdAdmin);
    });

    it('returns 400 when service rejects by role rule', async () => {
      userService.createAdmin.mockRejectedValue(
        ApiError.BadRequest('Только суперадмин может создавать админов')
      );

      const response = await request(app)
        .post('/api/create-admin')
        .send({ email: 'admin@test.com', password: '123456' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Только суперадмин может создавать админов');
    });
  });

  describe('GET /api/admins', () => {
    it('returns 200 and admin list', async () => {
      const admins = [
        { id: 'a1', email: 'a1@test.com', role: 'admin', assignedTatami: [] },
      ];
      userService.getAllAdmins.mockResolvedValue(admins);

      const response = await request(app).get('/api/admins');

      expect(response.status).toBe(200);
      expect(userService.getAllAdmins).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual(admins);
    });

    it('returns 500 when getAdmins throws unexpected error', async () => {
      userService.getAllAdmins.mockRejectedValue(new Error('db down'));

      const response = await request(app).get('/api/admins');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Непредвиденная ошибка' });
    });
  });
});
