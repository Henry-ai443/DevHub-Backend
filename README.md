# DevHub Backend - MongoDB Migration & Collaboration Platform

A production-ready Node.js + Express backend for a two-sided marketplace and developer collaboration platform.

## 🎯 Overview

This backend provides:
- **User Management**: Developers, clients, and admin roles with RBAC
- **Developer Discovery**: Browse public developer profiles with filtering
- **Project Collaboration**: Create projects, invite collaborators, manage tasks
- **Messaging**: Direct messages and project-specific conversations
- **Hire System**: Request developers, review system, and hiring management
- **Admin Dashboard**: Moderation, reporting, and platform analytics
- **Security**: JWT authentication, input validation, rate limiting support

## 🗄️ Database Schema

### Core Collections
- **User**: Identity and authentication
- **DeveloperProfile**: Developer information and ratings
- **ClientProfile**: Client company information
- **Project**: Collaboration units with members and permissions
- **ProjectInvitation**: Invites to join projects
- **Task**: Project tasks with assignments and status
- **Message**: Direct and project messages
- **Conversation**: Message threads between users
- **HireRequest**: Hiring requests with budget and status
- **Review**: Developer reviews (1 per completed hire)
- **Report**: Abuse reports by type
- **AdminLog**: Audit trail of admin actions

All collections include:
- Automatic timestamps (`createdAt`, `updatedAt`)
- Indexes for optimal query performance
- Schema validation and relationships (refs)

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- MongoDB Atlas account or local MongoDB
- Cloudinary account (for avatar uploads)

### Installation

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and API keys
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   Server runs on `http://localhost:5000`

### Production Deployment
```bash
npm start
```

## 📚 API Reference

### Authentication
```
POST   /api/auth/signup       - Register new user
POST   /api/auth/login        - Authenticate user
POST   /api/auth/logout       - Logout (invalidate token)
POST   /api/auth/refresh      - Get new access token
```

### Profiles
```
GET    /api/profile/me                     - Get own profile
GET    /api/profile/developer/:developerId - Get public developer profile
GET    /api/profile/developers/browse      - Browse developers with filters
PUT    /api/profile/me/developer           - Update developer profile
PUT    /api/profile/me/client              - Update client profile
```

### Projects (Developer Collaboration)
```
POST   /api/projects                          - Create project
GET    /api/projects                          - List user projects
GET    /api/projects/:projectId               - Get project details
PUT    /api/projects/:projectId               - Update project
POST   /api/projects/:projectId/invite        - Invite developer
DELETE /api/projects/:projectId/members/:id   - Remove member
POST   /api/projects/invitations/:id/accept   - Accept invitation
POST   /api/projects/invitations/:id/reject   - Reject invitation
```

### Tasks
```
POST   /api/projects/:projectId/tasks         - Create task
GET    /api/projects/:projectId/tasks         - List project tasks
GET    /api/tasks/:taskId                     - Get task details
PUT    /api/tasks/:taskId                     - Update task
DELETE /api/tasks/:taskId                     - Delete task
GET    /api/tasks/assigned                    - Get assigned tasks
```

### Messaging
```
POST   /api/messages/direct                          - Send direct message
POST   /api/messages/project/:projectId              - Send project message
GET    /api/conversations                            - Get conversations list
GET    /api/conversations/:conversationId/messages   - Get messages
GET    /api/projects/:projectId/messages             - Get project messages
PUT    /api/conversations/:conversationId/mark-read  - Mark as read
```

### Hiring & Reviews
```
POST   /api/hires                       - Create hire request (client)
POST   /api/hires/:hireId/accept        - Accept hire (developer)
POST   /api/hires/:hireId/reject        - Reject hire (developer)
POST   /api/hires/:hireId/complete      - Mark completed
GET    /api/hires/developer/requests    - Developer's hire requests
GET    /api/hires/client/requests       - Client's hire requests
POST   /api/reviews                     - Create review (client)
GET    /api/reviews/developer/:id       - Get developer reviews
```

### Admin
```
POST   /api/admin/reports                   - Create report
GET    /api/admin/reports                   - Get pending reports (admin)
PUT    /api/admin/reports/:reportId/resolve - Resolve report (admin)
POST   /api/admin/users/:userId/suspend     - Suspend user (admin)
POST   /api/admin/users/:userId/unsuspend   - Unsuspend user (admin)
GET    /api/admin/logs                      - Get audit logs (admin)
GET    /api/admin/stats                     - Get platform stats (admin)
```

## 🔐 Authentication & Authorization

### Token-Based Auth
- **Access Token**: JWT with 7-day expiration (configurable)
- **Refresh Token**: Regenerate access token
- **Token Invalidation**: Increment `tokenVersion` on logout

### Header Format
```
Authorization: Bearer <token>
```

### Role-Based Access Control (RBAC)

| Action | Public | Client | Developer | Admin |
|--------|--------|--------|-----------|-------|
| View profiles | ✅ | ✅ | ✅ | ✅ |
| Create project | ❌ | ❌ | ✅ | ❌ |
| Hire developer | ❌ | ✅ | ❌ | ✅ |
| Message | ❌ | ✅ | ✅ | ✅ |
| Moderate | ❌ | ❌ | ❌ | ✅ |

## 🏗️ Architecture

```
DevHub-Backend/
├── config/          # Database & external service config
├── controllers/     # HTTP request handlers
├── middleware/      # Auth, upload, validation
├── models/          # Mongoose schemas
├── routes/          # API endpoint definitions
├── services/        # Business logic & database ops
├── utils/           # Error handling, validation, RBAC
└── server.js        # Express app entry point
```

### Request Flow
```
Request → Middleware (Auth) → Controller → Service → Model → Database
Response ← Controller ← Service ← Model
```

## 🛡️ Security Features

- **Input Validation**: Joi schema validation on all endpoints
- **Password Hashing**: Bcrypt with 10 salt rounds
- **Suspension Tracking**: Check before allowing access
- **NoSQL Injection Prevention**: Mongoose schema enforcement
- **Soft Deletes**: Mark deleted users as suspended
- **Admin Audit Logs**: Track all admin actions
- **CORS**: Configurable origin

## 📝 Models Overview

### User
```javascript
{
  email: String (unique),
  password: String (hashed),
  role: Enum ['client', 'developer', 'admin'],
  isVerified: Boolean,
  isSuspended: Boolean,
  lastLogin: Date,
  tokenVersion: Number,
  timestamps
}
```

### DeveloperProfile
```javascript
{
  userId: ObjectId (ref),
  displayName: String,
  bio: String,
  skills: [String],
  experienceLevel: Enum,
  hourlyRate: Number,
  availabilityStatus: Enum,
  portfolioLinks: [String],
  location: String,
  isRemote: Boolean,
  avatarUrl: String,
  averageRating: Number (0-5),
  totalReviews: Number,
  profileCompletenessScore: Number (0-100),
  visibility: Enum ['public', 'hidden'],
  timestamps
}
```

### Project
```javascript
{
  title: String,
  description: String,
  createdBy: ObjectId (ref),
  members: [{
    developerId: ObjectId,
    role: Enum ['owner', 'collaborator'],
    permissions: [Enum ['read', 'write', 'admin']],
    joinedAt: Date
  }],
  clientId: ObjectId (optional),
  status: Enum ['active', 'paused', 'completed', 'archived'],
  visibility: Enum ['private', 'team', 'public-read'],
  tags: [String],
  budget: Number,
  deadline: Date,
  timestamps
}
```

## 🔧 Configuration

Key environment variables:

- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Token signing key (min 32 chars in production)
- `JWT_EXPIRES_IN`: Token expiration (e.g., "7d")
- `PORT`: Server port (default 5000)
- `FRONTEND_URL`: CORS origin
- `CLOUDINARY_*`: Image upload service credentials

## 📊 Error Handling

All errors follow consistent format:
```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

**Status Codes**:
- `400`: Validation errors
- `401`: Authentication failures
- `403`: Authorization failures (suspended, role mismatch)
- `404`: Resource not found
- `409`: Conflict (duplicate email, already invited)
- `500`: Server errors

## 🚦 Testing the API

### Quick Start
```bash
# Register
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@test.com","password":"password123","role":"developer"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@test.com","password":"password123"}'

# Get profile (with token)
curl http://localhost:5000/api/profile/me \
  -H "Authorization: Bearer <token>"
```

## 🤝 Frontend Integration

The frontend expects:
- **Token Format**: JWT in `Authorization: Bearer <token>` header
- **Response Format**: `{success: boolean, data: object, message?: string}`
- **CORS**: Requests from `FRONTEND_URL`

### Example Response
```json
{
  "success": true,
  "data": {
    "userId": "...",
    "email": "user@example.com",
    "role": "developer",
    "token": "eyJhbGc..."
  }
}
```

## 📦 Deployment

### Environment
Set production environment variables in hosting platform:
```
NODE_ENV=production
MONGO_URI=<production-mongodb-uri>
JWT_SECRET=<long-random-secret>
```

### Process Manager
Use PM2 or similar for process management:
```bash
pm2 start server.js --name devhub-backend
```

## 📚 Future Enhancements

- [ ] Real-time messaging with WebSockets
- [ ] Payment integration (Stripe/Razorpay)
- [ ] Email notifications
- [ ] Two-factor authentication
- [ ] Project files/attachments storage
- [ ] Time tracking for hourly hires
- [ ] Analytics dashboard
- [ ] API rate limiting
- [ ] GraphQL API

## 📖 Documentation

- Full API docs: See routes in `routes/`
- Schema definitions: See `models/`
- Service logic: See `services/`

## 🐛 Common Issues

**MongoDB Connection Error**
- Ensure `MONGO_URI` is correct
- Check MongoDB Atlas IP whitelist includes your IP

**JWT Token Invalid**
- Token may be expired (check `JWT_EXPIRES_IN`)
- Token was invalidated (user logged out)
- Secret mismatch between generation and verification

**CORS Errors**
- Frontend URL must match `FRONTEND_URL` env var
- Check browser console for exact error

## 📄 License

ISC

## 👨‍💻 Development

- Node version: 16.x or higher
- Package manager: npm
- Code style: JavaScript (no linter enforced yet)
- Git: Feature branches with clear commit messages

---

**Ready to scale!** This architecture supports thousands of concurrent users and is designed for production deployment.
