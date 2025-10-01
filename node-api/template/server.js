const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const githubService = require('./services/githubService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ${{values.app_name}}',
    environment: '${{values.app_env}}',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    hostname: process.env.HOSTNAME || require('os').hostname(),
    podName: process.env.HOSTNAME || 'local',
    nodeName: process.env.NODE_NAME || 'local',
    namespace: process.env.NAMESPACE || 'default',
    endpoints: {
      health: '/health',
      apiStatus: '/api-status',
      api: '/api',
      users: '/api/users',
      services: '/api/services'
    }
  });
});

app.get('/health', async (req, res) => {
  try {
    const localGitInfo = await githubService.getLocalGitInfo();
    
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      version: process.version,
      environment: process.env.NODE_ENV || 'development',
      git: localGitInfo
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: 'Failed to get health information',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api', (req, res) => {
  res.json({
    message: 'API is running',
    version: '1.0.0',
    documentation: 'https://github.com/backstage/backstage'
  });
});

app.get('/api-status', async (req, res) => {
  try {
    const localGitInfo = await githubService.getLocalGitInfo();
    const startTime = Date.now();
    
    const status = {
      service: {
        name: 'backstage-node-app',
        version: '1.0.0',
        status: 'running',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        port: parseInt(PORT)
      },
      pod: {
        hostname: process.env.HOSTNAME || require('os').hostname(),
        podName: process.env.HOSTNAME || 'local',
        nodeName: process.env.NODE_NAME || 'local',
        namespace: process.env.NAMESPACE || 'default',
        podIP: process.env.POD_IP || '127.0.0.1'
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      },
      git: {
        local: localGitInfo
      },
      endpoints: {
        health: '/health',
        apiStatus: '/api-status',
        users: '/api/users',
        services: '/api/services'
      },
      responseTime: Date.now() - startTime
    };

    res.json(status);
  } catch (error) {
    console.error('API status error:', error);
    res.status(500).json({
      service: {
        name: 'backstage-node-app',
        status: 'error',
        timestamp: new Date().toISOString()
      },
      error: 'Failed to get API status information'
    });
  }
});

app.get('/api/users', (req, res) => {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'developer' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'designer' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'manager' }
  ];
  
  res.json({
    users,
    total: users.length,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/services', (req, res) => {
  const services = [
    { 
      id: 'user-service', 
      name: 'User Service', 
      status: 'running', 
      version: '1.2.0',
      lastDeployed: '2024-01-15T10:30:00Z'
    },
    { 
      id: 'auth-service', 
      name: 'Authentication Service', 
      status: 'running', 
      version: '2.1.0',
      lastDeployed: '2024-01-14T15:45:00Z'
    },
    { 
      id: 'notification-service', 
      name: 'Notification Service', 
      status: 'maintenance', 
      version: '1.5.2',
      lastDeployed: '2024-01-13T09:20:00Z'
    }
  ];
  
  res.json({
    services,
    total: services.length,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/services/:id', (req, res) => {
  const { id } = req.params;
  const service = {
    id,
    name: `${id.charAt(0).toUpperCase() + id.slice(1)} Service`,
    status: 'running',
    version: '1.0.0',
    lastDeployed: new Date().toISOString(),
    endpoints: [
      `https://${id}.example.com/api`,
      `https://${id}.example.com/health`
    ],
    dependencies: ['database', 'redis'],
    metrics: {
      requests: Math.floor(Math.random() * 1000),
      errors: Math.floor(Math.random() * 10),
      responseTime: Math.floor(Math.random() * 200) + 50
    }
  };
  
  res.json(service);
});

app.post('/api/services', (req, res) => {
  const { name, version } = req.body;
  
  if (!name || !version) {
    return res.status(400).json({
      error: 'Name and version are required'
    });
  }
  
  const newService = {
    id: name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
    name,
    version,
    status: 'deploying',
    lastDeployed: new Date().toISOString()
  };
  
  res.status(201).json(newService);
});

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON format'
    });
  }
  
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
  console.log(`API documentation at http://localhost:${PORT}/api`);
});

module.exports = app;
