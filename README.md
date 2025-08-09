# 🚀 AWS CDK PoC Project: ALB + ECS + S3 Logging

## 📌 Purpose

This project explores using **AWS Cloud Development Kit (CDK)** in **TypeScript**, to implement a PoC project, focusing on:

- Hosting a containerized application using **Amazon ECS with Fargate**
- Exposing the application using an **Application Load Balancer (ALB)**
- Storing ALB access logs in an **S3 bucket**
- Enforcing security best practices with **Security Groups** and **IAM policies**

It supports **multi-environment deployments** (e.g., `dev`, `stg`, `prod`) and follows AWS infrastructure-as-code best practices.

---

## 📁 Project Structure

```
cdk-app/
├── bin/
│   └── main.ts               # Entry point of the CDK app
├── lib/
│   ├── stacks/
│   │   ├── ecs-stack.ts      # ECS cluster, service, task definitions
│   │   ├── alb-stack.ts      # Application Load Balancer & listeners
│   │   └── logging-stack.ts  # S3 bucket for logs
│   └── stages/
│       └── DevStage.ts       # CDK Stage for dev environment
├── config/
│   └── env-config.ts         # Environment-specific parameters
├── test/
├── cdk.json
├── package.json
└── README.md
```

---

## ⚙️ Deployment Instructions

### 🔧 Prerequisites
The following  Make sure you have the following ap
- Node.js >=18.0.0 <20.0.0: Follow this [link](https://nodejs.org/en/download) for installation instruction for Mac or windows
- AWS CLI v2 installation: Installation [Link](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

- AWS CLI configured (`aws configure`)
- AWS CDK ≥ v2.x (`npm install -g aws-cdk`)
- Docker Runtime example Docker deskop (for building ECS images): See [link](https://docs.docker.com/desktop/) for docker Desktop installation 

### 🧪 Install Dependencies

```bash
npm install
```

### 🏗️ Deploy to an Environment


1. **Bootstrap the environment** (only once per account/region):

   ```bash
   cdk bootstrap 
   ```

2. **Build and deploy**:

   ```bash
   #build 
   npm run build
   #deploy
   cdk deploy 
   ```
3. ** Access Application **
   Go to AWS console and copy the DNS name of the ALB the application(browser, postman, or curl command) at http://<dns-name>


---

## 🧠 Design Highlights

### ✅ ECS with Fargate

- Deploys a service in a **public subnet** with port mappings
- **Task definition** includes resource limits, container image, environment variables
<!-- - Integrated with **CloudWatch Logs** for container logs -->

### ✅ Application Load Balancer (ALB)

- Public-facing ALB with HTTP listener
- Targets the ECS service using port 80
- Access logs delivered to **S3** with prefix based on environment(this will help identify
the logs steams from different env in a centralized observability tool )

### ✅ S3 Logging Bucket

- Dedicated S3 bucket with:
  - **Server-side encryption**
  - **Versioning**
  - **Lifecycle policy** to expire logs
  - **Blocked public access**

### ✅ Security Groups

- SG for ALB: allows inbound HTTP
- SG for ECS tasks: allows inbound from ALB SG only
- Outbound rules restricted where applicable

### ✅ Multi-Environment Support

Each environment (e.g., dev, prod) is a separate CDK `Stage`, allowing isolated deployments:

```bash
cdk deploy --context env=prod
```

---

## 📈 CI/CD Integration

This project is compatible with GitHub Actions, CodePipeline, etc. Sample GitHub Actions step:

```yaml
- name: CDK Deploy
  run: |
    npm ci
    npm run build
    cdk deploy --require-approval never --context env=prod
```

---

## 🧪 Testing

```bash
npm run test
```

---

## 🧰 Helpful Commands

```bash
cdk synth          # Generate CloudFormation templates
cdk diff           # Show infrastructure changes
cdk deploy         # Deploy to AWS
cdk destroy        # Teardown deployed stacks
```

---