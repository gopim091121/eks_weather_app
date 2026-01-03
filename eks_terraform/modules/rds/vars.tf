variable "name" {
  type = string
}

variable "engine" {
  type = string
}

variable "engine_version" {
  type = string
}

variable "instance_class" {
  type = string
}

variable "allocated_storage" {
  type = number
}

variable "username" {
  type = string
}

variable "password" {
  type      = string
  sensitive = true
}
variable "rds_backup_retention_period" {
  description = "Number of days to retain backups for RDS"
  type        = number
  default     = 1
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "vpc_id" {
  type = string
}

variable "eks_node_sg_id" {
  type = string
}