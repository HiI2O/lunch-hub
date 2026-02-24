/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module.js';
import { DomainExceptionFilter } from '../../src/shared/presentation/filters/domain-exception.filter.js';

describe('Invitation (e2e)', () => {
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

    // Login as admin to get access token
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@company.com', password: 'Admin123!' });

    adminAccessToken = loginRes.body.data.accessToken;
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('Full invitation flow', () => {
    const inviteeEmail = `invitee-${Date.now()}@company.com`;
    let inviteeUserId: string;
    let invitationToken: string;

    it('POST /api/admin/users/invite - admin should invite a new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/admin/users/invite')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ email: inviteeEmail, role: 'GENERAL_USER' })
        .expect(201);

      expect(res.body.data.userId).toBeDefined();
      expect(res.body.data.email).toBe(inviteeEmail);
      inviteeUserId = res.body.data.userId;
    });

    it('should retrieve invitation token from database for activation', async () => {
      // Retrieve invitation token directly from database
      const dataSource = app.get(DataSource);
      const result = await dataSource.query(
        'SELECT invitation_token FROM users WHERE id = $1',
        [inviteeUserId],
      );

      expect(result).toHaveLength(1);
      invitationToken = result[0].invitation_token;
      expect(invitationToken).toBeDefined();
    });

    it('POST /api/auth/activate - user should activate with invitation token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/activate')
        .send({
          token: invitationToken,
          password: 'NewUser123!',
          displayName: 'New User',
        })
        .expect(200);

      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe(inviteeEmail);
      expect(res.body.data.user.role).toBe('GENERAL_USER');
    });

    it('POST /api/auth/login - newly activated user can login', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: inviteeEmail, password: 'NewUser123!' })
        .expect(200);

      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe(inviteeEmail);
    });
  });

  describe('Invitation error cases', () => {
    it('should reject invitation without admin token', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/users/invite')
        .send({ email: 'test@company.com', role: 'GENERAL_USER' })
        .expect(401);
    });

    it('should reject invitation with invalid role', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/users/invite')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ email: 'test@company.com', role: 'INVALID_ROLE' })
        .expect(400);
    });

    it('should reject activation with invalid token', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/activate')
        .send({
          token: 'invalid-token-value',
          password: 'Password123!',
          displayName: 'Test',
        })
        .expect(400);
    });
  });
});
