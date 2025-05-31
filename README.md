# HiveMind
The application serves as a platform for registered contributors ("Observers") to submit observation data that helps improve HiveMind's satellite internet constellation
# HiveMind Web Application - Project Documentation

## 1. Project Overview

The HiveMind web application is a system developed for HiveMind charity to support their mission of enhancing collective knowledge by ensuring free and universal internet access worldwide. The application serves as a platform for registered contributors ("Observers") to submit observation data that helps improve HiveMind's satellite internet constellation.

The system includes:
- A client-side interface built with HTML5, CSS3, and JavaScript
- A server-side business logic layer using Node.js and Express
- A persistence layer using MongoDB with Mongoose ODM

## 2. System Architecture

### 2.1 Overall Architecture

The application follows the Model-View-Controller (MVC) architectural pattern:

- **Model**: MongoDB database with Mongoose schemas for Users, Observations, and Messages
- **View**: EJS templates for rendering HTML views
- **Controller**: Express.js route handlers for processing requests and responses

### 2.2 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript, EJS templates
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js with passport-local-mongoose strategy
- **Security**: Bcrypt for password and sensitive data hashing

### 2.3 Database Schema

#### User Model
```javascript
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // Email address
  forename: { type: String, required: true },
  surname: { type: String, required: true },
  address: { type: String, required: true },
  category: { type: String, enum: ['support', 'observer'], required: true },
  accountStatus: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  // Observer-specific fields
  accountBalance: { type: Number, default: 0 },
  cardNumberHash: String, // First 12 digits hashed
  cardNumberLast4: String, // Last 4 digits in clear text
  cardName: String,
  cardType: { type: String, enum: ['Visa', 'Mastercard'] },
  cardCVVHash: String, // Hashed CVV
  notificationPreference: { type: String, enum: ['text', 'email'] }
});
```

#### Observation Model
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
}, { timestamps: true });
```

#### Message Model
```javascript
const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
}, { timestamps: true });
```

## 3. Features and Functionality

### 3.1 User Management

#### Observer Features
- Register for an account
- Login to account
- View and amend account details
- Message support personnel
- Submit observation data
- View observation history

#### Support Features
- Login to account
- Register new support personnel
- View and amend client's account details
- Message observers and other support personnel
- Disable observers who do not adhere to terms of service

### 3.2 Authentication and Security

- Password hashing using bcrypt
- Credit card information security (first 12 digits hashed, last 4 visible)
- CVV security (fully hashed)
- Session-based authentication
- Role-based access control

### 3.3 Observation Data Collection

The system collects the following data for each observation:
- Date (ISO 8601 - YYYYMMDD)
- Time (ISO 8601 - hh:mm:ss)
- Time zone offset (ISO 8601 e.g. UTC-10:00)
- Coordinates (W3W and decimal degrees)
- Free Space Path Loss
- Bit Error Rate (BER)
- Temperature (celsius)
- Humidity (g/kg)
- Snowfall (cm)
- Wind speed (km/h)
- Wind direction (decimal degrees)
- Precipitation (mm)
- Haze (%)
- Notes

### 3.4 Messaging System

- Send messages between users
- View received messages
- Reply to messages
- Mark messages as read

## 4. Implementation Details

### 4.1 Project Structure

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
│   │   └── validation.js   # Client-side validation
│   └── html/               # Static HTML files
├── views/
│   ├── index.ejs           # Home page
│   ├── auth/               # Authentication pages
│   ├── user/               # User management pages
│   ├── observer/           # Observer pages
│   ├── support/            # Support pages
│   └── messages/           # Messaging pages
├── middleware/
│   └── auth.js             # Authentication middleware
├── utils/
│   ├── hashing.js          # Functions for hashing sensitive data
│   └── validation.js       # Validation helper functions
├── test/                   # Test files
├── app.js                  # Main application file
└── package.json            # Project dependencies
```

### 4.2 Key Implementation Aspects

#### Authentication System
The application uses Passport.js with the passport-local-mongoose strategy for authentication. This provides:
- Secure user registration and login
- Password hashing and salting
- Session management
- Serialization and deserialization of user data

#### Security Measures
- Passwords are hashed using bcrypt with a salt factor of 10
- Credit card numbers have the first 12 digits hashed and only the last 4 digits stored in clear text
- CVV numbers are fully hashed
- Input validation is performed on both client and server sides
- Role-based access control prevents unauthorized access to protected routes

#### Responsive Design
The application uses a responsive design approach with:
- Fluid layouts that adapt to different screen sizes
- Media queries to adjust styling for different devices
- Flexible images and media
- Touch-friendly interface elements

## 5. Testing

### 5.1 Testing Approach

The application was tested using a comprehensive approach that included:
- Unit testing of individual components
- Component testing of route handlers
- Integration testing of complete workflows
- Security testing
- User interface testing

### 5.2 Testing Tools

- Mocha: JavaScript test framework
- Chai: Assertion library
- Chai-HTTP: HTTP integration testing

### 5.3 Test Results

All critical functionality has been tested and verified to be working as expected. For detailed test results, please refer to the test_results.md document.

## 6. Deployment Instructions

### 6.1 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- npm (v6 or higher)

### 6.2 Installation Steps

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure the database connection in config/dbconfig.js
4. Start the application:
   ```
   node app.js
   ```
5. Access the application at http://localhost:3000

## 7. Future Enhancements

Potential future enhancements for the HiveMind application include:
- Real-time messaging using WebSockets
- Advanced data visualization for observations
- Mobile application for field observations
- Integration with external weather APIs for data validation
- Advanced analytics dashboard for support personnel

## 8. Conclusion

The HiveMind web application provides a robust platform for collecting observation data to support HiveMind's mission of providing universal internet access. The application meets all the requirements specified in the assignment, including:
- Two user categories with appropriate permissions
- Secure handling of user data
- Proper data collection for observations
- Responsive design for consistent user experience across devices

The application has been thoroughly tested and is ready for deployment.

## 9. References

- Node.js Documentation: https://nodejs.org/en/docs/
- Express.js Documentation: https://expressjs.com/
- MongoDB Documentation: https://docs.mongodb.com/
- Mongoose Documentation: https://mongoosejs.com/docs/
- Passport.js Documentation: http://www.passportjs.org/docs/
