# 🧪 POSTMAN SAMPLE DATA - Complete Testing Guide

**Base URL**: `http://localhost:5000/api`  
**Date**: 2024-12-18

---

## 📋 TABLE OF CONTENTS

1. [Users (12 samples)](#1-users)
2. [Skills to Teach (15 samples)](#2-skills-to-teach)
3. [Skills to Learn (15 samples)](#3-skills-to-learn)
4. [Swaps (10 samples)](#4-swaps)
5. [Posts (12 samples)](#5-posts)
6. [Comments (15 samples)](#6-comments)
7. [Groups (10 samples)](#7-groups)
8. [Messages (10 samples)](#8-messages)
9. [Notifications (Auto-generated)](#9-notifications)
10. [Transactions (Auto-generated)](#10-transactions)

---

## 1. USERS (12 Samples)

### Register Users - POST `/api/auth/register`

```json
// User 1 - John (Frontend Developer)
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@skillswap.com",
  "password": "password123"
}

// User 2 - Sarah (UI/UX Designer)
{
  "firstName": "Sarah",
  "lastName": "Smith",
  "email": "sarah.smith@skillswap.com",
  "password": "password123"
}

// User 3 - Mike (Backend Developer)
{
  "firstName": "Mike",
  "lastName": "Johnson",
  "email": "mike.johnson@skillswap.com",
  "password": "password123"
}

// User 4 - Emily (Data Scientist)
{
  "firstName": "Emily",
  "lastName": "Brown",
  "email": "emily.brown@skillswap.com",
  "password": "password123"
}

// User 5 - David (Mobile Developer)
{
  "firstName": "David",
  "lastName": "Wilson",
  "email": "david.wilson@skillswap.com",
  "password": "password123"
}

// User 6 - Lisa (Marketing Expert)
{
  "firstName": "Lisa",
  "lastName": "Garcia",
  "email": "lisa.garcia@skillswap.com",
  "password": "password123"
}

// User 7 - Tom (DevOps Engineer)
{
  "firstName": "Tom",
  "lastName": "Martinez",
  "email": "tom.martinez@skillswap.com",
  "password": "password123"
}

// User 8 - Anna (Content Writer)
{
  "firstName": "Anna",
  "lastName": "Lee",
  "email": "anna.lee@skillswap.com",
  "password": "password123"
}

// User 9 - Chris (Product Manager)
{
  "firstName": "Chris",
  "lastName": "Taylor",
  "email": "chris.taylor@skillswap.com",
  "password": "password123"
}

// User 10 - Rachel (Graphic Designer)
{
  "firstName": "Rachel",
  "lastName": "Anderson",
  "email": "rachel.anderson@skillswap.com",
  "password": "password123"
}

// User 11 - James (Video Editor)
{
  "firstName": "James",
  "lastName": "Thomas",
  "email": "james.thomas@skillswap.com",
  "password": "password123"
}

// User 12 - Sophia (Business Analyst)
{
  "firstName": "Sophia",
  "lastName": "Moore",
  "email": "sophia.moore@skillswap.com",
  "password": "password123"
}
```

---

## 2. SKILLS TO TEACH (15 Samples)

### Add Skills - POST `/api/users/skills/teach`

```json
// Skill 1 - JavaScript (John)
{
  "title": "Modern JavaScript (ES6+)",
  "description": "Teaching modern JavaScript including async/await, promises, arrow functions, and ES6+ features",
  "category": "Programming",
  "experienceLevel": "advanced",
  "proficiency": "expert",
  "yearsExperience": "5-10",
  "tools": ["ES6", "TypeScript", "Webpack", "Babel"],
  "tags": ["javascript", "frontend", "es6"],
  "availability": "weekday-evenings",
  "preferredMethod": "video-calls",
  "notes": "I can help with React and Node.js as well"
}

// Skill 2 - React (John)
{
  "title": "React Development",
  "description": "Building modern web applications with React, hooks, and state management",
  "category": "Frontend",
  "experienceLevel": "advanced",
  "proficiency": "expert",
  "yearsExperience": "3-5",
  "tools": ["React", "Redux", "React Query", "Next.js"],
  "tags": ["react", "frontend", "hooks"],
  "availability": "weekends",
  "preferredMethod": "one-on-one"
}

// Skill 3 - UI/UX Design (Sarah)
{
  "title": "UI/UX Design Fundamentals",
  "description": "User interface design, user experience principles, and design thinking",
  "category": "Design",
  "experienceLevel": "advanced",
  "proficiency": "expert",
  "yearsExperience": "5-10",
  "tools": ["Figma", "Adobe XD", "Sketch", "InVision"],
  "tags": ["design", "ux", "ui"],
  "availability": "weekday-mornings",
  "preferredMethod": "project-based"
}

// Skill 4 - Node.js (Mike)
{
  "title": "Backend Development with Node.js",
  "description": "Building RESTful APIs, microservices, and server-side applications",
  "category": "Backend",
  "experienceLevel": "advanced",
  "proficiency": "expert",
  "yearsExperience": "5-10",
  "tools": ["Express", "NestJS", "MongoDB", "PostgreSQL"],
  "tags": ["nodejs", "backend", "api"],
  "availability": "weekday-evenings",
  "preferredMethod": "video-calls"
}

// Skill 5 - Python (Emily)
{
  "title": "Python for Data Science",
  "description": "Data analysis, machine learning, and scientific computing with Python",
  "category": "Data Science",
  "experienceLevel": "advanced",
  "proficiency": "expert",
  "yearsExperience": "3-5",
  "tools": ["Pandas", "NumPy", "Scikit-learn", "TensorFlow"],
  "tags": ["python", "data-science", "ml"],
  "availability": "weekends",
  "preferredMethod": "project-based"
}

// Skill 6 - React Native (David)
{
  "title": "Mobile App Development",
  "description": "Building cross-platform mobile apps with React Native",
  "category": "Mobile",
  "experienceLevel": "intermediate",
  "proficiency": "advanced",
  "yearsExperience": "3-5",
  "tools": ["React Native", "Expo", "Firebase"],
  "tags": ["mobile", "react-native", "ios", "android"],
  "availability": "weekday-evenings",
  "preferredMethod": "one-on-one"
}

// Skill 7 - Digital Marketing (Lisa)
{
  "title": "Digital Marketing Strategy",
  "description": "SEO, social media marketing, and content strategy",
  "category": "Marketing",
  "experienceLevel": "advanced",
  "proficiency": "expert",
  "yearsExperience": "5-10",
  "tools": ["Google Analytics", "SEMrush", "HubSpot"],
  "tags": ["marketing", "seo", "social-media"],
  "availability": "weekday-mornings",
  "preferredMethod": "video-calls"
}

// Skill 8 - Docker (Tom)
{
  "title": "Docker & Containerization",
  "description": "Container orchestration, Docker compose, and deployment strategies",
  "category": "DevOps",
  "experienceLevel": "advanced",
  "proficiency": "expert",
  "yearsExperience": "3-5",
  "tools": ["Docker", "Kubernetes", "Docker Compose"],
  "tags": ["devops", "docker", "containers"],
  "availability": "weekends",
  "preferredMethod": "hands-on"
}

// Skill 9 - Content Writing (Anna)
{
  "title": "Technical Content Writing",
  "description": "Writing documentation, blog posts, and technical articles",
  "category": "Writing",
  "experienceLevel": "intermediate",
  "proficiency": "advanced",
  "yearsExperience": "3-5",
  "tools": ["Markdown", "WordPress", "Grammarly"],
  "tags": ["writing", "content", "documentation"],
  "availability": "weekday-evenings",
  "preferredMethod": "one-on-one"
}

// Skill 10 - Product Management (Chris)
{
  "title": "Agile Product Management",
  "description": "Product roadmap planning, user stories, and agile methodologies",
  "category": "Management",
  "experienceLevel": "advanced",
  "proficiency": "expert",
  "yearsExperience": "5-10",
  "tools": ["Jira", "Confluence", "Trello"],
  "tags": ["product-management", "agile", "scrum"],
  "availability": "weekday-mornings",
  "preferredMethod": "video-calls"
}

// Skill 11 - Graphic Design (Rachel)
{
  "title": "Graphic Design Essentials",
  "description": "Logo design, branding, and visual identity creation",
  "category": "Design",
  "experienceLevel": "intermediate",
  "proficiency": "advanced",
  "yearsExperience": "3-5",
  "tools": ["Adobe Illustrator", "Photoshop", "Canva"],
  "tags": ["design", "graphics", "branding"],
  "availability": "weekends",
  "preferredMethod": "project-based"
}

// Skill 12 - Video Editing (James)
{
  "title": "Professional Video Editing",
  "description": "Video editing, color grading, and post-production",
  "category": "Media",
  "experienceLevel": "advanced",
  "proficiency": "expert",
  "yearsExperience": "5-10",
  "tools": ["Adobe Premiere", "After Effects", "DaVinci Resolve"],
  "tags": ["video", "editing", "media"],
  "availability": "weekday-evenings",
  "preferredMethod": "hands-on"
}

// Skill 13 - SQL & Databases (Sophia)
{
  "title": "Database Design & SQL",
  "description": "Database architecture, SQL queries, and optimization",
  "category": "Database",
  "experienceLevel": "intermediate",
  "proficiency": "advanced",
  "yearsExperience": "3-5",
  "tools": ["MySQL", "PostgreSQL", "MongoDB"],
  "tags": ["database", "sql", "data"],
  "availability": "weekday-mornings",
  "preferredMethod": "video-calls"
}

// Skill 14 - AWS Cloud (Tom)
{
  "title": "AWS Cloud Services",
  "description": "Cloud architecture, EC2, S3, Lambda, and serverless",
  "category": "Cloud",
  "experienceLevel": "intermediate",
  "proficiency": "advanced",
  "yearsExperience": "1-3",
  "tools": ["AWS", "EC2", "S3", "Lambda"],
  "tags": ["cloud", "aws", "serverless"],
  "availability": "weekends",
  "preferredMethod": "hands-on"
}

// Skill 15 - Git & Version Control (Mike)
{
  "title": "Git & GitHub Workflow",
  "description": "Version control, branching strategies, and collaboration",
  "category": "Tools",
  "experienceLevel": "intermediate",
  "proficiency": "advanced",
  "yearsExperience": "5-10",
  "tools": ["Git", "GitHub", "GitLab"],
  "tags": ["git", "version-control", "github"],
  "availability": "weekday-evenings",
  "preferredMethod": "one-on-one"
}
```

---

## 3. SKILLS TO LEARN (15 Samples)

### Add Learning Goals - POST `/api/users/skills/learn`

```json
// Learning Goal 1 - Python (John wants to learn)
{
  "title": "Python Programming",
  "description": "Want to learn Python for backend development and automation",
  "category": "Programming",
  "experienceLevel": "beginner",
  "targetDate": "2025-06-01",
  "currentProgress": 10,
  "resources": ["Python Crash Course Book", "Real Python Tutorials"],
  "tags": ["python", "backend", "automation"],
  "availability": "weekends",
  "preferredMethod": "project-based",
  "notes": "Interested in Django framework"
}

// Learning Goal 2 - Machine Learning (Sarah wants to learn)
{
  "title": "Machine Learning Basics",
  "description": "Understanding ML algorithms and practical applications",
  "category": "Data Science",
  "experienceLevel": "beginner",
  "targetDate": "2025-08-01",
  "currentProgress": 0,
  "resources": ["Coursera ML Course", "Hands-On ML Book"],
  "tags": ["ml", "ai", "data-science"],
  "availability": "weekday-evenings",
  "preferredMethod": "one-on-one"
}

// Learning Goal 3 - Backend Development (Sarah wants to learn)
{
  "title": "Node.js Backend",
  "description": "Building RESTful APIs and server-side applications",
  "category": "Backend",
  "experienceLevel": "beginner",
  "targetDate": "2025-05-01",
  "currentProgress": 15,
  "resources": ["Node.js Course", "Express Documentation"],
  "tags": ["nodejs", "backend", "api"],
  "availability": "weekends",
  "preferredMethod": "video-calls"
}

// Learning Goal 4 - UI/UX Design (Mike wants to learn)
{
  "title": "UI/UX Design Principles",
  "description": "User interface design and user experience fundamentals",
  "category": "Design",
  "experienceLevel": "beginner",
  "targetDate": "2025-07-01",
  "currentProgress": 5,
  "resources": ["Design of Everyday Things", "Figma Tutorials"],
  "tags": ["design", "ui", "ux"],
  "availability": "weekday-mornings",
  "preferredMethod": "project-based"
}

// Learning Goal 5 - React (Emily wants to learn)
{
  "title": "React Framework",
  "description": "Modern frontend development with React",
  "category": "Frontend",
  "experienceLevel": "intermediate",
  "targetDate": "2025-04-01",
  "currentProgress": 30,
  "resources": ["React Docs", "Scrimba React Course"],
  "tags": ["react", "frontend", "javascript"],
  "availability": "weekday-evenings",
  "preferredMethod": "hands-on"
}

// Learning Goal 6 - Data Science (David wants to learn)
{
  "title": "Data Analysis with Python",
  "description": "Data manipulation, visualization, and analysis",
  "category": "Data Science",
  "experienceLevel": "beginner",
  "targetDate": "2025-09-01",
  "currentProgress": 0,
  "resources": ["Pandas Documentation", "DataCamp"],
  "tags": ["python", "data", "analysis"],
  "availability": "weekends",
  "preferredMethod": "project-based"
}

// Learning Goal 7 - SEO (David wants to learn)
{
  "title": "Search Engine Optimization",
  "description": "SEO techniques and digital marketing",
  "category": "Marketing",
  "experienceLevel": "beginner",
  "targetDate": "2025-05-15",
  "currentProgress": 20,
  "resources": ["Moz SEO Guide", "Google SEO Starter"],
  "tags": ["seo", "marketing", "google"],
  "availability": "weekday-evenings",
  "preferredMethod": "video-calls"
}

// Learning Goal 8 - DevOps (Emily wants to learn)
{
  "title": "DevOps Practices",
  "description": "CI/CD, Docker, and cloud deployment",
  "category": "DevOps",
  "experienceLevel": "beginner",
  "targetDate": "2025-10-01",
  "currentProgress": 0,
  "resources": ["Docker Documentation", "DevOps Handbook"],
  "tags": ["devops", "docker", "cicd"],
  "availability": "weekends",
  "preferredMethod": "hands-on"
}

// Learning Goal 9 - Public Speaking (Tom wants to learn)
{
  "title": "Public Speaking & Presentations",
  "description": "Effective presentation and communication skills",
  "category": "Soft Skills",
  "experienceLevel": "beginner",
  "targetDate": "2025-03-01",
  "currentProgress": 10,
  "resources": ["Toastmasters", "TED Talk Videos"],
  "tags": ["speaking", "communication", "presentation"],
  "availability": "weekday-mornings",
  "preferredMethod": "one-on-one"
}

// Learning Goal 10 - Graphic Design (Anna wants to learn)
{
  "title": "Adobe Illustrator",
  "description": "Vector graphics and logo design",
  "category": "Design",
  "experienceLevel": "beginner",
  "targetDate": "2025-06-15",
  "currentProgress": 5,
  "resources": ["Adobe Tutorials", "Skillshare"],
  "tags": ["design", "illustrator", "graphics"],
  "availability": "weekday-evenings",
  "preferredMethod": "project-based"
}

// Learning Goal 11 - TypeScript (Chris wants to learn)
{
  "title": "TypeScript",
  "description": "Type-safe JavaScript development",
  "category": "Programming",
  "experienceLevel": "intermediate",
  "targetDate": "2025-04-15",
  "currentProgress": 40,
  "resources": ["TypeScript Handbook", "TypeScript Course"],
  "tags": ["typescript", "javascript", "types"],
  "availability": "weekends",
  "preferredMethod": "video-calls"
}

// Learning Goal 12 - Mobile Development (Lisa wants to learn)
{
  "title": "React Native",
  "description": "Cross-platform mobile app development",
  "category": "Mobile",
  "experienceLevel": "beginner",
  "targetDate": "2025-07-15",
  "currentProgress": 0,
  "resources": ["React Native Docs", "Expo Documentation"],
  "tags": ["mobile", "react-native", "app"],
  "availability": "weekday-evenings",
  "preferredMethod": "hands-on"
}

// Learning Goal 13 - Content Strategy (Rachel wants to learn)
{
  "title": "Content Marketing Strategy",
  "description": "Content planning, creation, and distribution",
  "category": "Marketing",
  "experienceLevel": "beginner",
  "targetDate": "2025-05-30",
  "currentProgress": 15,
  "resources": ["Content Marketing Institute", "HubSpot Academy"],
  "tags": ["content", "marketing", "strategy"],
  "availability": "weekday-mornings",
  "preferredMethod": "video-calls"
}

// Learning Goal 14 - Agile/Scrum (James wants to learn)
{
  "title": "Agile & Scrum Methodologies",
  "description": "Agile project management and Scrum framework",
  "category": "Management",
  "experienceLevel": "beginner",
  "targetDate": "2025-04-01",
  "currentProgress": 25,
  "resources": ["Scrum Guide", "Agile Manifesto"],
  "tags": ["agile", "scrum", "project-management"],
  "availability": "weekends",
  "preferredMethod": "one-on-one"
}

// Learning Goal 15 - Blockchain (Sophia wants to learn)
{
  "title": "Blockchain Technology",
  "description": "Understanding blockchain, smart contracts, and Web3",
  "category": "Technology",
  "experienceLevel": "beginner",
  "targetDate": "2025-12-01",
  "currentProgress": 0,
  "resources": ["Blockchain Basics", "Ethereum Documentation"],
  "tags": ["blockchain", "web3", "crypto"],
  "availability": "weekday-evenings",
  "preferredMethod": "project-based"
}
```

---

## 4. SWAPS (10 Samples)

### Create Swaps - POST `/api/swaps`

**Note**: Replace `recipientId` with actual user IDs from registration responses.

```json
// Swap 1 - John teaches JavaScript to Sarah
{
  "recipientId": "SARAH_USER_ID",
  "skillOffered": "Modern JavaScript (ES6+)",
  "skillRequested": "UI/UX Design Fundamentals",
  "message": "Hi Sarah! I'd love to learn UI/UX from you. I can teach you modern JavaScript in return!",
  "availability": "weekday-evenings",
  "duration": "1 hour",
  "preferences": {
    "videoCalls": true,
    "screenSharing": true,
    "projectBased": false
  }
}

// Swap 2 - Mike teaches Node.js to Emily
{
  "recipientId": "EMILY_USER_ID",
  "skillOffered": "Backend Development with Node.js",
  "skillRequested": "Python for Data Science",
  "message": "Hey Emily! I need help with Python for data analysis. Can teach you Node.js!",
  "availability": "weekends",
  "duration": "2 hours",
  "preferences": {
    "videoCalls": true,
    "screenSharing": true,
    "projectBased": true
  }
}

// Swap 3 - David teaches React Native to Lisa
{
  "recipientId": "LISA_USER_ID",
  "skillOffered": "Mobile App Development",
  "skillRequested": "Digital Marketing Strategy",
  "message": "Hi Lisa! Want to learn mobile development? I need help with digital marketing!",
  "availability": "weekday-evenings",
  "duration": "1.5 hours",
  "preferences": {
    "videoCalls": true,
    "screenSharing": false,
    "projectBased": true
  }
}

// Swap 4 - Tom teaches Docker to Chris
{
  "recipientId": "CHRIS_USER_ID",
  "skillOffered": "Docker & Containerization",
  "skillRequested": "Agile Product Management",
  "message": "Hey Chris! I'd love to learn product management from you. Docker in exchange?",
  "availability": "weekends",
  "duration": "2 hours",
  "preferences": {
    "videoCalls": true,
    "screenSharing": true,
    "projectBased": true
  }
}

// Swap 5 - Anna teaches Content Writing to Rachel
{
  "recipientId": "RACHEL_USER_ID",
  "skillOffered": "Technical Content Writing",
  "skillRequested": "Graphic Design Essentials",
  "message": "Hi Rachel! Need a content writer? I'd love to learn graphic design!",
  "availability": "weekday-mornings",
  "duration": "1 hour",
  "preferences": {
    "videoCalls": true,
    "screenSharing": false,
    "projectBased": true
  }
}

// Swap 6 - James teaches Video Editing to Sophia
{
  "recipientId": "SOPHIA_USER_ID",
  "skillOffered": "Professional Video Editing",
  "skillRequested": "Database Design & SQL",
  "message": "Hey Sophia! Want to learn video editing? I need SQL expertise!",
  "availability": "weekday-evenings",
  "duration": "2 hours",
  "preferences": {
    "videoCalls": true,
    "screenSharing": true,
    "projectBased": false
  }
}

// Swap 7 - Sarah teaches UI/UX to Mike
{
  "recipientId": "MIKE_USER_ID",
  "skillOffered": "UI/UX Design Fundamentals",
  "skillRequested": "Git & GitHub Workflow",
  "message": "Hi Mike! I can teach you design principles. Need help with Git!",
  "availability": "weekday-mornings",
  "duration": "1 hour",
  "preferences": {
    "videoCalls": true,
    "screenSharing": true,
    "projectBased": false
  }
}

// Swap 8 - Emily teaches Python to John
{
  "recipientId": "JOHN_USER_ID",
  "skillOffered": "Python for Data Science",
  "skillRequested": "React Development",
  "message": "Hey John! I can help with Python. Need React expertise!",
  "availability": "weekends",
  "duration": "1.5 hours",
  "preferences": {
    "videoCalls": true,
    "screenSharing": true,
    "projectBased": true
  }
}

// Swap 9 - Lisa teaches Marketing to David
{
  "recipientId": "DAVID_USER_ID",
  "skillOffered": "Digital Marketing Strategy",
  "skillRequested": "React Native",
  "message": "Hi David! Marketing for mobile dev? Sounds like a great swap!",
  "availability": "weekday-evenings",
  "duration": "1 hour",
  "preferences": {
    "videoCalls": true,
    "screenSharing": false,
    "projectBased": false
  }
}

// Swap 10 - Tom teaches AWS to Anna
{
  "recipientId": "ANNA_USER_ID",
  "skillOffered": "AWS Cloud Services",
  "skillRequested": "Technical Content Writing",
  "message": "Hey Anna! Want to learn AWS? I need content writing skills!",
  "availability": "weekends",
  "duration": "2 hours",
  "preferences": {
    "videoCalls": true,
    "screenSharing": true,
    "projectBased": true
  }
}
```

---

## 5. POSTS (12 Samples)

### Create Posts - POST `/api/posts`

```json
// Post 1 - John
{
  "content": "Just completed my first skill swap! Taught JavaScript to Sarah and learned amazing UI/UX principles. This platform is incredible! 🚀"
}

// Post 2 - Sarah
{
  "content": "Loving the SkillSwap community! John is an amazing teacher. Can't wait to apply these JavaScript skills to my next project! 💻"
}

// Post 3 - Mike
{
  "content": "Pro tip: Always practice what you learn immediately. Just applied the Python data analysis techniques Emily taught me on a real dataset! 📊"
}

// Post 4 - Emily
{
  "content": "Shoutout to Mike for the awesome Node.js session! Built my first REST API today. Feeling accomplished! 🎉"
}

// Post 5 - David
{
  "content": "Mobile development + marketing = powerful combination! Thanks Lisa for the marketing insights. My app downloads doubled! 📱"
}

// Post 6 - Lisa
{
  "content": "If you're not learning, you're not growing. Just learned React Native from David. Next stop: building my own app! 🚀"
}

// Post 7 - Tom
{
  "content": "Docker containers make deployment so much easier! If you haven't learned containerization yet, you're missing out. Happy to teach! 🐳"
}

// Post 8 - Anna
{
  "content": "Content is king, but distribution is queen! Just wrapped up an amazing swap with Rachel. Design + Content = Magic ✨"
}

// Post 9 - Chris
  {
    "content": "Product management is all about empathy and execution. Grateful for Tom teaching me Docker - now I understand dev challenges better! 🎯"
  }

// Post 10 - Rachel
{
  "content": "Design tip of the day: Consistency is key! White space is your friend. Less is more. Thanks Anna for the content collab! 🎨"
}

// Post 11 - James
{
  "content": "Video editing workflow tip: Color grade BEFORE adding effects. Just taught Sophia my process - she's a natural! 🎬"
}

// Post 12 - Sophia
{
  "content": "Database optimization can make your app 10x faster! SQL is powerful. Also, video editing is harder than it looks - respect to James! 💪"
}
```

---

## 6. COMMENTS (15 Samples)

### Add Comments - POST `/api/posts/:postId/comment`

```json
// Comment 1
{
  "text": "This is amazing! Congrats on your first swap! 🎉"
}

// Comment 2
{
  "text": "Love this energy! Keep learning and sharing! 💪"
}

// Comment 3
{
  "text": "Great tip! I'll definitely try this approach."
}

// Comment 4
{
  "text": "Wow! That's inspiring. I'm signing up for a swap now!"
}

// Comment 5
{
  "text": "This community is so supportive! Best decision joining SkillSwap! ❤️"
}

// Comment 6
{
  "text": "Can you share more details about this? Would love to learn!"
}

// Comment 7
{
  "text": "Absolutely! Consistency in design makes everything better! 👏"
}

// Comment 8
{
  "text": "Thanks for sharing! This helped me understand the concept better."
}

// Comment 9
{
  "text": "I had the same experience! Swapping skills is so rewarding! 🌟"
}

// Comment 10
{
  "text": "Would love to connect and learn from you!"
}

// Comment 11
{
  "text": "This is exactly what I needed to hear today! 💯"
}

// Comment 12
{
  "text": "Great progress! Keep it up! 🚀"
}

// Comment 13
{
  "text": "I'm interested in learning this too! Anyone want to swap?"
}

// Comment 14
{
  "text": "Your journey is inspiring! Thanks for sharing! 🙏"
}

// Comment 15
{
  "text": "Bookmarking this! Super helpful advice! 📌"
}
```

---

## 7. GROUPS (10 Samples)

### Create Groups - POST `/api/groups`

```json
// Group 1
{
  "name": "Frontend Developers Hub",
  "description": "A community for frontend developers to share knowledge, tips, and collaborate on projects",
  "category": "Technology"
}

// Group 2
{
  "name": "UI/UX Design Circle",
  "description": "For designers to discuss design trends, share portfolios, and get feedback",
  "category": "Design"
}

// Group 3
{
  "name": "Backend Engineers",
  "description": "Backend development, API design, database optimization, and server architecture",
  "category": "Technology"
}

// Group 4
{
  "name": "Data Science Enthusiasts",
  "description": "Machine learning, data analysis, Python, R, and statistical modeling",
  "category": "Data Science"
}

// Group 5
{
  "name": "Mobile Developers",
  "description": "iOS, Android, React Native, and cross-platform mobile development",
  "category": "Technology"
}

// Group 6
{
  "name": "Digital Marketers",
  "description": "SEO, content marketing, social media strategy, and analytics",
  "category": "Marketing"
}

// Group 7
{
  "name": "DevOps & Cloud",
  "description": "Docker, Kubernetes, AWS, CI/CD, and infrastructure as code",
  "category": "Technology"
}

// Group 8
{
  "name": "Content Creators",
  "description": "Writers, video editors, podcasters, and multimedia creators",
  "category": "Media"
}

// Group 9
{
  "name": "Product Managers",
  "description": "Product strategy, roadmap planning, user research, and agile methodologies",
  "category": "Management"
}

// Group 10
{
  "name": "Career Growth & Mentorship",
  "description": "Professional development, career advice, resume reviews, and interview prep",
  "category" "Career"
}
```

---

## 8. MESSAGES (10 Samples)

### Send Messages - POST `/api/messages`

**Note**: Replace `conversationId` with actual conversation IDs.

```json
// Message 1
{
  "conversationId": "CONVERSATION_ID",
  "content": "Hey! Looking forward to our swap session tomorrow!",
  "type": "text"
}

// Message 2
{
  "conversationId": "CONVERSATION_ID",
  "content": "What time works best for you? I'm free after 6 PM.",
  "type": "text"
}

// Message 3
{
  "conversationId": "CONVERSATION_ID",
  "content": "Perfect! Let's meet at 7 PM. I'll send you the Zoom link.",
  "type": "text"
}

// Message 4
{
  "conversationId": "CONVERSATION_ID",
  "content": "Here's the link: https://zoom.us/j/123456789",
  "type": "text"
}

// Message 5
{
  "conversationId": "CONVERSATION_ID",
  "content": "Thanks! See you then! 😊",
  "type": "text"
}

// Message 6
{
  "conversationId": "CONVERSATION_ID",
  "content": "Great session today! I learned so much. Thank you!",
  "type": "text"
}

// Message 7
{
  "conversationId": "CONVERSATION_ID",
  "content": "You're welcome! You're a quick learner. Same time next week?",
  "type": "text"
}

// Message 8
{
  "conversationId": "CONVERSATION_ID",
  "content": "Absolutely! I'll prepare some questions for our next session.",
  "type": "text"
}

// Message 9
{
  "conversationId": "CONVERSATION_ID",
  "content": "Sounds good! Also, I found this great resource you might like: [link]",
  "type": "text"
}

// Message 10
{
  "conversationId": "CONVERSATION_ID",
  "content": "Amazing! Thanks for sharing. You're an awesome teacher! 🙏",
  "type": "text"
}
```

---

## 9. NOTIFICATIONS

**Note**: Notifications are auto-generated when:
- Swap requests are created
- Swaps are accepted/rejected/completed
- Comments are added to posts
- Messages are received
- Milestones are achieved

---

## 10. TRANSACTIONS

**Note**: Transactions are auto-generated when:
- Swaps are completed (50 skillcoins each)
- Referrals are successful (100 skillcoins)
- Login streaks reach 7 days (50 skillcoins)
- Profile is completed (20 skillcoins)

---

## 📝 TESTING WORKFLOW

### 1. **Setup Phase**
```
1. Register all 12 users
2. Save all user IDs and tokens
3. Login with each user
```

### 2. **Skills Phase**
```
1. Add 15 skills to teach (distribute among users)
2. Add 15 learning goals (distribute among users)
```

### 3. **Swaps Phase**
```
1. Create 10 swap requests
2. Accept 5 swaps (update status to "accepted")
3. Complete 3 swaps (update status to "completed")
4. Reject 2 swaps (update status to "rejected")
```

### 4. **Community Phase**
```
1. Create all 12 posts
2. Like posts (each user likes 3-5 posts)
3. Add 15 comments across different posts
4. Create all 10 groups
5. Join groups (each user joins 2-3 groups)
```

### 5. **Messaging Phase**
```
1. Send 10 messages in swap conversations
2. Mark some messages as read
```

### 6. **Gamification Phase**
```
1. Track activities (login, post create, etc.)
2. Check leaderboards
3. View achievements
4. Claim available achievements
```

---

## 🔧 POSTMAN TIPS

### Setting Environment Variables
```
baseURL = http://localhost:5000/api
authToken = {{loginResponse.token}}
userId = {{loginResponse.user.id}}
```

### Pre-request Script for Auth
```javascript
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get('authToken')
});
```

### Test Script to Save Token
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    var jsonData = pm.response.json();
    if (jsonData.token) {
        pm.environment.set('authToken', jsonData.token);
    }
    if (jsonData.user && jsonData.user.id) {
        pm.environment.set('userId', jsonData.user.id);
    }
}
```

---

**Last Updated**: 2024-12-18  
**Total Sample Data**: 100+ items  
**Ready for Testing**: ✅
