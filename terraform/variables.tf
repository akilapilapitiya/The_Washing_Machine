variable "location" {
  description = "AWS Region"
  type        = string
  default     = "ap-southeast-1"
}

variable "vm_size" {
  description = "Size of the EC2 Instance"
  type        = string
  default     = "t3.micro"
}

variable "project_name" {
  description = "Project name for tagging"
  type        = string
  default     = "the-washing-machine"
}

variable "admin_username" {
  description = "Admin username for the VM"
  type        = string
  default     = "ubuntu"
}

variable "ssh_public_key" {
  description = "Public key for SSH access"
  type        = string
}
