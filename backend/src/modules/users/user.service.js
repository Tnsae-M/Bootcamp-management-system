import User from './user.model.js';
import bcrypt from 'bcrypt';
import { sanitizeUser, USER_POPULATE } from './user.sanitize.js';

export const createUser = async (userData) => {
  // Format bootcamps array if provided as raw IDs
  if (userData.bootcamps && Array.isArray(userData.bootcamps)) {
    userData.bootcamps = userData.bootcamps.map(id => ({ bootcampId: id }));
  }

  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    const error = new Error('Email already exists');
    error.statusCode = 409; // Conflict
    throw error;
  }
  if (userData.password) {
    userData.password = await bcrypt.hash(userData.password, 10);
  }

  const user = new User(userData);
  await user.save();
  await user.populate(USER_POPULATE);

  return sanitizeUser(user);
};

export const getAllUsers = async (filter = {}) => {
  const users = await User.find(filter).populate(USER_POPULATE);
  return users.map(sanitizeUser);
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId).populate(USER_POPULATE);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return sanitizeUser(user);
};

export const updateUser = async (userId, updateData) => {
  // Prevent password updates through this generic method
  if (updateData.password) {
    delete updateData.password;
  }

  // Format bootcamps if provided as IDs
  if (updateData.bootcamps && Array.isArray(updateData.bootcamps)) {
    updateData.bootcamps = updateData.bootcamps.map(id => ({ bootcampId: id }));
  }

  const user = await User.findByIdAndUpdate(userId, updateData, {
    returnDocument: 'after', // Return the updated document
    runValidators: true // Ensure schema rules (like enums) are respected
  }).populate(USER_POPULATE);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return sanitizeUser(user);
};

export const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return sanitizeUser(user);
};
