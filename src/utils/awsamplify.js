import fs from 'fs';
import { Storage } from 'aws-amplify';

// Set up environment variables
const AWS_CONFIG = {
  aws_project_region: process.env.AWS_PROJECT_REGION,
  aws_cognito_identity_pool_id: process.env.AWS_COGNITO_IDENTITY_POOL_ID,
  aws_cognito_region: process.env.AWS_COGNITO_REGION,
  aws_user_pools_id: process.env.AWS_USER_POOLS_ID,
  aws_user_pools_web_client_id: process.env.AWS_USER_POOLS_WEB_CLIENT_ID,
  aws_appsync_graphqlEndpoint: process.env.AWS_APPSYNC_GRAPHQL_ENDPOINT,
  aws_appsync_region: process.env.AWS_APPSYNC_REGION,
  aws_appsync_authenticationType: process.env.AWS_APPSYNC_AUTHENTICATION_TYPE,
  aws_s3_bucket: process.env.AWS_S3_BUCKET,
  aws_s3_region: process.env.AWS_S3_REGION
};

Storage.configure(AWS_CONFIG);

// Function to upload image to AWS S3
const uploadOnAWS = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await Storage.put(localFilePath, {
      level: 'public',
      contentType: 'image/jpeg' // Adjust content type as needed
    });

    // Optionally, you can delete the local file here if needed

    return response;
  } catch (error) {
    console.error('Error uploading image to AWS S3:', error);
    return null;
  }
};

// Function to delete image from AWS S3
const deleteFromAWS = async (key) => {
  try {
    if (!key) return null;

    const response = await Storage.remove(key);

    return response;
  } catch (error) {
    console.error('Error deleting image from AWS S3:', error);
    return null;
  }
};

export { uploadOnAWS, deleteFromAWS };
