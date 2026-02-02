import aws from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.AWS_ACCESS_KEY_ID) {
  console.warn("AWS credentials not set. File uploads will fail.");
}

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "ap-south-1",
});

const s3 = new aws.S3();
export default s3;
