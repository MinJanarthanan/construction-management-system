const { Resource, Project } = require('../models');
const { Op } = require('sequelize');

const getAllResources = async (req, res) => {
  try {
    const { projectId, type, search } = req.query;
    const where = {};

    if (projectId) where.Project_ID = projectId;
    if (type) where.Type = type;
    if (search) where.Resource_Name = { [Op.like]: `%${search}%` };

    const resources = await Resource.findAll({
      where,
      include: [
        { model: Project, as: 'project', attributes: ['Project_ID', 'Project_Name'] }
      ],
      order: [['Resource_ID', 'DESC']]
    });

    return res.json({ resources });
  } catch (err) {
    console.error('getAllResources error:', err);
    return res.status(500).json({ error: 'Failed to retrieve resources.' });
  }
};

const getResourceById = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findByPk(id, {
      include: [{ model: Project, as: 'project' }]
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found.' });
    }

    return res.json({ resource });
  } catch (err) {
    console.error('getResourceById error:', err);
    return res.status(500).json({ error: 'Failed to retrieve resource.' });
  }
};

const createResource = async (req, res) => {
  try {
    const { Project_ID, Resource_Name, Type, Quantity, Unit, Remarks } = req.body;

    const project = await Project.findByPk(Project_ID);
    if (!project) {
      return res.status(400).json({ error: 'Referenced project does not exist.' });
    }

    const resource = await Resource.create({
      Project_ID,
      Resource_Name,
      Type,
      Quantity: parseFloat(Quantity) || 1.00,
      Unit,
      Remarks
    });

    const populated = await Resource.findByPk(resource.Resource_ID, {
      include: [{ model: Project, as: 'project', attributes: ['Project_ID', 'Project_Name'] }]
    });

    return res.status(201).json({
      message: 'Resource allocated successfully',
      resource: populated
    });
  } catch (err) {
    console.error('createResource error:', err);
    return res.status(500).json({ error: err.message || 'Failed to allocate resource.' });
  }
};

const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findByPk(id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found.' });
    }

    const { Resource_Name, Type, Quantity, Unit, Remarks, Project_ID } = req.body;

    await resource.update({
      Resource_Name: Resource_Name !== undefined ? Resource_Name : resource.Resource_Name,
      Type: Type !== undefined ? Type : resource.Type,
      Quantity: Quantity !== undefined ? parseFloat(Quantity) : resource.Quantity,
      Unit: Unit !== undefined ? Unit : resource.Unit,
      Remarks: Remarks !== undefined ? Remarks : resource.Remarks,
      Project_ID: Project_ID !== undefined ? Project_ID : resource.Project_ID
    });

    const updated = await Resource.findByPk(id, {
      include: [{ model: Project, as: 'project', attributes: ['Project_ID', 'Project_Name'] }]
    });

    return res.json({
      message: 'Resource updated successfully',
      resource: updated
    });
  } catch (err) {
    console.error('updateResource error:', err);
    return res.status(500).json({ error: err.message || 'Failed to update resource.' });
  }
};

const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findByPk(id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found.' });
    }

    await resource.destroy();
    return res.json({ message: 'Resource deleted successfully.' });
  } catch (err) {
    console.error('deleteResource error:', err);
    return res.status(500).json({ error: 'Failed to delete resource.' });
  }
};

module.exports = {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource
};
