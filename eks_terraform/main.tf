
# ---------------- VPC ----------------

module "vpc" {
  source = "./modules/vpc"

  name            = var.name
  vpc_cidr        = var.vpc_cidr
  public_subnets  = var.public_subnets
  private_subnets = var.private_subnets
}

# ---------------- EKS ----------------

module "eks" {
  source = "./modules/eks"

  name               = var.name
  eks_version        = var.eks_version
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  public_subnet_ids  = module.vpc.public_subnet_ids

  node_groups = var.node_groups
}

# ---------------- Secrets Manager for DB password ----------------
resource "random_password" "rds" {
  length           = 12
  special          = true
  override_special = "_@"
}

resource "random_string" "secret_suffix" {
  length  = 6
  special = false
}

resource "aws_secretsmanager_secret" "rds" {
  name = "myapp-rds-secret-${random_string.secret_suffix.result}"
}

resource "aws_secretsmanager_secret_version" "rds" {
  secret_id = aws_secretsmanager_secret.rds.id

  secret_string = jsonencode({
    username = "admin"
    password = random_password.rds.result
  })
}
# ---------------- RDS ----------------

module "rds" {
  source = "./modules/rds"

  name              = "${var.name}-db"
  engine            = "mysql"
  engine_version    = "8.0.43"
  instance_class    = var.db_instance_class
  allocated_storage = var.db_allocated_storage
  rds_backup_retention_period =  var.rds_backup_retention_period

  username = var.db_username
  # password = data.aws_secretsmanager_secret_version.db.secret_string
  password = random_password.rds.result

  private_subnet_ids = module.vpc.private_subnet_ids
  vpc_id             = module.vpc.vpc_id

  eks_node_sg_id = module.eks.node_sg_id
}

# ---------------- Addons (ALB + metrics-server) ----------------
module "addons" {
  source = "./modules/addons"

  name                   = var.name
  region                 = var.region
  cluster_name           = module.eks.cluster_name
  cluster_endpoint       = module.eks.cluster_endpoint
  cluster_ca_certificate = module.eks.cluster_ca_certificate
  oidc_provider_arn      = module.eks.oidc_provider_arn
  oidc_provider_url      = module.eks.oidc_provider_url
  addons                 = var.addons
  vpc_id                 = module.vpc.vpc_id

  depends_on = [
    module.eks
  ]
}
resource "aws_instance" "example" {
  ami           = "ami-0ecb62995f68bb549" # Amazon Linux 2 AMI ID for us-east-1
  instance_type = "t3.micro"
  vpc_id        = module.vpc.vpc_id
  subnet_id     = module.vpc.public_subnet_ids[0]
  key_name      = "gitlab_runner"
  security_group_ids = [module.eks.node_sg_id]
  user_data = file("setup_instance.sh")

  tags = {
    Name = "ExampleInstance"
  }
  depends_on = [
    module.eks
  ]
}