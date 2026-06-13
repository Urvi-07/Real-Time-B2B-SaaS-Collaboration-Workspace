import request from 'supertest';
import app from './app';

describe('GET /health', () => {
  it('should return 200 OK with system statistics', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('timestamp');
    expect(res.body.data).toHaveProperty('uptime');
    expect(res.body.data).toHaveProperty('env');
  });
});

describe('GET /unknown-route', () => {
  it('should return 404 error', async () => {
    const res = await request(app).get('/unknown-route');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toBeInstanceOf(Array);
    expect(res.body.message).toContain('not found');
  });
});
