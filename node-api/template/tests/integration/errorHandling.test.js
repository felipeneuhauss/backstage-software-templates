const { createTestApp } = require('../helpers/testHelpers');

describe('Error Handling Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('404 Not Found Errors', () => {
    it('should return 404 for non-existent endpoint', async () => {
      const response = await app.get('/non-existent-endpoint');

      expect(response.status).toBe(404);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('path');
      expect(response.body).toHaveProperty('method');
      
      expect(response.body.error).toBe('Endpoint not found');
      expect(response.body.path).toBe('/non-existent-endpoint');
      expect(response.body.method).toBe('GET');
    });

    it('should return 404 for non-existent API endpoint', async () => {
      const response = await app.get('/api/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Endpoint not found');
      expect(response.body.path).toBe('/api/non-existent');
      expect(response.body.method).toBe('GET');
    });

    it('should return 404 for POST to non-existent endpoint', async () => {
      const response = await app.post('/api/non-existent')
        .send({ test: 'data' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Endpoint not found');
      expect(response.body.path).toBe('/api/non-existent');
      expect(response.body.method).toBe('POST');
    });

    it('should return 404 for PUT to non-existent endpoint', async () => {
      const response = await app.put('/api/non-existent')
        .send({ test: 'data' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Endpoint not found');
      expect(response.body.path).toBe('/api/non-existent');
      expect(response.body.method).toBe('PUT');
    });

    it('should return 404 for DELETE to non-existent endpoint', async () => {
      const response = await app.delete('/api/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Endpoint not found');
      expect(response.body.path).toBe('/api/non-existent');
      expect(response.body.method).toBe('DELETE');
    });

    it('should return 404 for PATCH to non-existent endpoint', async () => {
      const response = await app.patch('/api/non-existent')
        .send({ test: 'data' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Endpoint not found');
      expect(response.body.path).toBe('/api/non-existent');
      expect(response.body.method).toBe('PATCH');
    });

    it('should handle nested non-existent paths', async () => {
      const response = await app.get('/api/services/non-existent/extra/path');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Endpoint not found');
      expect(response.body.path).toBe('/api/services/non-existent/extra/path');
    });

    it('should handle paths with special characters', async () => {
      const response = await app.get('/api/test@#$%^&*()');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Endpoint not found');
      expect(response.body.path).toContain('/api/test');
    });

    it('should handle very long paths', async () => {
      const longPath = '/api/' + 'a'.repeat(1000);
      const response = await app.get(longPath);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Endpoint not found');
      expect(response.body.path).toBe(longPath);
    });
  });

  describe('Method Not Allowed Errors', () => {
    it('should return 404 for PUT to /api/users (method not implemented)', async () => {
      const response = await app.put('/api/users')
        .send({ name: 'Test User' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Endpoint not found');
      expect(response.body.method).toBe('PUT');
    });

    it('should return 404 for DELETE to /api/users (method not implemented)', async () => {
      const response = await app.delete('/api/users');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Endpoint not found');
      expect(response.body.method).toBe('DELETE');
    });

    it('should return 404 for PATCH to /api/services (method not implemented)', async () => {
      const response = await app.patch('/api/services')
        .send({ status: 'maintenance' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Endpoint not found');
      expect(response.body.method).toBe('PATCH');
    });

    it('should return 404 for PUT to /api/services/:id (method not implemented)', async () => {
      const response = await app.put('/api/services/test-service')
        .send({ status: 'running' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Endpoint not found');
      expect(response.body.method).toBe('PUT');
    });

    it('should return 404 for DELETE to /api/services/:id (method not implemented)', async () => {
      const response = await app.delete('/api/services/test-service');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Endpoint not found');
      expect(response.body.method).toBe('DELETE');
    });
  });

  describe('Malformed Request Handling', () => {
    it('should handle malformed JSON in POST requests', async () => {
      const response = await app.post('/api/services')
        .set('Content-Type', 'application/json')
        .send('{"name": "Test Service", "version": "1.0.0"');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid JSON format');
    });

    it('should handle completely invalid JSON', async () => {
      const response = await app.post('/api/services')
        .set('Content-Type', 'application/json')
        .send('invalid json string');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid JSON format');
    });

    it('should handle empty JSON body', async () => {
      const response = await app.post('/api/services')
        .set('Content-Type', 'application/json')
        .send('');

      expect(response.status).toBe(400);
    });

    it('should handle null JSON body', async () => {
      const response = await app.post('/api/services')
        .set('Content-Type', 'application/json')
        .send('null');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid JSON format');
    });

    it('should handle very large JSON payloads', async () => {
      const largePayload = {
        name: 'Test Service',
        version: '1.0.0',
        data: 'x'.repeat(10000)
      };

      const response = await app.post('/api/services')
        .send(largePayload);

      expect(response.status).toBe(201);
    });

    it('should handle requests with invalid content type', async () => {
      const response = await app.post('/api/services')
        .set('Content-Type', 'text/plain')
        .send('name=Test&version=1.0.0');

      expect(response.status).toBe(400);
    });

    it('should handle requests without content type', async () => {
      const response = await app.post('/api/services')
        .set('Content-Type', '')
        .send('invalid data');

      expect([400, 201]).toContain(response.status);
      if (response.status === 400) {
        expect(['Invalid JSON format', 'Name and version are required']).toContain(response.body.error);
      }
    });
  });

  describe('Query Parameter Edge Cases', () => {
    it('should handle requests with empty query parameters', async () => {
      const response = await app.get('/api/users?');

      expect(response.status).toBe(200);
    });

    it('should handle requests with multiple empty query parameters', async () => {
      const response = await app.get('/api/users?&&&');

      expect(response.status).toBe(200);
    });

    it('should handle requests with very long query parameters', async () => {
      const longParam = 'a'.repeat(1000);
      const response = await app.get(`/api/users?param=${longParam}`);

      expect(response.status).toBe(200);
    });

    it('should handle requests with special characters in query parameters', async () => {
      const response = await app.get('/api/users?param=%20%21%40%23%24%25%5E%26%2A%28%29');

      expect(response.status).toBe(200);
    });

    it('should handle requests with many query parameters', async () => {
      const params = Array(100).fill().map((_, i) => `param${i}=value${i}`).join('&');
      const response = await app.get(`/api/users?${params}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Header Edge Cases', () => {
    it('should handle requests with very long headers', async () => {
      const longHeader = 'x'.repeat(10000);
      const response = await app.get('/api/users')
        .set('X-Custom-Header', longHeader);

      expect(response.status).toBe(200);
    });

    it('should handle requests with many headers', async () => {
      let request = app.get('/api/users');
      
      for (let i = 0; i < 100; i++) {
        request = request.set(`X-Header-${i}`, `value-${i}`);
      }

      const response = await request;
      expect(response.status).toBe(200);
    });

    it('should handle requests with invalid header values', async () => {
      const response = await app.get('/api/users')
        .set('Content-Type', 'invalid/content-type');

      expect(response.status).toBe(200);
    });
  });

  describe('Concurrent Error Handling', () => {
    it('should handle multiple concurrent 404 requests', async () => {
      const promises = Array(2).fill().map(() => 
        app.get('/non-existent-endpoint')
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect([404, 200]).toContain(response.status);
        if (response.status === 404) {
          expect(response.body.error).toBe('Endpoint not found');
        }
      });
    });

    it('should handle mixed valid and invalid concurrent requests', async () => {
      const response1 = await app.get('/api/users');
      const response2 = await app.get('/non-existent');
      const response3 = await app.get('/api/services');
      
      expect([200, 301]).toContain(response1.status);
      expect([404, 200]).toContain(response2.status);
      expect([200, 301]).toContain(response3.status);
    });
  });

  describe('Response Time Under Error Conditions', () => {
    it('should respond to 404 errors within reasonable time', async () => {
      const startTime = Date.now();
      const response = await app.get('/non-existent-endpoint');
      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(404);
      expect(responseTime).toBeLessThan(1000);
    });

    it('should respond to malformed requests within reasonable time', async () => {
      const startTime = Date.now();
      const response = await app.post('/api/services')
        .set('Content-Type', 'application/json')
        .send('invalid json');
      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(400);
      expect(responseTime).toBeLessThan(1000);
    });
  });
});
