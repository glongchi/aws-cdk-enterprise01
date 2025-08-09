# 🚀 AWS CDK PoC Project: ALB + ECS + S3 Logging

## 📌 Purpose

This project explores using **AWS Cloud Development Kit (CDK)** in **TypeScript**, to implement a PoC project, focusing on:

- Hosting a containerized application using **Amazon ECS with Fargate**
- Exposing the application using an **Application Load Balancer (ALB)**
- Storing ALB access logs in an **S3 bucket**
- Enforcing security best practices with **Security Groups** and **IAM policies**
- It supports **multi-environment deployments** (e.g., `dev`, `qa`, `stg`, `prod`) through environment config files to customize key properties accross environments and follows AWS infrastructure-as-code best practices.

---

## 📁 Project Structure

```

├── README.md
├── bin
│   └── app-infra.ts # ckd app to provision application stack( we are using only on stack for this simple infra)
├── env
│   ├── base.json
│   ├── dev.json # overrides specific configs in base.json with dev specific properties
│   ├── prod.json # overrides specific configs in base.json with prod specific properties
│   ├── qa.json # overrides specific configs in base.json with qa specific properties
│   └── stg.json # overrides specific configs in base.json with stg specific properties
├── env-config-loader.ts # loads base.json and target <env>.json based on the target environment
├── lib
│   ├── application
│   │   ├── alb-ecs-construct.ts # custom construct includes ALB, ECS cluster, service, task definitions
│   │   └── app-stack.ts # single stack with logic to initialize all props for the different constructs
│   ├── aws-cdk-enterprise01-stack.ts
│   ├── local-image
│   │   ├── Dockerfile
│   │   ├── app.py
│   │   └── requirements.txt
│   ├── models
│   │   └── env-config.model.ts
│   ├── networking
│   │   └── vpc-construct.ts # custom construct implementation of ECS cluster, service, task definitions
│   ├── shared
│   │   ├── base.props.ts # common attributes shared accross used accross constructs and stacks
│   │   └── logging-bucket.ts # logging bucket with configurable accross different environments
│   └── utils
│       └── helpers.ts # utililty method used accross
├── package-lock.json
├── package.json
└── tsconfig.json

```

Note the code has been refactored and organized to be maintenance friendly as the project grows.
Due to the simplicity of the PoC, we are using a single stack, but can be reorganized into multiple stacks
based on functionality , application tier, ... etc

---

## ⚙️ Deployment Instructions

### 🔧 Prerequisites

Install the following tools; required to deploy the infrastructure

- Node.js >=18.0.0 <20.0.0: Follow this [link](https://nodejs.org/en/download) for installation instruction for Mac or windows
- AWS CLI v2 installation: Installation [Link](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

- AWS CLI configured (`aws configure`) : Configure your AWS Profile, ensure the user has the right permissions for the target AWS Account
- AWS CDK ≥ v2.x (`npm install -g aws-cdk`)
- Docker Runtime example Docker deskop (for building ECS images): See [link](https://docs.docker.com/desktop/) for docker Desktop installation

### 🧪 Install Dependencies

```bash
# run the following command to install package dependencies in package.json
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
   #command definition in package.json script# export DEPLOYMENT_ENV='dev' && cdk deploy
   npm run deploy:dev
   ```

3. ** Access Application **
   Go to AWS console and copy the DNS name of the ALB the application(browser, Postman, or curl command) at http://<dns-name>

---

## 🧠 Design Highlights

### ✅ ECS with Fargate

- Deploys the backend service in the **private subnet** with port mappings 80:80
- **Task definition** includes resource requests and limit, container image, environment variables
<!-- - Integrated with **CloudWatch Logs** for container logs -->

### ✅ Application Load Balancer (ALB)

- Public-facing ALB with HTTP listener
- Targets the ECS service using port 80
- Access logs delivered to **S3** with prefix based on environment(this will help identify
  the logs streams from different env in a centralized observability tool )

### ✅ S3 Logging Bucket

- Dedicated S3 bucket with:
  - **Server-side encryption**
  - **Versioning**
  - **Lifecycle policy** to expire logs; Lifecycle transition and expiration durations are configurable accross environments
  - **Blocked public access**

### ✅ Security Groups

- SG for ALB: allows inbound HTTP
- SG for ECS tasks: allows inbound from ALB SG only
- Outbound rules restricted where applicable

### ✅ Multi-Environment Support

Each environment (e.g., dev, prod) is a separate CDK `Stage`, allowing isolated deployments:
All resource names are prefixed with an environment aware prefix(`<projectPrefix>-<deploymentEnv>` ex: EMD-Dev)
This way resource name conflict is avoided when deploying same infra accross multiple environments.
we provide environment configuration parameters for vpc, alb, ECS S3Bucket Log to allow customization based on
each environment needs.
All defaults are configured in a `/env/base.json` file with specific customizations/overrides implemented in envrionment specfic config files e.g.`dev.json`, `prod.json`,

---

## 📈 CI/CD Integration

The deployment script have been configured in package.json for easy integration of CI/CD to multiple
environments.

```json
  "scripts": {
    "deploy:dev": "export DEPLOYMENT_ENV='dev' && cdk deploy",
    "deploy:qa": "export DEPLOYMENT_ENV='qa' && cdk deploy",
    "deploy:stg": "export DEPLOYMENT_ENV='stg' && cdk deploy",
    "deploy:prod": "export DEPLOYMENT_ENV='prod' && cdk deploy"
  },
```

---
