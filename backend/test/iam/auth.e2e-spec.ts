/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../src/app.module.js';
import { DomainExceptionFilter } from '../../src/shared/presentation/filters/domain-exception.filter.js';

describe('Auth (e2e)', () => {
  let app: INestApplication;

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
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate admin user seeded by AdminSeedService', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@company.com', password: 'Admin123!' })
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe('admin@company.com');
      expect(res.body.data.user.role).toBe('ADMINISTRATOR');
    });

    it('should reject invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@company.com', password: 'wrong-password' })
        .expect(400);
    });

    it('should reject non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'nobody@company.com', password: 'Admin123!' })
        .expect(400);
    });

    it('should reject request with missing email', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ password: 'Admin123!' })
        .expect(400);
    });

    it('should reject request with missing password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@company.com' })
        .expect(400);
    });
  });

  describe('GET /api/users/me', () => {
    it('should return profile with valid access token', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@company.com', password: 'Admin123!' });

      const { accessToken } = loginRes.body.data;

      const res = await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.email).toBe('admin@company.com');
      expect(res.body.data.displayName).toBeDefined();
      expect(res.body.data.role).toBe('ADMINISTRATOR');
    });

    it('should reject request without access token', async () => {
      await request(app.getHttpServer()).get('/api/users/me').expect(401);
    });

    it('should reject request with invalid access token', async () => {
      await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should issue new access token with valid refresh token cookie', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@company.com', password: 'Admin123!' });

      const cookies = loginRes.headers['set-cookie'] as unknown as string[];

      const res = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', cookies)
        .expect(200);

      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject refresh without cookie', async () => {
      await request(app.getHttpServer()).post('/api/auth/refresh').expect(400);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@company.com', password: 'Admin123!' });

      const { accessToken } = loginRes.body.data;
      const cookies = loginRes.headers['set-cookie'] as unknown as string[];

      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', cookies)
        .expect(200);
    });

    it('should reject logout without access token', async () => {
      await request(app.getHttpServer()).post('/api/auth/logout').expect(401);
    });
  });
});
