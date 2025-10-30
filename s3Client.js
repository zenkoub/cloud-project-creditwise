// s3Client.js
import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

// Get your region from your .env file
const region = process.env.AWS_REGION || "us-east-1"; 

// The SDK will automatically find your credentials
// from the /home/ubuntu/.aws/credentials file.
export const s3Client = new S3Client({ region });

// Export your bucket name for easy use
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;