# Terraform — AWS Infrastructure

## Overview

This directory contains the Infrastructure as Code (IaC) definition for "The Washing Machine" production environment on **Amazon Web Services (AWS)**. It provisions a single-server architecture in the **Singapore (ap-southeast-1)** region.

State is stored remotely in GitLab's managed Terraform backend, enabling safe concurrent operations and full history tracking through your CI/CD pipeline.

---

## Resources Provisioned (AWS ap-southeast-1)

| Resource | Type | Purpose |
|---|---|---|
| VPC | `aws_vpc` | Isolated network (`10.0.0.0/16`) |
| Subnet | `aws_subnet` | Public subnet (`10.0.1.0/24`) |
| Gateway | `aws_internet_gateway` | Internet access for the VPC |
| Security Group | `aws_security_group` | Firewall (Ports 22, 80, 443, 5500) |
| EC2 Instance | `aws_instance` | Ubuntu 22.04 LTS (t3.micro) |
| Elastic IP | `aws_eip` | Static public IP address |
| Key Pair | `aws_key_pair` | SSH access authentication |

---

## Security Rules (Inbound)

| Port | Protocol | Purpose |
|---|---|---|
| 22 | TCP | SSH Administration |
| 80 | TCP | HTTP Traffic / Certbot Challenge |
| 443 | TCP | HTTPS Traffic |
| 5500 | TCP | API Backend Access |

---

## Setup & Configuration

### 1. Local Variables
Sensitive variables (like your SSH key) should be stored in `terraform.tfvars`. This file is **ignored by git** to prevent credential leaks.

1. Copy the example file:
   ```bash
   cp example.tfvars terraform.tfvars
   ```
2. Edit `terraform.tfvars` and paste your RSA public key:
   ```hcl
   ssh_public_key = "ssh-rsa AAAAB3NzaC1yc2E..."
   ```

### 2. Provider Authentication
The pipeline authenticates using the following environment variables:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

---

## CI/CD Pipeline Integration

Terraform runs automatically on every push via **GitLab CI**. The results of the `terraform apply` (the public IP) are passed to the deployment stage to update your API URLs and SSH targets.

- **Trigger**: Every push to any branch.
- **Backend**: GitLab Managed HTTP State.

---

## Running Manually

To run Terraform from your local machine:

```bash
export AWS_ACCESS_KEY_ID="your_key"
export AWS_SECRET_ACCESS_KEY="your_secret"

terraform init \
  -backend-config="address=https://gitlab.com/api/v4/projects/<PROJECT_ID>/terraform/state/default" \
  -backend-config="username=<GITLAB_USER>" \
  -backend-config="password=<GITLAB_TOKEN>"

terraform plan
terraform apply
```
