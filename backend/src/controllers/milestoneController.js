const { Milestone, Project } = require('../models');

const getAllMilestones = async (req, res) => {
  try {
    const { projectId, status } = req.query;
    const where = {};

    if (projectId) where.Project_ID = projectId;
    if (status) where.Status = status;

    const milestones = await Milestone.findAll({
      where,
      include: [
        { model: Project, as: 'project', attributes: ['Project_ID', 'Project_Name'] }
      ],
      order: [['Due_Date', 'ASC']]
    });

    return res.json({ milestones });
  } catch (err) {
    console.error('getAllMilestones error:', err);
    return res.status(500).json({ error: 'Failed to retrieve milestones.' });
  }
};

const getMilestoneById = async (req, res) => {
  try {
    const { id } = req.params;
    const milestone = await Milestone.findByPk(id, {
      include: [{ model: Project, as: 'project' }]
    });

    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found.' });
    }

    return res.json({ milestone });
  } catch (err) {
    console.error('getMilestoneById error:', err);
    return res.status(500).json({ error: 'Failed to retrieve milestone.' });
  }
};

const createMilestone = async (req, res) => {
  try {
    const { Project_ID, Milestone_Name, Description, Due_Date, Status } = req.body;

    const project = await Project.findByPk(Project_ID);
    if (!project) {
      return res.status(400).json({ error: 'Referenced project does not exist.' });
    }

    const milestone = await Milestone.create({
      Project_ID,
      Milestone_Name,
      Description,
      Due_Date,
      Status: Status || 'Pending'
    });

    const populated = await Milestone.findByPk(milestone.Milestone_ID, {
      include: [{ model: Project, as: 'project', attributes: ['Project_ID', 'Project_Name'] }]
    });

    return res.status(201).json({
      message: 'Milestone created successfully',
      milestone: populated
    });
  } catch (err) {
    console.error('createMilestone error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create milestone.' });
  }
};

const updateMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    const milestone = await Milestone.findByPk(id);

    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found.' });
    }

    const { Milestone_Name, Description, Due_Date, Status, Project_ID } = req.body;

    await milestone.update({
      Milestone_Name: Milestone_Name !== undefined ? Milestone_Name : milestone.Milestone_Name,
      Description: Description !== undefined ? Description : milestone.Description,
      Due_Date: Due_Date !== undefined ? Due_Date : milestone.Due_Date,
      Status: Status !== undefined ? Status : milestone.Status,
      Project_ID: Project_ID !== undefined ? Project_ID : milestone.Project_ID
    });

    const updated = await Milestone.findByPk(id, {
      include: [{ model: Project, as: 'project', attributes: ['Project_ID', 'Project_Name'] }]
    });

    return res.json({
      message: 'Milestone updated successfully',
      milestone: updated
    });
  } catch (err) {
    console.error('updateMilestone error:', err);
    return res.status(500).json({ error: err.message || 'Failed to update milestone.' });
  }
};

const deleteMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    const milestone = await Milestone.findByPk(id);

    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found.' });
    }

    await milestone.destroy();
    return res.json({ message: 'Milestone deleted successfully.' });
  } catch (err) {
    console.error('deleteMilestone error:', err);
    return res.status(500).json({ error: 'Failed to delete milestone.' });
  }
};

module.exports = {
  getAllMilestones,
  getMilestoneById,
  createMilestone,
  updateMilestone,
  deleteMilestone
};
