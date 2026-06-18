import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import workspaceRoutes from './workspaceRoutes';
import { WorkspaceModel } from '../../../infrastructure/database/models/Workspace';

jest.mock('../../../infrastructure/database/models/Workspace');

const app = express();
app.use(express.json());
app.use('/api/workspaces', workspaceRoutes);

describe('Workspace Routes Integration', () => {
  const secret = 'default_secret';
  let token: string;

  beforeAll(() => {
    process.env.JWT_SECRET = secret;
    token = jwt.sign({ userId: 'owner123', email: 'test@b2b.com' }, secret);
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should block requests without a token (401)', async () => {
    const res = await request(app).get('/api/workspaces');
    expect(res.status).toBe(401);
  });

  it('should allow GET /api/workspaces with token', async () => {
    (WorkspaceModel.find as jest.Mock).mockResolvedValue([
      { _id: 'ws1', name: 'WS 1', ownerId: 'owner123', members: ['owner123'] },
    ]);

    const res = await request(app)
      .get('/api/workspaces')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(WorkspaceModel.find).toHaveBeenCalled();
  });

  it('should allow POST /api/workspaces with token', async () => {
    const newWs = { name: 'My WS', description: 'desc' };
    const mockCreated = { _id: 'ws1', ...newWs, ownerId: 'owner123', members: ['owner123'] };
    (WorkspaceModel.create as jest.Mock).mockResolvedValue(mockCreated);

    const res = await request(app)
      .post('/api/workspaces')
      .set('Authorization', `Bearer ${token}`)
      .send(newWs);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('My WS');
    expect(WorkspaceModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'My WS',
        ownerId: 'owner123',
      })
    );
  });
});
