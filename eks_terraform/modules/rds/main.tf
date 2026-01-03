resource "aws_db_subnet_group" "this" {
  name       = "${var.name}-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.name}-subnet-group"
  }
}

resource "aws_security_group" "this" {
  name        = "${var.name}-sg"
  description = "RDS security group"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.name}-sg"
  }
}

resource "aws_security_group_rule" "eks_to_rds" {
  type                     = "ingress"
  from_port                = 3306
  to_port                  = 3306
  protocol                 = "tcp"
  security_group_id        = aws_security_group.this.id
  source_security_group_id = var.eks_node_sg_id
}

resource "aws_db_instance" "this" {
  identifier              = var.name
  engine                  = var.engine
  engine_version          = var.engine_version
  instance_class          = var.instance_class
  allocated_storage       = var.allocated_storage

  username = var.username
  password = var.password

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.this.id]

  multi_az                = false
  storage_encrypted       = false
  publicly_accessible     = false
  backup_retention_period = var.rds_backup_retention_period
  skip_final_snapshot     = true

  tags = {
    Name = var.name
  }
}