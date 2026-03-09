terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }

  backend "http" {
    # GitLab managed terraform state
  }
}

provider "azurerm" {
  features {}
}
