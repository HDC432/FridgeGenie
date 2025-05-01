# FridgeGenie 

FridgeGenie is an intelligent refrigerator management system that helps users track food items, manage expiration dates, and make informed decisions about their meals and shopping habits. The application leverages AI to provide personalized recipe suggestions, nutritional analysis, and shopping recommendations based on user preferences and dietary habits.

## Features

- **Smart Food Tracking**: Monitor items in your refrigerator with expiration date alerts
- **AI-Powered Recipe Generation**: Get recipe suggestions based on available ingredients
- **Nutritional Analysis**: Track calories and nutritional content of your meals
- **Personalized Shopping Recommendations**: Receive smart shopping suggestions based on your eating habits
- **Waste Reduction**: Minimize food waste through intelligent tracking and suggestions
- **Accessible Nutrition**: Make professional nutrition guidance available to everyone

## Table of Contents

- [Installation](#installation)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [AI Features](#ai-features)
- [API Documentation](#api-documentation)

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/HDC432/FridgeGenie.git
cd FridgeGenie
```

2. Install server dependencies:
```bash
cd server
npm install
npm run dev
```

3. Install client dependencies:
```bash
cd ../client
npm install
npm start
```

4. Running the application:
   - Scan the QR code with Expo Go app on your mobile device
   - Or access the web version at http://localhost:8081
   - For iOS simulator: Press 'i' in the terminal
   - For Android emulator: Press 'a' in the terminal

## Project Structure

```
FridgeGenie/
client/
├── assets/
├── components/
│   ├── ItemList.js
│   ├── UserAvatar.js
│   └── UserMenu.js
├── config/
├── contexts/
├── navigation/
├── node_modules/
├── screens/
│   ├── AddItemScreen.js
│   ├── FamilyScreen.js
│   ├── FavoriteRecipesScreen.js
│   ├── HealthEditScreen.js
│   ├── HealthProfileScreen.js
│   ├── ItemDetailsScreen.js
│   ├── LoginScreen.js
│   ├── RecipeScreen.js
│   ├── RecommendedItemsScreen.js
│   ├── RegisterScreen.js
│   └── UserProfileScreen.js
├── scripts/
├── services/
│   ├── aiService.js
│   ├── authService.js
│   └── databaseService.js
└── src/                        ← AI Assistant core
│   ├── components/             ← UI pieces for chat & voice
│   │   └── AIAssistant.js      ← main assistant widget    
│   ├── contexts/               ← global state & hooks
│   │   └── AuthContext.js  
│   ├── services/               ← thin wrappers over aiService/ 
│   └── utils/                  ← date parsing, prompt formatting
│       └── avatarUtils.js
│
└── server/                     ← Node.js backend
    ├── models/                 ← Database models
    ├── controllers/            ← Business logic
    ├── routes/                 ← API routes
    └── services/               ← External services

```

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Azure Cosmos DB
- **Authentication**: JWT, bcryptjs
- **API**: RESTful architecture

### Frontend
- **Framework**: React Native
- **Navigation**: React Navigation
- **State Management**: React Context API
- **UI Components**: Custom components with React Native

## Security Features

- JWT-based authentication
- Password encryption using bcryptjs
- Protected routes
- Secure API endpoints
- Data validation and sanitization

## API Documentation

### Authentication Endpoints

#### POST /users/register
Register a new user
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

#### POST /users/login
Login user
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### GET /users/me
Get current user information (requires authentication)

### Food Management Endpoints

#### GET /items
Get all food items

#### GET /items/family/:familyId
Get all food items for a specific family

#### GET /items/name/:name
Get item by name

#### GET /items/:id
Get single item by ID

#### POST /items
Add new food item
```json
{
  "name": "Milk",
  "quantity": 1,
  "familyId": "family123"
}
```

#### PUT /items/name/:name
Update item by name
```json
{
  "quantity": 2
}
```

#### PUT /items/:id
Update item by ID

#### DELETE /items/name/:name
Delete item by name

#### DELETE /items/:id
Delete item by ID

### Family Management Endpoints

#### POST /family
Create a new family (requires authentication)

#### GET /family
Get family information (requires authentication)

#### PUT /family/:familyId/members/:userId/role
Update member role (requires authentication)

#### DELETE /family/:familyId/leave
Leave family (requires authentication)

### Health Profile Endpoints

#### GET /health/profile
Get user's health profile (requires authentication)

#### PUT /health/profile
Update user's health profile (requires authentication)

### Recipe Endpoints

#### GET /favorites
Get user's favorite recipes (requires authentication)

#### POST /favorites
Add recipe to favorites (requires authentication)

#### DELETE /favorites/:favoriteId
Remove recipe from favorites (requires authentication)

#### GET /favorites/:recipeId/check
Check if recipe is favorited (requires authentication)

## AI Features

FridgeGenie leverages advanced AI capabilities to provide an intelligent and personalized experience:

### 1. AI Assistant
- Natural language interface for managing your fridge inventory
- Voice and text-based commands for adding, removing, and updating food items
- Smart search and filtering capabilities
- Conversational interface for easy interaction

### 2. Recipe Generation
- AI-powered recipe suggestions based on available ingredients
- Personalized recommendations considering:
  - User's dietary preferences
  - Food expiration dates
  - Nutritional requirements
  - Cooking skill level
- Recipe adaptation based on available ingredients

### 3. Nutritional Analysis
- Detailed breakdown of nutritional content for meals
- Calorie tracking and monitoring
- Macro and micronutrient analysis
- Dietary restriction compliance checking
- Personalized nutritional insights

### 4. Smart Shopping Recommendations
- AI-driven shopping list generation
- Personalized recommendations based on:
  - User's eating habits
  - Nutritional goals
  - Budget constraints
  - Seasonal availability
- Smart inventory management to prevent over-purchasing