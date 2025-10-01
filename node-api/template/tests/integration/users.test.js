const { createTestApp, expectValidUserResponse } = require('../helpers/testHelpers');

describe('Users API Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /api/users', () => {
    it('should return users list with all required fields', async () => {
      const response = await app.get('/api/users');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expectValidUserResponse(response);
    });

    it('should return exactly 3 users', async () => {
      const response = await app.get('/api/users');

      expect(response.body.users).toHaveLength(3);
      expect(response.body.total).toBe(3);
    });

    it('should return users with correct structure', async () => {
      const response = await app.get('/api/users');

      const expectedUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'developer' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'designer' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'manager' }
      ];

      response.body.users.forEach((user, index) => {
        expect(user.id).toBe(expectedUsers[index].id);
        expect(user.name).toBe(expectedUsers[index].name);
        expect(user.email).toBe(expectedUsers[index].email);
        expect(user.role).toBe(expectedUsers[index].role);
      });
    });

    it('should include valid timestamp', async () => {
      const response = await app.get('/api/users');

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    it('should have consistent data across multiple requests', async () => {
      const response1 = await app.get('/api/users');
      const response2 = await app.get('/api/users');

      expect(response1.body.users).toEqual(response2.body.users);
      expect(response1.body.total).toBe(response2.body.total);
    });

    it('should respond within reasonable time', async () => {
      const startTime = Date.now();
      const response = await app.get('/api/users');
      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000);
    });

    it('should handle concurrent requests', async () => {
      const promises = Array(3).fill().map(() => app.get('/api/users'));
      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expectValidUserResponse(response);
      });

      const firstResponse = responses[0];
      responses.forEach(response => {
        expect(response.body.users).toEqual(firstResponse.body.users);
      });
    });

    it('should return proper JSON content type', async () => {
      const response = await app.get('/api/users');

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should not include sensitive information', async () => {
      const response = await app.get('/api/users');

      response.body.users.forEach(user => {
        expect(user).not.toHaveProperty('password');
        expect(user).not.toHaveProperty('token');
        expect(user).not.toHaveProperty('secret');
      });
    });

    it('should validate user data types', async () => {
      const response = await app.get('/api/users');

      response.body.users.forEach(user => {
        expect(typeof user.id).toBe('number');
        expect(typeof user.name).toBe('string');
        expect(typeof user.email).toBe('string');
        expect(typeof user.role).toBe('string');
        
        expect(user.id).toBeGreaterThan(0);
        expect(user.name.length).toBeGreaterThan(0);
        expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        expect(user.role.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Users endpoint edge cases', () => {
    it('should handle requests with query parameters', async () => {
      const response = await app.get('/api/users?limit=10&offset=0');

      expect(response.status).toBe(200);
      expectValidUserResponse(response);
    });

    it('should handle requests with invalid query parameters', async () => {
      const response = await app.get('/api/users?invalid=param&another=test');

      expect(response.status).toBe(200);
      expectValidUserResponse(response);
    });

    it('should handle requests with special characters in query', async () => {
      const response = await app.get('/api/users?test=%20%21%40%23');

      expect(response.status).toBe(200);
      expectValidUserResponse(response);
    });
  });
});
