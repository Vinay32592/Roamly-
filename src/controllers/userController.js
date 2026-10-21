const User = require('../models/User');

// Get current user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, username, profileImage } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    if (username && username.toLowerCase() !== req.user.username) {
      // Check username uniqueness
      const existing = await User.findOne({ username: username.toLowerCase(), _id: { $ne: req.user._id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Username is already taken.' });
      }
      updateData.username = username.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { returnDocument: 'after', runValidators: true });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
