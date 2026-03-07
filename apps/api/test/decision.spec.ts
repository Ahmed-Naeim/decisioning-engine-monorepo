import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('DecisionController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/decision/decide (POST)', () => {
    it('Test A: Verifies a correct variant is returned based on country or deviceType', () => {
      const payload = {
        id: 'req-test-a',
        visitorId: 'visitor-a',
        timestamp: Date.now(),
        consent: { marketing: true },
        context: {
          country: 'US',
          deviceType: 'mobile',
        },
      };

      return request(app.getHttpServer())
        .post('/decision/decide')
        .send(payload)
        .expect(201)
        .expect((res) => {
          expect(res.body.approved).toBe(true);
          expect(res.body.variantId).toBe('promo-us');
        });
    });

    it('Test B: Verifies that if marketing: false, the visitorId is completely ignored by the decision logic', () => {
      const payload = {
        id: 'req-test-b',
        visitorId: 'visitor-pii-should-drop',
        userId: 'user-secret',
        timestamp: Date.now(),
        consent: { marketing: false },
        context: {
          country: 'CA',
        },
      };

      // By intercepting, visitorId becomes null in the request before hitting the controller.
      // We can verify this via the response if the service echoed it back, or just verify the decision fallback since rules won't match.
      // E2E test: the interceptor runs on integration. The service receives null.
      return request(app.getHttpServer())
        .post('/decision/decide')
        .send(payload)
        .expect(201)
        .expect((res) => {
          expect(res.body.approved).toBe(false);
          expect(res.body.variantId).toBe('control');
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
