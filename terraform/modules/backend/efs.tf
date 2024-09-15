resource "aws_efs_file_system" "efs_file_system" {
  lifecycle_policy {
    transition_to_ia = "AFTER_30_DAYS"
  }
  tags = {
    application = var.app_name
    environment = var.environment
  }
}

resource "aws_efs_access_point" "efs_access_point" {
  file_system_id = aws_efs_file_system.efs_file_system.id

  posix_user {
    uid = 1000
    gid = 1000
  }

  root_directory {
    path = "/"
    creation_info {
      owner_gid   = 1000
      owner_uid   = 1000
      permissions = "0755"
    }
  }

  tags = {
    application = var.app_name
    environment = var.environment
  }
}