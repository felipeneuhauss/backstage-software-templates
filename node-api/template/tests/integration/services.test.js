const { createTestApp, expectValidServiceResponse, expectValidSingleServiceResponse } = require('../helpers/testHelpers');

describe('Services API Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /api/services', () => {
    it('should return services list with all required fields', async () => {
      const response = await app.get('/api/services');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expectValidServiceResponse(response);
    });

    it('should return exactly 3 services', async () => {
      const response = await app.get('/api/services');

      expect(response.body.services).toHaveLength(3);
      expect(response.body.total).toBe(3);
    });

    it('should return services with correct structure', async () => {
      const response = await app.get('/api/services');

      const expectedServices = [
        { 
          id: 'user-service', 
          name: 'User Service', 
          status: 'running', 
          version: '1.2.0'
        },
        { 
          id: 'auth-service', 
          name: 'Authentication Service', 
          status: 'running', 
          version: '2.1.0'
        },
        { 
          id: 'notification-service', 
          name: 'Notification Service', 
          status: 'maintenance', 
          version: '1.5.2'
        }
      ];

      response.body.services.forEach((service, index) => {
        expect(service.id).toBe(expectedServices[index].id);
        expect(service.name).toBe(expectedServices[index].name);
        expect(service.status).toBe(expectedServices[index].status);
        expect(service.version).toBe(expectedServices[index].version);
        expect(service).toHaveProperty('lastDeployed');
      });
    });

    it('should include valid timestamp', async () => {
      const response = await app.get('/api/services');

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    it('should have consistent data across multiple requests', async () => {
      const response1 = await app.get('/api/services');
      const response2 = await app.get('/api/services');

      expect(response1.body.services).toEqual(response2.body.services);
      expect(response1.body.total).toBe(response2.body.total);
    });

    it('should respond within reasonable time', async () => {
      const startTime = Date.now();
      const response = await app.get('/api/services');
      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000);
    });

    it('should handle concurrent requests', async () => {
      const promises = Array(3).fill().map(() => app.get('/api/services'));
      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expectValidServiceResponse(response);
      });
    });

    it('should validate service data types', async () => {
      const response = await app.get('/api/services');

      response.body.services.forEach(service => {
        expect(typeof service.id).toBe('string');
        expect(typeof service.name).toBe('string');
        expect(typeof service.status).toBe('string');
        expect(typeof service.version).toBe('string');
        expect(typeof service.lastDeployed).toBe('string');
        
        expect(service.id.length).toBeGreaterThan(0);
        expect(service.name.length).toBeGreaterThan(0);
        expect(['running', 'maintenance', 'deploying', 'error']).toContain(service.status);
        expect(service.version).toMatch(/^\d+\.\d+\.\d+$/);
      });
    });
  });

  describe('GET /api/services/:id', () => {
    it('should return service details for valid service ID', async () => {
      const response = await app.get('/api/services/user-service');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expectValidSingleServiceResponse(response);
    });

    it('should return service with correct ID', async () => {
      const serviceId = 'auth-service';
      const response = await app.get(`/api/services/${serviceId}`);

      expect(response.body.id).toBe(serviceId);
    });

    it('should return service with generated name based on ID', async () => {
      const serviceId = 'test-service';
      const response = await app.get(`/api/services/${serviceId}`);

      expect(response.body.name).toBe('Test-service Service');
    });

    it('should return service with default status', async () => {
      const response = await app.get('/api/services/any-service');

      expect(response.body.status).toBe('running');
    });

    it('should return service with default version', async () => {
      const response = await app.get('/api/services/any-service');

      expect(response.body.version).toBe('1.0.0');
    });

    it('should include endpoints array', async () => {
      const serviceId = 'test-service';
      const response = await app.get(`/api/services/${serviceId}`);

      expect(Array.isArray(response.body.endpoints)).toBe(true);
      expect(response.body.endpoints).toHaveLength(2);
      expect(response.body.endpoints[0]).toBe(`https://${serviceId}.example.com/api`);
      expect(response.body.endpoints[1]).toBe(`https://${serviceId}.example.com/health`);
    });

    it('should include dependencies array', async () => {
      const response = await app.get('/api/services/test-service');

      expect(Array.isArray(response.body.dependencies)).toBe(true);
      expect(response.body.dependencies).toEqual(['database', 'redis']);
    });

    it('should include metrics object', async () => {
      const response = await app.get('/api/services/test-service');

      expect(response.body.metrics).toHaveProperty('requests');
      expect(response.body.metrics).toHaveProperty('errors');
      expect(response.body.metrics).toHaveProperty('responseTime');
      
      expect(typeof response.body.metrics.requests).toBe('number');
      expect(typeof response.body.metrics.errors).toBe('number');
      expect(typeof response.body.metrics.responseTime).toBe('number');
      
      expect(response.body.metrics.requests).toBeGreaterThanOrEqual(0);
      expect(response.body.metrics.errors).toBeGreaterThanOrEqual(0);
      expect(response.body.metrics.responseTime).toBeGreaterThanOrEqual(50);
    });

    it('should include valid lastDeployed timestamp', async () => {
      const response = await app.get('/api/services/test-service');

      const timestamp = new Date(response.body.lastDeployed);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    it('should handle service IDs with special characters', async () => {
      const serviceId = 'test-service-123';
      const response = await app.get(`/api/services/${serviceId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(serviceId);
    });

    it('should handle service IDs with underscores', async () => {
      const serviceId = 'test_service_123';
      const response = await app.get(`/api/services/${serviceId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(serviceId);
    });

    it('should respond within reasonable time', async () => {
      const startTime = Date.now();
      const response = await app.get('/api/services/test-service');
      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000);
    });
  });

  describe('POST /api/services', () => {
    it('should create a new service with valid data', async () => {
      const newService = {
        name: 'Test Service',
        version: '1.0.0'
      };

      const response = await app.post('/api/services')
        .send(newService);

      expect(response.status).toBe(201);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('lastDeployed');
      
      expect(response.body.name).toBe(newService.name);
      expect(response.body.version).toBe(newService.version);
      expect(response.body.id).toBe('test-service');
      expect(response.body.status).toBe('deploying');
    });

    it('should generate ID from service name', async () => {
      const newService = {
        name: 'My Awesome Service',
        version: '2.1.0'
      };

      const response = await app.post('/api/services')
        .send(newService);

      expect(response.body.id).toBe('my-awesome-service');
    });

    it('should handle service names with special characters', async () => {
      const newService = {
        name: 'Service@#$%^&*()',
        version: '1.0.0'
      };

      const response = await app.post('/api/services')
        .send(newService);

      expect(response.body.id).toBe('service');
    });

    it('should return 400 for missing name', async () => {
      const newService = {
        version: '1.0.0'
      };

      const response = await app.post('/api/services')
        .send(newService);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Name and version are required');
    });

    it('should return 400 for missing version', async () => {
      const newService = {
        name: 'Test Service'
      };

      const response = await app.post('/api/services')
        .send(newService);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Name and version are required');
    });

    it('should return 400 for empty name', async () => {
      const newService = {
        name: '',
        version: '1.0.0'
      };

      const response = await app.post('/api/services')
        .send(newService);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Name and version are required');
    });

    it('should return 400 for empty version', async () => {
      const newService = {
        name: 'Test Service',
        version: ''
      };

      const response = await app.post('/api/services')
        .send(newService);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Name and version are required');
    });

    it('should return 400 for null values', async () => {
      const newService = {
        name: null,
        version: null
      };

      const response = await app.post('/api/services')
        .send(newService);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Name and version are required');
    });

    it('should handle valid JSON with extra fields', async () => {
      const newService = {
        name: 'Test Service',
        version: '1.0.0',
        extraField: 'should be ignored',
        anotherField: 123
      };

      const response = await app.post('/api/services')
        .send(newService);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(newService.name);
      expect(response.body.version).toBe(newService.version);
    });

    it('should include valid lastDeployed timestamp', async () => {
      const newService = {
        name: 'Test Service',
        version: '1.0.0'
      };

      const response = await app.post('/api/services')
        .send(newService);

      const timestamp = new Date(response.body.lastDeployed);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    it('should respond within reasonable time', async () => {
      const newService = {
        name: 'Test Service',
        version: '1.0.0'
      };

      const startTime = Date.now();
      const response = await app.post('/api/services')
        .send(newService);
      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(201);
      expect(responseTime).toBeLessThan(1000);
    });
  });

  describe('Services endpoint edge cases', () => {
    it('should handle requests with query parameters for GET /api/services', async () => {
      const response = await app.get('/api/services?limit=10&offset=0');

      expect(response.status).toBe(200);
      expectValidServiceResponse(response);
    });

    it('should handle requests with invalid query parameters', async () => {
      const response = await app.get('/api/services?invalid=param&another=test');

      expect(response.status).toBe(200);
      expectValidServiceResponse(response);
    });

    it('should handle POST requests with invalid JSON', async () => {
      const response = await app.post('/api/services')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid JSON format');
    });

    it('should handle POST requests with wrong content type', async () => {
      const response = await app.post('/api/services')
        .set('Content-Type', 'text/plain')
        .send('name=Test&version=1.0.0');

      expect(response.status).toBe(400);
    });
  });
});
