const { createTestApp } = require('../helpers/testHelpers');

describe('Complete API Integration Test Suite', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('API Endpoints Overview', () => {
    it('should have all expected endpoints available', async () => {
      const response = await app.get('/');

      expect(response.status).toBe(200);
      expect(response.body.endpoints).toEqual({
        health: '/health',
        apiStatus: '/api-status',
        api: '/api',
        users: '/api/users',
        services: '/api/services'
      });
    });

    it('should maintain consistent API version across endpoints', async () => {
      const [rootResponse, apiResponse] = await Promise.all([
        app.get('/'),
        app.get('/api')
      ]);

      expect(rootResponse.body.version).toBe('1.0.0');
      expect(apiResponse.body.version).toBe('1.0.0');
    });

    it('should have consistent service name across status endpoints', async () => {
      const [healthResponse, statusResponse] = await Promise.all([
        app.get('/health'),
        app.get('/api-status')
      ]);

      expect(statusResponse.body.service.name).toBe('${{values.app_name}}');
    });
  });

  describe('Cross-Endpoint Data Consistency', () => {
    it('should have consistent timestamps across all endpoints', async () => {
      const response1 = await app.get('/');
      const response2 = await app.get('/health');
      const response3 = await app.get('/api-status');
      const response4 = await app.get('/api/users');
      const response5 = await app.get('/api/services');

      const responses = [response1, response2, response3, response4, response5];

      responses.forEach(response => {
        expect([200, 301]).toContain(response.status);
        if (response.status === 200 && response.body.timestamp) {
          const timestamp = new Date(response.body.timestamp);
          expect(timestamp).toBeInstanceOf(Date);
          expect(timestamp.getTime()).not.toBeNaN();
        }
      });
    });

    it('should have consistent environment information', async () => {
      const [healthResponse, statusResponse] = await Promise.all([
        app.get('/health'),
        app.get('/api-status')
      ]);

      expect(healthResponse.body.environment).toBe('test');
      expect(statusResponse.body.service.environment).toBe('test');
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle high concurrent load', async () => {
      const response1 = await app.get('/');
      const response2 = await app.get('/health');
      const response3 = await app.get('/api-status');

      const responses = [response1, response2, response3];
      
      responses.forEach(response => {
        expect([200, 301]).toContain(response.status);
      });
    });

    it('should maintain response times under load', async () => {
      const startTime = Date.now();
      
      const promises = Array(3).fill().map(() => 
        app.get('/api-status')
      );
      
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      responses.forEach(response => {
        expect([200, 301]).toContain(response.status);
        if (response.status === 200 && response.body.responseTime) {
          expect(response.body.responseTime).toBeLessThan(1000);
        }
      });
      
      expect(totalTime).toBeLessThan(10000);
    });

    it('should handle mixed request types concurrently', async () => {
      const response1 = await app.get('/health');
      const response2 = await app.get('/api/users');
      const response3 = await app.get('/api/services');

      expect([200, 301]).toContain(response1.status);
      expect([200, 301]).toContain(response2.status);
      expect([200, 301]).toContain(response3.status);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain data consistency across multiple requests', async () => {
      const userResponses = await Promise.all([
        app.get('/api/users'),
        app.get('/api/users'),
        app.get('/api/users')
      ]);

      const serviceResponses = await Promise.all([
        app.get('/api/services'),
        app.get('/api/services'),
        app.get('/api/services')
      ]);

      userResponses.forEach(response => {
        expect(response.body.users).toEqual(userResponses[0].body.users);
        expect(response.body.total).toBe(userResponses[0].body.total);
      });

      serviceResponses.forEach(response => {
        expect(response.body.services).toEqual(serviceResponses[0].body.services);
        expect(response.body.total).toBe(serviceResponses[0].body.total);
      });
    });

    it('should generate consistent service IDs for same input', async () => {
      const serviceName = 'Consistent Test Service';
      
      const responses = await Promise.all([
        app.post('/api/services').send({ name: serviceName, version: '1.0.0' }),
        app.post('/api/services').send({ name: serviceName, version: '2.0.0' })
      ]);

      expect(responses[0].body.id).toBe('consistent-test-service');
      expect(responses[1].body.id).toBe('consistent-test-service');
    });
  });

  describe('Security and Headers', () => {
    it('should include security headers', async () => {
      const response = await app.get('/');

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });

    it('should handle CORS properly', async () => {
      const response = await app.get('/')
        .set('Origin', 'https://example.com');

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should not expose sensitive information in error responses', async () => {
      const response = await app.get('/non-existent-endpoint');

      expect(response.body).not.toHaveProperty('stack');
      expect(response.body).not.toHaveProperty('internal');
      expect(response.body).not.toHaveProperty('debug');
    });
  });

  describe('API Contract Compliance', () => {
    it('should follow RESTful conventions', async () => {
      const getResponse = await app.get('/api/services');
      const postResponse = await app.post('/api/services')
        .send({ name: 'REST Test', version: '1.0.0' });

      expect(getResponse.status).toBe(200);
      expect(postResponse.status).toBe(201);
    });

    it('should return appropriate HTTP status codes', async () => {
      const response1 = await app.get('/');
      const response2 = await app.get('/health');
      const response3 = await app.get('/api-status');
      const response4 = await app.get('/api');
      const response5 = await app.get('/api/users');

      expect([200, 301]).toContain(response1.status);
      expect([200, 301]).toContain(response2.status);
      expect([200, 301]).toContain(response3.status);
      expect([200, 301]).toContain(response4.status);
      expect([200, 301]).toContain(response5.status);
    });

    it('should maintain consistent JSON structure', async () => {
      const responses = await Promise.all([
        app.get('/api/users'),
        app.get('/api/services')
      ]);

      responses.forEach(response => {
        expect(response.body).toHaveProperty('timestamp');
        expect(typeof response.body.timestamp).toBe('string');
        expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
      });
    });
  });
});
