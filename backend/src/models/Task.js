const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Task = sequelize.define('TASK', {
  Task_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Task_ID'
  },
  Project_ID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'Project_ID'
  },
  Assigned_To: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'Assigned_To'
  },
  Task_Name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    field: 'Task_Name'
  },
  Start_Date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'Start_Date'
  },
  Due_Date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'Due_Date'
  },
  Status: {
    type: DataTypes.ENUM('Open', 'In-Progress', 'Blocked', 'Done'),
    allowNull: false,
    defaultValue: 'Open',
    field: 'Status'
  }
}, {
  tableName: 'TASK',
  timestamps: false
});

module.exports = Task;
