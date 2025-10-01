const { createTestApp, expectValidHealthResponse } = require('../helpers/testHelpers');

describe('Health Endpoint Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /health', () => {
    it('should return healthy status with all required fields', async () => {
      const response = await app.get('/health');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expectValidHealthResponse(response);
    });

    it('should return status as healthy', async () => {
      const response = await app.get('/health');

      expect(response.body.status).toBe('healthy');
    });

    it('should include uptime information', async () => {
      const response = await app.get('/health');

      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
      expect(typeof response.body.uptime).toBe('number');
    });

    it('should include memory usage information', async () => {
      const response = await app.get('/health');

      expect(response.body.memory).toHaveProperty('rss');
      expect(response.body.memory).toHaveProperty('heapTotal');
      expect(response.body.memory).toHaveProperty('heapUsed');
      expect(response.body.memory).toHaveProperty('external');
      expect(response.body.memory).toHaveProperty('arrayBuffers');
      
      expect(typeof response.body.memory.rss).toBe('number');
      expect(typeof response.body.memory.heapTotal).toBe('number');
      expect(typeof response.body.memory.heapUsed).toBe('number');
    });

    it('should include Node.js version', async () => {
      const response = await app.get('/health');

      expect(response.body.version).toMatch(/^v\d+\.\d+\.\d+$/);
    });

    it('should include environment information', async () => {
      const response = await app.get('/health');

      expect(response.body.environment).toBe('test');
    });

    it('should include git information', async () => {
      const response = await app.get('/health');

      expect(response.body).toHaveProperty('git');
    });

    it('should include local git information when available', async () => {
      const response = await app.get('/health');

      if (response.body.git) {
        expect(response.body.git).toHaveProperty('branch');
        expect(response.body.git).toHaveProperty('lastCommit');
        expect(response.body.git.lastCommit).toHaveProperty('hash');
        expect(response.body.git.lastCommit).toHaveProperty('author');
      }
    });

    it('should respond within reasonable time', async () => {
      const startTime = Date.now();
      const response = await app.get('/health');
      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(5000);
    });

    it('should handle concurrent requests', async () => {
      const promises = Array(3).fill().map(() => app.get('/health'));
      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expectValidHealthResponse(response);
      });
    });
  });

  describe('Health endpoint error scenarios', () => {
    it('should handle service errors gracefully', async () => {
      const originalEnv = process.env.GITHUB_TOKEN;
      delete process.env.GITHUB_TOKEN;

      const response = await app.get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');

      process.env.GITHUB_TOKEN = originalEnv;
    });
  });
});
