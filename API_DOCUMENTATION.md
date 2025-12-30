# 📚 BLACK & WHITE SKILLSWAP - COMPLETE API DOCUMENTATION

**Version**: 4.0.0 (WhatsApp-Level Media Messaging)  
**Base URL**: `http://localhost:5000/api`  
**Total Endpoints**: 55  
**Authentication**: JWT (Bearer Token) + Refresh Token  

---

## 📦 DATA MODELS

### User Object
```json
{
  "id": "string",
  "email": "string",
  "firstName": "string (required)",
  "lastName": "string (required)",
  "avatar": "string | null",
  "bio": "string | null",
  "location": "string | null",
  "role": "string (default: 'user')",
  
  "skillcoins": "number (default: 50)",
  "level": "number (default: 1)",
  "xp": "number (default: 0)",
  "badges": "[BadgeObject]",
  "milestones": "[MilestoneObject]",
  
  "loginStreak": "number (default: 0)",
  "lastLoginAt": "Date | null",
  "totalSwaps": "number (default: 0)",
  "completedSwaps": "number (default: 0)",
  
  "referralCode": "string (unique, 8 chars)",
  "referredBy": "string (User ID) | null",
  "referralCount": "number (default: 0)",
  
  "skillsToTeach": "[SkillObject]",
  "skillsToLearn": "[SkillObject]",
  "isActive": "boolean (default: true)",
  
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Skill Object
```json
{
  "_id": "string",
  "title": "string (required)",
  "description": "string (required)",
  "category": "string (required)",
  "experienceLevel": "beginner | intermediate | advanced | expert (required)",
  
  // For Skills to Teach
  "proficiency": "string | null",
  "yearsExperience": "string | null (e.g., '1-3', '5-10')",
  "tools": "[string]",
  
  // For Learning Goals
  "targetDate": "Date | null",
  "currentProgress": "number (0-100)",
  "resources": "[string]",
  
  // Common Fields
  "tags": "[string]",
  "availability": "string | null",
  "preferredMethod": "string | null",
  "notes": "string | null",
  "createdAt": "Date"
}
```

### Swap Object
```json
{
  "id": "string",
  "requester": "PopulatedUser { id, firstName, lastName, avatar }",
  "recipient": "PopulatedUser { id, firstName, lastName, avatar }",
  "skillOffered": "string (required)",
  "skillRequested": "string (required)",
  "description": "string | null",
  "status": "pending | accepted | rejected | scheduled | active | completed | cancelled",
  
  "scheduledDate": "Date | null",
  "startTime": "Date | null",
  "endTime": "Date | null",
  "autoExpireAt": "Date | null",
  "completedAt": "Date | null",
  
  "duration": "string (default: '1 hour')",
  "availability": "string | null",
  "preferences": {
    "videoCalls": "boolean (default: true)",
    "screenSharing": "boolean (default: false)",
    "projectBased": "boolean (default: false)"
  },
  
  "skillcoinsEarned": "number (default: 50)",
  "bonusMultiplier": "number (default: 1.0)",
  "skillcoinsAwarded": "boolean (default: false)",
  
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Post Object
```json
{
  "id": "string",
  "author": "PopulatedUser { id, firstName, lastName, avatar }",
  "content": "string (required)",
  "image": "string | null",
  "group": "string (Group ID) | null",
  "likes": "[string] (User IDs)",
  "comments": "[CommentObject]",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Comment Object
```json
{
  "user": "PopulatedUser { id, firstName, lastName, avatar }",
  "text": "string (required)",
  "createdAt": "Date"
}
```

### Message Object
```json
{
  "id": "string",
  "conversationId": "string (required)",
  "sender": "PopulatedUser { id, firstName, lastName, avatar }",
  "content": "string (required)",
  "type": "text | image (default: text)",
  "attachmentUrl": "string | null",
  "readBy": "[string] (User IDs)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Conversation Object
```json
{
  "id": "string",
  "participants": "[PopulatedUser]",
  "type": "direct | swap_request | group",
  "contextId": "string | null (Swap ID if type is swap_request)",
  "lastMessage": "string",
  "lastMessageTime": "Date",
  "unreadCounts": "{ [userId]: number }",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Transaction Object
```json
{
  "id": "string",
  "user": "string (User ID)",
  "type": "earn | spend | bonus | referral | credit",
  "amount": "number (required)",
  "description": "string",
  "balance": "number (balance after transaction)",
  "status": "completed | pending",
  "swapId": "string | null",
  "source": {
    "type": "swap | achievement | referral | spend"
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Notification Object
```json
{
  "id": "string",
  "user": "string (User ID)",
  "type": "swap_request | swap_accepted | swap_rejected | swap_completed | etc.",
  "title": "string (required)",
  "message": "string (required)",
  "isRead": "boolean (default: false)",
  "data": "object | null",
  "relatedEntity": {
    "type": "string (e.g., 'Swap', 'Post')",
    "id": "string"
  },
  "actionUrl": "string | null",
  "createdAt": "Date"
}
```

### Badge Object
```json
{
  "type": "string (required)",
  "name": "string (required)",
  "earnedAt": "Date",
  "tier": "bronze | silver | gold | platinum"
}
```

### Milestone Object
```json
{
  "type": "string (required)",
  "completedAt": "Date",
  "reward": "number (skillcoins)"
}
```

---

## 🔐 AUTHENTICATION

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer {access_token}
```

### 📌 Auth Endpoints

#### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response (201):
{
  "success": true,
  "user": {
    "id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "skillcoins": 50,
    "level": 1,
    "xp": 0,
    "referralCode": "ABC12345",
    "avatar": "https://..."
  },
  "token": "eyJhbGc...",  // Access token (15 min)
  "refreshToken": "a1b2c3..."  // Refresh token (7 days)
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "user": { ... },
  "token": "eyJhbGc...",
  "refreshToken": "a1b2c3..."
}
```

#### 3. Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "user": {
    "id": "...",
    "firstName": "John",
    "skillcoins": 150,
    "level": 3,
    "badges": [...],
    ...
  }
}
```

#### 4. Refresh Access Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "a1b2c3..."  // Optional if using cookie
}

Response (200):
{
  "success": true,
  "token": "newAccessToken...",
  "refreshToken": "newRefreshToken..."
}
```

#### 5. Revoke Refresh Token
```http
POST /api/auth/revoke-token
Content-Type: application/json

{
  "refreshToken": "a1b2c3..."
}

Response (200):
{
  "success": true,
  "message": "Token revoked successfully"
}
```

#### 6. Get Active Sessions
```http
GET /api/auth/tokens
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "tokens": [
    {
      "createdByIp": "192.168.1.1",
      "createdAt": "2024-12-13T...",
      "expiresAt": "2024-12-20T..."
    }
  ]
}
```

#### 7. Logout
```http
POST /api/auth/logout  
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 👥 USERS

#### 1. Get All Users (Paginated, Searchable)
```http
GET /api/users?page=1&limit=20&search=john&sortBy=skillcoins&sortOrder=desc
Authorization: Bearer {token} (optional)

Response (200):
{
  "users": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### 2. Get User by ID
```http
GET /api/users/:id
Authorization: Bearer {token} (optional)

Response (200):
{
  "id": "...",
  "firstName": "John",
  "lastName": "Doe",
  "avatar": "https://...",
  "bio": "Web developer",
  "skillsToTeach": [
    { "name": "JavaScript", "level": "Advanced" }
  ],
  "skillsToLearn": [
    { "name": "Python", "level": "Beginner" }
  ],
  "skillcoins": 150,
  "level": 3,
  "xp": 250,
  "completedSwaps": 5
}
```

#### 3. Get User Stats
```http
GET /api/users/:id/stats
Authorization: Bearer {token}

Response (200):
{
  "totalSwaps": 10,
  "completedSwaps": 7,
  "pendingSwaps": 2,
  "skillcoins": 150,
  "level": 3,
  "badges": 3,
  "loginStreak": 5
}
```

#### 4. Update Profile
```http
PUT /api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "bio": "Experienced web developer",
  "location": "New York, USA",
  "skillsToTeach": [
    {
      "title": "React",
      "description": "Modern React development with hooks",
      "category": "frontend",
      "experienceLevel": "advanced",
      "yearsExperience": "5-10",
      "tools": ["React Hooks", "Redux", "TypeScript"],
      "availability": "weekday-evenings",
      "preferredMethod": "video-calls"
    }
  ],
  "skillsToLearn": [
    {
      "title": "Node.js",
      "description": "Backend development with Node.js",
      "category": "backend",
      "experienceLevel": "intermediate",
      "targetDate": "2024-12-31",
      "currentProgress": 30,
      "resources": ["NodeJS Course", "Express Tutorial"],
      "availability": "weekends",
      "preferredMethod": "one-on-one"
    }
  ]
}

Response (200):
{
  "success": true,
  "user": { ... }
}
```

#### 5. Add Skill to Teach
```http
POST /api/users/skills/teach
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "JavaScript",
  "description": "Modern JavaScript development including ES6+ features",
  "category": "frontend",
  "experienceLevel": "advanced",
  "proficiency": "expert",
  "yearsExperience": "5-10",
  "tools": ["ES6", "TypeScript", "Webpack"],
  "tags": ["web", "frontend", "programming"],
  "availability": "weekday-evenings",
  "preferredMethod": "one-on-one",
  "notes": "Specializing in async programming and modern frameworks"
}

Response (201):
{
  "success": true,
  "skill": {
    "_id": "...",
    "title": "JavaScript",
    "description": "Modern JavaScript development including ES6+ features",
    ...
  },
  "message": "Skill added successfully"
}
```

#### 6. Add Learning Goal
```http
POST /api/users/skills/learn
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Python",
  "description": "Learn Python for data science and ML",
  "category": "data",
  "experienceLevel": "beginner",
  "targetDate": "2025-03-01",
  "currentProgress": 0,
  "resources": ["Python Crash Course", "Kaggle Tutorials"],
  "tags": ["programming", "data-science", "ml"],
  "availability": "weekends",
  "preferredMethod": "project-based",
  "notes": "Interested in machine learning applications"
}

Response (201):
{
  "success": true,
  "skill": {
    "_id": "...",
    "title": "Python",
    "description": "Learn Python for data science and ML",
    ...
  },
  "message": "Learning goal added successfully"
}
```

#### 7. Remove Skill to Teach
```http
DELETE /api/users/skills/teach/:skillId
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": "Skill removed successfully"
}
```

#### 8. Remove Learning Goal
```http
DELETE /api/users/skills/learn/:skillId
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": "Learning goal removed successfully"
}
```

---

## 🔄 SWAPS

#### 1. Get All Swaps (User's Swaps)
```http
GET /api/swaps?page=1&limit=20&status=scheduled
Authorization: Bearer {token}

Response (200):
{
  "swaps": [
    {
      "id": "...",
      "requester": { "id": "...", "name": "John Doe" },
      "recipient": { "id": "...", "name": "Sarah Smith" },
      "skillOffered": "JavaScript",
      "skillRequested": "UI/UX Design",
      "status": "scheduled",
      "scheduledDate": "2024-12-15T14:00:00Z",
      "duration": "1 hour",
      "skillcoinsEarned": 50
    }
  ]
}
```

#### 2. Create Swap Request
```http
POST /api/swaps
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "recipientId": "user_id_here" (required),
  "skillOffered": "JavaScript" (required),
  "skillRequested": "Python" (required),
  "message": "I can teach modern JS, want to learn Python basics" (optional),
  "availability": "weekday-evenings" (optional),
  "duration": "1 hour" (optional, default: "1 hour"),
  "preferences": {
    "videoCalls": true,
    "screenSharing": true,
    "projectBased": false
  } (optional)
}

Response (201):
{
  "success": true,
  "swap": {
    "id": "...",
    "requester": { "id": "...", "firstName": "John", "lastName": "Doe", "avatar": "..." },
    "recipient": { "id": "...", "firstName": "Sarah", "lastName": "Smith", "avatar": "..." },
    "skillOffered": "JavaScript",
    "skillRequested": "Python",
    "description": "I can teach modern JS, want to learn Python basics",
    "status": "pending",
    "duration": "1 hour",
    "availability": "weekday-evenings",
    "preferences": { ... },
    "skillcoinsEarned": 50,
    "createdAt": "2024-12-18T...",
    "updatedAt": "2024-12-18T..."
  },
  "conversationId": "conv_abc123"  // ID of created conversation for this swap
}

Error (400 - Cannot swap with yourself):
{
  "success": false,
  "message": "Cannot swap with yourself"
}

Error (404 - Recipient not found):
{
  "success": false,
  "message": "Recipient not found"
}
```

#### 3. Update Swap Status / Schedule Session
```http
PUT /api/swaps/:id
Authorization: Bearer {token}
Content-Type: application/json

Request Body (flexible - provide any combination):
{
  // Status Update
  "status": "accepted" | "rejected" | "cancelled" | "completed" | "scheduled" (optional),
  
  // Scheduling Fields (NEW)
  "scheduledDate": "2024-12-25T14:00:00.000Z" (optional),
  "duration": "1.5 hours" (optional),
  "sessionType": "video" | "in-person" (optional),
  "notes": "Looking forward to learning React!" (optional),
  "preferences": {
    "videoCalls": true,
    "screenSharing": true,
    "projectBased": false
  } (optional)
}

Response (200) - Fast Response (50-100ms):
{
  "success": true,
  "swap": {
    "id": "...",
    "status": "scheduled",
    "scheduledDate": "2024-12-25T14:00:00.000Z",
    "startTime": "2024-12-25T14:00:00.000Z",      // Auto-calculated
    "endTime": "2024-12-25T15:30:00.000Z",        // Auto-calculated
    "autoExpireAt": "2024-12-25T15:30:00.000Z",   // Auto-calculated
    "duration": "1.5 hours",
    "preferences": { "videoCalls": true },
    "requester": { ... },
    "recipient": { ... }
  }
}

Example 1: Schedule a Session
PUT /api/swaps/abc123
{
  "scheduledDate": "2024-12-25T14:00:00.000Z",
  "duration": "1.5 hours",
  "sessionType": "video",
  "notes": "Let's meet on Zoom!"
}

Example 2: Accept Swap Only
PUT /api/swaps/abc123
{
  "status": "accepted"
}

Notes:
- When status is "completed": Both users receive 50 skillcoins, transactions created
- When scheduledDate provided: Must be future date, auto-calculates times, status→'scheduled'
- Reminders: Sent 1-hour and 15-minutes before session
- Performance: 50-100ms response, async notifications
- Auto-completion: Session completes automatically at endTime

Error (401 - Not authorized):
{
  "success": false,
  "message": "Not authorized"  // Only swap participants can update
}

Error (404 - Swap not found):
{
  "success": false,
  "message": "Swap not found"
}
```

---

## 👥 GROUPS

#### 1. Get All Groups
```http
GET /api/groups?page=1&limit=20&category=Technology
Authorization: Bearer {token} (optional)

Response (200):
{
  "groups": [
    {
      "id": "...",
      "name": "Web Developers United",
      "description": "Community for web devs",
      "category": "Technology",
      "members": 45,
      "creator": { ... },
      "avatar": "https://..."
    }
  ]
}
```

#### 2. Create Group
```http
POST /api/groups
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "React Developers",
  "description": "For React enthusiasts",
  "category": "Technology",
  "isPrivate": false
}

Response (201):
{
  "success": true,
  "group": { ... }
}
```

#### 3. Get Group by ID
```http
GET /api/groups/:id
Authorization: Bearer {token} (optional)

Response (200):
{
  "id": "...",
  "name": "Web Developers United",
  "members": [...],
  "posts": [...]
}
```

#### 4. Join Group
```http
POST /api/groups/:id/join
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": "Joined group successfully",
  "group": {
    "id": "...",
    "name": "Web Developers United",
    "description": "Community for web devs",
    "category": "Technology",
    "creator": { "id": "...", "firstName": "...", "lastName": "...", "avatar": "..." },
    "members": [
      { "id": "...", "firstName": "...", "lastName": "...", "avatar": "..." },
      // ... includes newly joined user
    ],
    "coverImage": "https://...",
    "createdAt": "2024-12-18T...",
    "updatedAt": "2024-12-18T..."
  }
}

Error (400 - Already a member):
{
  "success": false,
  "message": "Already a member"
}

Error (404 - Group not found):
{
  "success": false,
  "message": "Group not found"
}
```

---

## 💬 MESSAGES & CONVERSATIONS

#### 1. Get All Conversations
```http
GET /api/conversations
Authorization: Bearer {token}

Response (200):
[
  {
    "id": "...",
    "participants": [
      { "id": "...", "name": "John Doe", "avatar": "..." }
    ],
    "lastMessage": "Hey! Ready for our swap?",
    "lastMessageTime": "2024-12-13T...",
    "unreadCount": 2,
    "type": "direct"
  }
]
```

#### 2. Get Messages for Conversation
```http
GET /api/conversations/:id/messages
Authorization: Bearer {token}

Response (200):
[
  {
    "id": "...",
    "sender": { "id": "...", "name": "John" },
    "content": "Hey! Looking forward to our swap!",
    "type": "text",
    "timestamp": "2024-12-13T...",
    "isRead": true,
    "attachmentUrl": null
  }
]
```

#### 3. Send Message
```http
POST /api/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "conversationId": "conv_id_here",
  "content": "Thanks! Me too!",
  "type": "text"
}

Response (201):
{
  "id": "...",
  "sender": { ... },
  "content": "Thanks! Me too!",
  "timestamp": "2024-12-13T..."
}
```

#### 4. Mark Message as Read
```http
PUT /api/messages/:messageId/read
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": { ... }
}
```

---

## 📝 POSTS

#### 1. Get All Posts (Feed)
```http
GET /api/posts?page=1&limit=20&sortBy=timestamp&sortOrder=desc&groupId=group_id
Authorization: Bearer {token} (optional)

Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 20)
- sortBy: Sort field (default: createdAt)
- sortOrder: asc | desc (default: desc)
- groupId: Filter posts by group ID (optional)

Response (200):
[
  {
    "id": "...",
    "author": { "id": "...", "firstName": "John", "lastName": "Doe", "avatar": "..." },
    "content": "Just completed my first swap!",
    "image": "https://cloudinary.com/..." | null,
    "group": "group_id" | null,
    "likes": ["user_id1", "user_id2"],
    "comments": [
      {
        "user": { "id": "...", "firstName": "...", "lastName": "...", "avatar": "..." },
        "text": "Congrats!",
        "createdAt": "2024-12-18T..."
      }
    ],
    "createdAt": "2024-12-18T...",
    "updatedAt": "2024-12-18T..."
  }
]
```

#### 2. Create Post
```http
POST /api/posts
Authorization: Bearer {token}
Content-Type: application/json (or multipart/form-data for images)

Request Body:
{
  "content": "Just learned React! Amazing framework." (required),
  "groupId": "optional_group_id" (optional),
  "image": "https://..." | file upload (optional)
}

Response (201):
{
  "id": "...",
  "author": { "id": "...", "firstName": "John", "lastName": "Doe", "avatar": "..." },
  "content": "Just learned React! Amazing framework.",
  "image": "https://cloudinary.com/..." | null,
  "group": "group_id" | null,
  "likes": [],
  "comments": [],
  "createdAt": "2024-12-18T...",
  "updatedAt": "2024-12-18T..."
}

Note: For file uploads, use multipart/form-data with field name 'image'
```

#### 3. Like Post
```http
PUT /api/posts/:id/like
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "likes": 15
}
```

#### 4. Comment on Post
```http
POST /api/posts/:id/comment
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "text": "Great post! Very helpful." (required)
}

Response (201):
{
  "id": "...",
  "author": { ... },
  "content": "...",
  "image": null,
  "group": null,
  "likes": [...],
  "comments": [
    {
      "user": { "id": "...", "firstName": "...", "lastName": "...", "avatar": "..." },
      "text": "Great post! Very helpful.",
      "createdAt": "2024-12-18T..."
    },
    // ... other comments
  ],
  "createdAt": "2024-12-18T...",
  "updatedAt": "2024-12-18T..."
}

Error (404 - Post not found):
{
  "success": false,
  "message": "Post not found"
}
```

---

## 💰 WALLET & TRANSACTIONS

#### 1. Get Wallet Info
```http
GET /api/wallet
Authorization: Bearer {token}

Response (200):
{
  "skillcoins": 250,
  "stats": {
    "totalEarned": 500,
    "totalSpent": 250,
    "thisMonthEarnings": 150,
    "available": 250
  },
  "transactions": [
    {
      "id": "...",
      "type": "earn",
      "amount": 50,
      "description": "Swap completed with Sarah",
      "balance": 250,
      "timestamp": "2024-12-13T..."
    }
  ],
  "message": "💡 Skillcoins can only be earned - no cash purchases!"
}
```

#### 2. Get Earning Opportunities
```http
GET /api/wallet/opportunities
Authorization: Bearer {token}

Response (200):
{
  "opportunities": [
    {
      "type": "swap_complete",
      "title": "Complete a Skill Swap",
      "description": "Exchange skills with other users",
      "reward": 50,
      "icon": "🔄",
      "available": true
    },
    {
      "type": "referral",
      "title": "Refer a Friend",
      "reward": 100,
      "referralCode": "ABC12345"
    }
  ]
}
```

#### 3. Spend Skillcoins
```http
POST /api/wallet/spend
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 50,
  "description": "Premium feature access",
  "feature": "advanced_search"
}

Response (200):
{
  "success": true,
  "newBalance": 200,
  "message": "Spent 50 skillcoins"
}
```

---

## 🔔 NOTIFICATIONS

#### 1. Get Notifications (Paginated)
```http
GET /api/notifications?page=1&limit=20&unreadOnly=true
Authorization: Bearer {token}

Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 20)
- unreadOnly: Filter only unread notifications (boolean, optional)

Response (200):
{
  "notifications": [
    {
      "id": "...",
      "user": "user_id",
      "type": "swap_request | swap_accepted | swap_rejected | swap_completed | etc.",
      "title": "New Swap Request",
      "message": "Sarah wants to swap Python for JavaScript",
      "isRead": false,
      "data": { "swapId": "...", "conversationId": "..." },
      "relatedEntity": {
        "type": "Swap",
        "id": "swap_id"
      },
      "actionUrl": "/swaps/swap_id",
      "createdAt": "2024-12-18T..."
    }
  ],
  "unreadCount": 5,
  "pagination": {
    "current": 1,
    "pages": 3,
    "total": 50
  }
}
```

#### 2. Mark as Read
```http
PUT /api/notifications/:id/read
Authorization: Bearer {token}

Response (200):
{
  "id": "...",
  "user": "user_id",
  "type": "swap_request",
  "title": "New Swap Request",
  "message": "Sarah wants to swap Python for JavaScript",
  "isRead": true,
  "data": { "swapId": "..." },
  "relatedEntity": { ... },
  "actionUrl": "/swaps/...",
  "createdAt": "2024-12-18T..."
}

Error (404 - Notification not found):
{
  "success": false,
  "message": "Notification not found"
}
```

#### 3. Mark All as Read
```http
PUT /api/notifications/read-all
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": "All notifications marked as read"
}
```

#### 4. Delete Notification
```http
DELETE /api/notifications/:id
Authorization: Bearer {token}

Response (200):
{
  "success": true
}
```

---

## 🎮 GAMIFICATION

#### 1. Get User Gamification Profile
```http
GET /api/gamification/profile
Authorization: Bearer {token}

Response (200):
{
  "level": 5,
  "xp": 650,
  "skillcoins": 300,
  "badges": [
    {
      "type": "badge",
      "name": "First Timer",
      "tier": "bronze",
      "earnedAt": "2024-12-01T..."
    }
  ],
  "milestones": [...],
  "stats": {
    "totalSwaps": 15,
    "completedSwaps": 12,
    "loginStreak": 7,
    "referralCount": 3
  },
  "nextLevel": {
    "level": 6,
    "xpRequired": 800,
    "xpToGo": 150
  }
}
```

#### 2. Get Leaderboard
```http
GET /api/gamification/leaderboard?type=level&limit=10
Authorization: Bearer {token} (optional)

Response (200):
{
  "leaderboard": [
    {
      "rank": 1,
      "user": {
        "id": "...",
        "name": "John Doe",
        "avatar": "..."
      },
      "level": 10,
      "xp": 2500,
      "skillcoins": 1500,
      "completedSwaps": 50
    }
  ]
}
```

#### 3. Get Available Achievements
```http
GET /api/gamification/achievements
Authorization: Bearer {token} (optional)

Response (200):
{
  "achievements": [
    {
      "type": "badge",
      "name": "First Timer",
      "description": "Complete your first swap",
      "tier": "bronze",
      "reward": {
        "skillcoins": 30,
        "xp": 20
      }
    }
  ]
}
```

#### 4. Claim Achievement
```http
POST /api/gamification/claim/:type
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "achievement": { ... },
  "newSkillcoins": 330,
  "newXP": 670,
  "newLevel": 5
}
```

#### 5. Track Activity
```http
POST /api/gamification/activity
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "login",
  "metadata": {}
}

Response (200):
{
  "success": true,
  "skillcoinsEarned": 0,
  "xpEarned": 2,
  "newBalance": 300,
  "newXP": 652,
  "newLevel": 5
}
```

---

## 🎁 REFERRALS

#### 1. Get Referral Code
```http
GET /api/referrals/code
Authorization: Bearer {token}

Response (200):
{
  "referralCode": "ABC12345",
  "referralCount": 3,
  "totalEarned": 300
}
```

#### 2. Get Referral Stats
```http
GET /api/referrals/stats
Authorization: Bearer {token}

Response (200):
{
  "totalReferrals": 3,
  "totalEarned": 300,
  "referrals": [
    {
      "name": "Sarah Johnson",
      "joinedAt": "2024-12-10T...",
      "completedSwaps": 5,
      "earnedYou": 100
    }
  ]
}
```

#### 3. Apply Referral Code
```http
POST /api/referrals/apply
Content-Type: application/json

{
  "referralCode": "ABC12345",
  "newUserId": "new_user_id"
}

Response (200):
{
  "success": true,
  "message": "Referral applied successfully",
  "referrerBonus": 100,
  "newUserBonus": 20
}
```

---

## 🔍 SEARCH

#### 1. Universal Search
```http
GET /api/search?q=javascript&type=users&page=1&limit=10
Authorization: Bearer {token} (optional)

Response (200):
{
  "query": "javascript",
  "total": 25,
  "page": 1,
  "limit": 10,
  "results": {
    "users": {
      "data": [...],
      "count": 8,
      "total": 15
    },
    "swaps": {
      "data": [...],
      "count": 5,
      "total": 10
    },
    "posts": {
      "data": [...],
      "count": 2,
      "total": 5
    }
  }
}

Query Parameters:
- q: Search query (required, min 2 chars)
- type: Filter by type (users, swaps, posts, groups) - optional
- page: Page number (default: 1)
- limit: Results per page (default: 10, max: 100)
```

#### 2. Search Suggestions (Autocomplete)
```http
GET /api/search/suggestions?q=ja&limit=5
Authorization: Bearer {token} (optional)

Response (200):
{
  "suggestions": [
    {
      "suggestion": "JavaScript",
      "type": "skill",
      "count": 45
    },
    {
      "suggestion": "James Wilson",
      "type": "user",
      "id": "..."
    }
  ]
}
```

---

## 📊 STATISTICS & RECOMMENDATIONS

#### 1. Get Platform Statistics
```http
GET /api/stats/platform
Authorization: Bearer {token} (optional)

Response (200):
{
  "totalUsers": 1500,
  "totalSwaps": 5000,
  "completedSwaps": 4200,
  "activeUsers": 450,
  "popularSkills": [
    { "skill": "JavaScript", "count": 250 },
    { "skill": "Python", "count": 200 }
  ]
}
```

#### 2. Get Leaderboard
```http
GET /api/stats/leaderboard?type=skillcoins&limit=10
Authorization: Bearer {token} (optional)

Response (200):
{
  "leaderboard": [...]
}
```

#### 3. Get Activity Feed
```http
GET /api/stats/activity?limit=20
Authorization: Bearer {token}

Response (200):
{
  "activities": [
    {
      "type": "swap_completed",
      "user": { ... },
      "timestamp": "..."
    }
  ]
}
```

#### 4. Get Recommendations
```http
GET /api/recommendations
Authorization: Bearer {token}

Response (200):
{
  "users": [...],  // Recommended users based on skills
  "swaps": [...],  // Potential swap matches
  "groups": [...]  // Relevant groups
}
```

#### 5. Get Trending Content
```http
GET /api/recommendations/trending
Authorization: Bearer {token} (optional)

Response (200):
{
  "posts": [...],
  "skills": [...],
  "groups": [...]
}
```

---

## 🔌 SOCKET.IO REAL-TIME EVENTS

### Client → Server Events

```javascript
// Connect
socket.emit('join', { userId: 'user_id' });

// Join conversation room
socket.emit('join_conversation', { conversationId: 'conv_id' });

// Send typing indicator
socket.emit('typing', { conversationId: 'conv_id', userId: 'user_id' });

// Stop typing
socket.emit('stop_typing', { conversationId: 'conv_id', userId: 'user_id' });

// Video call signaling
socket.emit('video-offer', { to: 'user_id', offer: {...} });
socket.emit('video-answer', { to: 'user_id', answer: {...} });
socket.emit('ice-candidate', { to: 'user_id', candidate: {...} });
```

### Server → Client Events

```javascript
// New message received
socket.on('receive_message', (message) => {
  // message: {
  //   id, conversationId, sender: { id, firstName, lastName, avatar },
  //   content, type, attachmentUrl, readBy, createdAt, updatedAt
  // }
});

// User typing
socket.on('user_typing', ({ userId, conversationId }) => {
  // Show typing indicator
});

// User stopped typing
socket.on('user_stopped_typing', ({ userId, conversationId }) => {
  // Hide typing indicator
});

// New notification
socket.on('new_notification', (notification) => {
  // notification: {
  //   id, user, type, title, message, isRead, data,
  //   relatedEntity: { type, id }, actionUrl, createdAt
  // }
});

// New swap request received
socket.on('new_swap_request', ({ swap, sender }) => {
  // swap: Full swap object
  // sender: { id, name }
});

// Swap status updated
socket.on('swap_status_update', ({ swapId, status }) => {
  // swapId: ID of the swap that was updated
  // status: New status (accepted, rejected, completed, etc.)
});

// User presence
socket.on('user_online', ({ userId }) => {});
socket.on('user_offline', ({ userId }) => {});

// Video call events
socket.on('video-offer', ({ from, offer }) => {});
socket.on('video-answer', ({ from, answer }) => {});
socket.on('ice-candidate', ({ from, candidate }) => {});
```

---

## 📋 QUERY PARAMETERS

### Pagination
```
?page=1          // Page number (default: 1)
?limit=20        // Items per page (default: 20, max: 100)
```

### Filtering
```
?status=active          // Filter by status
?dateFrom=2024-01-01    // Start date
?dateTo=2024-12-31      // End date
?isActive=true          // Boolean filter
?tags=javascript,react  // Array filter
```

### Sorting
```
?sortBy=createdAt       // Sort field
?sortOrder=desc         // asc or desc (default: desc)
```

### Search
```
?search=john            // Text search
?q=javascript           // Query string
```

---

## 🔍 VALIDATION RULES & CONSTRAINTS

### Authentication Fields
- **email**: Must be valid email format, unique in database
- **password**: Minimum 6 characters (configurable)
- **firstName**: Required, string, 1-50 characters
- **lastName**: Required, string, 1-50 characters

### User Profile Fields
- **bio**: Optional, string, max 500 characters
- **location**: Optional, string, max 100 characters
- **avatar**: Optional, valid URL or file upload

### Skill Fields (Both Teach & Learn)
- **title**: Required, string, 3-100 characters
- **description**: Required, string, 10-500 characters
- **category**: Required, string from predefined list
- **experienceLevel**: Required, enum: `beginner | intermediate | advanced | expert`
- **proficiency**: Optional, string
- **yearsExperience**: Optional, string (e.g., "1-3", "5-10")
- **tools**: Optional, array of strings
- **targetDate**: Optional, valid ISO 8601 date
- **currentProgress**: Optional, number between 0-100
- **resources**: Optional, array of strings
- **tags**: Optional, array of strings, max 10 items
- **availability**: Optional, string
- **preferredMethod**: Optional, string
- **notes**: Optional, string, max 300 characters

### Swap Fields
- **recipientId**: Required, valid User ObjectId
- **skillOffered**: Required, string, 3-100 characters
- **skillRequested**: Required, string, 3-100 characters
- **message**: Optional, string, max 500 characters
- **duration**: Optional, string, default: "1 hour"
- **availability**: Optional, string
- **preferences**: Optional, object with boolean fields

### Post Fields
- **content**: Required, string, 1-1000 characters
- **groupId**: Optional, valid Group ObjectId
- **image**: Optional, valid URL or file upload (max 5MB)

### Message Fields
- **conversationId**: Required, valid Conversation ObjectId
- **content**: Required, string, 1-2000 characters
- **type**: Optional, enum: `text | image`, default: `text`
- **attachmentUrl**: Optional, valid URL

### Pagination
- **page**: Integer, min: 1, default: 1
- **limit**: Integer, min: 1, max: 100, default: 20
- **sortBy**: String, valid field name
- **sortOrder**: Enum: `asc | desc`, default: `desc`

### Skillcoin Constraints
- **Cannot be negative**: All users start with 50 skillcoins
- **No cash purchases**: Skillcoins can only be earned through platform activity
- **Earning methods**:
  - Complete swap: 50 skillcoins (each participant)
  - Referral bonus: 100 skillcoins
  - Daily login: 2 XP
  - 7-day login streak: 50 skillcoins
  - Profile completion: 20 skillcoins
  - Milestone achievements: Varies
- **Spending methods**: Premium features only (no withdrawal)

---

## ⚠️ ERROR HANDLING

### Generic Error Format
All errors follow this structure:
```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

### Validation Error Format
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

### Common Error Messages by Endpoint

#### Authentication Errors
- `"Invalid credentials"` (401) - Wrong email/password
- `"Email already exists"` (400) - Registration with existing email
- `"No token provided"` (401) - Missing Authorization header
- `"Invalid token"` (401) - Malformed or expired token
- `"Refresh token expired"` (401) - Need to login again

#### Swap Errors
- `"Cannot swap with yourself"` (400)
- `"Recipient not found"` (404)
- `"Swap not found"` (404)
- `"Not authorized"` (401) - Only swap participants can update
- `"Invalid status transition"` (400)

#### Post Errors
- `"Post not found"` (404)
- `"Content is required"` (400)
- `"Content too long"` (400) - Exceeds 1000 characters

#### Group Errors
- `"Group not found"` (404)
- `"Already a member"` (400)
- `"Group name already exists"` (400)

#### Message Errors
- `"Conversation not found"` (404)
- `"Message not found"` (404)
- `"Not a participant in this conversation"` (403)

#### Wallet Errors
- `"Insufficient skillcoins"` (400)
- `"Invalid amount"` (400)
- `"Amount must be positive"` (400)

#### Notification Errors
- `"Notification not found"` (404)
- `"Notification does not belong to you"` (403)

### HTTP Status Code Reference

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": []  // Optional validation errors
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### Rate Limiting

- **Auth endpoints**: 5 requests per 15 minutes per IP
- **API endpoints**: 100 requests per 15 minutes per IP

---

## 🎯 QUICK EXAMPLES

### Complete User Flow

```javascript
// 1. Register
const registerRes = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
    password: 'password123'
  })
});
const { token } = await registerRes.json();

// 2. Get users to swap with
const usersRes = await fetch('http://localhost:5000/api/users?limit=10', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { users } = await usersRes.json();

// 3. Create swap request
const swapRes = await fetch('http://localhost:5000/api/swaps', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    recipientId: users[0].id,
    skillOffered: 'JavaScript',
    skillRequested: 'Python'
  })
});

// 4. Check wallet
const walletRes = await fetch('http://localhost:5000/api/wallet', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { skillcoins } = await walletRes.json();
```

---

## � BACKEND FEATURES & MECHANISMS

### Auto-Expiry System
The backend includes an automatic expiry system for swaps:

- **How it works**: When a swap is scheduled or becomes active, the system calculates `autoExpireAt` based on the `endTime`
- **Calculation**: `autoExpireAt = startTime + duration`
- **Default duration**: 1 hour (customizable in swap creation)
- **Duration parsing**: Supports formats like "1 hour", "30 minutes", "2 hr", etc.
- **Fields set automatically**:
  - `startTime`: Set from `scheduledDate`
  - `endTime`: Calculated as `startTime + duration`
  - `autoExpireAt`: Same as `endTime`

**Example**: If you create a swap with `scheduledDate: "2024-12-18T14:00:00Z"` and `duration: "1 hour"`, the system automatically sets:
- `startTime`: `2024-12-18T14:00:00Z`
- `endTime`: `2024-12-18T15:00:00Z`
- `autoExpireAt`: `2024-12-18T15:00:00Z`

### Caching Strategy
The API uses in-memory caching for performance optimization:

- **Cached endpoints**:
  - `GET /api/search` (5 minutes TTL)
  - `GET /api/search/suggestions` (5 minutes TTL)
  - `GET /api/stats/platform` (10 minutes TTL)
  - `GET /api/stats/leaderboard` (10 minutes TTL)
  - `GET /api/stats/activity` (5 minutes TTL)
  - `GET /api/users` (Cache invalidated on profile updates)

- **Cache invalidation**: Automatic when relevant data changes (e.g., user profile updates)

### Background Jobs
The backend runs scheduled background tasks:

- **Login Streak Tracking**: Updates user login streaks daily
- **Swap Expiry Checker**: Marks expired swaps as cancelled
- **Achievement Checker**: Automatically awards badges and milestones
- **Email Queue Processor**: Sends notification emails asynchronously
- **Activity Log Cleanup**: Removes old activity logs (retention period configurable)

### Gamification System
Automatic XP and level calculation:

- **XP Earning**:
  - Daily login: 2 XP
  - Complete swap: 10 XP
  - Create post: 5 XP
  - Receive likes: 1 XP per 5 likes
  - Achieve milestones: Varies

- **Level Formula**: `Level = floor(sqrt(XP / 50)) + 1`
  - Level 1: 0-49 XP
  - Level 2: 50-199 XP
  - Level 3: 200-449 XP
  - Level 4: 450-799 XP
  - Level 5: 800-1249 XP
  - And so on...

- **Auto-level up**: Happens automatically when XP threshold is reached

### Skillcoin Award System
Automatic skillcoin distribution when swaps are completed:

- **Base amount**: 50 skillcoins per participant
- **Bonus multiplier**: Can be adjusted based on swap quality, duration, etc.
- **Duplicate prevention**: `skillcoinsAwarded` flag prevents double-awarding
- **Transaction creation**: Automatic transaction records for both users
- **Notification**: Both users receive completion notifications

### Real-time Notifications
All critical actions trigger real-time updates via Socket.IO:

- **Swap created**: Recipient gets `new_swap_request` event
- **Swap status changed**: Participants get `swap_status_update` event
- **New message**: Participants get `receive_message` event
- **Notification created**: User gets `new_notification` event

### File Uploads (Cloudinary)
The API supports file uploads for:

- **User avatars**: `PUT /api/users/profile` with `multipart/form-data`
- **Post images**: `POST /api/posts` with field name `image`
- **Message attachments**: Image URLs stored in `attachmentUrl`

**Upload limits**:
- Max file size: 5MB
- Supported formats: JPG, PNG, GIF, WebP

### Security Features
- **JWT Authentication**: Access tokens expire in 15 minutes
- **Refresh Tokens**: Valid for 7 days, stored in database
- **Rate Limiting**: Protects against abuse
- **Password Hashing**: bcrypt with salt rounds
- **CORS**: Configurable allowed origins
- **Helmet.js**: Security headers
- **Input Validation**: All inputs sanitized and validated

---

## 📱 MEDIA MESSAGING (WhatsApp-Level Performance)

### Overview
The messaging system supports **all media types** with automatic optimization, compression, and CDN delivery:

- ✅ **Text messages** - Standard messaging
- ✅ **Images** - Auto-compressed to WebP (70% savings)
- ✅ **Voice messages** - Auto-compressed to MP3 32kbps (90% savings)
- ✅ **Video messages** - Auto-compressed to H.264 (60% savings)
- ✅ **File attachments** - PDF, DOC, XLS, TXT, ZIP
- ✅ **System messages** - Notifications and status updates

### Message Object (Updated)
```json
{
  "_id": "string",
  "conversationId": "ObjectId",
  "sender": {
    "_id": "string",
    "firstName": "string",
    "lastName": "string",
    "avatar": "string"
  },
  "content": "string (required)",
  "type": "text | image | voice | video | file | call | system",
  "attachmentUrl": "string (Cloudinary CDN URL)",
  "metadata": {
    "fileName": "string",
    "fileSize": "number (bytes)",
    "mimeType": "string",
    "duration": "number (seconds, for audio/video)",
    "thumbnail": "string (URL for video thumbnails)",
    "width": "number (for images/video)",
    "height": "number (for images/video)"
  },
  "readBy": ["ObjectId"],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Conversation Object
```json
{
  "_id": "string",
  "participants": [{
    "_id": "string",
    "firstName": "string",
    "lastName": "string",
    "avatar": "string"
  }],
  "type": "direct | swap_request | group",
  "contextId": "ObjectId (reference to swap, group, etc.)",
  "lastMessage": "string",
  "lastMessageTime": "Date",
  "unreadCounts": {
    "userId": "number"
  },
  "isGroup": "boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

### 📌 Messaging Endpoints

#### 1. Get Conversations
```http
GET /api/conversations
Authorization: Bearer {token}

Response (200):
[
  {
    "_id": "conv_123",
    "participants": [
      {
        "_id": "user_1",
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "https://..."
      }
    ],
    "type": "swap_request",
    "lastMessage": "🎤 Voice message",
    "lastMessageTime": "2025-12-20T10:30:00Z",
    "unreadCounts": {
      "user_1": 3
    }
  }
]
```

---

#### 2. Get Messages for Conversation
```http
GET /api/conversations/:conversationId/messages
Authorization: Bearer {token}

Response (200):
[
  {
    "_id": "msg_123",
    "conversationId": "conv_123",
    "sender": {
      "_id": "user_1",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://..."
    },
    "content": "Hello!",
    "type": "text",
    "readBy": ["user_1"],
    "createdAt": "2025-12-20T10:25:00Z"
  },
  {
    "_id": "msg_124",
    "sender": {...},
    "content": "🎤 Voice message",
    "type": "voice",
    "attachmentUrl": "https://res.cloudinary.com/.../voice.mp3",
    "metadata": {
      "fileName": "recording.mp3",
      "fileSize": 125000,
      "mimeType": "audio/mpeg",
      "duration": 15
    },
    "createdAt": "2025-12-20T10:30:00Z"
  }
]
```

---

#### 3. Send Text Message
```http
POST /api/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "conversationId": "conv_123",
  "content": "Hello, how are you?",
  "type": "text"
}

Response (201):
{
  "_id": "msg_125",
  "conversationId": "conv_123",
  "sender": {
    "_id": "user_1",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://..."
  },
  "content": "Hello, how are you?",
  "type": "text",
  "readBy": ["user_1"],
  "createdAt": "2025-12-20T10:35:00Z",
  "updatedAt": "2025-12-20T10:35:00Z"
}
```

---

#### 4. Send Image Message ⭐
```http
POST /api/messages
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
  conversationId: "conv_123"
  type: "image"
  attachment: [File: image.jpg]
  content: "Check this out!" (optional caption)

Response (201):
{
  "_id": "msg_126",
  "conversationId": "conv_123",
  "sender": {...},
  "content": "📷 Image",
  "type": "image",
  "attachmentUrl": "https://res.cloudinary.com/skillswap/images/optimized.webp",
  "metadata": {
    "fileName": "photo.jpg",
    "fileSize": 245000,
    "mimeType": "image/jpeg",
    "width": 1200,
    "height": 800
  },
  "readBy": ["user_1"],
  "createdAt": "2025-12-20T10:40:00Z"
}

Automatic Optimizations:
✅ Converted to WebP format
✅ Quality: 80% (auto:good)
✅ Max dimensions: 1200x1200px
✅ Progressive loading enabled
✅ 300x300 thumbnail generated
✅ File size reduced by ~70%
✅ CDN delivery enabled
```

---

#### 5. Send Voice Message ⭐
```http
POST /api/messages
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
  conversationId: "conv_123"
  type: "voice"
  attachment: [File: recording.m4a]

Response (201):
{
  "_id": "msg_127",
  "conversationId": "conv_123",
  "sender": {...},
  "content": "🎤 Voice message",
  "type": "voice",
  "attachmentUrl": "https://res.cloudinary.com/skillswap/voice/compressed.mp3",
  "metadata": {
    "fileName": "recording.m4a",
    "fileSize": 520000,
    "mimeType": "audio/mp4",
    "duration": 45
  },
  "readBy": ["user_1"],
  "createdAt": "2025-12-20T10:45:00Z"
}

Automatic Optimizations:
✅ Converted to MP3 format
✅ Bitrate: 32kbps (WhatsApp standard)
✅ File size reduced by ~90%
✅ Streaming enabled
✅ CDN delivery
```

---

#### 6. Send Video Message ⭐
```http
POST /api/messages
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
  conversationId: "conv_123"
  type: "video"
  attachment: [File: clip.mp4]

Response (201):
{
  "_id": "msg_128",
  "conversationId": "conv_123",
  "sender": {...},
  "content": "🎥 Video",
  "type": "video",
  "attachmentUrl": "https://res.cloudinary.com/skillswap/videos/compressed.mp4",
  "metadata": {
    "fileName": "clip.mp4",
    "fileSize": 5200000,
    "mimeType": "video/mp4",
    "duration": 30,
    "thumbnail": "https://res.cloudinary.com/.../thumb.jpg",
    "width": 640,
    "height": 480
  },
  "readBy": ["user_1"],
  "createdAt": "2025-12-20T10:50:00Z"
}

Automatic Optimizations:
✅ Converted to H.264 + AAC
✅ Max dimensions: 640x640px
✅ Bitrate: 500kbps
✅ Thumbnail auto-generated
✅ File size reduced by ~60%
✅ Adaptive streaming enabled
```

---

#### 7. Send File Attachment ⭐
```http
POST /api/messages
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
  conversationId: "conv_123"
  type: "file"
  attachment: [File: document.pdf]

Response (201):
{
  "_id": "msg_129",
  "conversationId": "conv_123",
  "sender": {...},
  "content": "📎 document.pdf",
  "type": "file",
  "attachmentUrl": "https://res.cloudinary.com/skillswap/files/document.pdf",
  "metadata": {
    "fileName": "document.pdf",
    "fileSize": 850000,
    "mimeType": "application/pdf"
  },
  "readBy": ["user_1"],
  "createdAt": "2025-12-20T10:55:00Z"
}

Note: Documents stored without compression
```

---

#### 8. Mark Message as Read
```http
PUT /api/messages/:messageId/read
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": {
    "_id": "msg_123",
    "readBy": ["user_1", "user_2"],
    ...
  }
}
```

---

### 📊 Media Specifications

#### Image Upload
```
Accepted formats: .jpg, .jpeg, .png, .gif, .webp
Max file size: 10 MB
Output format: WebP (automatic conversion)
Max dimensions: 1200x1200px (maintains aspect ratio)
Quality: 80% (auto:good)
Compression: ~70% file size reduction
Thumbnail: 300x300px (auto-generated)
Loading: Progressive
CDN: Global Cloudinary
```

#### Voice Upload
```
Accepted formats: .mp3, .m4a, .ogg, .wav, .webm
Max file size: 10 MB
Output format: MP3 (automatic conversion)
Bitrate: 32kbps (WhatsApp standard)
Codec: MP3
Compression: ~90% file size reduction
Streaming: Enabled
CDN: Global Cloudinary
```

#### Video Upload
```
Accepted formats: .mp4, .mov, .avi, .webm
Max file size: 10 MB
Output format: MP4 (automatic conversion)
Codec: H.264 + AAC
Max dimensions: 640x640px (maintains aspect ratio)
Bitrate: 500kbps
Compression: ~60% file size reduction
Thumbnail: Auto-generated from first frame
Streaming: Adaptive enabled
CDN: Global Cloudinary
```

#### File Upload
```
Accepted formats: .pdf, .doc, .docx, .xls, .xlsx, .txt, .zip
Max file size: 10 MB
Storage: Raw (no compression)
CDN: Global Cloudinary
```

---

### 🚀 Performance Optimizations

#### Streaming Upload
- **Zero disk storage** - Files stream directly from RAM to Cloudinary
- **Low memory** - 10MB buffer limit
- **No lag** - Instant upload start
- **Concurrent** - Non-blocking operations

#### Automatic Compression
```javascript
// Images
Original: 2.5 MB (JPG)
  ↓ Auto-convert to WebP
  ↓ Quality: 80%
  ↓ Progressive encoding
Result: 350 KB (~86% savings)

// Voice
Original: 1.2 MB (M4A)
  ↓ Auto-convert to MP3
  ↓ Bitrate: 32kbps
  ↓ Mono channel
Result: 120 KB (~90% savings)

// Video
Original: 15 MB (MOV)
  ↓ Auto-convert to H.264
  ↓ Resize to 640px max
  ↓ Bitrate: 500kbps
Result: 6 MB (~60% savings)
```

#### CDN Delivery
- **Global edge network** - Cloudinary CDN
- **Auto format selection** - Best format for user's browser
- **Responsive images** - Multiple sizes generated
- **Fast delivery** - Cached worldwide
- **HTTPS** - Secure connections

---

### 🔒 Security & Validation

#### File Type Validation
```
✅ MIME type checking
✅ File extension validation
✅ Magic number verification
✅ Malware scanning (Cloudinary)
```

#### Size Limits
```
✅ Per-file limit: 10 MB
✅ Concurrent limit: 1 file at a time
✅ Memory buffer: 10 MB max
✅ Reject oversized files
```

#### Authentication
```
✅ JWT required for all uploads
✅ User must be conversation participant
✅ Rate limiting applied
✅ Cloudinary signed uploads
```

---

### 📱 Real-Time Delivery

All messages are delivered instantly via Socket.IO:

```javascript
// Client receives
socket.on('receive_message', (message) => {
  // Message object with all metadata
  console.log(message);
  /*
  {
    "_id": "msg_123",
    "type": "voice",
    "attachmentUrl": "https://...",
    "metadata": {
      "duration": 45,
      "fileSize": 125000
    },
    ...
  }
  */
});
```

---

### 💡 Frontend Integration Example

```javascript
// Send voice message
const sendVoiceMessage = async (conversationId, audioBlob) => {
  const formData = new FormData();
  formData.append('conversationId', conversationId);
  formData.append('type', 'voice');
  formData.append('attachment', audioBlob, 'voice.mp3');
  
  const response = await fetch('/api/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  const message = await response.json();
  // message.attachmentUrl = Optimized MP3 URL
  // message.metadata.duration = Audio duration in seconds
  
  return message;
};

// Send image with caption
const sendImage = async (conversationId, imageFile, caption) => {
  const formData = new FormData();
  formData.append('conversationId', conversationId);
  formData.append('type', 'image');
  formData.append('attachment', imageFile);
  formData.append('content', caption);
  
  const response = await fetch('/api/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  const message = await response.json();
  // message.attachmentUrl = Optimized WebP URL
  // message.metadata.width/height = Image dimensions
  
  return message;
};

// Display media message
const renderMessage = (message) => {
  switch(message.type) {
    case 'image':
      return (
        <div>
          <img src={message.attachmentUrl} alt={message.content} />
          <span>{message.metadata.width}x{message.metadata.height}</span>
        </div>
      );
      
    case 'voice':
      return (
        <div>
          <audio src={message.attachmentUrl} controls />
          <span>Duration: {message.metadata.duration}s</span>
        </div>
      );
      
    case 'video':
      return (
        <div>
          <video 
            src={message.attachmentUrl} 
            poster={message.metadata.thumbnail}
            controls 
          />
        </div>
      );
      
    case 'file':
      return (
        <a href={message.attachmentUrl} download>
          📎 {message.metadata.fileName}
          <span>({(message.metadata.fileSize / 1024).toFixed(0)} KB)</span>
        </a>
      );
      
    default:
      return <p>{message.content}</p>;
  }
};
```

---

### 📊 Compression Statistics

```
Image Compression:
- Format: WebP (Google standard)
- Quality: 80% (auto:good)
- Average savings: 70% file size
- Loading: Progressive (like WhatsApp)

Voice Compression:
- Codec: MP3
- Bitrate: 32kbps (WhatsApp uses 16-32kbps)
- Average savings: 90% file size
- Streaming: Yes

Video Compression:
- Codec: H.264 + AAC
- Quality: Auto-good
- Average savings: 60% file size
- Streaming: Adaptive (like YouTube)
```

---

### ⚠️ Error Handling

```javascript
// Invalid file type
{
  "success": false,
  "message": "Invalid file type for image. Allowed: image/jpeg, image/png"
}

// File too large
{
  "success": false,
  "message": "File size exceeds 10MB limit"
}

// Upload failed
{
  "success": false,
  "message": "File upload failed. Please try again."
}

// Unauthorized
{
  "success": false,
  "message": "Not authorized to send messages in this conversation"
}
```

---

### 🎯 Best Practices

**For Images:**
- Use `.jpg` for photos, `.png` for graphics
- Backend automatically converts to WebP
- No need to resize (auto-optimized to 1200px max)
- Caption is optional

**For Voice:**
- Record in any format (.m4a, .mp3, .ogg)
- Backend compresses to 32kbps MP3
- Keep recordings under 2 minutes
- File size will be ~250KB per minute after compression

**For Video:**
- Use `.mp4` for best compatibility
- Backend compresses and generates thumbnail
- Keep videos under 2 minutes
- Resolution auto-adjusted to 640px max

**For Files:**
- Use for documents only (.pdf, .doc, .xls)
- No compression applied
- Max 10MB size
- Include descriptive filenames

---

## �📚 ADDITIONAL RESOURCES

- **README.md** - Quick start guide
- **REFRESH_TOKEN_SYSTEM.md** - Detailed auth documentation
- **Source Code** - `/src` directory

---

## 🔧 SUPPORT

For issues or questions:
1. Check this documentation
2. Review the source code
3. Contact the development team

---

**Last Updated**: 2025-12-20  
**API Version**: 4.0.0 (WhatsApp-Level Media Messaging)  
**Documentation Version**: 3.0 (Complete Edition with Media Messaging, Data Models, Optimization Details)

