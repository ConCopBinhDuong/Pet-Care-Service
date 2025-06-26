# Pet Care Service - Full Stack Application

A comprehensive pet care service platform with booking, scheduling, and management features.

## Project Structure

```
Pet_care_service_backend/
├── src/                    # Backend (Node.js + Express)
│   ├── server.js          # Main server file
│   ├── db.js             # Database configuration
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   └── services/         # Business logic services
├── public/               # Frontend (React + Vite + Tailwind)
│   ├── src/             # React components
│   ├── package.json     # Frontend dependencies
│   └── vite.config.js   # Vite configuration
├── package.json         # Backend dependencies
├── .env                 # Environment variables
└── petcare_mysqlver.sql # Database schema
```

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MySQL** database server
3. **npm** package manager

## Setup Instructions

### 1. Install Dependencies

#### Backend Dependencies
```bash
# In the root directory
npm install
```

#### Frontend Dependencies
```bash
# Navigate to the public folder
cd public
npm install
```

### 2. Database Setup

1. Make sure MySQL is running on your system
2. Create a database named `petcare` (or use the name specified in .env)
3. Import the database schema:
```bash
mysql -u your_username -p petcare < petcare_mysqlver.sql
```

### 3. Environment Configuration

The `.env` file is already configured. Update the database credentials if needed:

```env
DB_HOST=34.171.59.66
DB_PORT=3306
DB_USER=petcaremem
DB_PASSWORD=zxcvbnm123
DB_NAME=petcare
```

## Running the Application

### Method 1: Start Both Services Separately (Recommended for Development)

#### Terminal 1 - Start Backend Server
```bash
# In the root directory
npm run dev
```
The backend will start on `http://localhost:10000`

#### Terminal 2 - Start Frontend Development Server
```bash
# In the public directory
cd public
npm run dev
```
The frontend will start on `http://localhost:3000`

### Method 2: Production Mode

#### Start Backend in Production
```bash
npm start
```

#### Build and Serve Frontend
```bash
cd public
npm run build
npm run preview
```

## API Endpoints

The backend provides various API endpoints:

- **Authentication**: `/api/auth/*`
- **User Profile**: `/api/profile/*`
- **Pet Management**: `/api/pets/*`
- **Services**: `/api/services/*`
- **Bookings**: `/api/bookings/*`
- **Schedule**: `/api/schedule/*`
- **Reviews**: `/api/reviews/*`
- **Chat**: `/api/chat/*`
- **Notifications**: `/api/notifications/*`

## Development Features

- **Hot Reload**: Both frontend and backend support hot reloading
- **API Proxy**: Frontend proxies API calls to backend automatically
- **CORS**: Configured for cross-origin requests
- **Security**: Helmet, rate limiting, and authentication middleware
- **Database**: MySQL with connection pooling
- **File Uploads**: Support for pet images and documents
- **HTTP Only**: Development server runs on HTTP for simplicity

## Accessing the Application

1. **Frontend**: http://localhost:3000
2. **Backend API**: http://localhost:10000
3. **Health Check**: http://localhost:10000/health
4. **Debug Info**: http://localhost:10000/debug

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check if MySQL is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Or kill the process using the port

3. **Frontend Can't Connect to Backend**
   - Ensure backend is running on port 10000
   - Check Vite proxy configuration

### Environment Variables

Make sure these are set in your `.env` file:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`
- `PORT` (optional, defaults to 10000)
- `NODE_ENV` (development/production)

## Testing

The project includes test files in `/src/tests/` directory with JSON test cases for each API endpoint.

## Deployment

The application is configured for deployment on Render.com with automatic HTTPS handling.
