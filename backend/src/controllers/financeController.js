const { Budget, Expense, Project } = require('../models');
const { Op } = require('sequelize');

// --- BUDGET CONTROLLERS ---

const getAllBudgets = async (req, res) => {
  try {
    const budgets = await Budget.findAll({
      include: [
        { model: Project, as: 'project', attributes: ['Project_ID', 'Project_Name', 'Status'] }
      ],
      order: [['Project_ID', 'ASC']]
    });
    return res.json({ budgets });
  } catch (err) {
    console.error('getAllBudgets error:', err);
    return res.status(500).json({ error: 'Failed to retrieve budgets.' });
  }
};

const getBudgetByProjectId = async (req, res) => {
  try {
    const { projectId } = req.params;
    const budget = await Budget.findOne({
      where: { Project_ID: projectId },
      include: [{ model: Project, as: 'project' }]
    });

    if (!budget) {
      return res.status(404).json({ error: 'No budget allocated for this project yet.' });
    }

    return res.json({ budget });
  } catch (err) {
    console.error('getBudgetByProjectId error:', err);
    return res.status(500).json({ error: 'Failed to retrieve project budget.' });
  }
};

const createOrUpdateBudget = async (req, res) => {
  try {
    const { Project_ID, Total_Budget, Approved_Budget, Remarks, Created_Date } = req.body;

    const project = await Project.findByPk(Project_ID);
    if (!project) {
      return res.status(400).json({ error: 'Referenced project does not exist.' });
    }

    let budget = await Budget.findOne({ where: { Project_ID } });

    if (budget) {
      await budget.update({
        Total_Budget: Total_Budget !== undefined ? parseFloat(Total_Budget) : budget.Total_Budget,
        Approved_Budget: Approved_Budget !== undefined ? parseFloat(Approved_Budget) : budget.Approved_Budget,
        Remarks: Remarks !== undefined ? Remarks : budget.Remarks,
        Created_Date: Created_Date || budget.Created_Date
      });
    } else {
      budget = await Budget.create({
        Project_ID,
        Total_Budget: parseFloat(Total_Budget) || 0.00,
        Approved_Budget: parseFloat(Approved_Budget) || parseFloat(Total_Budget) || 0.00,
        Remarks: Remarks || '',
        Created_Date: Created_Date || new Date().toISOString().split('T')[0]
      });
    }

    const populated = await Budget.findByPk(budget.Budget_ID, {
      include: [{ model: Project, as: 'project', attributes: ['Project_ID', 'Project_Name'] }]
    });

    return res.json({
      message: 'Budget saved successfully',
      budget: populated
    });
  } catch (err) {
    console.error('createOrUpdateBudget error:', err);
    return res.status(500).json({ error: err.message || 'Failed to save budget.' });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await Budget.findByPk(id);

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found.' });
    }

    await budget.destroy();
    return res.json({ message: 'Budget deleted successfully.' });
  } catch (err) {
    console.error('deleteBudget error:', err);
    return res.status(500).json({ error: 'Failed to delete budget.' });
  }
};

// --- EXPENSE CONTROLLERS ---

const getAllExpenses = async (req, res) => {
  try {
    const { projectId, category, startDate, endDate, search } = req.query;
    const where = {};

    if (projectId) where.Project_ID = projectId;
    if (category) where.Category = category;
    if (startDate && endDate) {
      where.Expense_Date = { [Op.between]: [startDate, endDate] };
    }
    if (search) {
      where.Description = { [Op.like]: `%${search}%` };
    }

    const expenses = await Expense.findAll({
      where,
      include: [
        { model: Project, as: 'project', attributes: ['Project_ID', 'Project_Name'] }
      ],
      order: [['Expense_Date', 'DESC']]
    });

    // Compute total sum of filtered expenses
    const totalAmount = expenses.reduce((sum, e) => sum + parseFloat(e.Amount || 0), 0);

    return res.json({ expenses, totalAmount });
  } catch (err) {
    console.error('getAllExpenses error:', err);
    return res.status(500).json({ error: 'Failed to retrieve expenses.' });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByPk(id, {
      include: [{ model: Project, as: 'project' }]
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense record not found.' });
    }

    return res.json({ expense });
  } catch (err) {
    console.error('getExpenseById error:', err);
    return res.status(500).json({ error: 'Failed to retrieve expense.' });
  }
};

const createExpense = async (req, res) => {
  try {
    const { Project_ID, Category, Amount, Expense_Date, Description, Is_Override } = req.body;

    const project = await Project.findByPk(Project_ID);
    if (!project) {
      return res.status(400).json({ error: 'Referenced project does not exist.' });
    }

    const expense = await Expense.create({
      Project_ID,
      Category,
      Amount: parseFloat(Amount) || 0.00,
      Expense_Date: Expense_Date || new Date().toISOString().split('T')[0],
      Description,
      Is_Override: Boolean(Is_Override)
    });

    const populated = await Expense.findByPk(expense.Expense_ID, {
      include: [{ model: Project, as: 'project', attributes: ['Project_ID', 'Project_Name'] }]
    });

    return res.status(201).json({
      message: 'Expense recorded successfully',
      expense: populated
    });
  } catch (err) {
    console.error('createExpense error:', err);
    // Check if error is from MySQL trigger (SQLSTATE 45000)
    const errorMsg = err.original ? err.original.sqlMessage || err.message : err.message;
    if (errorMsg && errorMsg.includes('Approved Budget')) {
      return res.status(400).json({
        error: errorMsg,
        overBudget: true,
        canOverride: true
      });
    }
    return res.status(500).json({ error: errorMsg || 'Failed to record expense.' });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByPk(id);

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found.' });
    }

    const { Category, Amount, Expense_Date, Description, Project_ID } = req.body;

    await expense.update({
      Category: Category !== undefined ? Category : expense.Category,
      Amount: Amount !== undefined ? parseFloat(Amount) : expense.Amount,
      Expense_Date: Expense_Date !== undefined ? Expense_Date : expense.Expense_Date,
      Description: Description !== undefined ? Description : expense.Description,
      Project_ID: Project_ID !== undefined ? Project_ID : expense.Project_ID
    });

    const updated = await Expense.findByPk(id, {
      include: [{ model: Project, as: 'project', attributes: ['Project_ID', 'Project_Name'] }]
    });

    return res.json({
      message: 'Expense updated successfully',
      expense: updated
    });
  } catch (err) {
    console.error('updateExpense error:', err);
    return res.status(500).json({ error: err.message || 'Failed to update expense.' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByPk(id);

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found.' });
    }

    await expense.destroy();
    return res.json({ message: 'Expense deleted successfully.' });
  } catch (err) {
    console.error('deleteExpense error:', err);
    return res.status(500).json({ error: 'Failed to delete expense.' });
  }
};

module.exports = {
  getAllBudgets,
  getBudgetByProjectId,
  createOrUpdateBudget,
  deleteBudget,
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense
};
