const { User, Role, Project, Task } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
  try {
    const { roleId, status, search } = req.query;
    const where = {};

    if (roleId) where.Role_ID = roleId;
    if (status) where.Status = status;
    if (search) {
      where[Op.or] = [
        { Full_Name: { [Op.like]: `%${search}%` } },
        { Username: { [Op.like]: `%${search}%` } },
        { Email: { [Op.like]: `%${search}%` } }
      ];
    }

    const users = await User.findAll({
      where,
      include: [{ model: Role, as: 'role' }],
      order: [['User_ID', 'ASC']]
    });

    return res.json({ users });
  } catch (err) {
    console.error('getAllUsers error:', err);
    return res.status(500).json({ error: 'Failed to retrieve users.' });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      order: [['Role_ID', 'ASC']]
    });
    return res.json({ roles });
  } catch (err) {
    console.error('getAllRoles error:', err);
    return res.status(500).json({ error: 'Failed to retrieve roles.' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      include: [
        { model: Role, as: 'role' },
        { model: Project, as: 'managedProjects', attributes: ['Project_ID', 'Project_Name', 'Status'] },
        { model: Task, as: 'assignedTasks', attributes: ['Task_ID', 'Task_Name', 'Status', 'Due_Date'] }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ user });
  } catch (err) {
    console.error('getUserById error:', err);
    return res.status(500).json({ error: 'Failed to retrieve user.' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { Full_Name, Email, Role_ID, Status, Password } = req.body;

    if (Email && Email !== user.Email) {
      const emailExists = await User.findOne({ where: { Email } });
      if (emailExists) {
        return res.status(400).json({ error: 'Email is already taken by another account.' });
      }
    }

    const updates = {};
    if (Full_Name !== undefined) updates.Full_Name = Full_Name;
    if (Email !== undefined) updates.Email = Email;
    if (Role_ID !== undefined) {
      const roleExists = await Role.findByPk(Role_ID);
      if (!roleExists) return res.status(400).json({ error: 'Specified Role_ID does not exist.' });
      updates.Role_ID = Role_ID;
    }
    if (Status !== undefined) updates.Status = Status;
    if (Password) {
      const salt = await bcrypt.genSalt(10);
      updates.Password_Hash = await bcrypt.hash(Password, salt);
    }

    await user.update(updates);

    const updatedUser = await User.findByPk(id, {
      include: [{ model: Role, as: 'role' }]
    });

    return res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('updateUser error:', err);
    return res.status(500).json({ error: err.message || 'Failed to update user.' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting own account
    if (req.user.User_ID === parseInt(id, 10)) {
      return res.status(400).json({ error: 'You cannot delete your own administrative account.' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await user.destroy();
    return res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error('deleteUser error:', err);
    return res.status(500).json({ error: 'Failed to delete user.' });
  }
};

module.exports = {
  getAllUsers,
  getAllRoles,
  getUserById,
  updateUser,
  deleteUser
};
