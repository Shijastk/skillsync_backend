# 📚 BLACK & WHITE SKILLSWAP - COMPLETE API DOCUMENTATION

**Version**: 3.5.0 (Enterprise Edition)  
**Base URL**: `http://localhost:5000/api`  
**Total Endpoints**: 50  
**Authentication**: JWT (Bearer Token) + Refresh Token  

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
    { "name": "React", "level": "Advanced" }
  ],
  "skillsToLearn": [
    { "name": "Node.js", "level": "Intermediate" }
  ]
}

Response (200):
{
  "success": true,
  "user": { ... }
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

{
  "recipientId": "user_id_here",
  "skillOffered": "JavaScript",
  "skillRequested": "Python",
  "description": "I can teach modern JS, want to learn Python basics",
  "preferences": {
    "videoCalls": true,
    "screenSharing": true,
    "projectBased": false
  }
}

Response (201):
{
  "success": true,
  "swap": { ... }
}
```

#### 3. Update Swap (Accept/Schedule)
```http
PUT /api/swaps/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "accepted",
  "scheduledDate": "2024-12-15T14:00:00Z",
  "duration": "1 hour"
}

Response (200):
{
  "success": true,
  "swap": { ... }
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
  "message": "Joined group successfully"
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
GET /api/posts?page=1&limit=20&sortBy=timestamp&sortOrder=desc
Authorization: Bearer {token} (optional)

Response (200):
{
  "data": [
    {
      "id": "...",
      "author": { "id": "...", "name": "John Doe", "avatar": "..." },
      "content": "Just completed my first swap!",
      "likes": ["user_id1", "user_id2"],
      "comments": [
        {
          "author": { ... },
          "content": "Congrats!",
          "timestamp": "..."
        }
      ],
      "timestamp": "2024-12-13T..."
    }
  ],
  "pagination": { ... }
}
```

#### 2. Create Post
```http
POST /api/posts
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Just learned React! Amazing framework.",
  "groupId": "optional_group_id"
}

Response (201):
{
  "success": true,
  "post": { ... }
}
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

{
  "content": "Great post! Very helpful."
}

Response (201):
{
  "success": true,
  "comment": { ... }
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
GET /api/notifications?page=1&limit=20&isRead=false
Authorization: Bearer {token}

Response (200):
{
  "data": [
    {
      "id": "...",
      "type": "swap_request",
      "title": "New Swap Request",
      "message": "Sarah wants to swap Python for JavaScript",
      "isRead": false,
      "data": { "swapId": "..." },
      "createdAt": "2024-12-13T..."
    }
  ],
  "pagination": { ... }
}
```

#### 2. Mark as Read
```http
PUT /api/notifications/:id/read
Authorization: Bearer {token}

Response (200):
{
  "success": true
}
```

#### 3. Mark All as Read
```http
PUT /api/notifications/read-all
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "count": 5
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
  // message: { id, sender, content, timestamp, ... }
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
socket.on('notification', (notification) => {
  // notification: { type, title, message, ... }
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

## ⚠️ ERROR RESPONSES

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

## 📚 ADDITIONAL RESOURCES

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

**Last Updated**: 2024-12-13  
**API Version**: 3.5.0  
**Documentation Version**: 1.0
