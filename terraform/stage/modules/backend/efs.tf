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
  file_system_id = aws_efs_file_system.efs_file_system.id

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

  tags = {
    application = var.app_name
    Name        = "${var.app_name}-backend-efs-access-point"
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