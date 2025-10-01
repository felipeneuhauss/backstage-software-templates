# Backstage Node App

A simple Node.js Express application designed as an example for Backstage integration.

## Features

- RESTful API endpoints
- Health check endpoint
- Service management endpoints
- User management endpoints
- Docker containerization
- Security middleware (Helmet, CORS)
- Request logging (Morgan)

## API Endpoints

### Base Endpoints
- `GET /` - Welcome message and API documentation
- `GET /health` - Health check with system and Git information
- `GET /api-status` - Comprehensive API status with GitHub integration
- `GET /api` - API information

### User Endpoints
- `GET /api/users` - List all users

### Service Endpoints
- `GET /api/services` - List all services
- `GET /api/services/:id` - Get specific service details
- `POST /api/services` - Create a new service

## Quick Start

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. The server will be available at `http://localhost:3000`

### Docker

1. Build the Docker image:
```bash
docker build -t backstage-node-app .
```

2. Run the container:
```bash
docker run -p 3000:3000 backstage-node-app
```

3. The server will be available at `http://localhost:3000`

### Docker Registry (Docker Hub)

To push the image to Docker Hub:

1. Tag the image with your Docker Hub username:
```bash
docker tag backstage-node-app:latest your-username/backstage-node-app:latest
docker tag backstage-node-app:latest your-username/backstage-node-app:v1
```

2. Push to Docker Hub:
```bash
docker push your-username/backstage-node-app:latest
docker push your-username/backstage-node-app:v1
```

3. Pull and run from Docker Hub:
```bash
docker pull your-username/backstage-node-app:latest
docker run -p 3000:3000 your-username/backstage-node-app:latest
```

**Example with felipeneuhauss registry:**
```bash
docker tag backstage-node-app:latest felipeneuhauss/node-app:latest
docker tag backstage-node-app:latest felipeneuhauss/node-app:v1
docker push felipeneuhauss/node-app:latest
docker push felipeneuhauss/node-app:v1
```

### Docker Compose (Optional)

Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Then run:
```bash
docker-compose up
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)
- `GITHUB_TOKEN` - GitHub API token for repository information (optional)
- `GITHUB_OWNER` - GitHub repository owner (default: fnaraujo)
- `GITHUB_REPO` - GitHub repository name (default: backstage-node-app)

### GitHub Integration Setup

1. Create a GitHub Personal Access Token:
   - Go to https://github.com/settings/tokens
   - Generate a new token with `repo` scope
   - Copy the token

2. Set environment variables:
```bash
export GITHUB_TOKEN=your_token_here
export GITHUB_OWNER=your_username
export GITHUB_REPO=your_repo_name
```

Or create a `.env` file (copy from `env.example`):
```bash
cp env.example .env
# Edit .env with your values
```

## Backstage Integration

This application is designed to be easily integrated with Backstage. The API endpoints provide:

1. **Service Discovery**: The `/api/services` endpoint can be used by Backstage to discover and catalog services
2. **Health Monitoring**: The `/health` endpoint provides health status with Git information
3. **Comprehensive Status**: The `/api-status` endpoint provides detailed service information including:
   - System metrics (memory, CPU, uptime)
   - Git information (branch, last commit, author)
   - GitHub repository data (stars, forks, issues, workflows)
   - Service metadata and endpoints
4. **Metadata**: Service endpoints include version, deployment status, and metrics information

### Example Backstage Integration

You can use this app as a backend service in your Backstage catalog by adding it to your `catalog-info.yaml`:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: backstage-node-app
  description: Example Node.js service for Backstage integration
spec:
  type: service
  lifecycle: production
  owner: platform-team
  providesApis:
    - backstage-node-app-api
```

## Development

### Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests (placeholder)

### Project Structure

```
├── server.js          # Main application file
├── package.json       # Dependencies and scripts
├── Dockerfile         # Docker configuration
├── .dockerignore      # Docker ignore file
└── README.md          # This file
```

## Security

The application includes several security middleware:

- **Helmet**: Sets various HTTP headers for security
- **CORS**: Configures Cross-Origin Resource Sharing
- **Input validation**: Basic validation for POST requests

## Monitoring

The application provides:

- Health check endpoint with system metrics
- Request logging with Morgan
- Error handling middleware
- Docker health checks

# Testing docker

```bash
docker run -p 8080:3000 node-app:latest
```

## Docker Image Versions

The application uses semantic versioning for Docker images:

- `latest` - Always points to the most recent stable version
- `v1` - Version 1.x.x releases
- `v1.0.0` - Specific patch version

### Available Images

- **Local build**: `backstage-node-app:latest`
- **Docker Hub**: `felipeneuhauss/node-app:latest`
- **Versioned**: `felipeneuhauss/node-app:v1`

### Image Details

- **Base Image**: `node:22-alpine` (Node.js 22 on Alpine Linux)
- **Size**: ~50MB (optimized with Alpine Linux)
- **Security**: Runs as non-root user (nodejs:1001)
- **Port**: 3000 (configurable via PORT environment variable)

# Tag para seu registry
docker tag backstage-node-app:latest felipeneuhauss/node-app:latest
docker tag backstage-node-app:latest felipeneuhauss/node-app:v1

# Push para Docker Hub
docker push felipeneuhauss/node-app:latest
docker push felipeneuhauss/node-app:v1

# Pull e execução
docker pull felipeneuhauss/node-app:latest
docker run -p 3000:3000 felipeneuhauss/node-app:latest

# Kubernets 

```bash
$ kind create cluster
$ cat <<EOF | kind create cluster --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
EOF
$ kubectl apply -f https://kind.sigs.k8s.io/examples/ingress/deploy-ingress-nginx.yaml

 $  docker images # check that one created felipeneuhauss/node-app:v1 and registered 
 # search for kubernets deployment, get the example
 $ mkdir k8s
 $ vi deploy.yaml # paste the example renaming things and adjusting the container name to the (e.g) felipeneuhauss/node-app:v1
 $ kubectl apply -f deploy.yaml
 $ kubectl get deployments # check deployments
 $ kubectl get pods # check pods
``` 

## Kubernetes Commands & Components

### 🚀 **Basic Commands**

```bash
# Create cluster with Kind
kind create cluster

# Apply configurations
kubectl apply -f service.yaml
kubectl apply -f deploy.yaml
kubectl apply -f ingress.yaml

# Check resources
kubectl get pods
kubectl get svc
kubectl get deployments
kubectl get ingress
kubectl get ingressclass

# Scale deployment
kubectl scale deployment backstage-node-app --replicas=3

# Describe resources (detailed info)
kubectl describe svc backstage-node-app
kubectl describe deployment backstage-node-app
kubectl describe pod <pod-name>
```

### 📦 **Kubernetes Components Explained**

#### **1. Deployment (`deploy.yaml`)**
- **What it is**: Manages your application pods
- **Purpose**: Ensures desired number of pods are running
- **Key fields**:
  - `replicas: 2` - Number of pod instances
  - `image: felipeneuhauss/node-app:v1` - Docker image to use
  - `containerPort: 3000` - Port your app listens on

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backstage-node-app
spec:
  replicas: 2  # ← Number of pods
  selector:
    matchLabels:
      app: backstage-node-app
  template:
    spec:
      containers:
      - name: backstage-node-app
        image: felipeneuhauss/node-app:v1  # ← Your Docker image
        ports:
        - containerPort: 3000  # ← App port
```

#### **2. Service (`service.yaml`)**
- **What it is**: Load balancer for your pods
- **Purpose**: Provides stable network access to your pods
- **Key fields**:
  - `selector: app: backstage-node-app` - Which pods to route to
  - `port: 80` - External port
  - `targetPort: 3000` - Pod port

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backstage-node-app
spec:
  selector:
    app: backstage-node-app  # ← Routes to pods with this label
  ports:
    - name: http
      port: 80        # ← External port
      targetPort: 3000 # ← Pod port
```

#### **3. Ingress (`ingress.yaml`)**
- **What it is**: HTTP/HTTPS routing from outside to services
- **Purpose**: Exposes your service to the internet with custom domains
- **Key fields**:
  - `host: api.localhost` - Domain name
  - `serviceName: backstage-node-app` - Which service to route to
  - `servicePort: 80` - Service port

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: backstage-node-app-ingress
spec:
  rules:
  - host: api.localhost  # ← Your domain
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backstage-node-app  # ← Your service
            port:
              number: 80
```

### 🔄 **Command Flow Explanation**

```bash
# 1. Apply Service first (creates load balancer)
kubectl apply -f service.yaml
# Result: Creates internal load balancer

# 2. Apply Deployment (creates pods)
kubectl apply -f deploy.yaml  
# Result: Creates 2 pods running your app

# 3. Scale if needed
kubectl scale deployment backstage-node-app --replicas=3
# Result: Now 3 pods running

# 4. Apply Ingress (exposes to internet)
kubectl apply -f ingress.yaml
# Result: App accessible via api.localhost

# 5. Check everything is working
kubectl get pods      # Should show 3 pods
kubectl get svc       # Should show 1 service
kubectl get ingress   # Should show 1 ingress
```

### 🎯 **What Each Command Does**

| Command | Purpose | Result |
|---------|---------|---------|
| `kubectl get pods` | List all pods | Shows running containers |
| `kubectl get svc` | List all services | Shows load balancers |
| `kubectl get deployments` | List deployments | Shows app managers |
| `kubectl get ingress` | List ingress rules | Shows external routing |
| `kubectl describe svc` | Service details | Shows endpoints, ports, selectors |
| `kubectl scale deployment` | Change pod count | Adds/removes pods |
| `kubectl apply -f` | Apply configuration | Creates/updates resources |

### 🌐 **Accessing Your App**

```bash
# Method 1: Port Forward (for testing)
kubectl port-forward service/backstage-node-app 8080:80
# Then access: http://localhost:8080

# Method 2: Via Ingress (production)
# Add to /etc/hosts: 127.0.0.1 api.localhost
# Then access: http://api.localhost

# Method 3: Direct pod access (debugging)
kubectl port-forward pod/<pod-name> 3000:3000
# Then access: http://localhost:3000
```

# Using helm

```bash
mkdir charts
cd charts
helm create backstage-node-app
cd backstage-node-app
# Update values accordinly
# Get manespaces
kubctl get ns
# Use -create-namespace to create a new one if does not exist above
helm install node-app -n backstage-node . --create-namespace

# List pods from a namespace
kubectl get pods -n backstage-node 

# Deletting namespace
helm uninstall backstage-app -n 
``` 

# ARGO CD

```bash
helm upgrade --install argocd argo/argo-cd -n argocd-backstage --create-namespace -f values.yaml
```

# Overview

Fechado 👇 aqui vai o diagrama em ASCII bem simples pra visualizar:

```
                   +---------------------------+
                   |        CLUSTER            |
                   |   (control plane + etc)   |
                   +---------------------------+
                     |            |           |
          ------------            |            ------------
         |                        |                        |
+----------------+      +----------------+       +----------------+
|    NODE 1      |      |    NODE 2      |       |    NODE 3      |
| (uma EC2/VM)   |      | (uma EC2/VM)   |       | (uma EC2/VM)   |
+----------------+      +----------------+       +----------------+
     |      |                 |     |                  |
     |      |                 |     |                  |
+--------+ +--------+     +--------+ +--------+    +--------+
|  Pod A | |  Pod B |     |  Pod C | |  Pod D |    |  Pod E |
| (API)  | | (API)  |     |(Frontend)| (API)  |    | (Redis)|
+--------+ +--------+     +--------+ +--------+    +--------+
```

👉 Lendo de cima pra baixo:

* **Cluster** = controla tudo.
* **Nodes** = cada caixinha “NODE” é um EC2 (ou VM).
* **Pods** = aplicações rodando dentro de cada Node.

⚡ Exemplo real:

* Node 1 tem 2 Pods da API.
* Node 2 tem 1 Pod do frontend e 1 Pod da API.
* Node 3 tem 1 Pod do Redis.

---

Quer que eu complete esse diagrama mostrando também o **Service** e o **Ingress** com DNS (`api.empresa.com` → Pods)?

## ArgoCD - GitOps Deployment

ArgoCD é uma ferramenta de GitOps que automatiza o deployment de aplicações no Kubernetes baseado em repositórios Git.

### 🚀 **Instalação do ArgoCD**

#### **1. Adicionar repositório Helm:**
```bash
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update
```

#### **2. Criar namespace e instalar:**
```bash
# Instalar ArgoCD no namespace argocd-backstage
helm upgrade --install argocd argo/argo-cd \
  -n argocd-backstage \
  --create-namespace \
  -f charts/argocd/values.yaml
```

#### **3. Verificar instalação:**
```bash
# Ver pods do ArgoCD
kubectl get pods -n argocd-backstage

# Ver services
kubectl get svc -n argocd-backstage

# Ver ingress
kubectl get ingress -n argocd-backstage
```

### 🔐 **Acesso ao ArgoCD**

#### **1. Obter senha do admin:**
```bash
# Obter senha inicial
kubectl -n argocd-backstage get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

#### **2. Port-forward para acesso local:**
```bash
# Fazer port-forward do ArgoCD server
kubectl port-forward svc/argocd-server -n argocd-backstage 8080:443 &

# Acessar no navegador
# https://localhost:8080
# Usuário: admin
# Senha: [senha obtida no passo anterior]
```

#### **3. Instalar ArgoCD CLI:**
```bash
# macOS
brew install argocd

# Login via CLI
argocd login localhost:8080 \
  --username admin \
  --password [sua-senha] \
  --insecure
```

### 🌐 **Configuração do Ingress**

#### **1. Adicionar domínio no hosts:**
```bash
# Editar /etc/hosts
sudo nano /etc/hosts

# Adicionar linha:
127.0.0.1 argocd.example.com
```

#### **2. Port-forward do nginx ingress:**

```bash
# Fazer port-forward do ingress controller
kubectl port-forward svc/ingress-nginx-controller \
  -n ingress-nginx 8081:80 &

# Acessar via domínio
# http://argocd.example.com:8081
```

### 📋 **Comandos Úteis do ArgoCD**

#### **Via CLI:**

```bash
# Listar aplicações
argocd app list

# Criar aplicação
argocd app create my-app \
  --repo https://github.com/user/repo \
  --path charts/my-app \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace default

# Sincronizar aplicação
argocd app sync my-app

# Ver status
argocd app get my-app
```

#### **Via API:**
```bash
# Login via API
curl -X POST https://localhost:8080/api/v1/session \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"[sua-senha]"}'

# Listar aplicações
curl -H "Authorization: Bearer [token]" \
  https://localhost:8080/api/v1/applications
```

### 🔧 **Configuração do values.yaml**

O arquivo `charts/argocd/values.yaml` contém:

```yaml
redis-ha:
  enabled: true

controller:
  replicas: 1

server:
  replicas: 1

repoServer:
  replicas: 1

applicationset:
  replicas: 1
  
global::
  domain: backstage-node-app-argocd.io

certificates:
  enabled: true

server:
  ingress:
    enabled: true
    className: nginx
    annotations: 
      nginx.ingress.kubernetes.io/backend-protocol: "HTTPS"
    hosts:
      - host: argocd.example.com
        paths:
          - path: /
            pathType: Prefix
    tls: []
```

### 🎯 **Troubleshooting**

#### **Problemas comuns:**

1. **Login não funciona via domínio:**
   - Use port-forward: `https://localhost:8080`
   - Ou configure HTTPS no ingress

2. **Ingress não funciona:**
   - Verificar se nginx ingress está rodando
   - Verificar se ingressClassName está configurado

3. **Pods em Pending:**
   - Normal em cluster single-node (Kind)
   - ArgoCD funciona com pods disponíveis

#### **Comandos de diagnóstico:**
```bash
# Ver logs do ArgoCD
kubectl logs -n argocd-backstage deployment/argocd-server

# Ver status dos ingress
kubectl describe ingress -n argocd-backstage

# Verificar conectividade
curl -k https://localhost:8080
```

### 🚀 **Próximos Passos**

1. **Criar aplicação no ArgoCD** para deploy automático
2. **Configurar repositório Git** com seus charts
3. **Configurar notificações** (Slack, Discord, etc.)
4. **Implementar GitOps workflow** completo

## License

MIT
