const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Milestone = sequelize.define('MILESTONE', {
  Milestone_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Milestone_ID'
  },
  Project_ID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'Project_ID'
  },
  Milestone_Name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    field: 'Milestone_Name'
  },
  Description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'Description'
  },
  Due_Date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'Due_Date'
  },
  Status: {
    type: DataTypes.ENUM('Pending', 'Achieved', 'Delayed'),
    allowNull: false,
    defaultValue: 'Pending',
    field: 'Status'
  }
}, {
  tableName: 'MILESTONE',
  timestamps: false
});

module.exports = Milestone;
