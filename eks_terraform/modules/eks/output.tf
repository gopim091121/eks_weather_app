output "cluster_name" {
  value = aws_eks_cluster.this.name
}

output "cluster_endpoint" {
  value = aws_eks_cluster.this.endpoint
}

output "cluster_ca_certificate" {
  value = aws_eks_cluster.this.certificate_authority[0].data
}

# output "node_group_name" {
#   value = aws_eks_node_group.default.node_group_name
# }
output "node_group_names" {
  description = "Names of all EKS managed node groups"
  value       = keys(aws_eks_node_group.this)
}
output "oidc_provider_arn" {
  value = aws_iam_openid_connect_provider.this.arn
}

output "oidc_provider_url" {
  value = aws_iam_openid_connect_provider.this.url
}

output "node_sg_id" {
  value = aws_security_group.node.id
}