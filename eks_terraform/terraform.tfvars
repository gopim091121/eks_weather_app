region            = "us-east-1"
name              = "dev-eks-cluster"

secret_name        = "eks_rds_secret"
db_instance_class    = "db.t3.micro"
db_allocated_storage = 20
db_username          = "appuser"
rds_backup_retention_period = 1

node_groups = {
  frontend = {
    instance_types = ["t3.micro", "t3.small", "c7i-flex.large", "m7i-flex.large"]
    min_size      = 1
    max_size      = 15
    desired_size  = 14
    capacity_type = "ON_DEMAND"
    labels = {
      role = "frontend"
    }
    taints = []
    
  }
}
addons = [
  # {
  #   name       = "aws-load-balancer-controller"
  #   namespace  = "kube-system"
  #   repository = "https://aws.github.io/eks-charts"
  #   chart      = "aws-load-balancer-controller"
  #   version    = "1.7.2"
  #   values = {
  #      clusterName = "dev"
  #     # "serviceAccount.create" = true
  #     # "serviceAccount.name"   = "aws-load-balancer-controller"
  #   }
  # },
  {
    name       = "metrics-server"
    namespace  = "kube-system"
    repository = "https://kubernetes-sigs.github.io/metrics-server/"
    chart      = "metrics-server"
    version    = "3.12.1"
    values     = {}
  }
] 