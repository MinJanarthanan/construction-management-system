const { Role } = require('../models');

exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({ order: [['Role_ID', 'ASC']] });
    res.json({ success: true, data: roles });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve roles' });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, error: 'Role not found' });
    }
    res.json({ success: true, data: role });
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve role' });
  }
};
