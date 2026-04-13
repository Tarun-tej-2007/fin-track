const Class = require('../models/Class');

const toMinutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const detectConflict = async (userId, day, startTime, endTime, excludeId = null) => {
  const query = { userId, day };
  if (excludeId) query._id = { $ne: excludeId };

  const existing = await Class.find(query);
  const newStart = toMinutes(startTime);
  const newEnd = toMinutes(endTime);

  return existing.find((cls) => {
    const s = toMinutes(cls.startTime);
    const e = toMinutes(cls.endTime);
    return newStart < e && newEnd > s;
  });
};

// @desc    Get all classes for user
// @route   GET /api/classes
const getClasses = async (req, res) => {
  try {
    const classes = await Class.find({ userId: req.user._id }).sort({ day: 1, startTime: 1 });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch classes' });
  }
};

// @desc    Create a class
// @route   POST /api/classes
const createClass = async (req, res) => {
  try {
    const { subject, instructor, day, startTime, endTime, color } = req.body;

    if (!subject || !instructor || !day || !startTime || !endTime) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const conflict = await detectConflict(req.user._id, day, startTime, endTime);
    if (conflict) {
      return res.status(400).json({
        message: `Time conflict with "${conflict.subject}" (${conflict.startTime} - ${conflict.endTime})`,
      });
    }

    const newClass = await Class.create({
      userId: req.user._id,
      subject,
      instructor,
      day,
      startTime,
      endTime,
      color: color || '#6366f1',
    });

    res.status(201).json(newClass);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message || 'Failed to create class' });
  }
};

// @desc    Update a class
// @route   PUT /api/classes/:id
const updateClass = async (req, res) => {
  try {
    const cls = await Class.findOne({ _id: req.params.id, userId: req.user._id });
    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const { subject, instructor, day, startTime, endTime, color } = req.body;
    const checkDay = day || cls.day;
    const checkStart = startTime || cls.startTime;
    const checkEnd = endTime || cls.endTime;

    const conflict = await detectConflict(req.user._id, checkDay, checkStart, checkEnd, cls._id);
    if (conflict) {
      return res.status(400).json({
        message: `Time conflict with "${conflict.subject}" (${conflict.startTime} - ${conflict.endTime})`,
      });
    }

    Object.assign(cls, { subject, instructor, day, startTime, endTime, color });
    await cls.save();

    res.json(cls);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message || 'Failed to update class' });
  }
};

// @desc    Delete a class
// @route   DELETE /api/classes/:id
const deleteClass = async (req, res) => {
  try {
    const cls = await Class.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete class' });
  }
};

module.exports = { getClasses, createClass, updateClass, deleteClass };
