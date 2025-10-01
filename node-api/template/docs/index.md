# ${{values.app_name}}

Welcome to the ${{values.app_name}} documentation!

Access the application on ${{values.app_name}}-${{values.app_env}}.test.com/

## Overview

This is an example of a API in Node.js application that demonstrates how to integrate a Node.js service with Backstage.

## Features

- RESTful API endpoints
- Health check endpoint
- User management
- GitHub integration
- Comprehensive testing suite

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Docker (optional, for containerized deployment)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. Start the application:
   ```bash
   npm start
   ```

## API Endpoints

### Health Check
- `GET /health` - Returns the health status of the application

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Configuration

The application can be configured through environment variables. See `env.example` for available options.

## Testing

Run the test suite:
```bash
npm test
```

## Deployment

### Docker

Build and run with Docker:
```bash
docker build -t backstage-node-app .
docker run -p 3000:3000 backstage-node-app
```

### Kubernetes

Deployment manifests are available in the `k8s/` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.