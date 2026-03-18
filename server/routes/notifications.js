import express from 'express';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get notifications for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const roleTargets = req.user.role === 'student_representative'
      ? ['student_representative', 'placement_officer']
      : [req.user.role];

    const notifications = await Notification.find({
      $or: [
        { targetRole: 'all' },
        { targetRole: { $in: roleTargets } },
        { userId: req.user._id },
        { userIds: req.user._id },
        { createdBy: req.user._id }
      ]
    })
      .populate('userId', 'name email')
      .populate('userIds', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/notifications
// @desc    Create a notification (broadcast or targeted)
// @access  Private/Placement Officer
router.post('/', protect, authorize('placement_officer', 'admin', 'student_representative'), async (req, res) => {
  try {
    const { title, message, type, targetRole, userId, userIds } = req.body;

    const sanitize = (v) => (typeof v === 'string' ? v.replace(/[<>$]/g, '').trim().slice(0, 500) : '');
    const validTypes = ['info', 'warning', 'success', 'error'];
    const validRoles = ['all', 'student', 'placement_officer', 'specific'];

    const notifData = {
      title: sanitize(title),
      message: sanitize(message),
      type: validTypes.includes(type) ? type : 'info',
      targetRole: validRoles.includes(targetRole) ? targetRole : 'all',
      createdBy: req.user._id,
    };

    if (!notifData.title || !notifData.message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    if (targetRole === 'specific') {
      if (userId && typeof userId === 'string') {
        notifData.userId = userId;
      } else if (Array.isArray(userIds) && userIds.length > 0) {
        notifData.userIds = userIds.slice(0, 200);
      } else {
        return res.status(400).json({ success: false, message: 'Specific target requires userId or userIds' });
      }
    }

    const notification = await Notification.create(notifData);
    const populated = await notification.populate([
      { path: 'userId', select: 'name email' },
      { path: 'userIds', select: 'name email' },
    ]);
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/notifications/:id
// @desc    Update notification (mark as read)
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private/Placement Officer
router.delete('/:id', protect, authorize('placement_officer', 'admin', 'student_representative'), async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
