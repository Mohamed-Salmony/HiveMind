const mongoose = require('mongoose');

// MongoDB connection string 
const mongoDB = 'mongodb+srv://mohamedsamysalmony:ndjmC973lWYwCtu8@cluster0.ckwgalz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB
mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected successfully to MongoDB!');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Export mongoose connection
module.exports = mongoose;
