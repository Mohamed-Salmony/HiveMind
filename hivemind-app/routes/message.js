const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const User = require('../models/user');

// Authentication middleware
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// Messages inbox - GET
router.get('/', isLoggedIn, async (req, res) => {
  try {
    // Get all messages for the current user
    const messages = await Message.find({ recipient: req.user._id })
      .sort({ timestamp: -1 })
      .populate('sender', 'username forename surname category');
    
    res.render('messages/inbox', { 
      user: req.user, 
      messages: messages 
    });
  } catch (error) {
    console.error(error);
    res.render('messages/inbox', { 
      user: req.user, 
      messages: [],
      error: 'Failed to load messages.'
    });
  }
});

// Sent messages - GET
router.get('/sent', isLoggedIn, async (req, res) => {
  try {
    // Get all messages sent by the current user
    const messages = await Message.find({ sender: req.user._id })
      .sort({ timestamp: -1 })
      .populate('recipient', 'username forename surname category');
    
    res.render('messages/sent', { 
      user: req.user, 
      messages: messages 
    });
  } catch (error) {
    console.error(error);
    res.render('messages/sent', { 
      user: req.user, 
      messages: [],
      error: 'Failed to load sent messages.'
    });
  }
});

// New message form - GET
router.get('/new', isLoggedIn, async (req, res) => {
  try {
    let recipients = [];
    
    // If user is observer, they can only message support personnel
    if (req.user.category === 'observer') {
      recipients = await User.find({ category: 'support' })
        .sort({ surname: 1, forename: 1 });
    } 
    // If user is support, they can message observers and other support personnel
    else if (req.user.category === 'support') {
      recipients = await User.find({ _id: { $ne: req.user._id } })
        .sort({ category: 1, surname: 1, forename: 1 });
    }
    
    res.render('messages/new', { 
      user: req.user, 
      recipients: recipients,
      recipientId: req.query.to || '' // Pre-select recipient if provided in query
    });
  } catch (error) {
    console.error(error);
    res.render('messages/new', { 
      user: req.user, 
      recipients: [],
      error: 'Failed to load recipients.'
    });
  }
});

// Send new message - POST
router.post('/new', isLoggedIn, async (req, res) => {
  try {
    const { recipient, subject, content } = req.body;
    
    // Create new message
    const newMessage = new Message({
      sender: req.user._id,
      recipient,
      subject,
      content
    });
    
    await newMessage.save();
    res.redirect('/messages');
  } catch (error) {
    console.error(error);
    res.redirect('/messages/new');
  }
});

// View specific message - GET
router.get('/:id', isLoggedIn, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'username forename surname category')
      .populate('recipient', 'username forename surname category');
    
    // Check if message exists and user is either sender or recipient
    if (!message || 
        (message.sender._id.toString() !== req.user._id.toString() && 
         message.recipient._id.toString() !== req.user._id.toString())) {
      return res.redirect('/messages');
    }
    
    // If user is recipient, mark message as read
    if (message.recipient._id.toString() === req.user._id.toString() && !message.read) {
      message.read = true;
      await message.save();
    }
    
    res.render('messages/view', { 
      user: req.user, 
      message: message 
    });
  } catch (error) {
    console.error(error);
    res.redirect('/messages');
  }
});

// Reply to message - GET
router.get('/:id/reply', isLoggedIn, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'username forename surname _id');
    
    // Check if message exists and user is the recipient
    if (!message || message.recipient.toString() !== req.user._id.toString()) {
      return res.redirect('/messages');
    }
    
    res.render('messages/reply', { 
      user: req.user, 
      originalMessage: message 
    });
  } catch (error) {
    console.error(error);
    res.redirect('/messages');
  }
});

// Send reply - POST
router.post('/:id/reply', isLoggedIn, async (req, res) => {
  try {
    const originalMessage = await Message.findById(req.params.id);
    
    // Check if message exists and user is the recipient
    if (!originalMessage || originalMessage.recipient.toString() !== req.user._id.toString()) {
      return res.redirect('/messages');
    }
    
    const { subject, content } = req.body;
    
    // Create new reply message
    const replyMessage = new Message({
      sender: req.user._id,
      recipient: originalMessage.sender,
      subject: subject || `Re: ${originalMessage.subject}`,
      content
    });
    
    await replyMessage.save();
    res.redirect('/messages');
  } catch (error) {
    console.error(error);
    res.redirect('/messages');
  }
});

module.exports = router;
