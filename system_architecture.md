# HiveMind Web Application - System Architecture Design

## 1. Overall Architecture

The HiveMind web application will follow the Model-View-Controller (MVC) architectural pattern to ensure separation of concerns and maintainability. The system will be built using the following technologies:

- **Frontend**: HTML5, CSS3 (vanilla), JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js with passport-local-mongoose strategy
- **Session Management**: Express-session
- **Security**: Bcrypt for password hashing

## 2. System Components

### 2.1 Database Layer (Model)

#### User Schema
```javascript
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // Email address
  password: String, // Handled by passport-local-mongoose
  forename: { type: String, required: true },
  surname: { type: String, required: true },
  address: { type: String, required: true },
  category: { type: String, enum: ['support', 'observer'], required: true },
  accountStatus: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  // Observer-specific fields (only populated for observers)
  accountBalance: { type: Number, default: 0 },
  cardNumberHash: String, // First 12 digits hashed
  cardNumberLast4: String, // Last 4 digits in clear text
  cardName: String,
  cardType: { type: String, enum: ['Visa', 'Mastercard'] },
  cardCVVHash: String, // Hashed CVV
  notificationPreference: { type: String, enum: ['text', 'email'] }
});
```

#### Observation Schema
```javascript
const ObservationSchema = new mongoose.Schema({
  observer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // ISO 8601 - YYYYMMDD
  time: { type: String, required: true }, // ISO 8601 - hh:mm:ss
  timeZoneOffset: { type: String, required: true }, // ISO 8601 e.g. UTC-10:00
  coordinates: {
    w3w: { type: String, required: true },
    decimalDegrees: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    }
  },
  freeSpacePathLoss: { type: Number, required: true },
  bitErrorRate: { type: Number, required: true },
  temperature: { type: Number, required: true }, // celsius
  humidity: { type: Number, required: true }, // g/kg
  snowfall: { type: Number, required: true }, // cm
  windSpeed: { type: Number, required: true }, // km/h
  windDirection: { type: Number, required: true }, // decimal degrees
  precipitation: { type: Number, required: true }, // mm
  haze: { type: Number, required: true }, // %
  notes: { type: String }
});
```

#### Message Schema
```javascript
const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});
```

### 2.2 Server-Side Business Logic (Controller)

#### Authentication Controller
- User registration
- User login
- User logout
- Password reset

#### User Management Controller
- View user profile
- Update user profile
- Change password
- Manage account status (for support users)

#### Observer Controller
- Submit observation data
- View past observations
- Update account details

#### Support Controller
- View observer accounts
- Update observer account status
- Register new support personnel

#### Messaging Controller
- Send messages
- View received messages
- Reply to messages
- Mark messages as read

### 2.3 Client-Side Interface (View)

#### Public Pages
- Home page
- Registration page
- Login page

#### Observer Pages
- Observer dashboard
- Submit observation form
- Account management
- Messaging interface

#### Support Pages
- Support dashboard
- User management interface
- Observer account management
- Support messaging interface

## 3. API Endpoints

### Authentication Endpoints
- `GET /register` - Serve registration page
- `POST /register` - Register new user
- `GET /login` - Serve login page
- `POST /login` - Authenticate user
- `GET /logout` - Log out user

### User Management Endpoints
- `GET /account` - View account details
- `POST /account` - Update account details
- `GET /account/password` - Change password form
- `POST /account/password` - Update password

### Observer Endpoints
- `GET /observation/new` - New observation form
- `POST /observation/new` - Submit new observation
- `GET /observation/history` - View observation history

### Support Endpoints
- `GET /admin/users` - View all users
- `GET /admin/users/:id` - View specific user
- `POST /admin/users/:id` - Update user status
- `GET /admin/support/new` - New support user form
- `POST /admin/support/new` - Create new support user

### Messaging Endpoints
- `GET /messages` - View all messages
- `GET /messages/new` - New message form
- `POST /messages/new` - Send new message
- `GET /messages/:id` - View specific message
- `POST /messages/:id/reply` - Reply to message

## 4. Security Measures

### Authentication Security
- Passwords will be hashed using bcrypt with salt rounds of 10
- Session-based authentication using express-session
- Protected routes with middleware checks

### Data Security
- Credit card numbers: First 12 digits hashed, last 4 digits stored in clear text
- CVV: Fully hashed
- HTTPS for all communications (in production)
- Input validation on both client and server side

## 5. Project Directory Structure

```
hivemind-app/
├── config/
│   ├── dbconfig.js         # Database connection configuration
│   └── passport.js         # Passport authentication configuration
├── models/
│   ├── user.js             # User model
│   ├── observation.js      # Observation model
│   └── message.js          # Message model
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── user.js             # User management routes
│   ├── observer.js         # Observer-specific routes
│   ├── support.js          # Support-specific routes
│   └── message.js          # Messaging routes
├── public/
│   ├── css/
│   │   └── styles.css      # Main stylesheet
│   ├── js/
│   │   ├── validation.js   # Client-side validation
│   │   └── main.js         # Main JavaScript file
│   └── html/               # Static HTML files if needed
├── views/                  # HTML templates
│   ├── partials/           # Reusable components
│   │   ├── header.html
│   │   ├── footer.html
│   │   └── navbar.html
│   ├── auth/               # Authentication pages
│   ├── user/               # User management pages
│   ├── observer/           # Observer pages
│   └── support/            # Support pages
├── middleware/             # Custom middleware
│   ├── auth.js             # Authentication middleware
│   └── validation.js       # Input validation middleware
├── utils/                  # Utility functions
│   ├── hashing.js          # Functions for hashing sensitive data
│   └── validation.js       # Validation helper functions
├── app.js                  # Main application file
└── package.json            # Project dependencies
```

## 6. Data Flow

1. **User Registration**:
   - User submits registration form
   - Server validates input
   - Password is hashed
   - User is saved to database
   - User is authenticated and redirected to dashboard

2. **User Login**:
   - User submits login form
   - Server authenticates credentials
   - Session is created
   - User is redirected to dashboard

3. **Observation Submission**:
   - Observer fills observation form
   - Client-side validation
   - Data sent to server
   - Server-side validation
   - Data saved to database
   - Confirmation shown to user

4. **Support User Management**:
   - Support user views list of observers
   - Support user selects observer to manage
   - Support user updates observer status
   - Changes saved to database
   - Confirmation shown to support user

5. **Messaging**:
   - User composes message
   - Message sent to server
   - Server saves message to database
   - Recipient can view message in their inbox
   - Recipient can reply to message

This architecture design provides a comprehensive blueprint for implementing the HiveMind web application according to the requirements specified in the assignment.
