# DevHub API Documentation

Complete REST API reference for the DevHub backend.

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Tokens expire after **7 days** by default. Use `/auth/refresh` to get a new token.

---

## 1. Authentication Endpoints

### Register User

**POST** `/auth/signup`

Register a new user (developer or client).

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "role": "developer"
}
```

**Parameters:**
- `email` (string, required): Valid email address, must be unique
- `password` (string, required): Minimum 6 characters
- `role` (enum, optional): `'developer'` or `'client'` (default: `'developer'`)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "developer",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- `400`: Missing email or password
- `409`: Email already registered

---

### Login

**POST** `/auth/login`

Authenticate and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "developer",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- `401`: Invalid email or password
- `403`: Account suspended

---

### Logout

**POST** `/auth/logout`

Invalidate current token (requires authentication).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### Refresh Token

**POST** `/auth/refresh`

Get a new access token using current valid token.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 2. Profile Endpoints

### Get Own Profile

**GET** `/profile/me`

Get authenticated user's profile (developer or client).

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "displayName": "John Developer",
    "bio": "Full-stack developer with 5+ years experience",
    "skills": ["JavaScript", "React", "Node.js"],
    "experienceLevel": "senior",
    "hourlyRate": 85,
    "availabilityStatus": "available",
    "location": "San Francisco, CA",
    "isRemote": true,
    "avatarUrl": "https://...",
    "averageRating": 4.8,
    "totalReviews": 24,
    "profileCompletenessScore": 95,
    "visibility": "public",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T15:45:00Z"
  }
}
```

---

### Browse Developers

**GET** `/profile/developers/browse`

Get list of public developer profiles with filtering.

**Authentication:** Optional

**Query Parameters:**
- `page` (integer, default: 1): Page number for pagination
- `limit` (integer, default: 20): Results per page (max: 100)
- `skills` (string): Comma-separated skills to filter
- `experienceLevel` (enum): Filter by `'junior'`, `'mid'`, `'senior'`
- `isRemote` (boolean): Filter by remote availability
- `minRate` (number): Minimum hourly rate
- `maxRate` (number): Maximum hourly rate

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "displayName": "Jane Developer",
      "bio": "React specialist",
      "skills": ["React", "TypeScript"],
      "experienceLevel": "senior",
      "hourlyRate": 90,
      "averageRating": 4.9,
      "location": "Remote",
      "isRemote": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

### Get Developer Profile

**GET** `/profile/developer/:developerId`

Get public developer profile by ID.

**Authentication:** Optional

**Path Parameters:**
- `developerId` (string): MongoDB ObjectId of developer

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "displayName": "John Developer",
    "bio": "Full-stack developer with 5+ years experience",
    "skills": ["JavaScript", "React", "Node.js"],
    "experienceLevel": "senior",
    "hourlyRate": 85,
    "portfolioLinks": ["https://portfolio.com"],
    "averageRating": 4.8,
    "totalReviews": 24
  }
}
```

**Errors:**
- `403`: Profile is private
- `404`: Developer not found

---

### Update Developer Profile

**PUT** `/profile/me/developer`

Update authenticated developer's profile.

**Authentication:** Required (developer role)

**Request Body:**
```json
{
  "displayName": "John Developer",
  "bio": "Full-stack specialist",
  "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
  "experienceLevel": "senior",
  "hourlyRate": 85,
  "availabilityStatus": "available",
  "portfolioLinks": ["https://github.com/username"],
  "location": "San Francisco, CA",
  "isRemote": true,
  "visibility": "public"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "displayName": "John Developer",
    "profileCompletenessScore": 95,
    "updatedAt": "2024-01-20T15:45:00Z"
  }
}
```

---

### Update Client Profile

**PUT** `/profile/me/client`

Update authenticated client's profile.

**Authentication:** Required (client role)

**Request Body:**
```json
{
  "companyName": "Tech Solutions Inc",
  "industry": "Software Development"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "companyName": "Tech Solutions Inc",
    "industry": "Software Development"
  }
}
```

---

## 3. Project Collaboration Endpoints

### Create Project

**POST** `/projects`

Create a new collaboration project (developer only).

**Authentication:** Required (developer role)

**Request Body:**
```json
{
  "title": "E-commerce Platform Redesign",
  "description": "Complete UI/UX overhaul of our e-commerce site",
  "visibility": "private",
  "tags": ["frontend", "react", "redesign"],
  "budget": 5000,
  "deadline": "2024-06-30"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "title": "E-commerce Platform Redesign",
    "createdBy": "507f1f77bcf86cd799439011",
    "members": [
      {
        "developerId": "507f1f77bcf86cd799439011",
        "role": "owner",
        "permissions": ["read", "write", "admin"],
        "joinedAt": "2024-01-20T15:45:00Z"
      }
    ],
    "status": "active",
    "visibility": "private",
    "createdAt": "2024-01-20T15:45:00Z"
  }
}
```

---

### List User's Projects

**GET** `/projects`

Get all projects where user is owner or member.

**Authentication:** Required

**Query Parameters:**
- `status` (enum): Filter by `'active'`, `'paused'`, `'completed'`, `'archived'`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "title": "E-commerce Platform Redesign",
      "status": "active",
      "members": 3,
      "createdAt": "2024-01-20T15:45:00Z"
    }
  ]
}
```

---

### Get Project Details

**GET** `/projects/:projectId`

Get full project details (members only for private projects).

**Authentication:** Required

**Path Parameters:**
- `projectId` (string): MongoDB ObjectId

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "title": "E-commerce Platform Redesign",
    "description": "Complete UI/UX overhaul",
    "createdBy": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "creator@example.com"
    },
    "members": [
      {
        "developerId": {
          "_id": "507f1f77bcf86cd799439011",
          "email": "creator@example.com"
        },
        "role": "owner",
        "permissions": ["read", "write", "admin"],
        "joinedAt": "2024-01-20T15:45:00Z"
      }
    ],
    "status": "active",
    "visibility": "private",
    "tags": ["frontend", "react"],
    "budget": 5000,
    "deadline": "2024-06-30",
    "createdAt": "2024-01-20T15:45:00Z"
  }
}
```

---

### Update Project

**PUT** `/projects/:projectId`

Update project (owner only).

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "paused",
  "visibility": "team",
  "tags": ["frontend", "react", "updated"],
  "budget": 6000,
  "deadline": "2024-07-31"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": { /* updated project */ }
}
```

**Errors:**
- `403`: Only owner can update
- `404`: Project not found

---

### Invite Member to Project

**POST** `/projects/:projectId/invite`

Invite a developer to project (owner only).

**Authentication:** Required (developer role)

**Request Body:**
```json
{
  "developerId": "507f1f77bcf86cd799439015",
  "message": "We'd love to have you join our team!"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Invitation sent",
  "data": {
    "_id": "507f1f77bcf86cd799439030",
    "projectId": {
      "_id": "507f1f77bcf86cd799439020",
      "title": "E-commerce Platform Redesign"
    },
    "invitedDeveloperId": "507f1f77bcf86cd799439015",
    "status": "pending",
    "createdAt": "2024-01-20T15:45:00Z"
  }
}
```

**Errors:**
- `403`: Only owner can invite
- `409`: Developer already a member

---

### Accept Project Invitation

**POST** `/projects/invitations/:invitationId/accept`

Accept an invitation to join project (developer only).

**Authentication:** Required

**Path Parameters:**
- `invitationId` (string): MongoDB ObjectId

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Invitation accepted",
  "data": {
    "status": "accepted",
    "respondedAt": "2024-01-20T16:00:00Z"
  }
}
```

---

### Reject Project Invitation

**POST** `/projects/invitations/:invitationId/reject`

Reject an invitation to join project.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Invitation rejected",
  "data": {
    "status": "rejected",
    "respondedAt": "2024-01-20T16:00:00Z"
  }
}
```

---

### Remove Project Member

**DELETE** `/projects/:projectId/members/:memberId`

Remove member from project (owner only).

**Authentication:** Required (developer role)

**Path Parameters:**
- `projectId` (string): MongoDB ObjectId
- `memberId` (string): User ID to remove

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Member removed",
  "data": { /* updated project */ }
}
```

**Errors:**
- `403`: Only owner can remove
- `400`: Cannot remove owner

---

## 4. Task Management Endpoints

### Create Task

**POST** `/projects/:projectId/tasks`

Create task in project (project member only).

**Authentication:** Required (developer role)

**Request Body:**
```json
{
  "title": "Design homepage mockups",
  "description": "Create high-fidelity mockups for new homepage design",
  "priority": "high",
  "dueDate": "2024-02-15"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439035",
    "projectId": "507f1f77bcf86cd799439020",
    "title": "Design homepage mockups",
    "status": "todo",
    "priority": "high",
    "dueDate": "2024-02-15",
    "createdAt": "2024-01-20T15:45:00Z"
  }
}
```

---

### List Project Tasks

**GET** `/projects/:projectId/tasks`

Get all tasks in a project.

**Authentication:** Required

**Query Parameters:**
- `status` (enum): Filter by status
- `priority` (enum): Filter by priority
- `assignedTo` (string): Filter by assignee ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439035",
      "title": "Design homepage mockups",
      "status": "in-progress",
      "priority": "high",
      "assignedTo": { "_id": "507f1f77bcf86cd799439015", "email": "dev@example.com" },
      "dueDate": "2024-02-15"
    }
  ]
}
```

---

### Get Task

**GET** `/tasks/:taskId`

Get task details.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439035",
    "projectId": "507f1f77bcf86cd799439020",
    "title": "Design homepage mockups",
    "description": "Create high-fidelity mockups...",
    "status": "in-progress",
    "priority": "high",
    "assignedTo": "507f1f77bcf86cd799439015",
    "dueDate": "2024-02-15",
    "createdAt": "2024-01-20T15:45:00Z"
  }
}
```

---

### Update Task

**PUT** `/tasks/:taskId`

Update task details.

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Updated title",
  "status": "done",
  "priority": "medium",
  "assignedTo": "507f1f77bcf86cd799439016",
  "dueDate": "2024-02-20"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": { /* updated task */ }
}
```

---

### Delete Task

**DELETE** `/tasks/:taskId`

Delete a task.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

### Get Assigned Tasks

**GET** `/tasks/assigned`

Get all tasks assigned to authenticated user.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439035",
      "title": "Design homepage mockups",
      "projectId": { "title": "E-commerce Platform Redesign" },
      "status": "in-progress",
      "dueDate": "2024-02-15"
    }
  ]
}
```

---

## 5. Messaging Endpoints

### Send Direct Message

**POST** `/messages/direct`

Send message to another user (client or developer).

**Authentication:** Required

**Request Body:**
```json
{
  "receiverId": "507f1f77bcf86cd799439016",
  "content": "Hi! I'm interested in your profile. Are you available for a project?"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Message sent",
  "data": {
    "_id": "507f1f77bcf86cd799439040",
    "conversationId": "507f1f77bcf86cd799439038",
    "senderId": { "email": "client@example.com" },
    "receiverId": { "email": "dev@example.com" },
    "content": "Hi! I'm interested...",
    "readStatus": false,
    "messageType": "direct",
    "createdAt": "2024-01-20T15:45:00Z"
  }
}
```

---

### Send Project Message

**POST** `/messages/project/:projectId`

Send message in project (members only).

**Authentication:** Required (developer role)

**Request Body:**
```json
{
  "content": "I've completed the UI mockups. Please review when you have time."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Message sent",
  "data": {
    "_id": "507f1f77bcf86cd799439041",
    "projectId": "507f1f77bcf86cd799439020",
    "senderId": { "email": "dev@example.com" },
    "content": "I've completed the UI mockups...",
    "messageType": "project",
    "createdAt": "2024-01-20T15:45:00Z"
  }
}
```

---

### Get Conversations

**GET** `/conversations`

Get all conversations for authenticated user.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439038",
      "participant1Id": { "email": "user1@example.com" },
      "participant2Id": { "email": "user2@example.com" },
      "lastMessage": "Thanks for the update!",
      "lastMessageAt": "2024-01-20T15:45:00Z"
    }
  ]
}
```

---

### Get Conversation Messages

**GET** `/conversations/:conversationId/messages`

Get messages in a conversation (participant only).

**Authentication:** Required

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 50)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439040",
      "senderId": { "email": "client@example.com" },
      "content": "Hi! Interested in your profile",
      "readStatus": true,
      "createdAt": "2024-01-20T15:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25
  }
}
```

---

### Get Project Messages

**GET** `/projects/:projectId/messages`

Get messages in project (members only).

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439041",
      "senderId": { "email": "dev@example.com" },
      "content": "I've completed the UI mockups",
      "createdAt": "2024-01-20T15:45:00Z"
    }
  ]
}
```

---

### Mark Conversation as Read

**PUT** `/conversations/:conversationId/mark-read`

Mark all messages in conversation as read.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Conversation marked as read"
}
```

---

## 6. Hiring Endpoints

### Create Hire Request

**POST** `/hires`

Request to hire a developer (client only).

**Authentication:** Required (client role)

**Request Body:**
```json
{
  "developerId": "507f1f77bcf86cd799439016",
  "title": "Build E-commerce Backend",
  "description": "Need a Node.js developer to build REST API",
  "budget": 2500,
  "budget_type": "fixed"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Hire request sent",
  "data": {
    "_id": "507f1f77bcf86cd799439050",
    "clientId": { "email": "client@example.com" },
    "developerId": { "email": "dev@example.com" },
    "title": "Build E-commerce Backend",
    "budget": 2500,
    "status": "pending",
    "createdAt": "2024-01-20T15:45:00Z"
  }
}
```

---

### Accept Hire Request

**POST** `/hires/:hireId/accept`

Accept a hire request (developer only).

**Authentication:** Required (developer role)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Hire request accepted",
  "data": {
    "status": "accepted",
    "respondedAt": "2024-01-20T16:00:00Z"
  }
}
```

---

### Get Developer Hire Requests

**GET** `/hires/developer/requests`

Get hire requests for authenticated developer.

**Authentication:** Required (developer role)

**Query Parameters:**
- `status` (enum): Filter by status

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439050",
      "clientId": { "email": "client@example.com" },
      "title": "Build E-commerce Backend",
      "budget": 2500,
      "status": "pending"
    }
  ]
}
```

---

### Get Client Hire Requests

**GET** `/hires/client/requests`

Get hire requests created by authenticated client.

**Authentication:** Required (client role)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [ /* similar to above */ ]
}
```

---

### Create Review

**POST** `/reviews`

Create review for developer after hire completion (client only).

**Authentication:** Required (client role)

**Request Body:**
```json
{
  "hireRequestId": "507f1f77bcf86cd799439050",
  "rating": 5,
  "comment": "Excellent work! Delivered on time and exceeded expectations."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439060",
    "developerId": { "email": "dev@example.com" },
    "rating": 5,
    "comment": "Excellent work!...",
    "createdAt": "2024-01-20T17:00:00Z"
  }
}
```

**Errors:**
- `400`: Hire not completed
- `409`: Review already exists

---

### Get Developer Reviews

**GET** `/reviews/developer/:developerId`

Get all reviews for a developer (public).

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439060",
      "rating": 5,
      "comment": "Excellent work!...",
      "clientId": { "email": "client@example.com" },
      "createdAt": "2024-01-20T17:00:00Z"
    }
  ]
}
```

---

## 7. Admin Endpoints

### Create Report

**POST** `/admin/reports`

Report inappropriate content or behavior.

**Authentication:** Required

**Request Body:**
```json
{
  "targetType": "user",
  "targetId": "507f1f77bcf86cd799439016",
  "reason": "spam",
  "description": "Spamming inappropriate content in messages"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Report submitted",
  "data": {
    "_id": "507f1f77bcf86cd799439070",
    "reportedBy": { "email": "reporter@example.com" },
    "targetType": "user",
    "targetId": "507f1f77bcf86cd799439016",
    "reason": "spam",
    "status": "open",
    "createdAt": "2024-01-20T15:45:00Z"
  }
}
```

---

### Get Pending Reports

**GET** `/admin/reports`

Get reports awaiting review (admin only).

**Authentication:** Required (admin role)

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 20)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [ /* reports */ ],
  "pagination": { /* page info */ }
}
```

---

### Resolve Report

**PUT** `/admin/reports/:reportId/resolve`

Resolve a report with action (admin only).

**Authentication:** Required (admin role)

**Request Body:**
```json
{
  "action": "suspend_user",
  "notes": "User was suspended for spam violations"
}
```

**Possible Actions:**
- `suspend_user`: Suspend reported user
- `remove_content`: Remove reported content
- `dismiss`: Close report without action

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Report resolved",
  "data": {
    "status": "resolved",
    "resolvedBy": "admin_id",
    "resolvedAt": "2024-01-20T16:00:00Z"
  }
}
```

---

### Suspend User

**POST** `/admin/users/:userId/suspend`

Suspend a user account (admin only).

**Authentication:** Required (admin role)

**Request Body:**
```json
{
  "reason": "Violating community guidelines"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User suspended",
  "data": {
    "isSuspended": true
  }
}
```

---

### Unsuspend User

**POST** `/admin/users/:userId/unsuspend`

Restore suspended account (admin only).

**Authentication:** Required (admin role)

**Request Body:**
```json
{
  "reason": "Appeal approved"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User unsuspended"
}
```

---

### Get Admin Logs

**GET** `/admin/logs`

Get audit trail of admin actions (admin only).

**Authentication:** Required (admin role)

**Query Parameters:**
- `adminId` (string): Filter by admin
- `actionType` (enum): Filter by action type
- `page` (integer, default: 1)
- `limit` (integer, default: 50)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439080",
      "adminId": { "email": "admin@example.com" },
      "actionType": "user.suspend",
      "targetId": "507f1f77bcf86cd799439016",
      "metadata": { "reason": "Spam violations" },
      "createdAt": "2024-01-20T16:00:00Z"
    }
  ]
}
```

---

### Get Platform Statistics

**GET** `/admin/stats`

Get platform overview statistics (admin only).

**Authentication:** Required (admin role)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1250,
      "developers": 850,
      "clients": 400,
      "suspended": 15
    },
    "projects": 342,
    "hires": 567,
    "reviews": 489,
    "reports": {
      "open": 8
    }
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 400 | Bad Request | Invalid email format |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Role insufficient or account suspended |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Email already exists, already invited |
| 500 | Server Error | Database connection failed |

---

## Rate Limiting (Future)

Endpoints will be rate-limited in production:
- Auth endpoints: 5 requests per minute per IP
- General endpoints: 100 requests per minute per user
- Admin endpoints: 20 requests per minute per admin

---

## Pagination

Paginated endpoints use query parameters:
- `page` (default: 1)
- `limit` (default: 20, max: 100)

Response includes:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## Timestamps

All timestamps are in ISO 8601 format (UTC):
```
2024-01-20T15:45:00Z
```

---

## Testing Checklist

- [ ] All auth endpoints working
- [ ] Profile CRUD operations
- [ ] Project creation and member management
- [ ] Task management
- [ ] Direct messaging
- [ ] Project messaging
- [ ] Hire requests workflow
- [ ] Review creation
- [ ] Admin reporting and moderation
- [ ] Error handling on all endpoints
- [ ] Authorization checks

---

**Last Updated:** January 2024  
**API Version:** 1.0.0
