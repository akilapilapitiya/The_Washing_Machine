# Terraform — Infrastructure Reference

## Overview

This directory contains the complete Infrastructure as Code (IaC) definition for The Washing Machine's production environment on Microsoft Azure. Terraform provisions all cloud resources required to run the application: the virtual machine, networking layer, firewall rules, and static public IP.

State is stored remotely in GitLab's managed Terraform backend, enabling safe concurrent operations and full history tracking through the CI/CD pipeline.

---

## Resources Provisioned

The following Azure resources are created and managed by this configuration:

| Resource | Type | Name Pattern |
|---|---|---|
| Resource Group | `azurerm_resource_group` | `{project_name}-rg` |
| Virtual Network | `azurerm_virtual_network` | `{project_name}-vnet` |
| Subnet | `azurerm_subnet` | `internal` (10.0.1.0/24) |
| Public IP | `azurerm_public_ip` | `{project_name}-pip` |
| Network Security Group | `azurerm_network_security_group` | `{project_name}-nsg` |
| Network Interface | `azurerm_network_interface` | `{project_name}-nic` |
| NSG Association | `azurerm_network_interface_security_group_association` | — |
| Linux VM | `azurerm_linux_virtual_machine` | `{project_name}-vm` |

All names are parameterised through the `project_name` variable (default: `the-washing-machine`).

---

## Network Security Rules

The NSG grants the following inbound access:

| Rule Name | Priority | Port | Protocol | Purpose |
|---|---|---|---|---|
| SSH | 1001 | 22 | TCP | Remote administration |
| HTTP | 1002 | 80 | TCP | Web traffic + Let's Encrypt ACME challenge |
| API | 1003 | 5500 | TCP | Direct backend access (if needed) |
| HTTPS | 1004 | 443 | TCP | SSL web traffic |

All outbound traffic is permitted by default (Azure default egress rule).

---

## Virtual Machine Specification

| Property | Value |
|---|---|
| Image | Ubuntu Server 22.04 LTS (Canonical) |
| Size | Standard_B1s (1 vCPU, 1 GB RAM) |
| OS Disk | Standard_LRS, ReadWrite cache |
| Authentication | SSH public key only (password disabled) |
| Admin user | `azureuser` (configurable) |
| Public IP | Static, Standard SKU |

### cloud-init (user_data)

The VM runs the following bootstrap script on first boot via `user_data`:

```bash
# 2GB swap file — critical for B1s to avoid OOM under Docker load
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Docker installation
apt-get update
apt-get install -y docker.io docker-compose-v2
usermod -aG docker azureuser
```

The swap allocation is intentional — the B1s SKU has only 1 GB RAM, which is insufficient for running Docker with four containers concurrently. The 2 GB swap file prevents out-of-memory kills during container startup and peak load.

---

## File Structure

| File | Purpose |
|---|---|
| `provider.tf` | Terraform version constraints, AzureRM provider, GitLab HTTP backend |
| `variables.tf` | Input variable declarations with defaults |
| `main.tf` | All resource definitions |
| `outputs.tf` | Exports the VM's public IP address post-apply |

---

## Variables

| Variable | Type | Default | Description |
|---|---|---|---|
| `location` | string | `East US` | Azure region for all resources |
| `vm_size` | string | `Standard_B1s` | Azure VM SKU |
| `project_name` | string | `the-washing-machine` | Prefix for all resource names and tags |
| `admin_username` | string | `azureuser` | Linux admin user created on the VM |
| `ssh_public_key` | string | — | RSA public key for SSH access. **No default — must be supplied.** |

`ssh_public_key` is provided via the `TF_VAR_ssh_public_key` environment variable set as a GitLab CI/CD variable. It is never stored in the repository.

---

## Outputs

| Output | Description |
|---|---|
| `instance_public_ip` | The static public IP address assigned to the VM |

The GitLab CI/CD pipeline writes this value to `server_ip.txt` as a job artifact, which is consumed by the subsequent `build:frontend` and `deploy:prod` stages to set the correct API URL and SSH target.

---

## State Management

State is stored in GitLab's managed Terraform HTTP backend, configured in `provider.tf`:

```hcl
backend "http" {
  # Configured at runtime via GitLab CI/CD environment variables:
  # TF_HTTP_ADDRESS, TF_HTTP_LOCK_ADDRESS, TF_HTTP_UNLOCK_ADDRESS
  # TF_HTTP_USERNAME, TF_HTTP_PASSWORD
}
```

GitLab CI/CD injects these variables automatically when using the `gitlab-terraform` image in the pipeline. State locking is handled by GitLab to prevent concurrent applies.

Do not run `terraform apply` locally against the production state without first ensuring no pipeline is running, as this will conflict with the remote lock.

---

## Provider

```hcl
provider "azurerm" {
  features {}
}
```

The AzureRM provider authenticates using service principal credentials injected by the CI/CD pipeline as environment variables:

| Variable | Description |
|---|---|
| `ARM_CLIENT_ID` | Service principal application ID |
| `ARM_CLIENT_SECRET` | Service principal password |
| `ARM_SUBSCRIPTION_ID` | Target Azure subscription |
| `ARM_TENANT_ID` | Azure Active Directory tenant |

These are set as protected GitLab CI/CD variables and are never stored in code.

---

## CI/CD Integration

Terraform is executed in the `infra` stage of the GitLab pipeline using the `registry.gitlab.com/gitlab-org/terraform-images/stable:latest` image. The pipeline runs on pushes to `main` and `feat/production-automation`.

```
terraform init   → Initialises the GitLab HTTP backend
terraform plan   → Shows planned changes (output saved as artifact)
terraform apply  → Applies changes; outputs instance_public_ip to server_ip.txt
```

The `server_ip.txt` artifact is passed to:
- `build:frontend` — sets `VITE_API_BASE_URL` (now a fixed domain URL)
- `deploy:prod` — sets the SSH target for file transfer and container orchestration

---

## Running Manually

For local development or emergency operations, provide credentials as environment variables:

```bash
export ARM_CLIENT_ID="..."
export ARM_CLIENT_SECRET="..."
export ARM_SUBSCRIPTION_ID="..."
export ARM_TENANT_ID="..."
export TF_VAR_ssh_public_key="$(cat ~/.ssh/id_rsa.pub)"

terraform init \
  -backend-config="address=https://gitlab.com/api/v4/projects/<PROJECT_ID>/terraform/state/default" \
  -backend-config="lock_address=..." \
  -backend-config="unlock_address=..." \
  -backend-config="username=<GITLAB_USERNAME>" \
  -backend-config="password=<GITLAB_TOKEN>"

terraform plan
terraform apply
```

Replace backend config values with those from your GitLab project's Terraform state settings page.

---

## Destroying Infrastructure

```bash
terraform destroy
```

This will permanently delete the resource group and all resources within it, including the VM and its disk. All Docker volumes and application data stored on the VM will be lost. Ensure database backups are taken before destroying.
