import Announcement from '../models/Announcement.js';

// Get all announcements (HR sees all, employees see published)
export const getAllAnnouncements = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    
    // If user is not HR, only show published announcements
    if (req.user?.role !== 'hr') {
      filter.status = 'Published';
      const now = new Date();
      filter.expiryDate = { $gte: now };
    } else if (status) {
      // HR can filter by status
      filter.status = status;
    }

    const announcements = await Announcement.find(filter)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    console.log('✅ Fetched announcements for role:', req.user?.role, 'Count:', announcements.length);
    res.json(announcements);
  } catch (error) {
    console.error('❌ Error fetching announcements:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get published announcements (Employees)
export const getPublishedAnnouncements = async (req, res) => {
  try {
    const now = new Date();
    const announcements = await Announcement.find({
      status: 'Published',
      expiryDate: { $gte: now }
    })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    console.log('✅ Fetched published announcements:', announcements.length);
    res.json(announcements);
  } catch (error) {
    console.error('❌ Error fetching published announcements:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get single announcement
export const getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'name email role');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    console.log('✅ Fetched announcement:', announcement.title);
    res.json(announcement);
  } catch (error) {
    console.error('❌ Error fetching announcement:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create announcement (HR only)
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, audience, expiryDate, status, priority } = req.body;
    const userId = req.user.id;
    const userName = req.user.name || 'HR User';

    if (!title || !content || !expiryDate) {
      return res.status(400).json({ message: 'Title, content, and expiry date are required' });
    }

    const announcement = new Announcement({
      title,
      content,
      audience: audience || 'All Employees',
      expiryDate,
      status: status || 'Draft',
      priority: priority || 'Medium',
      createdBy: userId,
      createdByName: userName
    });

    await announcement.save();
    console.log('✅ Announcement created:', announcement.title);
    res.status(201).json(announcement);
  } catch (error) {
    console.error('❌ Error creating announcement:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update announcement (HR only)
export const updateAnnouncement = async (req, res) => {
  try {
    const { title, content, audience, expiryDate, status, priority } = req.body;

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    if (title) announcement.title = title;
    if (content) announcement.content = content;
    if (audience) announcement.audience = audience;
    if (expiryDate) announcement.expiryDate = expiryDate;
    if (status) announcement.status = status;
    if (priority) announcement.priority = priority;

    await announcement.save();
    console.log('✅ Announcement updated:', announcement.title);
    res.json(announcement);
  } catch (error) {
    console.error('❌ Error updating announcement:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete announcement (HR only)
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    console.log('✅ Announcement deleted:', announcement.title);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting announcement:', error);
    res.status(500).json({ message: error.message });
  }
};

// Publish announcement (HR only)
export const publishAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    announcement.status = 'Published';
    await announcement.save();

    console.log('✅ Announcement published:', announcement.title);
    res.json(announcement);
  } catch (error) {
    console.error('❌ Error publishing announcement:', error);
    res.status(500).json({ message: error.message });
  }
};
