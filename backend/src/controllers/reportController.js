const { sequelize, Project, Budget, Expense, Task, Milestone, Material, Resource, User, Contractor } = require('../models');

const getBudgetVsActualReport = async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [
        { model: Budget, as: 'budget' },
        { model: Expense, as: 'expenses' },
        { model: Material, as: 'materials' },
        { model: Contractor, as: 'contractor', attributes: ['Contractor_Name'] }
      ],
      order: [['Project_ID', 'ASC']]
    });

    let overallTotalBudget = 0;
    let overallApprovedBudget = 0;
    let overallTotalSpent = 0;

    const projectReports = projects.map(p => {
      const budget = p.budget;
      const totalBudget = budget ? parseFloat(budget.Total_Budget || 0) : 0;
      const approvedBudget = budget ? parseFloat(budget.Approved_Budget || 0) : 0;
      
      const expenses = p.expenses || [];
      const totalSpent = expenses.reduce((sum, e) => sum + parseFloat(e.Amount || 0), 0);
      
      const laborSpent = expenses.filter(e => e.Category === 'Labor').reduce((sum, e) => sum + parseFloat(e.Amount || 0), 0);
      const materialSpent = expenses.filter(e => e.Category === 'Material').reduce((sum, e) => sum + parseFloat(e.Amount || 0), 0);
      const equipmentSpent = expenses.filter(e => e.Category === 'Equipment').reduce((sum, e) => sum + parseFloat(e.Amount || 0), 0);
      const miscSpent = expenses.filter(e => e.Category === 'Misc').reduce((sum, e) => sum + parseFloat(e.Amount || 0), 0);

      const variance = approvedBudget - totalSpent;
      const burnRate = approvedBudget > 0 ? ((totalSpent / approvedBudget) * 100).toFixed(2) : 0;

      overallTotalBudget += totalBudget;
      overallApprovedBudget += approvedBudget;
      overallTotalSpent += totalSpent;

      return {
        Project_ID: p.Project_ID,
        Project_Name: p.Project_Name,
        Status: p.Status,
        Contractor_Name: p.contractor ? p.contractor.Contractor_Name : 'N/A',
        Total_Budget: totalBudget,
        Approved_Budget: approvedBudget,
        Total_Spent: totalSpent,
        Variance: variance,
        Burn_Rate_Percent: parseFloat(burnRate),
        Breakdown: {
          Labor: laborSpent,
          Material: materialSpent,
          Equipment: equipmentSpent,
          Misc: miscSpent
        }
      };
    });

    const overallVariance = overallApprovedBudget - overallTotalSpent;
    const overallBurnRate = overallApprovedBudget > 0 ? ((overallTotalSpent / overallApprovedBudget) * 100).toFixed(2) : 0;

    return res.json({
      summary: {
        totalProjects: projects.length,
        overallTotalBudget,
        overallApprovedBudget,
        overallTotalSpent,
        overallVariance,
        overallBurnRate: parseFloat(overallBurnRate)
      },
      report: projectReports
    });
  } catch (err) {
    console.error('getBudgetVsActualReport error:', err);
    return res.status(500).json({ error: 'Failed to generate budget vs actual report.' });
  }
};

const getProjectProgressReport = async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [
        { model: User, as: 'manager', attributes: ['Full_Name'] },
        { model: Task, as: 'tasks' },
        { model: Milestone, as: 'milestones' }
      ],
      order: [['Project_ID', 'ASC']]
    });

    const progressReports = projects.map(p => {
      const tasks = p.tasks || [];
      const totalTasks = tasks.length;
      const doneTasks = tasks.filter(t => t.Status === 'Done').length;
      const inProgressTasks = tasks.filter(t => t.Status === 'In-Progress').length;
      const openTasks = tasks.filter(t => t.Status === 'Open').length;
      const blockedTasks = tasks.filter(t => t.Status === 'Blocked').length;
      const taskProgressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

      const milestones = p.milestones || [];
      const totalMilestones = milestones.length;
      const achievedMilestones = milestones.filter(m => m.Status === 'Achieved').length;
      const delayedMilestones = milestones.filter(m => m.Status === 'Delayed').length;
      const pendingMilestones = milestones.filter(m => m.Status === 'Pending').length;
      const milestoneProgressPercent = totalMilestones > 0 ? Math.round((achievedMilestones / totalMilestones) * 100) : 0;

      let health = 'Good';
      if (blockedTasks > 0 || delayedMilestones > 0) {
        health = 'Warning';
      }
      if (blockedTasks >= 2 || delayedMilestones >= 2 || p.Status === 'On-Hold') {
        health = 'Critical';
      }

      return {
        Project_ID: p.Project_ID,
        Project_Name: p.Project_Name,
        Status: p.Status,
        Start_Date: p.Start_Date,
        End_Date: p.End_Date,
        Manager_Name: p.manager ? p.manager.Full_Name : 'Unassigned',
        Health: health,
        Tasks: {
          total: totalTasks,
          done: doneTasks,
          inProgress: inProgressTasks,
          open: openTasks,
          blocked: blockedTasks,
          progressPercent: taskProgressPercent
        },
        Milestones: {
          total: totalMilestones,
          achieved: achievedMilestones,
          delayed: delayedMilestones,
          pending: pendingMilestones,
          progressPercent: milestoneProgressPercent
        }
      };
    });

    return res.json({ progressReports });
  } catch (err) {
    console.error('getProjectProgressReport error:', err);
    return res.status(500).json({ error: 'Failed to generate progress report.' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const [projects, tasks, milestones, expenses, materials, budgets] = await Promise.all([
      Project.findAll({
        include: [
          { model: Budget, as: 'budget' },
          { model: Expense, as: 'expenses' }
        ]
      }),
      Task.findAll({
        include: [{ model: Project, as: 'project', attributes: ['Project_Name'] }]
      }),
      Milestone.findAll({
        include: [{ model: Project, as: 'project', attributes: ['Project_Name'] }],
        order: [['Due_Date', 'ASC']]
      }),
      Expense.findAll(),
      Material.findAll(),
      Budget.findAll()
    ]);

    const activeProjects = projects.filter(p => p.Status === 'In-Progress' || p.Status === 'Planned').length;
    const completedProjects = projects.filter(p => p.Status === 'Completed').length;
    const totalApprovedBudget = budgets.reduce((sum, b) => sum + parseFloat(b.Approved_Budget || 0), 0);
    const totalSpent = expenses.reduce((sum, e) => sum + parseFloat(e.Amount || 0), 0);
    const finishedTasks = tasks.filter(t => t.Status === 'Done').length;

    const taskStatusCounts = {
      Open: tasks.filter(t => t.Status === 'Open').length,
      'In-Progress': tasks.filter(t => t.Status === 'In-Progress').length,
      Blocked: tasks.filter(t => t.Status === 'Blocked').length,
      Done: finishedTasks
    };

    const expensesByCategory = {
      Labor: expenses.filter(e => e.Category === 'Labor').reduce((sum, e) => sum + parseFloat(e.Amount || 0), 0),
      Material: expenses.filter(e => e.Category === 'Material').reduce((sum, e) => sum + parseFloat(e.Amount || 0), 0),
      Equipment: expenses.filter(e => e.Category === 'Equipment').reduce((sum, e) => sum + parseFloat(e.Amount || 0), 0),
      Misc: expenses.filter(e => e.Category === 'Misc').reduce((sum, e) => sum + parseFloat(e.Amount || 0), 0)
    };

    // Low stock materials using view or threshold
    let lowStockDb = [];
    try {
      const [res] = await sequelize.query(`SELECT * FROM v_low_stock`);
      lowStockDb = res;
    } catch {
      const mats = await Material.findAll({
        include: [{ model: Project, as: 'project', attributes: ['Project_Name'] }]
      });
      lowStockDb = mats
        .filter(m => parseFloat(m.Quantity) <= parseFloat(m.Reorder_Level))
        .map(m => ({
          Material_ID: m.Material_ID,
          Material_Name: m.Material_Name,
          Project_ID: m.Project_ID,
          Project_Name: m.project ? m.project.Project_Name : `Project #${m.Project_ID}`,
          Quantity: m.Quantity,
          Unit: m.Unit,
          Unit_Cost: m.Unit_Cost,
          Total_Cost: m.Total_Cost,
          Reorder_Level: m.Reorder_Level
        }));
    }

    const upcomingMilestones = milestones
      .filter(m => m.Status === 'Pending' || m.Status === 'Delayed')
      .slice(0, 8);

    const budgetVsSpentByProject = projects.map(p => {
      const budget = p.budget ? parseFloat(p.budget.Approved_Budget || 0) : 0;
      const spent = p.expenses ? p.expenses.reduce((sum, e) => sum + parseFloat(e.Amount || 0), 0) : 0;
      return {
        name: p.Project_Name.length > 20 ? p.Project_Name.substring(0, 18) + '...' : p.Project_Name,
        fullName: p.Project_Name,
        budget,
        spent,
        status: p.Status
      };
    });

    return res.json({
      kpis: {
        totalProjects: projects.length,
        activeProjects,
        completedProjects,
        totalApprovedBudget,
        totalSpent,
        totalTasks: tasks.length,
        finishedTasks,
        lowStockCount: lowStockDb.length
      },
      taskStatusCounts,
      expensesByCategory,
      budgetVsSpentByProject,
      lowStockMaterials: lowStockDb,
      upcomingMilestones
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    return res.status(500).json({ error: 'Failed to retrieve dashboard analytics.' });
  }
};

// CSV Export Utilities for Reports Page
const exportFinancialsCsv = async (req, res) => {
  try {
    let rows;
    try {
      [rows] = await sequelize.query(`SELECT * FROM v_project_financials ORDER BY Project_ID ASC`);
    } catch {
      const projects = await Project.findAll({
        include: [{ model: Budget, as: 'budget' }, { model: Expense, as: 'expenses' }]
      });
      rows = projects.map(p => {
        const approved = p.budget ? parseFloat(p.budget.Approved_Budget || 0) : 0;
        const spent = p.expenses ? p.expenses.reduce((s, e) => s + parseFloat(e.Amount || 0), 0) : 0;
        return {
          Project_ID: p.Project_ID,
          Project_Name: p.Project_Name,
          Project_Status: p.Status,
          Total_Budget: p.budget ? parseFloat(p.budget.Total_Budget || 0) : 0,
          Approved_Budget: approved,
          Total_Spent: spent,
          Remaining_Budget: approved - spent,
          Percent_Used: approved > 0 ? ((spent / approved) * 100).toFixed(2) : 0
        };
      });
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="project_financials_summary.csv"');
    
    res.write('Project_ID,Project_Name,Status,Total_Budget,Approved_Budget,Total_Spent,Remaining_Budget,Percent_Used\n');
    rows.forEach(r => {
      res.write(`${r.Project_ID},"${r.Project_Name}",${r.Project_Status},${r.Total_Budget},${r.Approved_Budget},${r.Total_Spent},${r.Remaining_Budget},${r.Percent_Used}%\n`);
    });
    res.end();
  } catch (err) {
    console.error('exportFinancialsCsv error:', err);
    res.status(500).json({ error: 'Failed to export financials.' });
  }
};

const exportProgressCsv = async (req, res) => {
  try {
    const [rows] = await sequelize.query(`SELECT * FROM v_task_status_counts ORDER BY Project_ID ASC`);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="project_progress_summary.csv"');
    
    res.write('Project_ID,Project_Name,Total_Tasks,Open,In_Progress,Blocked,Done,Completion_Percentage\n');
    rows.forEach(r => {
      res.write(`${r.Project_ID},"${r.Project_Name}",${r.Total_Tasks},${r.Open_Tasks},${r.In_Progress_Tasks},${r.Blocked_Tasks},${r.Done_Tasks},${r.Completion_Percentage}%\n`);
    });
    res.end();
  } catch (err) {
    console.error('exportProgressCsv error:', err);
    res.status(500).json({ error: 'Failed to export progress report.' });
  }
};

const exportInventoryCsv = async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT 
        m.Material_ID, m.Project_ID, p.Project_Name, m.Material_Name,
        m.Quantity, m.Unit, m.Unit_Cost, m.Total_Cost, m.Reorder_Level,
        IF(m.Quantity <= m.Reorder_Level, 'LOW STOCK', 'HEALTHY') as Stock_Status
      FROM MATERIAL m
      JOIN PROJECT p ON m.Project_ID = p.Project_ID
      ORDER BY m.Project_ID ASC, m.Material_Name ASC
    `);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="materials_inventory_report.csv"');
    
    res.write('Material_ID,Project_ID,Project_Name,Material_Name,Quantity,Unit,Unit_Cost,Total_Cost,Reorder_Level,Stock_Status\n');
    rows.forEach(r => {
      res.write(`${r.Material_ID},${r.Project_ID},"${r.Project_Name}","${r.Material_Name}",${r.Quantity},${r.Unit},${r.Unit_Cost},${r.Total_Cost},${r.Reorder_Level},${r.Stock_Status}\n`);
    });
    res.end();
  } catch (err) {
    console.error('exportInventoryCsv error:', err);
    res.status(500).json({ error: 'Failed to export inventory report.' });
  }
};

const exportSiteFormsSummaryCsv = async (req, res) => {
  try {
    const [rows] = await sequelize.query(`SELECT * FROM v_form_summary_by_project ORDER BY Project_ID ASC`);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="site_forms_summary_by_project.csv"');
    
    res.write('Project_ID,Project_Name,Total_Forms,Open_Forms,Closed_Forms,Total_Open_Actions,Total_Actions,Stale_Open_Forms\n');
    rows.forEach(r => {
      res.write(`${r.Project_ID},"${r.Project_Name}",${r.Total_Forms},${r.Open_Forms},${r.Closed_Forms},${r.Total_Open_Actions},${r.Total_Actions},${r.Stale_Open_Forms}\n`);
    });
    res.end();
  } catch (err) {
    console.error('exportSiteFormsSummaryCsv error:', err);
    res.status(500).json({ error: 'Failed to export site forms summary.' });
  }
};

module.exports = {
  getBudgetVsActualReport,
  getProjectProgressReport,
  getDashboardStats,
  exportFinancialsCsv,
  exportProgressCsv,
  exportInventoryCsv,
  exportSiteFormsSummaryCsv
};
