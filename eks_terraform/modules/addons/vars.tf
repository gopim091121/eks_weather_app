variable "name" {
  type = string
}

variable "cluster_name" {
  type = string
}

variable "cluster_endpoint" {
  type = string
}

variable "cluster_ca_certificate" {
  type = string
}

variable "oidc_provider_arn" {
  type = string
}

variable "oidc_provider_url" {
  type = string
}

variable "vpc_id" {
  type = string
}
variable "addons" {
  type = list(object({
    name       = string
    namespace  = string
    repository = string
    chart      = string
    version    = string
    values     = map(string)
  }))
}