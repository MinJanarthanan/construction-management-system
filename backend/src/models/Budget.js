const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Budget = sequelize.define('BUDGET', {
  Budget_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Budget_ID'
  },
  Project_ID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'Project_ID'
  },
  Total_Budget: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'Total_Budget'
  },
  Approved_Budget: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'Approved_Budget'
  },
  Created_Date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'Created_Date'
  },
  Remarks: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'Remarks'
  }
}, {
  tableName: 'BUDGET',
  timestamps: false
});

module.exports = Budget;
