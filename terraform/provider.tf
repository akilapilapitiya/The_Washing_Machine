terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "http" {
    # GitLab managed terraform state
  }
}

provider "aws" {
  region = var.location
}
