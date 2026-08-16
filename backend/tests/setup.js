process.env.NODE_ENV = 'test';
process.env.REDIS_URL = '';
process.env.ENCRYPTION_KEY = 'd45259cf4cb572049b1c75c5ef9d0893b2bea7c3f3e8b7637d856a87530fd1df';
process.env.JWT_SECRET = 'test_jwt_secret_minimum_32_characters_long_for_bca';
process.env.INTERNAL_SECRET = 'test_internal_secret_for_nest_bridge_tests_only';

jest.mock('uuid', () => ({
    v4: jest.fn(() => {
        const { randomUUID } = require('crypto');
        return randomUUID();
    })
}));
