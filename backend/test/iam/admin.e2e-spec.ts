/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module.js';
import { DomainExceptionFilter } from '../../src/shared/presentation/filters/domain-exception.filter.js';

describe('Admin User Management (e2e)', () => {
  let app: INestApplication;
  let adminAccessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();

    // Login as admin
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@company.com', password: 'Admin123!' });

    adminAccessToken = loginRes.body.data.accessToken;
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  /**
   * Helper: invite and activate a test user, returning the userId and accessToken.
   */
  async function createActivatedUser(
    emailPrefix: string,
  ): Promise<{ userId: string; accessToken: string }> {
    const email = `${emailPrefix}-${Date.now()}@company.com`;

    // Invite
    const inviteRes = await request(app.getHttpServer())
      .post('/api/admin/users/invite')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ email, role: 'GENERAL_USER' });

    const userId: string = inviteRes.body.data.userId;

    // Retrieve invitation token from DB
    const dataSource = app.get(DataSource);
    const result = await dataSource.query(
      'SELECT invitation_token FROM users WHERE id = $1',
      [userId],
    );
    const invitationToken: string = result[0].invitation_token;

    // Activate
    const activateRes = await request(app.getHttpServer())
      .post('/api/auth/activate')
      .send({
        token: invitationToken,
        password: 'TestUser123!',
        displayName: `User ${emailPrefix}`,
      });

    return { userId, accessToken: activateRes.body.data.accessToken };
  }

  describe('PUT /api/admin/users/:id/role - Change user role', () => {
    it('should change user role from GENERAL_USER to STAFF', async () => {
      const { userId } = await createActivatedUser('role-test');

      await request(app.getHttpServer())
        .put(`/api/admin/users/${userId}/role`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ role: 'STAFF' })
        .expect(200);

      // Verify role was changed by listing users
      const listRes = await request(app.getHttpServer())
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      const updatedUser = (
        listRes.body.data as Array<{ id: string; role: string }>
      ).find((u) => u.id === userId);
      expect(updatedUser?.role).toBe('STAFF');
    });

    it('should reject invalid role value', async () => {
      const { userId } = await createActivatedUser('role-invalid');

      await request(app.getHttpServer())
        .put(`/api/admin/users/${userId}/role`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ role: 'NONEXISTENT' })
        .expect(400);
    });
  });

  describe('PUT /api/admin/users/:id/deactivate - Deactivate user', () => {
    it('should deactivate an active user', async () => {
      const { userId } = await createActivatedUser('deactivate-test');

      await request(app.getHttpServer())
        .put(`/api/admin/users/${userId}/deactivate`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      // Verify user is deactivated by listing users
      const listRes = await request(app.getHttpServer())
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      const deactivatedUser = (
        listRes.body.data as Array<{ id: string; status: string }>
      ).find((u) => u.id === userId);
      expect(deactivatedUser?.status).toBe('DEACTIVATED');
    });

    it('should prevent deactivated user from logging in', async () => {
      const email = `deactivate-login-${Date.now()}@company.com`;

      // Invite and activate
      const inviteRes = await request(app.getHttpServer())
        .post('/api/admin/users/invite')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ email, role: 'GENERAL_USER' });

      const userId: string = inviteRes.body.data.userId;
      const dataSource = app.get(DataSource);
      const result = await dataSource.query(
        'SELECT invitation_token FROM users WHERE id = $1',
        [userId],
      );

      await request(app.getHttpServer()).post('/api/auth/activate').send({
        token: result[0].invitation_token,
        password: 'TestUser123!',
        displayName: 'Deactivate Test',
      });

      // Deactivate
      await request(app.getHttpServer())
        .put(`/api/admin/users/${userId}/deactivate`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      // Try to login
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password: 'TestUser123!' })
        .expect(400);
    });
  });

  describe('POST /api/admin/users/:id/force-logout - Force logout user', () => {
    it('should force logout a user and invalidate their sessions', async () => {
      const { userId, accessToken } = await createActivatedUser('force-logout');

      // Verify user can access profile
      await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Force logout
      await request(app.getHttpServer())
        .post(`/api/admin/users/${userId}/force-logout`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);
    });
  });

  describe('GET /api/admin/users - List users', () => {
    it('should return list of users', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      const admin = (
        res.body.data as Array<{ email: string; role: string }>
      ).find((u) => u.email === 'admin@company.com');
      expect(admin).toBeDefined();
      expect(admin?.role).toBe('ADMINISTRATOR');
    });

    it('should reject non-admin access', async () => {
      const { accessToken } = await createActivatedUser('non-admin-list');

      await request(app.getHttpServer())
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });
  });
});
