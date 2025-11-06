# Layer 1 Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AI Assessment Platform - Layer 1                  │
│                  Data & Core Infrastructure Layer                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                           SERVER (Express.js)                        │
│  ┌────────────────┬───────────────┬──────────────┬────────────────┐ │
│  │   Security     │  Body Parser  │     CORS     │  Rate Limiter  │ │
│  │   (Helmet)     │   (JSON)      │              │  (3-tier)      │ │
│  └────────────────┴───────────────┴──────────────┴────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          MIDDLEWARE LAYER                            │
│  ┌──────────────────┬──────────────────┬──────────────────────────┐ │
│  │  Authentication  │  Authorization   │   Error Handling         │ │
│  │  - JWT Verify    │  - Role Check    │   - Global Handler       │ │
│  │  - Token Gen     │  - Ownership     │   - Custom Errors        │ │
│  └──────────────────┴──────────────────┴──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATABASE (MongoDB)                           │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                        COLLECTIONS                            │  │
│  │                                                               │  │
│  │  ┌───────────┐  ┌───────────┐  ┌────────────┐  ┌──────────┐ │  │
│  │  │   Users   │  │  Courses  │  │ Questions  │  │Assessment│ │  │
│  │  │           │  │           │  │            │  │          │ │  │
│  │  │ - Student │  │ - Syllabus│  │ - MCQ      │  │ - Config │ │  │
│  │  │ - Faculty │  │ - Topics  │  │ - Coding   │  │ - Timer  │ │  │
│  │  │ - Admin   │  │ - Refs    │  │ - Essay    │  │ - Rules  │ │  │
│  │  │ - Context │  │ - Progress│  │ - AI Meta  │  │ - Adapt  │ │  │
│  │  └───────────┘  └───────────┘  └────────────┘  └──────────┘ │  │
│  │                                                               │  │
│  │  ┌───────────┐  ┌───────────┐                               │  │
│  │  │  Results  │  │ Analytics │                               │  │
│  │  │           │  │           │                               │  │
│  │  │ - Scores  │  │ - Trends  │                               │  │
│  │  │ - Topics  │  │ - Insights│                               │  │
│  │  │ - Time    │  │ - Compare │                               │  │
│  │  │ - AI Tips │  │ - Reports │                               │  │
│  │  └───────────┘  └───────────┘                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      FILE STORAGE (Cloudinary)                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  - Question Media (images, videos)                           │  │
│  │  - Profile Pictures                                          │  │
│  │  - Reports (PDF exports)                                     │  │
│  │  - Learning Resources                                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

```
┌─────────────┐
│   Request   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Rate Limiter   │ ◄── Check request limits
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Auth Middleware │ ◄── Verify JWT Token
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Authorization   │ ◄── Check Role/Permissions
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Route Handler   │ ◄── Business Logic (Layer 2)
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Mongoose Model  │ ◄── Database Operations
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│  MongoDB Atlas  │ ◄── Data Persistence
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│   Response      │
└─────────────────┘
```

## Authentication Flow

```
┌──────────────┐
│ Client Login │
└──────┬───────┘
       │ (email, password)
       ▼
┌─────────────────────┐
│  Auth Controller    │
│  (Layer 2)          │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  User.findOne()     │ ◄── Find by email
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ matchPassword()     │ ◄── Bcrypt compare
└──────┬──────────────┘
       │
       ▼ (if valid)
┌─────────────────────┐
│ generateToken()     │ ◄── JWT sign
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Return Token        │ ◄── Send to client
└─────────────────────┘
```

## Context Update Flow

```
┌──────────────────────┐
│ Student Completes    │
│   Assessment         │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Calculate Results    │
│  - Score             │
│  - Topic Performance │
│  - Time per Question │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Result.save()        │ ◄── Store in DB
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ User.updateContext() │ ◄── Update profile
│  - Topic Strengths   │     (70-30 weighted)
│  - Average Speed     │
│  - Tests Taken       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Analytics.create()   │ ◄── Generate insights
└──────────────────────┘
```

## Adaptive Assessment Generation

```
┌──────────────────────┐
│ Student Requests     │
│    New Test          │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Fetch Student Context        │
│  - Topic Strengths (Map)     │
│  - Difficulty Preference     │
│  - Recent Performance        │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Adaptive Algorithm           │
│  - Identify Weak Topics      │
│  - Balance Difficulty        │
│  - Topic Coverage            │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Query Question Bank          │
│  Question.find({             │
│    topic: {$in: focusTopics},│
│    difficulty: distribution  │
│  })                          │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Create Assessment            │
│  - Selected Questions        │
│  - Order & Randomization     │
│  - Timer Settings            │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Return to Student            │
└──────────────────────────────┘
```

## Model Relationships

```
┌─────────────┐           ┌─────────────┐
│    User     │           │   Course    │
│  (Faculty)  │───────────▶│             │
│             │  creates   │             │
└─────────────┘           └──────┬──────┘
                                 │
                                 │ has many
                                 ▼
                          ┌─────────────┐
                          │  Question   │
                          │             │
                          └──────┬──────┘
                                 │
                                 │ used in
                                 ▼
                          ┌─────────────┐
                          │ Assessment  │
                          │             │
                          └──────┬──────┘
                                 │
                   ┌─────────────┴─────────────┐
                   │                           │
              taken by                    generates
                   ▼                           ▼
            ┌─────────────┐           ┌─────────────┐
            │    User     │           │   Result    │
            │  (Student)  │───────────▶│             │
            │             │  receives  │             │
            └──────┬──────┘           └──────┬──────┘
                   │                         │
                   └────────┬────────────────┘
                            │
                       aggregated in
                            ▼
                     ┌─────────────┐
                     │  Analytics  │
                     │             │
                     └─────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────┐
│         Application Security Stack           │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Layer 4: Rate Limiting             │   │
│  │  - API: 100/15min                   │   │
│  │  - Auth: 5/15min                    │   │
│  │  - AI: 20/hour                      │   │
│  └─────────────────────────────────────┘   │
│           │                                 │
│           ▼                                 │
│  ┌─────────────────────────────────────┐   │
│  │  Layer 3: Authorization             │   │
│  │  - Role-based access                │   │
│  │  - Resource ownership               │   │
│  └─────────────────────────────────────┘   │
│           │                                 │
│           ▼                                 │
│  ┌─────────────────────────────────────┐   │
│  │  Layer 2: Authentication            │   │
│  │  - JWT verification                 │   │
│  │  - Token validation                 │   │
│  └─────────────────────────────────────┘   │
│           │                                 │
│           ▼                                 │
│  ┌─────────────────────────────────────┐   │
│  │  Layer 1: Base Security             │   │
│  │  - Helmet.js headers                │   │
│  │  - CORS                             │   │
│  │  - Password hashing (bcrypt)        │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## File Structure Tree

```
backend/
│
├── config/
│   ├── database.js          # MongoDB connection
│   └── cloudinary.js        # File storage
│
├── models/
│   ├── User.js              # User schema
│   ├── Course.js            # Course schema
│   ├── Question.js          # Question schema
│   ├── Assessment.js        # Assessment schema
│   ├── Result.js            # Result schema
│   ├── Analytics.js         # Analytics schema
│   └── index.js             # Export all models
│
├── middleware/
│   ├── auth.js              # JWT auth & authorization
│   ├── error.js             # Error handling
│   └── rateLimiter.js       # Rate limiting
│
├── utils/
│   └── jwt.js               # JWT utilities
│
├── .env.example             # Environment template
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies
├── server.js                # Main server
├── seed.js                  # Database seeder
├── README.md                # Documentation
└── LAYER1_COMPLETE.md       # Implementation summary
```

---

**Layer 1 Status**: ✅ Complete and Production-Ready
