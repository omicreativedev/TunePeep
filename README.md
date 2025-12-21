![TunePeep Banner](readme_banner.png)

A very basic full-stack YouTube Curation Program that enables a ADMIN to curate personalized playlists of YouTube music, including unlisted videos. This will allow private links, so that an ADMIN can share a curated library of private unlisted music/media that users have to login to stream. This is also great for musicians who want to share their unlisted music privately with registered users only.

## 🎵 Demo

[https://tunepeep.vercel.app](https://tunepeep.vercel.app)

## 🌟 Features

- **YouTube Integration**: Support for public and unlisted YouTube music links
- **User Authentication**: Secure registration and login system with JWT tokens
- **Role-Based Access**: Admin and user roles with different permissions
- **Music Curation**: Add, view, and organize music with custom metadata
- **Genre Classification**: Organize music by multiple genres
- **Admin Reviews**: Admin-curated reviews and rankings
- **Responsive UI**: Modern React interface with Bootstrap styling
- **Music Streaming**: Built-in YouTube player for seamless listening

## 🛠️ Tech Stack

### Frontend

- **React 19** with Vite
- **React Router** for navigation
- **Axios** for API communication
- **Bootstrap 5** & React-Bootstrap for UI
- **FontAwesome** icons
- **React Player** for YouTube streaming

### Backend

- **Go 1.25** with Gin framework
- **MongoDB** for database
- **JWT** authentication
- **CORS** middleware
- **bcrypt** password hashing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Go](https://golang.org/) (v1.25 or higher)
- [MongoDB](https://www.mongodb.com/) (local installation or Atlas account)
- [VS Code](https://code.visualstudio.com/) (recommended)

## 🚀 Getting Started

### 1. Fork and Clone the Repository

#### Option A: Using VS Code

1. Fork this repository on GitHub (click the "Fork" button at the top right)
2. Open VS Code
3. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
4. Type "Git: Clone" and press Enter
5. Paste your forked repository URL: `https://github.com/YOUR-USERNAME/TunePeep.git`
6. Select a folder to clone into
7. Click "Open" when prompted

#### Option B: Using Terminal

```bash
# Clone your forked repository
git clone https://github.com/YOUR-USERNAME/TunePeep.git

# Navigate to the project directory
cd TunePeep

# Open in VS Code
code .
```

### 2. Set Up MongoDB Database

#### Option A: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Click "Connect" on your cluster
4. Choose "Connect your application"
5. Copy your connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
6. Create a database named `tunepeep`
7. Create collections: `users` `musics` `genres` `rankings`
8. Populate collections with sample data (it can be replaced later)

#### Option B: Local MongoDB

1. Install [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:

   ```bash
   # Windows
   net start MongoDB

   # Mac/Linux
   sudo systemctl start mongod
   ```

3. Your connection string will be: `mongodb://localhost:27017/tunepeep`

### 3. Import Sample Data (Optional)

```bash
# Download the JSON files from the repository
# Import collections (one at a time)
mongoimport --uri="YOUR_MONGODB_URI" --collection=musics --file=musics.json --jsonArray

mongoimport --uri="YOUR_MONGODB_URI" --collection=users --file=users.json --jsonArray

mongoimport --uri="YOUR_MONGODB_URI" --collection=rankings --file=rankings.json --jsonArray

mongoimport --uri="YOUR_MONGODB_URI" --collection=genres --file=genres.json --jsonArray
```

### 4. Configure the Server

1. Navigate to the Server directory:

   ```bash
   cd Server/MusicServer
   ```

2. Create a `.env` file in the `Server/MusicServer` directory:

   ```bash
   # Windows
   type nul > .env

   # Mac/Linux
   touch .env
   ```

3. Add the following environment variables to `.env`:

   ```env
   DATABASE_NAME=tunepeep
   MONGODB_URI=<your connection url>
   SECRET_KEY=your_secret_key
   SECRET_REFRESH_KEY=your_secret_refresh_key
   BASE_PROMPT_TEMPLATE=Return a response using one of these words: {rankings}. The response should be a single word and should not contain any other text. The response should be based on the following review:
   API_KEY=<Your Open AI API key>
   RECOMMENDED_MUSIC_LIMIT=5
   ALLOWED_ORIGINS=http://localhost:5173
   ```

### 5. Configure the Client

1. Navigate to the Client directory:

   ```bash
   cd ../../Client/tunepeep
   ```

2. Create a `.env` file in the `Client/tunepeep` directory:

   ```bash
   # Windows
   type nul > .env

   # Mac/Linux
   touch .env
   ```

3. Add the following environment variable:
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```

### 6. Install Dependencies

#### Backend Dependencies

```bash
# From the Server/MusicServer directory
cd Server/MusicServer
go mod download
go mod tidy
```

#### Frontend Dependencies

```bash
# From the Client/tunepeep directory
cd Client/tunepeep
npm install
```

### 7. Run the Application

You'll need **two separate terminals** to run both the server and client:

#### Terminal 1: Start the Backend Server

```bash
# Navigate to Server/MusicServer
cd Server/MusicServer

# Run the Go server
go run .
```

You should see:

```
Allowed Origin: http://localhost:5173
MongoDB URI: mongodb+srv://...
[GIN] Listening and serving HTTP on :8080
```

#### Terminal 2: Start the Frontend Client

```bash
# Navigate to Client/tunepeep
cd Client/tunepeep

# Start the Vite dev server
npm run dev
```

You should see:

```
VITE v7.2.4  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 8. Open in Browser

Open your browser and navigate to:

```
http://localhost:5173
```

🎉 **You're all set!** <br>
The Demo Login is demo@hotmail.com password TunePeep1!<br><br>
In order to create new administrative accounts, you should register a new user then manually change the role in the MongoDB from USER to ADMIN. All users registered from the registration page are USER role. Only ADMIN accounts have the permissions to Add Music, Edit Music, and Delete Music.

## 📦 Building for Production

### Frontend Build

```bash
cd Client/tunepeep
npm run build
```

The production-ready files will be in `Client/tunepeep/dist/`

### Backend Build

```bash
cd Server/MusicServer
go build -o tunepeep-server
```

## 🚀 Deployment

### Deploy Backend to Render

1. Create a [Render](https://render.com/) account
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `tunepeep-api`
   - **Region**: Choose your preferred region
   - **Branch**: `main`
   - **Root Directory**: `Server/MusicServer`
   - **Runtime**: `Go`
   - **Build Command**: `go build -o server`
   - **Start Command**: `./server`
5. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET_KEY`: Your secret key
   - `ALLOWED_ORIGINS`: Your frontend URL (e.g., `https://your-app.vercel.app`)
6. Click "Create Web Service"
7. Copy your Render service URL (e.g., `https://tunepeep-api.onrender.com`)

### Deploy Frontend to Vercel

1. Create a [Vercel](https://vercel.com/) account
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `Client/tunepeep`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - `VITE_API_BASE_URL`: Your Render backend URL (e.g., `https://tunepeep-api.onrender.com`)
6. Click "Deploy"
7. Your app will be live at `https://your-project.vercel.app`

### Post-Deployment Configuration

After deploying both frontend and backend:

1. Update your Render backend environment variable:

   - `ALLOWED_ORIGINS`: Add your Vercel URL

2. Redeploy if needed to apply changes

## 📖 Usage Guide

### For Users

1. **Register**: Create an account with username, email, and password
2. **Login**: Access the platform with your credentials
3. **Browse Music**: View the curated music collection
4. **Stream**: Click on any music item to play it via the integrated YouTube player
5. **View Details**: See genres, admin reviews, and rankings

### For Admins

All user features, plus:

- **Add Music**: Curate new music with YouTube links, genres, and metadata
- **Edit Music**: Edit a music album listing (data pre-populated)
- **Delete Music**: Delete a music album
- **Manage Collections**: Organize music by genre
- **Write Reviews**: Add admin reviews for each music item

## 🗂️ Project Structure

```
TunePeep/
├── Client/
│   └── tunepeep/               # React frontend
│       ├── src/
│       │   ├── api/            # Axios configurations
│       │   ├── components/     # React components
│       │   ├── context/        # React context (Auth)
│       │   └── hooks/          # Custom React hooks
│       ├── public/             # Static assets
│       └── package.json
├── Server/
│   └── MusicServer/            # Go backend
│       ├── controllers/        # API controllers
│       ├── database/           # Database connection
│       ├── middleware/         # Auth middleware
│       ├── models/             # Data models
│       ├── routes/             # API routes
│       ├── utils/              # Utility functions
│       └── main.go
└── covers_2k/                  # Album cover images
```

## 📝 API Documentation

### Unprotected Routes (Public Access)

- `GET /musics` - Get all music
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /genres` - Get all genres
- `POST /refresh` - Refresh authentication token

### Protected Routes (Authentication Required)

- `GET /music/:music_id` - Get music by ID
- `POST /addmusic` - Add new music (admin only)
- `GET /recommendedmusic` - Get recommended music
- `PATCH /updatereview/:music_id` - Update admin review (admin only)
- `PATCH /edit/:music_id` - Edit music details (admin only)
- `DELETE /delete/:music_id` - Delete music (admin only)

## 🐛 Troubleshooting

### Server won't start

- Check if MongoDB is running
- Verify `.env` file exists and contains correct values
- Ensure port 8080 is not in use

### Client won't start

- Delete `node_modules` and run `npm install` again
- Check if `.env` file has the correct API URL
- Ensure port 5173 is not in use

### CORS errors

- Verify `ALLOWED_ORIGINS` in backend `.env` matches your frontend URL
- Check that `withCredentials: true` is set in axios config

### MongoDB connection issues

- Verify connection string format
- Check if IP is whitelisted (MongoDB Atlas)
- Ensure database user has proper permissions

## 📄 License

MIT License - See LICENSE file for details

## 🔮 Future Enhancements

- [ ] Playlist creation and management
- [ ] User management interface (add, edit, delete, assign role)
- [ ] Social features (likes, user reviews, saves)
- [ ] Advanced search and filtering
- [ ] User profile customization (edit account, delete account)
- [ ] Additional fields (Author, Runtime, Description, Publisher, etc.)

---

**❤️ OmiCreativeDev**

_If you find this project helpful, please consider giving it a ⭐!_
