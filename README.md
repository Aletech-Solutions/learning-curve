# XandLearning - Algorithm Practice Platform

A modern web application for practicing algorithm and data structure challenges. Built with React + Material UI frontend and Node.js + MongoDB backend.

![XandLearning](https://img.shields.io/badge/XandLearning-Algorithm%20Practice-7c3aed?style=for-the-badge)

## Features

- 🎯 **30 Algorithm Challenges** - 10 per difficulty level (Beginner, Average, Hardcore)
- 💻 **Monaco Code Editor** - VS Code-like editing experience
- ✅ **Real-time Code Testing** - Run your code against test cases
- 🏆 **XP & Leveling System** - Earn experience points and level up
- 💾 **Progress Persistence** - Your progress is saved automatically
- 🎨 **Beautiful Dark UI** - Modern, sleek interface

## Tech Stack

| Frontend | Backend | Database | Infrastructure |
|----------|---------|----------|----------------|
| React 18 | Node.js | MongoDB 7 | Docker |
| Material UI 5 | Express | Mongoose | Docker Compose |
| Monaco Editor | VM2 (sandbox) | | |
| Vite | | | |

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- OR Node.js 18+ and MongoDB 7+ for local development

## Quick Start with Docker (Recommended)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd XandLearning
```

### 2. Use the deployment script

**Windows (PowerShell):**
```powershell
.\deploy.ps1 dev
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh dev
```

### 3. Available commands

| Command | Description |
|---------|-------------|
| `dev` | Start development environment |
| `prod` | Start production environment |
| `stop` | Stop all services |
| `clean` | Remove containers, volumes, images |
| `logs` | View container logs |
| `status` | Check service health |

### Manual Start (Alternative)

```bash
# Create .env file
cp env.sample .env   # Linux/Mac
Copy-Item env.sample .env   # Windows

# Start with Docker Compose
docker-compose up --build
```

### 4. Access the application

- **Frontend**: http://localhost:4173
- **Backend API**: http://localhost:4174
- **MongoDB**: localhost:27117

## Local Development (Without Docker)

### Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/xandlearning
NODE_ENV=development
```

Start the backend:
```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Start the frontend:
```bash
npm run dev
```

### MongoDB

Make sure MongoDB is running locally on port 27017, or use MongoDB Atlas and update the connection string.

## Project Structure

```
XandLearning/
├── docker-compose.yml          # Docker orchestration
├── env.sample                  # Environment template
├── README.md                   # This file
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── theme/
│       │   └── theme.js
│       ├── components/
│       │   ├── TaskCard.jsx
│       │   ├── CodeEditor.jsx
│       │   └── UserProgress.jsx
│       ├── data/
│       │   └── tasks.json      # 30 algorithm challenges
│       └── services/
│           └── api.js
│
└── backend/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── index.js
        ├── models/
        │   └── User.js
        └── routes/
            ├── users.js
            └── code.js
```

## API Endpoints

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Create or get user by username |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users/:id/progress` | Update user progress |
| GET | `/api/users/leaderboard` | Get top 100 users |

### Code Execution

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/code/execute` | Execute code and run tests |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check API status |

## Challenge Categories

- **Arrays** - Array manipulation and algorithms
- **Strings** - String processing challenges
- **Sorting** - Bubble, Selection, Quick, Merge, Heap sort
- **Searching** - Binary search and variations
- **Math** - Factorial, Fibonacci, etc.
- **Logic** - FizzBuzz and similar problems
- **Data Structures** - LRU Cache and more
- **Dynamic Programming** - Coin change, LIS, Word break

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `FRONTEND_PORT` | 4173 | Frontend server port |
| `BACKEND_PORT` | 4174 | Backend API port |
| `MONGODB_PORT` | 27117 | MongoDB port |
| `NODE_ENV` | development | Environment mode |
| `MONGODB_URI` | mongodb://mongodb:27017/xandlearning | MongoDB connection string |

## Troubleshooting

### Docker Issues

**Port already in use:**
```bash
# Change ports in .env file
FRONTEND_PORT=4175
BACKEND_PORT=4176
```

**Clean rebuild:**
```bash
docker-compose down -v
docker-compose up --build
```

### MongoDB Connection Issues

Make sure MongoDB is running:
```bash
# Check if MongoDB container is up
docker-compose ps

# View logs
docker-compose logs mongodb
```

### Code Execution Timeout

The sandbox has a 5-second timeout. If your code takes longer, optimize your solution.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

---

Made with ❤️ for algorithm enthusiasts

