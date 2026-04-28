const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('user', 'name');
    const unreadCount = notifications.filter(n => !n.readBy.includes(req.user.id)).length;
    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (e) { next(e); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { readBy: { $ne: req.user.id } },
      { $addToSet: { readBy: req.user.id } }
    );
    res.json({ success: true, message: 'All marked as read.' });
  } catch (e) { next(e); }
};

exports.markRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { $addToSet: { readBy: req.user.id } });
    res.json({ success: true });
  } catch (e) { next(e); }
};

exports.getActivity = async (req, res, next) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('user', 'name email');
    res.json({ success: true, data: { activity: notifications } });
  } catch (e) { next(e); }
};