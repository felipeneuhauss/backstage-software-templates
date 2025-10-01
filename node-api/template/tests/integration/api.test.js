const { createTestApp, expectValidApiStatusResponse } = require('../helpers/testHelpers');

describe('API Endpoints Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /', () => {
    it('should return welcome message with all required fields', async () => {
      const response = await app.get('/');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('hostname');
      expect(response.body).toHaveProperty('podName');
      expect(response.body).toHaveProperty('nodeName');
      expect(response.body).toHaveProperty('namespace');
      expect(response.body).toHaveProperty('endpoints');
      
      expect(response.body.message).toBe('Welcome to Backstage Node App');
      expect(response.body.version).toBe('1.0.0');
      expect(typeof response.body.timestamp).toBe('string');
      expect(typeof response.body.hostname).toBe('string');
      expect(typeof response.body.podName).toBe('string');
      expect(typeof response.body.nodeName).toBe('string');
      expect(typeof response.body.namespace).toBe('string');
    });

    it('should include all available endpoints', async () => {
      const response = await app.get('/');

      expect(response.body.endpoints).toHaveProperty('health');
      expect(response.body.endpoints).toHaveProperty('apiStatus');
      expect(response.body.endpoints).toHaveProperty('api');
      expect(response.body.endpoints).toHaveProperty('users');
      expect(response.body.endpoints).toHaveProperty('services');
      
      expect(response.body.endpoints.health).toBe('/health');
      expect(response.body.endpoints.apiStatus).toBe('/api-status');
      expect(response.body.endpoints.api).toBe('/api');
      expect(response.body.endpoints.users).toBe('/api/users');
      expect(response.body.endpoints.services).toBe('/api/services');
    });

    it('should have valid timestamp format', async () => {
      const response = await app.get('/');

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });
  });

  describe('GET /api', () => {
    it('should return API status information', async () => {
      const response = await app.get('/api');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('documentation');
      
      expect(response.body.message).toBe('API is running');
      expect(response.body.version).toBe('1.0.0');
      expect(response.body.documentation).toBe('https://github.com/backstage/backstage');
    });
  });

  describe('GET /api-status', () => {
    it('should return comprehensive API status with all required fields', async () => {
      const response = await app.get('/api-status');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expectValidApiStatusResponse(response);
    });

    it('should include service information', async () => {
      const response = await app.get('/api-status');

      expect(response.body.service.name).toBe('backstage-node-app');
      expect(response.body.service.version).toBe('1.0.0');
      expect(response.body.service.status).toBe('running');
      expect(response.body.service.environment).toBe('test');
      expect(typeof response.body.service.uptime).toBe('number');
      expect(typeof response.body.service.port).toBe('number');
    });

    it('should include pod information', async () => {
      const response = await app.get('/api-status');

      expect(response.body.pod).toHaveProperty('hostname');
      expect(response.body.pod).toHaveProperty('podName');
      expect(response.body.pod).toHaveProperty('nodeName');
      expect(response.body.pod).toHaveProperty('namespace');
      expect(response.body.pod).toHaveProperty('podIP');
      
      expect(typeof response.body.pod.hostname).toBe('string');
      expect(typeof response.body.pod.podName).toBe('string');
      expect(typeof response.body.pod.nodeName).toBe('string');
      expect(typeof response.body.pod.namespace).toBe('string');
      expect(typeof response.body.pod.podIP).toBe('string');
    });

    it('should include system information', async () => {
      const response = await app.get('/api-status');

      expect(response.body.system).toHaveProperty('nodeVersion');
      expect(response.body.system).toHaveProperty('platform');
      expect(response.body.system).toHaveProperty('arch');
      expect(response.body.system).toHaveProperty('memory');
      expect(response.body.system).toHaveProperty('cpuUsage');
      
      expect(typeof response.body.system.nodeVersion).toBe('string');
      expect(typeof response.body.system.platform).toBe('string');
      expect(typeof response.body.system.arch).toBe('string');
      expect(typeof response.body.system.memory).toBe('object');
      expect(typeof response.body.system.cpuUsage).toBe('object');
    });

    it('should include git information', async () => {
      const response = await app.get('/api-status');

      expect(response.body).toHaveProperty('git');
      expect(response.body.git).toHaveProperty('local');
    });

    it('should include git information', async () => {
      const response = await app.get('/api-status');

      expect(response.body).toHaveProperty('git');
      expect(response.body.git).toHaveProperty('local');
    });

    it('should include all available endpoints', async () => {
      const response = await app.get('/api-status');

      expect(response.body.endpoints).toHaveProperty('health');
      expect(response.body.endpoints).toHaveProperty('apiStatus');
      expect(response.body.endpoints).toHaveProperty('users');
      expect(response.body.endpoints).toHaveProperty('services');
    });

    it('should include response time measurement', async () => {
      const response = await app.get('/api-status');

      expect(typeof response.body.responseTime).toBe('number');
      expect(response.body.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should respond within reasonable time', async () => {
      const startTime = Date.now();
      const response = await app.get('/api-status');
      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(5000);
    });

    it('should handle concurrent requests', async () => {
      const promises = Array(2).fill().map(() => app.get('/api-status'));
      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect([200, 301]).toContain(response.status);
        if (response.status === 200) {
          expectValidApiStatusResponse(response);
        }
      });
    });
  });

  describe('API endpoints error scenarios', () => {
    it('should handle service errors gracefully in api-status', async () => {
      const originalEnv = process.env.GITHUB_TOKEN;
      delete process.env.GITHUB_TOKEN;

      const response = await app.get('/api-status');

      expect(response.status).toBe(200);
      expect(response.body.service.status).toBe('running');

      process.env.GITHUB_TOKEN = originalEnv;
    });
  });
});
