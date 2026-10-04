const { Project, User, Contractor, Budget, Task, Milestone, Expense, Resource, Material } = require('../models');
const { Op } = require('sequelize');

const getAllProjects = async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = {};

    if (status) {
      where.Status = status;
    }

    if (search) {
      where.Project_Name = { [Op.like]: `%${search}%` };
    }

    // If user is Site Supervisor, filter only projects where supervisor is manager or has assigned tasks
    if (req.user.role.Role_Name === 'Site Supervisor') {
      const assignedTasks = await Task.findAll({
        where: { Assigned_To: req.user.User_ID },
        attributes: ['Project_ID']
      });
      const projectIds = assignedTasks.map(t => t.Project_ID);
      where[Op.or] = [
        { Manager_ID: req.user.User_ID },
        { Project_ID: { [Op.in]: projectIds } }
      ];
    }

    const projects = await Project.findAll({
      where,
      include: [
        { model: User, as: 'manager', attributes: ['User_ID', 'Full_Name', 'Username', 'Email'] },
        { model: Contractor, as: 'contractor', attributes: ['Contractor_ID', 'Contractor_Name', 'Phone', 'Email'] },
        { model: Budget, as: 'budget' },
        { model: Task, as: 'tasks', attributes: ['Task_ID', 'Status'] },
        { model: Milestone, as: 'milestones', attributes: ['Milestone_ID', 'Status'] },
        { model: Expense, as: 'expenses', attributes: ['Expense_ID', 'Amount'] }
      ],
      order: [['Project_ID', 'DESC']]
    });

    // Compute high-level stats for each project
    const formatted = projects.map(p => {
      const projectJson = p.toJSON();
      const totalTasks = projectJson.tasks ? projectJson.tasks.length : 0;
      const doneTasks = projectJson.tasks ? projectJson.tasks.filter(t => t.Status === 'Done').length : 0;
      const completionPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

      const totalSpent = projectJson.expenses ? projectJson.expenses.reduce((acc, exp) => acc + parseFloat(exp.Amount || 0), 0) : 0;
      const totalBudget = projectJson.budget ? parseFloat(projectJson.budget.Total_Budget || 0) : 0;
      const approvedBudget = projectJson.budget ? parseFloat(projectJson.budget.Approved_Budget || 0) : 0;

      return {
        ...projectJson,
        stats: {
          totalTasks,
          doneTasks,
          completionPercent,
          totalSpent,
          totalBudget,
          approvedBudget,
          budgetBurnPercent: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
        }
      };
    });

    return res.json({ projects: formatted });
  } catch (err) {
    console.error('getAllProjects error:', err);
    return res.status(500).json({ error: 'Failed to fetch projects list.' });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id, {
      include: [
        { model: User, as: 'manager', attributes: ['User_ID', 'Full_Name', 'Username', 'Email'] },
        { model: Contractor, as: 'contractor' },
        { model: Budget, as: 'budget' },
        { 
          model: Task, 
          as: 'tasks',
          include: [{ model: User, as: 'assignee', attributes: ['User_ID', 'Full_Name', 'Username'] }]
        },
        { model: Milestone, as: 'milestones' },
        { model: Expense, as: 'expenses' },
        { model: Resource, as: 'resources' },
        { model: Material, as: 'materials' }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    return res.json({ project });
  } catch (err) {
    console.error('getProjectById error:', err);
    return res.status(500).json({ error: 'Failed to fetch project details.' });
  }
};

const getProjectSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id, {
      include: [
        { model: User, as: 'manager', attributes: ['User_ID', 'Full_Name', 'Username'] },
        { model: Contractor, as: 'contractor', attributes: ['Contractor_ID', 'Contractor_Name'] },
        { model: Budget, as: 'budget' },
        { model: Task, as: 'tasks' },
        { model: Milestone, as: 'milestones' },
        { model: Expense, as: 'expenses' },
        { model: Resource, as: 'resources' },
        { model: Material, as: 'materials' }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const p = project.toJSON();

    // 1. Budget & Spend Analytics
    const totalBudget = p.budget ? parseFloat(p.budget.Total_Budget || 0) : 0;
    const approvedBudget = p.budget ? parseFloat(p.budget.Approved_Budget || 0) : 0;
    const totalSpent = p.expenses ? p.expenses.reduce((sum, e) => sum + parseFloat(e.Amount || 0), 0) : 0;
    const remainingBudget = totalBudget - totalSpent;
    const burnRatePercent = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0;

    // 2. Task Breakdown
    const tasks = p.tasks || [];
    const taskTotal = tasks.length;
    const tasksDone = tasks.filter(t => t.Status === 'Done').length;
    const tasksInProgress = tasks.filter(t => t.Status === 'In-Progress').length;
    const tasksOpen = tasks.filter(t => t.Status === 'Open').length;
    const tasksBlocked = tasks.filter(t => t.Status === 'Blocked').length;
    const taskCompletionPercent = taskTotal > 0 ? Math.round((tasksDone / taskTotal) * 100) : 0;

    // 3. Milestone Status
    const milestones = p.milestones || [];
    const milestoneTotal = milestones.length;
    const milestonesAchieved = milestones.filter(m => m.Status === 'Achieved').length;
    const milestonesPending = milestones.filter(m => m.Status === 'Pending').length;
    const milestonesDelayed = milestones.filter(m => m.Status === 'Delayed').length;

    // 4. Material & Inventory
    const materials = p.materials || [];
    const lowStockMaterials = materials.filter(m => m.isLowStock || parseFloat(m.Quantity) <= 10);
    const totalMaterialCost = materials.reduce((sum, m) => sum + parseFloat(m.Total_Cost || 0), 0);

    // 5. Resources Count
    const resourcesCount = p.resources ? p.resources.length : 0;

    return res.json({
      summary: {
        project: {
          Project_ID: p.Project_ID,
          Project_Name: p.Project_Name,
          Description: p.Description,
          Status: p.Status,
          Start_Date: p.Start_Date,
          End_Date: p.End_Date,
          manager: p.manager,
          contractor: p.contractor
        },
        financials: {
          totalBudget,
          approvedBudget,
          totalSpent,
          remainingBudget,
          burnRatePercent: parseFloat(burnRatePercent)
        },
        tasks: {
          total: taskTotal,
          done: tasksDone,
          inProgress: tasksInProgress,
          open: tasksOpen,
          blocked: tasksBlocked,
          completionPercent: taskCompletionPercent
        },
        milestones: {
          total: milestoneTotal,
          achieved: milestonesAchieved,
          pending: milestonesPending,
          delayed: milestonesDelayed
        },
        inventory: {
          materialCount: materials.length,
          totalMaterialCost,
          lowStockCount: lowStockMaterials.length,
          lowStockItems: lowStockMaterials
        },
        resources: {
          totalResources: resourcesCount
        }
      }
    });
  } catch (err) {
    console.error('getProjectSummary error:', err);
    return res.status(500).json({ error: 'Failed to generate project summary.' });
  }
};

const createProject = async (req, res) => {
  try {
    const { Project_Name, Description, Start_Date, End_Date, Status, Manager_ID, Contractor_ID, Total_Budget, Approved_Budget, Budget_Remarks } = req.body;

    const project = await Project.create({
      Project_Name,
      Description,
      Start_Date,
      End_Date,
      Status: Status || 'Planned',
      Manager_ID: Manager_ID || null,
      Contractor_ID: Contractor_ID || null
    });

    // Create 1:1 Budget if budget fields are provided
    if (Total_Budget !== undefined && Total_Budget !== null) {
      await Budget.create({
        Project_ID: project.Project_ID,
        Total_Budget: parseFloat(Total_Budget) || 0,
        Approved_Budget: parseFloat(Approved_Budget) || parseFloat(Total_Budget) || 0,
        Created_Date: new Date().toISOString().split('T')[0],
        Remarks: Budget_Remarks || 'Initial project allocation'
      });
    }

    const createdProject = await Project.findByPk(project.Project_ID, {
      include: [
        { model: User, as: 'manager', attributes: ['User_ID', 'Full_Name'] },
        { model: Contractor, as: 'contractor', attributes: ['Contractor_ID', 'Contractor_Name'] },
        { model: Budget, as: 'budget' }
      ]
    });

    return res.status(201).json({
      message: 'Project created successfully',
      project: createdProject
    });
  } catch (err) {
    console.error('createProject error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create project.' });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const { Project_Name, Description, Start_Date, End_Date, Status, Manager_ID, Contractor_ID } = req.body;

    await project.update({
      Project_Name: Project_Name !== undefined ? Project_Name : project.Project_Name,
      Description: Description !== undefined ? Description : project.Description,
      Start_Date: Start_Date !== undefined ? Start_Date : project.Start_Date,
      End_Date: End_Date !== undefined ? End_Date : project.End_Date,
      Status: Status !== undefined ? Status : project.Status,
      Manager_ID: Manager_ID !== undefined ? Manager_ID : project.Manager_ID,
      Contractor_ID: Contractor_ID !== undefined ? Contractor_ID : project.Contractor_ID
    });

    const updated = await Project.findByPk(id, {
      include: [
        { model: User, as: 'manager', attributes: ['User_ID', 'Full_Name'] },
        { model: Contractor, as: 'contractor', attributes: ['Contractor_ID', 'Contractor_Name'] },
        { model: Budget, as: 'budget' }
      ]
    });

    return res.json({
      message: 'Project updated successfully',
      project: updated
    });
  } catch (err) {
    console.error('updateProject error:', err);
    return res.status(500).json({ error: err.message || 'Failed to update project.' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    await project.destroy();

    return res.json({ message: 'Project and all associated records deleted successfully.' });
  } catch (err) {
    console.error('deleteProject error:', err);
    return res.status(500).json({ error: 'Failed to delete project.' });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  getProjectSummary,
  createProject,
  updateProject,
  deleteProject
};
