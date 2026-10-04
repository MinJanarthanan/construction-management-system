const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Project = sequelize.define('PROJECT', {
  Project_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Project_ID'
  },
  Project_Name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    field: 'Project_Name'
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'Description'
  },
  Start_Date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'Start_Date'
  },
  End_Date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'End_Date'
  },
  Status: {
    type: DataTypes.ENUM('Planned', 'In-Progress', 'On-Hold', 'Completed'),
    allowNull: false,
    defaultValue: 'Planned',
    field: 'Status'
  },
  Manager_ID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'Manager_ID'
  },
  Contractor_ID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'Contractor_ID'
  }
}, {
  tableName: 'PROJECT',
  timestamps: false
});

module.exports = Project;
