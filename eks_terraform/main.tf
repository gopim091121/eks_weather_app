terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
  }
}


provider "aws" {
  region = var.region
}

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

resource "random_password" "db" {
  length           = 20
  special          = true
  override_special = "!@#$%^&*()-_=+[]{}<>:?"
}

resource "aws_secretsmanager_secret" "db" {
  name = "${var.secret_name}/db/password"
}

resource "aws_secretsmanager_secret_version" "db" {
  secret_id     = aws_secretsmanager_secret.db.id
  secret_string = random_password.db.result
}

data "aws_secretsmanager_secret_version" "db" {
  secret_id = aws_secretsmanager_secret.db.id
}

# ---------------- RDS ----------------

module "rds" {
  source = "./modules/rds"

  name              = "${var.name}-db"
  engine            = "mysql"
  engine_version    = "8.0.35"
  instance_class    = var.db_instance_class
  allocated_storage = var.db_allocated_storage

  username = var.db_username
  password = data.aws_secretsmanager_secret_version.db.secret_string

  private_subnet_ids = module.vpc.private_subnet_ids
  vpc_id             = module.vpc.vpc_id

  eks_node_sg_id = module.eks.node_sg_id
}

# ---------------- Addons (ALB + metrics-server) ----------------
module "addons" {
  source = "./modules/addons"

  name                   = var.name
  cluster_name           = module.eks.cluster_name
  cluster_endpoint       = module.eks.cluster_endpoint
  cluster_ca_certificate = module.eks.cluster_ca_certificate
  oidc_provider_arn      = module.eks.oidc_provider_arn
  oidc_provider_url      = module.eks.oidc_provider_url

  addons = var.addons
    vpc_id = module.vpc.vpc_id
}