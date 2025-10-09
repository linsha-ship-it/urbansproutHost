# Database Setup Guide - Making Your Database Permanent

## 🎯 Overview
This guide will help you set up a permanent database for your UrbanSprout application. You have several options to choose from.

## 📋 Prerequisites
- Node.js installed
- MongoDB (local or cloud)

## 🔧 Option 1: MongoDB Atlas (Cloud - Recommended)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new project called "UrbanSprout"

### Step 2: Create a Cluster
1. Click "Build a Database"
2. Choose "M0 Sandbox" (Free tier)
3. Select your preferred region
4. Name your cluster (e.g., "urbansprout-cluster")
5. Click "Create Cluster"

### Step 3: Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and password (save these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### Step 4: Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add your specific IP addresses
5. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Clusters" and click "Connect"
2. Choose "Connect your application"
3. Select "Node.js" and version "4.1 or later"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Replace `<dbname>` with `urbansprout`

### Step 6: Create .env File
Create a `.env` file in your project root with:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/urbansprout?retryWrites=true&w=majority

# Server Configuration
NODE_ENV=production
PORT=5001

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

## 🏠 Option 2: Local MongoDB Installation

### macOS (using Homebrew)
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community

# Verify installation
mongosh
```

### Windows
1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Choose "Complete" installation
4. Install MongoDB as a Windows Service
5. Install MongoDB Compass (GUI tool)

### Linux (Ubuntu/Debian)
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Create .env File for Local MongoDB
```env
# Local MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/urbansprout

# Server Configuration
NODE_ENV=development
PORT=5001

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

## 🐳 Option 3: MongoDB with Docker

### Create docker-compose.yml
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7.0
    container_name: urbansprout-mongodb
    restart: always
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
      MONGO_INITDB_DATABASE: urbansprout
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro

volumes:
  mongodb_data:
```

### Create mongo-init.js
```javascript
db = db.getSiblingDB('urbansprout');
db.createUser({
  user: 'urbansprout',
  pwd: 'urbansprout123',
  roles: [
    {
      role: 'readWrite',
      db: 'urbansprout'
    }
  ]
});
```

### Start MongoDB with Docker
```bash
# Start MongoDB container
docker-compose up -d

# Check if container is running
docker ps
```

### Create .env File for Docker MongoDB
```env
# Docker MongoDB Connection
MONGODB_URI=mongodb://urbansprout:urbansprout123@localhost:27017/urbansprout?authSource=urbansprout

# Server Configuration
NODE_ENV=development
PORT=5001

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

## 🔄 Database Backup and Restore

### Backup Script
```bash
# Create backup
mongodump --uri="your-mongodb-connection-string" --out=./backups/$(date +%Y%m%d_%H%M%S)

# For MongoDB Atlas
mongodump --uri="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/urbansprout" --out=./backups/$(date +%Y%m%d_%H%M%S)
```

### Restore Script
```bash
# Restore from backup
mongorestore --uri="your-mongodb-connection-string" ./backups/backup-folder-name

# For MongoDB Atlas
mongorestore --uri="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/urbansprout" ./backups/backup-folder-name
```

## 🚀 Testing Your Setup

1. **Start your server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Check database connection:**
   - Look for "✅ MongoDB Connected" message in console
   - Visit `http://localhost:5001/api/test` to verify API is working

3. **Test database operations:**
   - Register a new user
   - Add some products
   - Check if data persists after server restart

## 🔒 Security Best Practices

1. **Never commit .env files to version control**
2. **Use strong passwords for database users**
3. **Restrict network access to your database**
4. **Regularly backup your database**
5. **Use environment-specific configurations**

## 🆘 Troubleshooting

### Common Issues:

1. **Connection refused:**
   - Check if MongoDB service is running
   - Verify connection string
   - Check firewall settings

2. **Authentication failed:**
   - Verify username and password
   - Check database user permissions
   - Ensure correct database name

3. **Network timeout:**
   - Check internet connection (for Atlas)
   - Verify IP whitelist settings
   - Check firewall rules

### Getting Help:
- Check MongoDB logs: `tail -f /var/log/mongodb/mongod.log`
- MongoDB documentation: https://docs.mongodb.com/
- MongoDB Atlas documentation: https://docs.atlas.mongodb.com/

## 📝 Next Steps

After setting up your permanent database:

1. Run the database setup script: `npm run setup:urban`
2. Create admin user: `node scripts/createAdmin.js`
3. Populate sample data: `node scripts/populateGardeningStore.js`
4. Test all functionality with persistent data

Your database is now permanent and will persist data across server restarts! 🌱




