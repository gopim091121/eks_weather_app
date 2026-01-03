variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "name" {
  description = "Base name for all resources"
  type        = string
  default     = "prod-eks"
}

variable "vpc_cidr" {
  description = "VPC CIDR"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnets" {
  description = "Public subnet definitions"
  type = map(object({
    cidr = string
    az   = string
  }))

  default = {
    a = { cidr = "10.0.1.0/24",  az = "us-east-1a" }
    b = { cidr = "10.0.2.0/24",  az = "us-east-1b" }
    c = { cidr = "10.0.3.0/24",  az = "us-east-1c" }
  }
}

variable "private_subnets" {
  description = "Private subnet definitions"
  type = map(object({
    cidr = string
    az   = string
  }))

  default = {
    a = { cidr = "10.0.11.0/24", az = "us-east-1a" }
    b = { cidr = "10.0.12.0/24", az = "us-east-1b" }
    c = { cidr = "10.0.13.0/24", az = "us-east-1c" }
  }
}

variable "eks_version" {
  description = "Kubernetes version for EKS"
  type        = string
  default     = "1.32"
}
variable "node_groups" {
  description = "List of EKS managed node groups"
  type = map(object({
    instance_types  = list(string)
    min_size       = number
    max_size       = number
    desired_size   = number
    labels         = map(string)
    taints         = list(string)
  }))
}

variable "secret_name" {
  description = "Base name for Secrets Manager secrets"
  type        = string
  default     = "eks_rds_secret"
}
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "appuser"
}
variable "addons" {
  description = "List of addons to install via Helm"
  type = list(object({
    name       = string
    namespace  = string
    repository = string
    chart      = string
    version    = string
    values     = map(any)
  }))
}