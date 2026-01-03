variable "name" {
  type = string
}

variable "eks_version" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "public_subnet_ids" {
  type = list(string)
}

# variable "node_min_size" {
#   type        = number
#   description = "Minimum number of nodes"
# }

# variable "node_max_size" {
#   type        = number
#   description = "Maximum number of nodes"
# }

# variable "node_desired_size" {
#   type        = number
#   description = "Desired number of nodes"
# }
# variable "node_instance_type" {
#   type = string
# }

variable "node_groups" {
  type = map(object({
    instance_type = string
    min_size      = number
    max_size      = number
    desired_size  = number
    labels        = map(string)
    taints        = list(string)
  }))
}