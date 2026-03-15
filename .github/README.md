# GitHub Actions — Automation Reference

## Overview

GitHub Actions is used in this project primarily as a continuous synchronization gateway. Since the main mission-critical CI/CD pipelines, Infrastructure-as-Code (Terraform) states, and Docker registries are hosted on **GitLab**, these actions ensure that the GitHub repository remains a perfect mirror of the primary workspace.

---

## Workflows

### 1. Mirror to GitLab (`mirror.yml`)

This workflow triggers on every `push` and `pull_request` to the `main` branch. It ensures that all code changes are instantly pushed to the GitLab secondary remote.

*   **Trigger**: Push or PR to `main`.
*   **Target**: `https://gitlab.com/akilapilapitiya/The_Washing_Machine.git`
*   **Mechanism**: Uses `actions/checkout@v4` with full fetch depth to preserve commit history during the force-push synchronization.

---

## Required Secrets

To enable repository mirroring, the following Repository Secrets must be configured in GitHub settings:

| Secret | Description |
|---|---|
| `GITLAB_USERNAME` | GitLab account username for authentication |
| `GITLAB_TOKEN` | GitLab Personal Access Token (PAT) with `write_repository` permissions |

---

## Architecture Note

The heavy-lifting automation (Build, Deploy, SSL, Seeding, and Infrastructure) is handled by the **GitLab CI** pipeline defined in `.gitlab-ci.yml`. This GitHub Action serves as the "source-of-truth" bridge to trigger those downstream pipelines automatically upon code arrival on GitLab.

---

> [!NOTE]
> All deployment-related troubleshooting should be conducted within the GitLab CI/CD console, as GitHub Actions only handles the initial code transportation.
