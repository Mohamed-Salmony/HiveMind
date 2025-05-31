const { expect } = require('chai');
const mongoose = require('mongoose');
const Message = require('../models/message');
const User = require('../models/user');

describe('Message Model Tests', function() {
  let testSender;
  let testRecipient;

  // Connect to test database before running tests
  before(async function() {
    // Use a test database
    await mongoose.connect('mongodb://localhost:27017/hivemind_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Create test users for messaging
    testSender = new User({
      username: 'sender@example.com',
      forename: 'Sender',
      surname: 'User',
      address: '123 Sender Street',
      category: 'observer'
    });
    
    testRecipient = new User({
      username: 'recipient@example.com',
      forename: 'Recipient',
      surname: 'User',
      address: '456 Recipient Street',
      category: 'support'
    });
    
    await testSender.save();
    await testRecipient.save();
  });

  // Clear messages collection before each test
  beforeEach(async function() {
    await Message.deleteMany({});
  });

  // Disconnect after tests
  after(async function() {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  // Test message creation with valid data
  it('should create a new message with valid data', async function() {
    const messageData = {
      sender: testSender._id,
      recipient: testRecipient._id,
      subject: 'Test Subject',
      content: 'This is a test message content.',
      timestamp: new Date(),
      read: false
    };

    const message = new Message(messageData);
    const savedMessage = await message.save();

    expect(savedMessage).to.have.property('_id');
    expect(savedMessage.sender.toString()).to.equal(testSender._id.toString());
    expect(savedMessage.recipient.toString()).to.equal(testRecipient._id.toString());
    expect(savedMessage.subject).to.equal(messageData.subject);
    expect(savedMessage.content).to.equal(messageData.content);
    expect(savedMessage.read).to.equal(false);
  });

  // Test message creation with invalid data
  it('should fail to create a message with invalid data', async function() {
    const invalidMessage = new Message({
      // Missing required fields
      sender: testSender._id,
      // Missing recipient
      subject: 'Test Subject'
      // Missing content
    });

    try {
      await invalidMessage.save();
      // If save succeeds, fail the test
      expect.fail('Message should not be saved with invalid data');
    } catch (error) {
      expect(error).to.exist;
      expect(error).to.be.an.instanceOf(mongoose.Error.ValidationError);
    }
  });

  // Test relationship with User model
  it('should correctly associate message with sender and recipient', async function() {
    const message = new Message({
      sender: testSender._id,
      recipient: testRecipient._id,
      subject: 'Test Subject',
      content: 'This is a test message content.'
    });

    await message.save();

    // Find the message and populate the sender and recipient fields
    const foundMessage = await Message.findById(message._id)
      .populate('sender')
      .populate('recipient');
    
    expect(foundMessage.sender).to.exist;
    expect(foundMessage.recipient).to.exist;
    expect(foundMessage.sender._id.toString()).to.equal(testSender._id.toString());
    expect(foundMessage.recipient._id.toString()).to.equal(testRecipient._id.toString());
    expect(foundMessage.sender.username).to.equal(testSender.username);
    expect(foundMessage.recipient.username).to.equal(testRecipient.username);
  });

  // Test marking message as read
  it('should mark a message as read', async function() {
    const message = new Message({
      sender: testSender._id,
      recipient: testRecipient._id,
      subject: 'Test Subject',
      content: 'This is a test message content.',
      read: false
    });

    await message.save();
    
    // Initially the message should be unread
    expect(message.read).to.be.false;
    
    // Mark as read
    message.read = true;
    await message.save();
    
    // Find the message again to verify it was updated
    const updatedMessage = await Message.findById(message._id);
    expect(updatedMessage.read).to.be.true;
  });

  // Test finding messages by sender
  it('should find all messages from a specific sender', async function() {
    // Create multiple messages from the same sender
    const messages = [
      {
        sender: testSender._id,
        recipient: testRecipient._id,
        subject: 'Message 1',
        content: 'Content of message 1'
      },
      {
        sender: testSender._id,
        recipient: testRecipient._id,
        subject: 'Message 2',
        content: 'Content of message 2'
      },
      {
        sender: testRecipient._id, // Different sender
        recipient: testSender._id,
        subject: 'Message 3',
        content: 'Content of message 3'
      }
    ];

    await Message.insertMany(messages);

    // Find messages from testSender
    const senderMessages = await Message.find({ sender: testSender._id });
    expect(senderMessages).to.have.lengthOf(2);
    
    // Find messages from testRecipient
    const recipientMessages = await Message.find({ sender: testRecipient._id });
    expect(recipientMessages).to.have.lengthOf(1);
  });

  // Test finding messages by recipient
  it('should find all messages for a specific recipient', async function() {
    // Create multiple messages to the same recipient
    const messages = [
      {
        sender: testSender._id,
        recipient: testRecipient._id,
        subject: 'Message 1',
        content: 'Content of message 1'
      },
      {
        sender: testSender._id,
        recipient: testRecipient._id,
        subject: 'Message 2',
        content: 'Content of message 2'
      },
      {
        sender: testRecipient._id,
        recipient: testSender._id, // Different recipient
        subject: 'Message 3',
        content: 'Content of message 3'
      }
    ];

    await Message.insertMany(messages);

    // Find messages to testRecipient
    const messagesToRecipient = await Message.find({ recipient: testRecipient._id });
    expect(messagesToRecipient).to.have.lengthOf(2);
    
    // Find messages to testSender
    const messagesToSender = await Message.find({ recipient: testSender._id });
    expect(messagesToSender).to.have.lengthOf(1);
  });
});
