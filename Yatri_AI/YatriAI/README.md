# 🌐 YatriAI - Smart Tourism Platform for Kolkata Heritage

> **Revolutionary AI-powered tourism platform for Kolkata heritage with automatic translation, intelligent itinerary planning, and comprehensive travel management**

[![Deploy Status](https://img.shields.io/badge/Deploy-Ready-brightgreen)](https://github.com/Rahul-Sanskar-28/YatriAI)
[![Translation](https://img.shields.io/badge/Auto--Translate-15%2B%20Languages-blue)](https://github.com/Rahul-Sanskar-28/YatriAI)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61dafb)](https://github.com/Rahul-Sanskar-28/YatriAI)
[![Backend](https://img.shields.io/badge/Backend-Express%20%2B%20Prisma-green)](https://github.com/Rahul-Sanskar-28/YatriAI)

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Project](#-running-the-project)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Overview

YatriAI is a comprehensive smart tourism platform designed specifically for Kolkata's rich heritage. It combines AI-powered itinerary planning, real-time travel information, cultural preservation, and seamless multi-language support to provide an authentic and accessible tourism experience.

### Key Highlights

- **🌍 Auto-Translate**: World's first tourism platform with automatic Google Translate (15+ languages)
- **🤖 AI-Powered**: Gemini AI for intelligent itinerary planning and RAG chatbot
- **🏛️ Heritage Focus**: Dedicated sections for recipes, artisans, and Patachitra artwork
- **🚂 Real-time Data**: Indian Railway API integration for train information
- **📱 Mobile Ready**: Capacitor-based Android app support
- **🔐 Secure**: JWT authentication, role-based access control
- **🎨 Modern UI**: Beautiful, responsive design with dark mode support

## ✨ Features

### 🌐 Auto-Translation System
- **Zero Manual Steps**: Automatic translation with one click
- **15+ Languages**: Including Hindi (हिन्दी), Bengali (বাংলা), and more
- **Multiple Methods**: Redirect, Iframe, and Widget options
- **Localhost Compatible**: Works perfectly in development
- **RTL Support**: Right-to-left languages (Arabic, Hebrew)

### 🤖 AI-Powered Features
- **Intelligent Itinerary Planning**: Personalized travel plans using Gemini AI
- **RAG Chatbot**: Context-aware travel assistant with train and hotel data
- **Cost Estimation**: AI-powered budget optimization
- **Natural Language Processing**: Intent classification and heritage embeddings

### 🏛️ Heritage & Culture
- **Recipe Vault**: Family recipes with stories (Tourist/Admin can create, Admin approves)
- **Artisan Chronicles**: Master craftspeople profiles (Admin/Seller can create, Admin approves)
- **Patachitra Archive**: Scroll painting collection (Guide/Tourist/Admin can create, Admin approves)
- **Heritage Tours**: Curated tours of Kolkata landmarks
- **Cultural Experiences**: Durga Puja, traditional crafts, local cuisine

### 🚂 Travel Management
- **Train Information**: Real-time Indian Railway data
- **Hotel Booking**: Makcorps API integration
- **Transport Tracker**: GPS-based suggestions
- **Booking System**: Tour and guide bookings
- **SOS Agent**: Emergency assistance with Twilio SMS

### 👥 User Roles & Access Control
- **Tourist**: Browse tours, book guides, create recipes/artworks
- **Guide**: Create tours, manage bookings, create artworks
- **Seller**: Create artisan profiles, manage products
- **Admin**: Full access, approval workflows, analytics

### 📱 Mobile Features
- **Android App**: Capacitor-based native app
- **PWA Support**: Install as web app
- **Offline Capabilities**: Service worker caching
- **Push Notifications**: Real-time updates

### 🔗 Blockchain & Web3
- **Heritage NFTs**: Mint NFTs for heritage locations
- **Verified Marketplace**: Blockchain-verified products
- **Pandal Donations**: Transparent donation system

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Router** - Navigation
- **i18next** - Internationalization
- **Leaflet** - Interactive maps
- **Lucide React** - Icon library

### Backend
- **Express.js** with TypeScript
- **Prisma ORM** - Database management
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Socket.io** - Real-time communication
- **Twilio** - SMS notifications
- **Multer** - File uploads

### AI & ML
- **Google Gemini AI** - Itinerary planning and chatbot
- **Custom ML Models** - Intent classification, heritage embeddings
- **RAG System** - Retrieval-Augmented Generation

### External APIs
- **Indian Railway API** - Train information
- **Makcorps API** - Hotel data
- **Google Translate** - Auto-translation
- **ElevenLabs** - Text-to-speech (optional)

### Mobile
- **Capacitor 8** - Native app framework
- **Android** - Native Android support

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** database (or use Neon/Supabase)
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/Rahul-Sanskar-28/YatriAI.git
cd YatriAI

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install Indian Railway API dependencies (optional)
cd indian-rail-api
npm install
cd ..
```

### Configuration

#### 1. Backend Environment Variables

Create `backend/.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/yatriaidb"

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_here

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Indian Railway API
INDIAN_RAIL_API_BASE=http://localhost:3000

# Makcorps (Hotels)
MAKCORPS_TOKEN=your_makcorps_token
```

#### 2. Frontend Environment Variables

Create `.env` in root:

```env
# API Configuration
VITE_API_BASE=http://localhost:3001

# Gemini AI (optional, for direct frontend use)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GEMINI_MODEL=gemini-2.0-flash-exp

# Indian Railway API (optional fallback)
VITE_INDIAN_RAIL_API_BASE=http://localhost:3000

# Makcorps Hotels (optional)
VITE_MAKCORPS_TOKEN=your_makcorps_token

# ElevenLabs (optional, for voice features)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

#### 3. Database Setup

```bash
cd backend

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database (optional)
npm run db:seed
```

## 🏃 Running the Project

### Development Mode

You'll need **3 terminal windows**:

#### Terminal 1: Backend Server
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:3001`

#### Terminal 2: Frontend Server
```bash
npm run dev
```
Frontend runs on `http://localhost:5173`

#### Terminal 3: Indian Railway API (Optional)
```bash
cd indian-rail-api
npm start
```
Runs on `http://localhost:3000`

### Production Build

```bash
# Build frontend
npm run build

# Build backend
cd backend
npm run build
npm start
```

### Mobile Development

```bash
# Sync Capacitor
npm run cap:sync

# Open Android Studio
npm run cap:android

# Build for Android
npm run cap:build
```

## 📁 Project Structure

```
YatriAI/
├── src/                          # Frontend source code
│   ├── components/              # React components
│   │   ├── dashboard/           # Dashboard components
│   │   ├── common/              # Shared components
│   │   ├── landing/             # Landing page sections
│   │   └── magicui/             # UI components
│   ├── contexts/                # React contexts
│   ├── lib/                     # Utilities and services
│   │   ├── api.ts               # API client
│   │   └── services/           # External services
│   ├── locales/                 # i18n translations
│   └── types/                   # TypeScript types
├── backend/                      # Backend source code
│   ├── src/
│   │   ├── controllers/        # Route controllers
│   │   ├── routes/             # API routes
│   │   ├── middleware/         # Express middleware
│   │   └── index.ts            # Entry point
│   └── prisma/                  # Database schema
├── indian-rail-api/             # Indian Railway API service
├── mobile/                      # Mobile app configuration
├── docs/                        # Documentation
├── contracts/                   # Smart contracts (Web3)
└── models/                      # ML models
```

## 📚 API Documentation

### Authentication

```typescript
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Tours

```typescript
GET    /api/tours              # Get all tours
GET    /api/tours/pending      # Get pending tours (admin)
POST   /api/tours              # Create tour
PUT    /api/tours/:id          # Update tour
DELETE /api/tours/:id          # Delete tour
POST   /api/tours/:id/approve  # Approve tour (admin)
```

### Recipes

```typescript
GET    /api/recipes            # Get approved recipes
GET    /api/recipes/pending    # Get pending recipes (admin)
POST   /api/recipes            # Create recipe
DELETE /api/recipes/:id        # Delete recipe
POST   /api/recipes/:id/approve # Approve recipe (admin)
```

### Artisans

```typescript
GET    /api/artisans           # Get approved artisans
GET    /api/artisans/pending   # Get pending artisans (admin)
POST   /api/artisans           # Create artisan
DELETE /api/artisans/:id       # Delete artisan
POST   /api/artisans/:id/approve # Approve artisan (admin)
```

### Patachitra

```typescript
GET    /api/patachitra         # Get approved artworks
GET    /api/patachitra/pending # Get pending artworks (admin)
POST   /api/patachitra         # Create artwork
DELETE /api/patachitra/:id     # Delete artwork
POST   /api/patachitra/:id/approve # Approve artwork (admin)
```

### Trains

```typescript
GET /api/trains/betweenStations # Get trains between stations
GET /api/trains/getTrainOn      # Get trains on date
GET /api/trains/getTrain        # Get train info
GET /api/trains/getRoute        # Get train route
```

### AI Services

```typescript
POST /api/gemini/chat          # Chat with AI
POST /api/gemini/itinerary     # Generate itinerary
POST /api/gemini/cost-estimate # Estimate costs
```

## 🚢 Deployment

### Frontend (Vercel)

```bash
npm i -g vercel
vercel
```

### Backend (Railway/Render)

1. Push to GitHub
2. Connect repository to Railway/Render
3. Set environment variables
4. Deploy

### Database (Neon/Supabase)

1. Create free PostgreSQL database
2. Copy connection string
3. Add to backend environment variables

### Environment Variables for Production

Set all environment variables in your hosting platform's dashboard.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint for code quality
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## 🌍 Supported Languages

🇺🇸 English | 🇮🇳 Hindi (हिन्दी) | 🇧🇩 Bengali (বাংলা) | 🇫🇷 French | 🇪🇸 Spanish | 🇸🇦 Arabic | 🇩🇪 German | 🇯🇵 Japanese | 🇨🇳 Chinese | 🇰🇷 Korean | 🇵🇹 Portuguese | 🇷🇺 Russian | 🇮🇹 Italian | 🇳🇱 Dutch | 🇸🇪 Swedish

**Special focus on Indian languages for authentic Kolkata heritage experience!**

## 🎯 Key Features Breakdown

### Role-Based Access Control

- **Recipe Vault**: Create (Tourist/Admin), Delete (Tourist/Admin), View (Tourist/Admin), Approval (Admin)
- **Artisan Chronicles**: Create (Admin/Seller), Delete (Admin/Seller), View (Tourist/Seller/Admin), Approval (Admin)
- **Patachitra Archive**: Create (Guide/Tourist/Admin), Delete (Guide/Admin/Tourist), View (Guide/Admin/Tourist), Approval (Admin)

### AI Itinerary Planner

- RAG chatbot with train availability
- Hotel recommendations
- Cost estimation
- Real-time travel data integration

### Heritage Preservation

- Digital recipe vault with family stories
- Artisan profiles and crafts
- Patachitra scroll paintings archive
- Cultural tour experiences

## 🐛 Troubleshooting

### Common Issues

**Connection Refused (Train API)**
- Ensure `indian-rail-api` server is running on port 3000
- Check `VITE_INDIAN_RAIL_API_BASE` environment variable

**Database Connection Error**
- Verify `DATABASE_URL` in `backend/.env`
- Run `npm run db:push` to sync schema

**Gemini API Rate Limit**
- Wait a few minutes and retry
- Check API key validity
- Consider upgrading API tier

**Build Errors**
- Clear `node_modules` and reinstall
- Check Node.js version (18+)
- Verify TypeScript version compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- **Google Gemini AI** for intelligent itinerary planning
- **Indian Railway API** for train data
- **Makcorps** for hotel information
- **Kolkata Heritage Community** for cultural content

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ for Kolkata's rich heritage and global accessibility**

🌐 **Experience Kolkata in your language - automatically!** 🏛️

