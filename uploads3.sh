#!/bin/bash
S3_BUCKET_PATH="s3://creditwise-it-cloud-site-assets-1/uploads/"

SOURCE_FILE="/var/log/auth.log"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

INSTANCE_ID=$(wget -q -O - http://169.254.169.254/latest/meta-data/instance-id)

/usr/bin/aws s3 cp $SOURCE_FILE ${S3_BUCKET_PATH}auth-$INSTANCE_ID-$TIMESTAMP.log