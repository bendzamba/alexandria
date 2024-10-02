# The following creates our Elastic File System
# While we could create a new one per application stage, this is unnecessary
# A single EFS can house as many stage-specific SQLite DB files as we need

resource "aws_efs_file_system" "efs_file_system" {
  lifecycle_policy {
    transition_to_ia = "AFTER_30_DAYS"
  }
  tags = {
    application = var.app_name
    Name        = "${var.app_name}-backend-efs-file-system"
  }
}

resource "aws_efs_access_point" "efs_access_point" {
  file_system_id  = aws_efs_file_system.efs_file_system.id
  tags            = {
    application = var.app_name
    Name        = "${var.app_name}-backend-efs-access-point"
  }
  posix_user {
    uid = 1000
    gid = 1000
  }
  root_directory {
    path = "/lambda"
    creation_info {
      owner_gid   = 1000
      owner_uid   = 1000
      permissions = "0777"
    }
  }
}

resource "aws_efs_mount_target" "efs_mount_target_1" {
  file_system_id  = aws_efs_file_system.efs_file_system.id
  subnet_id       = aws_subnet.public_subnet.id
  security_groups = [aws_security_group.efs_security_group.id]
}

resource "aws_efs_mount_target" "efs_mount_target_2" {
  file_system_id  = aws_efs_file_system.efs_file_system.id
  subnet_id       = aws_subnet.private_subnet_1.id
  security_groups = [aws_security_group.efs_security_group.id]
}

resource "aws_s3_bucket" "efs_datasync_bucket" {
  bucket  = "${var.app_name}-backend-s3-bucket-efs-datasync"
  tags    = {
    application = var.app_name
    environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "efs_datasync_s3_bucket_versioning" {
  bucket = aws_s3_bucket.efs_datasync_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_iam_role" "datasync_s3_role" {
  name = "${var.app_name}-datasync-s3-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = {
        Service = "datasync.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_policy" "datasync_s3_policy" {
  name = "${var.app_name}-datasync-s3-policy"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = [
          "s3:ListBucket",
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ],
        Effect   = "Allow",
        Resource = [
          aws_s3_bucket.efs_datasync_bucket.arn,
          "${aws_s3_bucket.efs_datasync_bucket.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "datasync_s3_policy_attach" {
  role       = aws_iam_role.datasync_s3_role.name
  policy_arn = aws_iam_policy.datasync_s3_policy.arn
}

resource "aws_datasync_location_efs" "efs_location" {
  ec2_config {
    security_group_arns = [aws_security_group.efs_security_group.arn]
    subnet_arn          = aws_subnet.public_subnet.arn
  }
  efs_file_system_arn = aws_efs_file_system.efs_file_system.arn
}

resource "aws_datasync_location_s3" "s3_location" {
  s3_bucket_arn = aws_s3_bucket.efs_datasync_bucket.arn
  subdirectory  = "/"  # Set this if you want to sync only part of the bucket
  s3_config {
    bucket_access_role_arn = aws_iam_role.datasync_s3_role.arn
  }
}

resource "aws_datasync_task" "datasync_task" {
  destination_location_arn = aws_datasync_location_s3.s3_location.arn
  name                     = "${var.app_name}-backend-efs-datasync"
  source_location_arn      = aws_datasync_location_efs.efs_location.arn
  schedule {
    schedule_expression = "${var.efs_datasync_schedule}"
  }
  depends_on = [
    aws_iam_role.datasync_s3_role,
    aws_iam_policy.datasync_s3_policy,
    aws_iam_role_policy_attachment.datasync_s3_policy_attach
  ]
} 