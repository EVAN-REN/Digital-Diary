# Books Diary
We used AWS to serve our service serverless. \
Our service helps clients to search books, save books, update comments and ratings, get recommendations and so on. 

## System Architecture
![system_architecture](https://github.com/jonghwan3/BooksDiary/assets/97586094/b2197774-16e5-4f48-884f-d99ee322a0e2)

As we have uploaded detailed report and demo already, we will skip detailed explanations realted those here. \
However, I will mainly focus on how to configure environments on AWS and how my repository is structured.
   
---

# Repository

This guide will help you understand our codes' structure and thier functions

## Root Directory
- **README.md**: Main repository documentation.
- **AWS_CloudFormation_debian.yaml**: Build EC2 server following [CloudFormation](#cloudformation)

## Frontend resources
All resources here should be uploaded in [S3 Bucket](#bucket)
- **html/**
  - **css/**: html styles 
  - **images/**: background images
  - **webfonts/**: webfonts
  - **forget.html**: Forgot password page
  - **history.html**: User Library page
  - **login.html**: User Login page
  - **profile.html**: User profile page
  - **register.html**: User register page
  - **search.html**: Book search page
  
## Nodejs
All resources here should be copied and pasted in [Lambda functions](#lambda)
- **nodejs/**
  - **deleteBook.js**: delete book in user's library page
  - **fetchBooks.js**: fetch books in user's library page
  - **forget.js**: get token for reset password in forgot password page
  - **login.js**: user login
  - **logout.js**: user logout
  - **recommendBooks.js**: recommend books based on saved books in book search page
  - **register.js**: user register
  - **reset.js**: reset password in forgot password page
  - **saveBook.js**: save book in book search page
  - **saveComment.js**: update comments or ratings in user library page
  - **updateUser.js**: update user's email information in profile page
  - **userInfo.js**: get user info in profile page

## Package_json
All resources here should be uploaded following [Lambda functions](#lambda) instructions
- **package_json/**
  - **mongoDB_uuid.zip**: mongoDB and uuid libraries used for all Lambda functions
  - **stop_word.zip**: stopword library used for `recommendBooks.js` Lambda function

---

# Configuration

This guide will explain steps to configure AWS environment.

## Prerequisites

Before getting started, ensure you have the following prerequisites
- AWS Account : free-tier (minimum)
- SSH Key Pairs : create public and private keys using ```$ ssh-keygen```, and save (public key will be used in `AWS_CloudFormation_debian.yaml`)


## Configuration
1. [CloudFormation](#cloudformation)
2. [EC2](#ec2)
3. [S3 Bucket](#bucket)
4. [Lambda functions](#lambda)
5. [API Gateway](#apigateway)
6. [SES](#ses)
7. [IAM roles](#iam)

### 1. CloudFormation <a name="cloudformation"></a>

On AWS - CloudFormation, create new stack with new resources.
- Replace some arguments on `AWS_CloudFormation_debian.yaml` (indicated on comments)
- Choose an existing template, Upload a template file (`AWS_CloudFormation_debian.yaml` on my repository)
- Enter stack name and click next serveral times and submit with aceepting acknowledgement.
  

### 2. EC2 <a name="ec2"></a>

On AWS - EC2, we can check a new EC2 has been created.
- Check Public Ipv4 address (e.g., 3.147.47.36)
 
### 3. S3 Bucket <a name="bucket"></a>

On AWS - S3 Bucket, we will upload all files in `html`
- Create bucket
- On the bucket, upload with Add files (`html/~.html` files)
- Upload with folders (`html/css`, `html/images`, `html/webfonts`)
- On the bucket - Properties - Static website hosting - Edit : Index document : `login.html`
- Edit Bucket Policy : In the Permissions tab of your static content bucket click on Bucket policy.
- Use the following template to allow public read access to the static files, replacing "yourwebsite-static-content" with your bucket's actual name:
```json
{
  "Version": "2012-10-17",
  "Statment": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::yourwebsite-static-content/*"
    }
  ]
```
### 4. Lambda functions <a name="lambda"></a>

On AWS - Lambda, we will create `nodejs/~.js` files
- Create functions with Runtime : Node.js 20.x, Architecture : x86_64
- Create two layers on AWS - Lambda - Layers by uploading a .zip file (`package_json/~.zip` individually)
- Add a custom layer created by `mongoDB_uuid.zip` to every Lambda functions
- Add a custom layer created by `stop_word` to `recommendBooks.js` Lambda function.
- Copy and Paste from `nodejs/~.js` files to Lambda functions (**Do not forget clicking deploy after changes**)
- On each Lambda function, Configuration - Edit Environment variables. Add following Key and Value
```json
"MONGODB_URI" : "mongodb://admin:vBTaTtAqabuC4NvV7jm3@{EC2 Ipv4 address}:27017"
```
- On `register.js` and `forget.js`, add another Environment variables. 
```json
"ADMIN_URI" : "{your email}"
```
  

### 5. API Gateway <a name="apigateway"></a>
On AWS - API Gateway, create each API mapping to Lambda function
- Build REST API
- Create resource with appropriate name (**Enable CORS!**)
- For each resource, create POST method (Lambda function, enable Lambda proxy integration, and select appropriate Lambda function)
- For each resource, click **Deploy API** button
- Invoke URL can be checked in API Gateway - APIs - your API - Stages, which will be used on your html files

### 6. SES <a name="ses"></a>
On AWS - SES, verify your sender email and recipient email
- On SES - Configuration - Identities, Click Create Identity, and put your Email address and Create Identity
- The previous step will give you verification url via email (As Amazon requires you to contact support team about sending emails wihtout registering Identities, we should manually register identities for sending admin email and receiving user emails)

### 7. IAM roles <a name="iam"></a>
Add SES permissions to Lambda functions, and add S3 and EC2 permissions to a user
- On AWS - IAM - Roles - corresponding Lambda functions (`register.js` and `forget.js`) - Add **AmazonSESFullAccess** permissions
- On AWS - IAM - Users - Add permissions AmazonEC2FullAccess and AmazonS3FullAccess to {your user}




