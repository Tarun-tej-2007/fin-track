const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
      maxlength: [100, 'Subject name cannot exceed 100 characters'],
    },
    instructor: {
      type: String,
      required: [true, 'Instructor name is required'],
      trim: true,
      maxlength: [100, 'Instructor name cannot exceed 100 characters'],
    },
    day: {
      type: String,
      required: [true, 'Day is required'],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'],
    },
    color: {
      type: String,
      default: '#6366f1',
    },
  },
  { timestamps: true }
);

// Validate endTime > startTime
classSchema.pre('save', function (next) {
  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  if (toMinutes(this.endTime) <= toMinutes(this.startTime)) {
    return next(new Error('End time must be after start time'));
  }
  next();
});

module.exports = mongoose.model('Class', classSchema);
