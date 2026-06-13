const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get allowed contacts for the current user based on role matrix
exports.getContacts = async (req, res, next) => {
  try {
    const { id, role } = req.user;
    
    let allowedRoles = [];
    if (role === 'admin') {
      allowedRoles = ['incident_manager', 'risk_analyst'];
    } else if (role === 'incident_manager' || role === 'risk_analyst') {
      allowedRoles = ['admin'];
    } else {
      // Other roles have no chat access in this implementation
      return res.json({ data: [] });
    }

    // Fetch users with allowed roles
    const contacts = await prisma.user.findMany({
      where: {
        role: { in: allowedRoles },
        isActive: true,
        id: { not: id } // Exclude self
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    // For each contact, count unread messages sent by them to the current user
    const contactsWithUnread = await Promise.all(
      contacts.map(async (contact) => {
        const unreadCount = await prisma.chatMessage.count({
          where: {
            senderId: contact.id,
            receiverId: id,
            isRead: false
          }
        });
        return { ...contact, unreadCount };
      })
    );

    res.json({ data: contactsWithUnread });
  } catch (err) {
    next(err);
  }
};

// Get chat history with a specific user
exports.getMessages = async (req, res, next) => {
  try {
    const { id } = req.user;
    const contactId = parseInt(req.params.contactId);

    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: id, receiverId: contactId },
          { senderId: contactId, receiverId: id }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ data: messages });
  } catch (err) {
    next(err);
  }
};

// Send a new message
exports.sendMessage = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ error: 'Receiver ID and content are required' });
    }

    // Basic validation to ensure the user is not messaging themselves
    if (id === parseInt(receiverId)) {
      return res.status(400).json({ error: 'Cannot send message to yourself' });
    }

    const message = await prisma.chatMessage.create({
      data: {
        senderId: id,
        receiverId: parseInt(receiverId),
        content: content
      }
    });

    res.status(201).json({ data: message });
  } catch (err) {
    next(err);
  }
};

// Mark messages from a specific sender as read
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.user;
    const senderId = parseInt(req.params.senderId);

    await prisma.chatMessage.updateMany({
      where: {
        senderId: senderId,
        receiverId: id,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    next(err);
  }
};
