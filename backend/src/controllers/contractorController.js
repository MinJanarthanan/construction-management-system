const { Contractor, Project } = require('../models');
const { Op } = require('sequelize');

const getAllContractors = async (req, res) => {
  try {
    const { search } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { Contractor_Name: { [Op.like]: `%${search}%` } },
        { Email: { [Op.like]: `%${search}%` } },
        { Phone: { [Op.like]: `%${search}%` } }
      ];
    }

    const contractors = await Contractor.findAll({
      where,
      include: [
        { model: Project, as: 'projects', attributes: ['Project_ID', 'Project_Name', 'Status'] }
      ],
      order: [['Contractor_Name', 'ASC']]
    });

    const formatted = contractors.map(c => {
      const cJson = c.toJSON();
      cJson.projectCount = cJson.projects ? cJson.projects.length : 0;
      return cJson;
    });

    return res.json({ contractors: formatted });
  } catch (err) {
    console.error('getAllContractors error:', err);
    return res.status(500).json({ error: 'Failed to retrieve contractors list.' });
  }
};

const getContractorById = async (req, res) => {
  try {
    const { id } = req.params;
    const contractor = await Contractor.findByPk(id, {
      include: [
        { model: Project, as: 'projects' }
      ]
    });

    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found.' });
    }

    return res.json({ contractor });
  } catch (err) {
    console.error('getContractorById error:', err);
    return res.status(500).json({ error: 'Failed to retrieve contractor details.' });
  }
};

const createContractor = async (req, res) => {
  try {
    const { Contractor_Name, Phone, Email, Address } = req.body;

    const contractor = await Contractor.create({
      Contractor_Name,
      Phone,
      Email,
      Address
    });

    return res.status(201).json({
      message: 'Contractor created successfully',
      contractor
    });
  } catch (err) {
    console.error('createContractor error:', err);
    return res.status(500).json({ error: err.message || 'Failed to register contractor.' });
  }
};

const updateContractor = async (req, res) => {
  try {
    const { id } = req.params;
    const contractor = await Contractor.findByPk(id);

    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found.' });
    }

    const { Contractor_Name, Phone, Email, Address } = req.body;

    await contractor.update({
      Contractor_Name: Contractor_Name !== undefined ? Contractor_Name : contractor.Contractor_Name,
      Phone: Phone !== undefined ? Phone : contractor.Phone,
      Email: Email !== undefined ? Email : contractor.Email,
      Address: Address !== undefined ? Address : contractor.Address
    });

    return res.json({
      message: 'Contractor updated successfully',
      contractor
    });
  } catch (err) {
    console.error('updateContractor error:', err);
    return res.status(500).json({ error: err.message || 'Failed to update contractor.' });
  }
};

const deleteContractor = async (req, res) => {
  try {
    const { id } = req.params;
    const contractor = await Contractor.findByPk(id);

    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found.' });
    }

    await contractor.destroy();
    return res.json({ message: 'Contractor deleted successfully.' });
  } catch (err) {
    console.error('deleteContractor error:', err);
    return res.status(500).json({ error: 'Failed to delete contractor.' });
  }
};

module.exports = {
  getAllContractors,
  getContractorById,
  createContractor,
  updateContractor,
  deleteContractor
};
