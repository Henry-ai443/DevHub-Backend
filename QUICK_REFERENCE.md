# DevHub Backend - Quick Reference

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env
# Edit .env with MongoDB URI and API keys

# 3. Start development server
npm run dev

# Server runs on http://localhost:5000
```

---

## 📚 Key Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Backend overview and architecture |
| `SETUP_GUIDE.md` | Installation & deployment steps |
| `API_DOCUMENTATION.md` | Complete API endpoint reference |
| `MIGRATION_SUMMARY.md` | What changed in migration |
| `.env.example` | Configuration template |

---

## 🔐 Authentication Quick Test

```bash
# Register
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@test.com","password":"pass123","role":"developer"}'

# Login (save token)
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@test.com","password":"pass123"}' | jq -r '.data.token')

# Use token
curl http://localhost:5000/api/profile/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 API Endpoints by Feature

### Auth (5 endpoints)
```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
```

### Profiles (4 endpoints)
```
GET    /api/profile/me
GET    /api/profile/developer/:id
GET    /api/profile/developers/browse
PUT    /api/profile/me/developer
PUT    /api/profile/me/client
```

### Projects (6 endpoints)
```
POST   /api/projects
GET    /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
POST   /api/projects/:id/invite
DELETE /api/projects/:id/members/:memberId
```

### Tasks (5 endpoints)
```
POST   /api/projects/:projectId/tasks
GET    /api/projects/:projectId/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

### Messages (6 endpoints)
```
POST   /api/messages/direct
POST   /api/messages/project/:projectId
GET    /api/conversations
GET    /api/conversations/:id/messages
GET    /api/projects/:projectId/messages
PUT    /api/conversations/:id/mark-read
```

### Hiring (7 endpoints)
```
POST   /api/hires
POST   /api/hires/:id/accept
POST   /api/hires/:id/reject
POST   /api/hires/:id/complete
GET    /api/hires/developer/requests
GET    /api/hires/client/requests
POST   /api/reviews
```

### Admin (6 endpoints)
```
POST   /api/admin/reports
GET    /api/admin/reports
PUT    /api/admin/reports/:id/resolve
POST   /api/admin/users/:id/suspend
POST   /api/admin/users/:id/unsuspend
GET    /api/admin/logs
GET    /api/admin/stats
```

**Total: 50+ API endpoints**

---

## 🏗️ Code Structure

```
request → middleware/auth → controller → service → model → db
           (validate token)  (HTTP)      (business) (schema) (MongoDB)
```

### Adding a New Feature

1. **Create Model** (`models/Feature.js`)
   ```javascript
   const featureSchema = new mongoose.Schema({...});
   module.exports = mongoose.model('Feature', featureSchema);
   ```

2. **Create Service** (`services/featureService.js`)
   ```javascript
   class FeatureService {
     static async createFeature(data) {...}
   }
   module.exports = FeatureService;
   ```

3. **Create Controller** (`controllers/featureControllers.js`)
   ```javascript
   exports.createFeature = asyncHandler(async (req, res) => {
     const feature = await FeatureService.createFeature(req.body);
     res.json({success: true, data: feature});
   });
   ```

4. **Add Routes** (in `routes/` or extend `collaborationRoutes.js`)
   ```javascript
   router.post('/features', authenticate, featureController.createFeature);
   ```

5. **Update server.js** if new route file created
   ```javascript
   const featureRoutes = require('./routes/featureRoutes');
   app.use('/api', featureRoutes);
   ```

---

## 🔒 RBAC Middleware Examples

```javascript
// In route
router.post('/projects', 
  authenticate,           // Check token valid
  isDeveloper,            // Check role is 'developer'
  projectController.createProject
);

// Or create custom check in controller
if (req.user.role !== 'admin') {
  throw new AppError('Admin required', 403);
}
```

**Roles**: `'client'`, `'developer'`, `'admin'`

---

## 💾 Database Models at a Glance

### User
```javascript
{
  email: String (unique),
  password: String,
  role: 'client'|'developer'|'admin',
  isVerified: Boolean,
  isSuspended: Boolean,
  lastLogin: Date,
  tokenVersion: Number
}
```

### DeveloperProfile
```javascript
{
  userId: ObjectId (ref User),
  displayName: String,
  skills: [String],
  hourlyRate: Number,
  averageRating: Number (0-5),
  totalReviews: Number,
  visibility: 'public'|'hidden'
}
```

### Project
```javascript
{
  title: String,
  createdBy: ObjectId (ref User),
  members: [{
    developerId: ObjectId,
    role: 'owner'|'collaborator',
    permissions: [String]
  }],
  status: 'active'|'paused'|'completed'|'archived',
  visibility: 'private'|'team'|'public-read'
}
```

**See models/ folder for complete schemas**

---

## ⚠️ Common Errors & Solutions

**"Cannot GET /api/..." (404)**
- Endpoint doesn't exist or route not registered
- Check collaborationRoutes.js has the endpoint
- Check server.js imports the route

**"Invalid token" (401)**
- Token expired (7 days)
- Use /api/auth/refresh to get new token
- JWT_SECRET changed

**"Forbidden" (403)**
- Wrong role for action
- Account suspended
- Not member of project/conversation

**"Email already exists" (409)**
- User with that email registered
- Use /api/auth/login instead

**MongoDB connection error**
- Check MONGO_URI in .env
- Verify IP whitelist in MongoDB Atlas
- Ensure database user password correct

---

## 📝 Creating Test Data

### Create Admin (manual)
```javascript
// Connect to MongoDB and run:
db.users.insertOne({
  email: "admin@test.com",
  password: await bcrypt.hash("password123", 10),
  role: "admin",
  isVerified: true,
  isSuspended: false,
  lastLogin: new Date(),
  tokenVersion: 0
})
```

### Create Sample Data (REST API)
```bash
# Register developer
DEV=$(curl -s -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@test.com","password":"pass123","role":"developer"}' \
  | jq -r '.data.userId')

# Register client
CLIENT=$(curl -s -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"client@test.com","password":"pass123","role":"client"}' \
  | jq -r '.data.userId')

# Continue creating profiles, projects, etc.
```

---

## 🐛 Debugging

### Enable Verbose Logging
```bash
# In .env
NODE_ENV=development

# View MongoDB queries (with mongoose)
mongoose.set('debug', true);
```

### Check Database
```bash
# MongoDB Atlas → Collections tab
# View your data directly in cloud

# Or use MongoDB Compass locally
# Connect to: mongodb://localhost:27017/devhub
```

### Postman Testing
1. Create environment with `base_url` and `token`
2. Import endpoints from API_DOCUMENTATION.md
3. Test each endpoint with sample data
4. Save token in Tests tab: `pm.environment.set("token", jsonData.data.token)`

---

## 🚀 Deployment Commands

### Heroku
```bash
heroku config:set MONGO_URI="..." JWT_SECRET="..." -a devhub-backend
git push heroku main
heroku logs --tail -a devhub-backend
```

### Local AWS EC2
```bash
git clone <repo>
cd DevHub/DevHub-Backend
npm install
pm2 start server.js --name "devhub-backend"
pm2 startup
pm2 save
```

### Docker (optional)
```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "server.js"]
```

---

## 📖 Common API Response Format

```json
{
  "success": true/false,
  "message": "Human readable message",
  "data": {
    // Response payload
  },
  "pagination": {
    // Only for list endpoints
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

---

## 🔑 Environment Variables

**Required:**
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/devhub
JWT_SECRET=your_secret_key_min_32_chars
```

**Recommended:**
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

---

## 📚 File Organization

- **models/** - Database schemas (read for field names)
- **services/** - Business logic (where features happen)
- **controllers/** - HTTP handlers (connect request → response)
- **routes/** - Endpoint definitions (what's available)
- **middleware/** - Auth, validation, upload
- **utils/** - Helpers (errors, RBAC, validation)
- **config/** - External service config

---

## 🎯 Common Tasks

### Add a new field to DeveloperProfile
1. Edit `models/DeveloperProfile.js` - add field to schema
2. Update `services/profileService.js` - add to allowed update fields
3. Update API_DOCUMENTATION.md - document new field
4. Test with PUT `/api/profile/me/developer`

### Add authorization check
1. Use utility: `isDeveloper`, `isClient`, `isAdmin` from `utils/rbac.js`
2. Or custom check in controller:
   ```javascript
   if (req.user.role !== 'admin') throw new AppError('Not admin', 403);
   ```

### Add input validation
1. Add schema to `utils/validation.js`
2. Validate in controller:
   ```javascript
   const {error, value} = schema.validate(req.body);
   if (error) throw new AppError(error.details.map(...).join(','), 400);
   ```

### Create new collection
1. Create model with `models/FeatureName.js`
2. Add indexes if needed
3. Create service `services/featureService.js`
4. Create controller `controllers/featureControllers.js`
5. Create routes in existing file or new
6. Import routes in `server.js`

---

## 🧪 Testing Checklist

- [ ] Authentication (signup, login, refresh, logout)
- [ ] Profiles (get, browse, update)
- [ ] Projects (CRUD, invitations, member management)
- [ ] Tasks (CRUD, status updates)
- [ ] Messages (direct, project, conversations)
- [ ] Hiring (request, accept, complete, review)
- [ ] Admin (reports, suspend, logs, stats)
- [ ] Error responses (400, 401, 403, 404)
- [ ] Role enforcement (RBAC)
- [ ] Input validation

---

## 📞 Need Help?

1. **API Issues** → Check `API_DOCUMENTATION.md`
2. **Setup Issues** → See `SETUP_GUIDE.md`
3. **Code Changes** → Examine `services/` for patterns
4. **Database Issues** → Check MongoDB Atlas logs
5. **Errors** → Look at `utils/errorHandler.js`

---

**Happy Coding!** 🎉

Version: 1.0.0 | Updated: January 2024
