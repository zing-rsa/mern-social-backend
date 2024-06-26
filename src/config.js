config = module.exports

config.env = process.env.EXPRESS_ENV || 'dev';

config.express = {
  port: process.env.EXPRESS_PORT || 3080,
}

config.jwt_access_secret = process.env.JWT_ACCESS_SECRET;
config.jwt_refresh_secret = process.env.JWT_REFRESH_SECRET;

config.mongoUrl = process.env.MONGO_URL;
config.db_name = process.env.MONGO_DB_NAME;

config.posts_folder = process.env.POSTS_FOLDER;
config.avatar_folder = process.env.AVATAR_FOLDER;
config.banner_folder = process.env.BANNER_FOLDER;

config.maxFileSize = 2000000
config.allowedUploadTypes = [
  '.png',
  '.jpeg',
  '.jpg',
  '.gif'
]

config.cors = {
  origins: ["https://www.mern-social.zing-rsa.co.za","https://mern-social-frontend-mxim.onrender.com","http://localhost:3000"],
  default: "https://www.mern-social.zing-rsa.co.za"
}

config.aws_access_key_id = process.env.AWS_ACCESS_KEY_ID
config.aws_secret_key = process.env.AWS_SECRET_KEY
config.aws_region = process.env.AWS_REGION
config.aws_media_bucket_name = process.env.AWS_MEDIA_BUCKET_NAME

config.s3_url = (bucket, key) => `https://${bucket}.s3.amazonaws.com/${key}`;