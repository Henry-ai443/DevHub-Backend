# DevHub Backend - Complete Setup Guide

This guide covers setting up and deploying the MongoDB-based DevHub backend from scratch.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [MongoDB Setup](#mongodb-setup)
4. [Environment Configuration](#environment-configuration)
5. [Running the Server](#running-the-server)
6. [API Testing](#api-testing)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required
- **Node.js** 16.x or higher ([download](https://nodejs.org/))
- **npm** 7.x or higher (comes with Node.js)
- **Git** for version control
- **MongoDB Atlas** account (free tier available)
- **Cloudinary** account (for image uploads)

### Optional
- **Postman** or **Insomnia** for API testing
- **MongoDB Compass** for database visualization
- **VS Code** or your preferred IDE

### System Requirements
- RAM: 512MB minimum (2GB recommended)
- Disk Space: 500MB minimum
- OS: Windows, macOS, Linux

---

## Local Development Setup

### Step 1: Clone the Repository

```bash
cd /path/to/your/workspace
git clone <repository-url>
cd DevHub/DevHub-Backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages listed in `package.json`:
- `express`: Web framework
- `mongoose`: MongoDB ODM
- `bcrypt`: Password hashing
- `jsonwebtoken`: JWT auth
- `joi`: Input validation
- `cors`: Cross-origin requests
- `dotenv`: Environment variables
- `cloudinary`: Image uploads
- `multer`: File handling
- `nodemailer`: Email (for future use)

### Step 3: Create Environment File

```bash
cp .env.example .env
```

Now edit `.env` with your actual credentials (see [Environment Configuration](#environment-configuration) below).

---

## MongoDB Setup

### Option A: MongoDB Atlas (Cloud - Recommended)

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free tier
   - Create organization and project

2. **Create Cluster**
   - Click "Create" to build a cluster
   - Choose free shared tier (M0)
   - Select region closest to you
   - Wait for cluster to deploy (5-10 minutes)

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `devhub_user` (or choose your own)
   - Password: Use auto-generated strong password (or create one)
   - Add user

4. **Whitelist IP**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0) for development
   - Confirm

5. **Get Connection String**
   - Click "Connect" button on cluster
   - Select "Connect your application"
   - Choose "Node.js" driver, version 4.x
   - Copy connection string
   - It looks like: `mongodb+srv://username:password@cluster.mongodb.net/devhub?retryWrites=true&w=majority`
   - Replace `<password>` with actual password

### Option B: Local MongoDB (Development Alternative)

1. **Install MongoDB Community**
   - Windows: [Download installer](https://www.mongodb.com/try/download/community)
   - macOS: `brew install mongodb-community`
   - Linux: Follow [official guide](https://docs.mongodb.com/manual/installation/)

2. **Start MongoDB Server**
   - Windows: MongoDB should start as service automatically
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

3. **Local Connection String**
   ```
   mongodb://localhost:27017/devhub
   ```

---

## Environment Configuration

### .env File Setup

Create a `.env` file in the `DevHub-Backend` directory with the following:

```env
# ============ MONGODB ============
MONGO_URI=mongodb+srv://devhub_user:your_password@cluster.mongodb.net/devhub?retryWrites=true&w=majority

# ============ JWT ============
JWT_SECRET=your_super_secret_32_character_minimum_string_here_change_in_production_use_randomness
JWT_EXPIRES_IN=7d

# ============ SERVER ============
PORT=5000
NODE_ENV=development

# ============ FRONTEND ============
FRONTEND_URL=http://localhost:3000

# ============ CLOUDINARY (Image Uploads) ============
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ============ EMAIL (Optional - Mocked for now) ============
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Getting Cloudinary Credentials

1. **Create Account**
   - Go to [Cloudinary](https://cloudinary.com/)
   - Sign up for free
   - Verify email

2. **Find Credentials**
   - Dashboard → Account
   - Copy Cloud Name, API Key, API Secret
   - Paste into `.env`

### JWT_SECRET Generation

Generate a secure secret (macOS/Linux):
```bash
openssl rand -base64 32
```

Windows PowerShell:
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString())) | Select-Object -First 32
```

---

## Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

- Uses `nodemon` to watch file changes
- Auto-restarts server on save
- Logs are displayed in terminal

Expected output:
```
✅ Database connected successfully
🚀 Server running on http://localhost:5000
```

### Production Mode

```bash
npm start
```

- Runs server without auto-reload
- Use with PM2 for process management

---

## API Testing

### Test with cURL

#### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "developer@test.com",
    "password": "securePassword123",
    "role": "developer"
  }'
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "...",
    "email": "developer@test.com",
    "role": "developer",
    "token": "eyJhbGc..."
  }
}
```

#### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "developer@test.com",
    "password": "securePassword123"
  }'
```

#### 3. Get Profile (with Token)
```bash
curl http://localhost:5000/api/profile/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 4. Update Developer Profile
```bash
curl -X PUT http://localhost:5000/api/profile/me/developer \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "John Developer",
    "bio": "Full-stack developer with 5 years experience",
    "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
    "experienceLevel": "senior",
    "hourlyRate": 75,
    "location": "San Francisco, CA",
    "isRemote": true
  }'
```

### Test with Postman

1. **Create Collection**: DevHub Backend
2. **Create Environment**:
   - Variable: `base_url` = `http://localhost:5000`
   - Variable: `token` = (leave empty initially)

3. **Create Requests**:

**Auth Signup** (POST)
```
URL: {{base_url}}/api/auth/signup
Body (JSON):
{
  "email": "dev@test.com",
  "password": "password123",
  "role": "developer"
}
```
In Tests tab, save token:
```javascript
var jsonData = pm.response.json();
pm.environment.set("token", jsonData.data.token);
```

**Get Profile** (GET)
```
URL: {{base_url}}/api/profile/me
Header: Authorization: Bearer {{token}}
```

---

## Production Deployment

### Preparation Checklist

- [ ] `.env` configured with strong `JWT_SECRET`
- [ ] `NODE_ENV=production`
- [ ] MongoDB Atlas cluster created with strong password
- [ ] IP whitelist configured in MongoDB Atlas
- [ ] Cloudinary credentials set
- [ ] Frontend `FRONTEND_URL` updated to production domain
- [ ] All tests passing
- [ ] Dependencies audited: `npm audit`

### Deploy to Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   heroku create devhub-backend
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set MONGO_URI="mongodb+srv://..." -a devhub-backend
   heroku config:set JWT_SECRET="your_secret" -a devhub-backend
   heroku config:set CLOUDINARY_CLOUD_NAME="..." -a devhub-backend
   heroku config:set CLOUDINARY_API_KEY="..." -a devhub-backend
   heroku config:set CLOUDINARY_API_SECRET="..." -a devhub-backend
   heroku config:set FRONTEND_URL="https://yourdomain.com" -a devhub-backend
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **View Logs**
   ```bash
   heroku logs --tail -a devhub-backend
   ```

### Deploy to AWS EC2

1. **Launch EC2 Instance**
   - AMI: Ubuntu 20.04 LTS
   - Instance type: t3.micro (free tier)
   - Security group: Allow HTTP (80), HTTPS (443), SSH (22)

2. **Connect & Setup**
   ```bash
   ssh -i key.pem ubuntu@your-instance-ip
   
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   ```

3. **Clone & Install**
   ```bash
   git clone <repo>
   cd DevHub/DevHub-Backend
   npm install
   ```

4. **Create .env** with production values

5. **Start with PM2**
   ```bash
   pm2 start server.js --name "devhub-backend"
   pm2 startup
   pm2 save
   ```

6. **Setup Nginx Reverse Proxy**
   ```bash
   sudo apt install nginx
   ```
   
   Create `/etc/nginx/sites-available/devhub`:
   ```nginx
   server {
     listen 80;
     server_name yourdomain.com;
     location / {
       proxy_pass http://localhost:5000;
     }
   }
   ```
   
   Enable and restart:
   ```bash
   sudo ln -s /etc/nginx/sites-available/devhub /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Setup SSL (Let's Encrypt)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

---

## Troubleshooting

### MongoDB Connection Issues

**Error**: `Error: connect ECONNREFUSED`

Solution:
- Check MongoDB Atlas cluster is deployed
- Verify connection string is correct
- Check IP whitelist includes your IP
- For local MongoDB, ensure it's running: `sudo systemctl status mongod`

**Error**: `MongoServerError: bad auth : authentication failed`

Solution:
- Wrong password in connection string
- User doesn't exist (create in MongoDB Atlas)
- Database user hasn't been created yet

### JWT Errors

**Error**: `Invalid or expired token`

Solution:
- Token has expired (default 7 days) - get new one via refresh endpoint
- `JWT_SECRET` changed between token creation and verification
- Token copied incorrectly (missing characters)

### Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::5000`

Solution:
```bash
# Find process on port 5000
lsof -i :5000

# Kill it
kill -9 <PID>

# Or change PORT in .env
PORT=5001
```

### CORS Errors

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

Solution:
- Check `FRONTEND_URL` matches exactly (including protocol and port)
- Frontend sends requests to correct backend URL
- Clear browser cache and cookies

### Cloudinary Errors

**Error**: `Error: Invalid credentials`

Solution:
- Check credentials are copied correctly
- No extra spaces in credentials
- API secret is not same as API key

### Nodemon Not Auto-Reloading

Solution:
```bash
npm install -g nodemon@latest
# or
npm run dev --verbose
```

### Database Queries Slow

Solution:
- Check MongoDB Atlas cluster tier (m0 free has limitations)
- Verify indexes are created (models define them automatically)
- Consider upgrading to m10 for production

---

## Next Steps

1. **Frontend Setup**: Follow DevHub-Frontend README
2. **Environment Testing**: Test all endpoints with Postman
3. **Database Seeding**: Create test data (optional)
4. **Monitoring**: Setup error tracking (Sentry, LogRocket)
5. **Rate Limiting**: Implement in production
6. **Documentation**: Update API docs with deployment URLs

---

## Getting Help

- **API Issues**: Check `server.js` console output
- **Database Issues**: Check MongoDB Atlas logs
- **Authentication Issues**: Verify JWT_SECRET and token format
- **Deployment Issues**: Check platform-specific logs (Heroku, AWS, etc.)

**Success!** Your backend is ready for development and production.
