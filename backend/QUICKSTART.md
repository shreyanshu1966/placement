# Quick Start Guide - Layer 1

Get up and running with the AI Assessment Platform backend in 5 minutes!

## Prerequisites

- ✅ Node.js v18+ installed
- ✅ MongoDB Atlas account (or local MongoDB)
- ✅ Cloudinary account (optional for file storage)

## Step-by-Step Setup

### 1️⃣ Install Dependencies

```bash
cd backend
npm install
```

**Expected output**: ~162 packages installed

### 2️⃣ Configure Environment

```bash
# Copy the example file
cp .env.example .env
```

**Edit `.env` file** with your credentials:

```env
# Required
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/ai-assessment?retryWrites=true&w=majority
JWT_SECRET=your-random-secret-key-change-this

# Optional (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Getting MongoDB URI:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password

**Generating JWT Secret:**
```bash
# On Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or use any random string
# Example: "mySecretKey12345!@#$%"
```

### 3️⃣ Start the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

**Expected output:**
```
✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
📊 Database: ai-assessment

🚀 Server running in development mode on port 5000
📍 API: http://localhost:5000
🏥 Health: http://localhost:5000/health
```

### 4️⃣ Verify Installation

**Test health endpoint:**

**Using browser:** Open http://localhost:5000/health

**Using curl:**
```bash
curl http://localhost:5000/health
```

**Using PowerShell:**
```powershell
Invoke-RestMethod http://localhost:5000/health
```

**Expected response:**
```json
{
  "success": true,
  "message": "AI Assessment Platform API is running",
  "timestamp": "2024-11-06T...",
  "environment": "development"
}
```

### 5️⃣ Seed Sample Data (Optional)

```bash
npm run seed
```

**Expected output:**
```
🗑️  Clearing existing data...
✅ Existing data cleared
👥 Creating users...
✅ Created 4 users
📚 Creating sample course...
✅ Created sample course
❓ Creating sample questions...
✅ Created 4 sample questions

🎉 Database seeded successfully!

📊 Summary:
   Users: 4
   Courses: 1
   Questions: 4

👤 Test Credentials:
   Admin:   admin@college.edu / admin123
   Faculty: john.smith@college.edu / faculty123
   Student: alice.student@college.edu / student123
   Student: bob.student@college.edu / student123
```

## ✅ Verification Checklist

- [ ] Dependencies installed (162 packages)
- [ ] `.env` file created with MongoDB URI
- [ ] Server starts without errors
- [ ] Health endpoint returns success
- [ ] Database connection successful
- [ ] (Optional) Sample data seeded

## 🎯 What's Next?

Layer 1 is complete! You now have:

✅ **Database Models** - All schemas ready  
✅ **Authentication** - JWT system in place  
✅ **Security** - Rate limiting, helmet, CORS  
✅ **File Storage** - Cloudinary integration  
✅ **Error Handling** - Global error handler  

**Next: Layer 2 - Backend Logic**
- Authentication routes (register, login)
- CRUD operations for all models
- Assessment generation logic
- Result calculation
- Analytics engine

## 🐛 Troubleshooting

### Server won't start

**Error: "Cannot find module"**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### MongoDB connection failed

**Error: "MongoServerError: Authentication failed"**
- ✅ Check username and password in MongoDB URI
- ✅ Ensure password is URL-encoded (special characters)
- ✅ Verify database user has read/write permissions

**Error: "connection timeout"**
- ✅ Check IP whitelist in MongoDB Atlas (add 0.0.0.0/0 for testing)
- ✅ Verify internet connection
- ✅ Check firewall settings

### JWT errors

**Error: "Invalid token"**
- ✅ Ensure JWT_SECRET is set in `.env`
- ✅ Check token format: `Bearer <token>`

### Port already in use

**Error: "Port 5000 is already in use"**
```bash
# Change port in .env
PORT=5001
```

Or kill the process using port 5000:
```powershell
# Find process
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

## 📚 Available Scripts

```bash
npm start      # Start production server
npm run dev    # Start development server (nodemon)
npm run seed   # Seed sample data
```

## 🔗 Useful Links

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Cloudinary Dashboard](https://cloudinary.com/console)
- [JWT.io](https://jwt.io) - Debug JWT tokens
- [Postman](https://www.postman.com) - API testing

## 💡 Pro Tips

1. **Use nodemon for development**
   - Auto-restarts server on file changes
   - Run with `npm run dev`

2. **Keep `.env` secure**
   - Never commit to git
   - Different `.env` for production

3. **Monitor logs**
   - Watch console for errors
   - MongoDB connection status
   - Request rate limiting

4. **Test incrementally**
   - Verify each component works
   - Use seed data for testing
   - Check health endpoint regularly

## 📞 Need Help?

Check documentation:
- `README.md` - Detailed setup guide
- `LAYER1_COMPLETE.md` - Implementation summary
- `ARCHITECTURE.md` - System architecture

## 🎉 Success!

If you see this message, Layer 1 is working perfectly:

```
✅ MongoDB Connected: cluster...
🚀 Server running in development mode on port 5000
```

**You're ready for Layer 2!** 🚀

---

**Time to complete**: ~5 minutes  
**Difficulty**: ⭐⭐☆☆☆ (Easy)
