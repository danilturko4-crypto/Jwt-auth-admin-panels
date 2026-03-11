const authMiddleware = require('../middlewares/auth-middleware');
const tokenService = require('../service/token-service');

jest.mock('../service/token-service', () => ({
  validateAccessToken: jest.fn(),
}));

describe('auth-middleware', () => {
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when authorization header is missing', () => {
    const req = { headers: {} };

    authMiddleware(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toMatchObject({
      status: 401,
      message: 'Пользователь не авторизован',
    });
  });

  it('returns 401 when bearer token is missing', () => {
    const req = { headers: { authorization: 'Bearer' } };

    authMiddleware(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toMatchObject({
      status: 401,
      message: 'Пользователь не авторизован',
    });
  });

  it('returns 401 when token validation fails', () => {
    tokenService.validateAccessToken.mockReturnValue(null);
    const req = { headers: { authorization: 'Bearer bad-token' } };

    authMiddleware(req, {}, next);

    expect(tokenService.validateAccessToken).toHaveBeenCalledWith('bad-token');
    const error = next.mock.calls[0][0];
    expect(error).toMatchObject({
      status: 401,
      message: 'Пользователь не авторизован',
    });
  });

  it('adds user to request and calls next without error for valid token', () => {
    const user = { id: 'u1', email: 'admin@test.com' };
    tokenService.validateAccessToken.mockReturnValue(user);
    const req = { headers: { authorization: 'Bearer valid-token' } };

    authMiddleware(req, {}, next);

    expect(tokenService.validateAccessToken).toHaveBeenCalledWith('valid-token');
    expect(req.user).toEqual(user);
    expect(next).toHaveBeenCalledWith();
  });

  it('returns 401 when token service throws an exception', () => {
    tokenService.validateAccessToken.mockImplementation(() => {
      throw new Error('unexpected');
    });
    const req = { headers: { authorization: 'Bearer boom-token' } };

    authMiddleware(req, {}, next);

    const error = next.mock.calls[0][0];
    expect(error).toMatchObject({
      status: 401,
      message: 'Пользователь не авторизован',
    });
  });
});
