const { sequelize } = require('../config/database');
const Role = require('./Role');
const User = require('./User');
const Contractor = require('./Contractor');
const Project = require('./Project');
const Task = require('./Task');
const Milestone = require('./Milestone');
const Budget = require('./Budget');
const Expense = require('./Expense');
const Resource = require('./Resource');
const Material = require('./Material');
const FormType = require('./FormType');
const SiteForm = require('./SiteForm');
const LowStockAlert = require('./LowStockAlert');

// 1. Role <-> User
Role.hasMany(User, { foreignKey: 'Role_ID', as: 'users' });
User.belongsTo(Role, { foreignKey: 'Role_ID', as: 'role' });

// 2. User (Manager) <-> Project
User.hasMany(Project, { foreignKey: 'Manager_ID', as: 'managedProjects' });
Project.belongsTo(User, { foreignKey: 'Manager_ID', as: 'manager' });

// 3. Contractor <-> Project
Contractor.hasMany(Project, { foreignKey: 'Contractor_ID', as: 'projects' });
Project.belongsTo(Contractor, { foreignKey: 'Contractor_ID', as: 'contractor' });

// 4. Project <-> Task
Project.hasMany(Task, { foreignKey: 'Project_ID', as: 'tasks', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'Project_ID', as: 'project' });

// 5. User (Assignee) <-> Task
User.hasMany(Task, { foreignKey: 'Assigned_To', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'Assigned_To', as: 'assignee' });

// 6. Project <-> Milestone
Project.hasMany(Milestone, { foreignKey: 'Project_ID', as: 'milestones', onDelete: 'CASCADE' });
Milestone.belongsTo(Project, { foreignKey: 'Project_ID', as: 'project' });

// 7. Project <-> Budget (1:1)
Project.hasOne(Budget, { foreignKey: 'Project_ID', as: 'budget', onDelete: 'CASCADE' });
Budget.belongsTo(Project, { foreignKey: 'Project_ID', as: 'project' });

// 8. Project <-> Expense
Project.hasMany(Expense, { foreignKey: 'Project_ID', as: 'expenses', onDelete: 'CASCADE' });
Expense.belongsTo(Project, { foreignKey: 'Project_ID', as: 'project' });

// 9. Project <-> Resource
Project.hasMany(Resource, { foreignKey: 'Project_ID', as: 'resources', onDelete: 'CASCADE' });
Resource.belongsTo(Project, { foreignKey: 'Project_ID', as: 'project' });

// 10. Project <-> Material
Project.hasMany(Material, { foreignKey: 'Project_ID', as: 'materials', onDelete: 'CASCADE' });
Material.belongsTo(Project, { foreignKey: 'Project_ID', as: 'project' });

// 11. Material / Project <-> LowStockAlert
Material.hasMany(LowStockAlert, { foreignKey: 'Material_ID', as: 'alerts', onDelete: 'CASCADE' });
LowStockAlert.belongsTo(Material, { foreignKey: 'Material_ID', as: 'material' });
Project.hasMany(LowStockAlert, { foreignKey: 'Project_ID', as: 'alerts', onDelete: 'CASCADE' });
LowStockAlert.belongsTo(Project, { foreignKey: 'Project_ID', as: 'project' });

// 12. Project <-> SiteForm
Project.hasMany(SiteForm, { foreignKey: 'Project_ID', as: 'siteForms', onDelete: 'CASCADE' });
SiteForm.belongsTo(Project, { foreignKey: 'Project_ID', as: 'project' });

// 13. FormType <-> SiteForm
FormType.hasMany(SiteForm, { foreignKey: 'Type_ID', as: 'forms' });
SiteForm.belongsTo(FormType, { foreignKey: 'Type_ID', as: 'formType' });

module.exports = {
  sequelize,
  Role,
  User,
  Contractor,
  Project,
  Task,
  Milestone,
  Budget,
  Expense,
  Resource,
  Material,
  FormType,
  SiteForm,
  LowStockAlert
};
