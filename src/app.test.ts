import request from 'supertest';
import app from './app';

describe('GET /health', () => {
  it('should return 200 OK with system statistics', async () => {
    const res = await request(app).get('/health');
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('env');
  });
});

describe('GET /unknown-route', () => {
  it('should return 404 error', async () => {
    const res = await request(app).get('/unknown-route');
    
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'error');
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('not found');
  });
});
