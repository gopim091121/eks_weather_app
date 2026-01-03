data "aws_iam_policy_document" "alb_controller_assume_role" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [module.eks.oidc_provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "${replace(module.eks.oidc_provider_url, "https://", "")}:sub"
      values   = ["system:serviceaccount:kube-system:aws-load-balancer-controller"]
    }
  }
}

resource "aws_iam_role" "alb_controller" {
  name               = "${var.name}-alb-controller-role"
  assume_role_policy = data.aws_iam_policy_document.alb_controller_assume_role.json
}

data "aws_iam_policy_document" "alb_controller_policy" {
  # You can inline AWS policy here, or attach the managed one if you created it.
  # Easiest: use the official JSON file and convert to Terraform, but I’ll keep it abstract:
  # For brevity, I assume you already have a JSON policy in a file.
}

resource "aws_iam_policy" "alb_controller" {
  name   = "${var.name}-alb-controller-policy"
  policy = data.aws_iam_policy_document.alb_controller_policy.json
}

resource "aws_iam_role_policy_attachment" "alb_controller_attach" {
  role       = aws_iam_role.alb_controller.name
  policy_arn = aws_iam_policy.alb_controller.arn
}