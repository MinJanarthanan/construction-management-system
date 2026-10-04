const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Resource = sequelize.define('RESOURCE', {
  Resource_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Resource_ID'
  },
  Project_ID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'Project_ID'
  },
  Resource_Name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'Resource_Name'
  },
  Type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'Type'
  },
  Quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 1.00,
    field: 'Quantity'
  },
  Unit: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'Unit'
  },
  Remarks: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'Remarks'
  }
}, {
  tableName: 'RESOURCE',
  timestamps: false
});

module.exports = Resource;
