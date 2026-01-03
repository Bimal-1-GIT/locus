# 🏔️ Locus - Nepal Real Estate Platform

A modern real estate platform for Nepal, featuring AI-powered property search, beautiful Nepali-inspired design, and seamless property management for both renters and buyers.

![Locus](https://img.shields.io/badge/Locus-Nepal%20Real%20Estate-8B0000?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)

## ✨ Features

### For Property Seekers
- 🔍 **Smart AI Search** - Natural language property search powered by Google Gemini
- 🏠 **Unified Listings** - Browse both rental and sale properties in one place
- 💬 **AI Chatbot Assistant** - Get instant help with Locus Assistant (लोकस सहायक)
- ❤️ **Save Favorites** - Keep track of properties you love
- 📱 **Responsive Design** - Beautiful on all devices

### For Property Owners
- 📝 **Easy Listing Creation** - List your property in minutes
- 📸 **Image Upload** - Showcase your property with multiple photos
- 📊 **Manage Listings** - Edit, update, or remove listings anytime
- 💌 **Direct Messaging** - Connect with potential tenants/buyers

### Platform Features
- 🎨 **Nepali-Inspired Design** - Beautiful maroon, gold, and cream color scheme
- 🔐 **Secure Authentication** - JWT-based auth with encrypted passwords
- 🤖 **AI-Powered** - Smart match search and conversational chatbot
- 📍 **Nepal-Focused** - Coverage across Kathmandu Valley, Pokhara, and more

## 🚀 Getting Started

### Prerequisites & Requirements

Before running Locus, make sure you have the following installed:

#### Required Software

| Software | Version | Download Link | Purpose |
|----------|---------|---------------|---------|
| **Node.js** | 18.0+ (LTS recommended) | [nodejs.org](https://nodejs.org/) | JavaScript runtime |
| **npm** | 9.0+ (comes with Node.js) | Included with Node.js | Package manager |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) | Version control |

#### Required API Keys

| Service | Purpose | Get Key From |
|---------|---------|--------------|
| **Google Gemini API** | AI chatbot & smart search | [Google AI Studio](https://aistudio.google.com/app/apikey) |

#### Frontend Dependencies (auto-installed via npm)

| Package | Version | Purpose |
|---------|---------|---------|
| React | ^19.2.0 | UI framework |
| React DOM | ^19.2.0 | React DOM rendering |
| React Router DOM | ^7.11.0 | Client-side routing |
| Lucide React | ^0.562.0 | Icon library |
| Tailwind CSS | ^4.1.18 | Utility-first CSS framework |
| Vite | ^7.2.4 | Build tool & dev server |
| ESLint | ^9.39.1 | Code linting |

#### Backend Dependencies (auto-installed via npm)

| Package | Version | Purpose |
|---------|---------|---------|
| Express | ^4.21.0 | Web server framework |
| Prisma Client | ^5.22.0 | Database ORM |
| @google/generative-ai | ^0.24.1 | Google Gemini AI SDK |
| bcryptjs | ^2.4.3 | Password hashing |
| jsonwebtoken | ^9.0.2 | JWT authentication |
| cors | ^2.8.5 | Cross-origin requests |
| dotenv | ^16.4.5 | Environment variables |
| multer | ^1.4.5-lts.1 | File upload handling |
| express-validator | ^7.2.0 | Request validation |
| uuid | ^10.0.0 | Unique ID generation |

#### Development Dependencies

| Package | Purpose |
|---------|---------|
| Prisma CLI | Database migrations & studio |
| Nodemon | Auto-restart server on changes |

#### Optional but Recommended

| Tool | Purpose | Download |
|------|---------|----------|
| **VS Code** | Code editor | [code.visualstudio.com](https://code.visualstudio.com/) |
| **Postman** | API testing | [postman.com](https://www.postman.com/downloads/) |
| **Prisma Studio** | Database GUI (included) | Run `npm run db:studio` |

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/locus.git
   cd locus/rent-finder
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Set up environment variables**
   ```bash
   # In the server folder, copy the example env file
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-secret-key"
   GEMINI_API_KEY="your-gemini-api-key"  # Get from https://aistudio.google.com/app/apikey
   ```

5. **Initialize the database**
   ```bash
   # In the server folder
   npm run db:push
   npm run db:seed  # Optional: seed with sample data
   ```

6. **Start the development servers**

   Terminal 1 - Backend:
   ```bash
   cd server
   cd src
   node index.js
   ```

   Terminal 2 - Frontend:
   ```bash
   # In rent-finder folder
   npm run dev
   ```

7. **Open the app**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 📁 Project Structure

```
rent-finder/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   │   ├── Chatbot.jsx     # AI assistant chatbot
│   │   ├── Header.jsx      # Navigation header
│   │   ├── PropertyCard.jsx
│   │   ├── SmartMatchSearch.jsx
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── HomePage.jsx
│   │   ├── SearchPage.jsx
│   │   ├── PropertyDetailPage.jsx
│   │   ├── ListPropertyPage.jsx
│   │   └── ...
│   ├── context/            # React context providers
│   ├── services/           # API client services
│   └── main.jsx            # App entry point
│
├── server/                 # Backend Express API
│   ├── src/
│   │   ├── index.js        # Server entry point
│   │   ├── routes/         # API route handlers
│   │   │   ├── auth.js
│   │   │   ├── properties.js
│   │   │   ├── chatbot.js
│   │   │   └── ...
│   │   └── middleware/     # Express middleware
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.js         # Database seeder
│   └── uploads/            # Uploaded images
│
└── public/                 # Static assets
```

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **React Router 7** - Client-side routing
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icons
- **Vite 7** - Build tool

### Backend
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **SQLite** - Database (easily switch to PostgreSQL)
- **JWT** - Authentication
- **Google Gemini** - AI chatbot
- **Multer** - File uploads

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Get current user

### Properties
- `GET /api/properties` - List properties (with filters)
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create listing (auth required)
- `PUT /api/properties/:id` - Update listing (auth required)
- `DELETE /api/properties/:id` - Delete listing (auth required)

### Other
- `POST /api/chatbot` - AI chatbot endpoint
- `POST /api/upload` - Image upload
- `GET /api/messages` - User messages

## 🎨 Design System

The platform uses a Nepali-inspired color palette:

| Color | Hex | Usage |
|-------|-----|-------|
| Primary (Maroon) | `#8B0000` | Headers, buttons, accents |
| Gold | `#D4AF37` | Highlights, borders |
| Cream | `#FDF5E6` | Backgrounds |
| Saffron | `#FF9933` | Accents, icons |
| Brown | `#CD853F` | Secondary text |

## 🤖 AI Features

### Smart Match Search
Natural language property search - just describe what you're looking for:
> "3 bedroom apartment in Kathmandu under 50,000 NPR"

### Locus Assistant (Chatbot)
AI-powered assistant that can:
- Help find properties
- Explain the listing process
- Answer questions about Nepal real estate
- Guide users through the platform

## 📝 Scripts

### Frontend
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Backend
```bash
npm run dev        # Start with nodemon
npm start          # Production start
npm run db:push    # Push schema to database
npm run db:studio  # Open Prisma Studio
npm run db:seed    # Seed database
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  Made with ❤️ for Nepal 🇳🇵
</p>
