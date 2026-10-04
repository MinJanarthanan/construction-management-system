const { Task, Project, User } = require('../models');
const { Op } = require('sequelize');

const getAllTasks = async (req, res) => {
  try {
    const { projectId, status, assignedTo, search } = req.query;
    const where = {};

    if (projectId) where.Project_ID = projectId;
    if (status) where.Status = status;
    if (assignedTo) where.Assigned_To = assignedTo;
    if (search) where.Task_Name = { [Op.like]: `%${search}%` };

    // Role-based scoping for Site Supervisor
    if (req.user.role.Role_Name === 'Site Supervisor') {
      where[Op.or] = [
        { Assigned_To: req.user.User_ID },
        ...(projectId ? [{ Project_ID: projectId }] : [])
      ];
    }

    const tasks = await Task.findAll({
      where,
      include: [
        { model: Project, as: 'project', attributes: ['Project_ID', 'Project_Name'] },
        { model: User, as: 'assignee', attributes: ['User_ID', 'Full_Name', 'Username', 'Email'] }
      ],
      order: [['Due_Date', 'ASC']]
    });

    return res.json({ tasks });
  } catch (err) {
    console.error('getAllTasks error:', err);
    return res.status(500).json({ error: 'Failed to retrieve tasks.' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id, {
      include: [
        { model: Project, as: 'project' },
        { model: User, as: 'assignee', attributes: ['User_ID', 'Full_Name', 'Username', 'Email'] }
      ]
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    return res.json({ task });
  } catch (err) {
    console.error('getTaskById error:', err);
    return res.status(500).json({ error: 'Failed to retrieve task.' });
  }
};

const createTask = async (req, res) => {
  try {
    const { Project_ID, Assigned_To, Task_Name, Start_Date, Due_Date, Status } = req.body;

    const project = await Project.findByPk(Project_ID);
    if (!project) {
      return res.status(400).json({ error: 'Referenced project does not exist.' });
    }

    if (Assigned_To) {
      const assignee = await User.findByPk(Assigned_To);
      if (!assignee) {
        return res.status(400).json({ error: 'Referenced assigned user does not exist.' });
      }
    }

    const task = await Task.create({
      Project_ID,
      Assigned_To: Assigned_To || null,
      Task_Name,
      Start_Date,
      Due_Date,
      Status: Status || 'Open'
    });

    const populated = await Task.findByPk(task.Task_ID, {
      include: [
        { model: Project, as: 'project', attributes: ['Project_ID', 'Project_Name'] },
        { model: User, as: 'assignee', attributes: ['User_ID', 'Full_Name'] }
      ]
    });

    return res.status(201).json({
      message: 'Task created successfully',
      task: populated
    });
  } catch (err) {
    console.error('createTask error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create task.' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const { Task_Name, Start_Date, Due_Date, Status, Assigned_To, Project_ID } = req.body;

    await task.update({
      Task_Name: Task_Name !== undefined ? Task_Name : task.Task_Name,
      Start_Date: Start_Date !== undefined ? Start_Date : task.Start_Date,
      Due_Date: Due_Date !== undefined ? Due_Date : task.Due_Date,
      Status: Status !== undefined ? Status : task.Status,
      Assigned_To: Assigned_To !== undefined ? Assigned_To : task.Assigned_To,
      Project_ID: Project_ID !== undefined ? Project_ID : task.Project_ID
    });

    const updated = await Task.findByPk(id, {
      include: [
        { model: Project, as: 'project', attributes: ['Project_ID', 'Project_Name'] },
        { model: User, as: 'assignee', attributes: ['User_ID', 'Full_Name'] }
      ]
    });

    return res.json({
      message: 'Task updated successfully',
      task: updated
    });
  } catch (err) {
    console.error('updateTask error:', err);
    return res.status(500).json({ error: err.message || 'Failed to update task.' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    await task.destroy();
    return res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    console.error('deleteTask error:', err);
    return res.status(500).json({ error: 'Failed to delete task.' });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
