const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Expense = sequelize.define('EXPENSE', {
  Expense_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Expense_ID'
  },
  Project_ID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'Project_ID'
  },
  Category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'Category'
  },
  Amount: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'Amount'
  },
  Expense_Date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'Expense_Date'
  },
  Description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'Description'
  },
  Is_Override: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'Is_Override'
  }
}, {
  tableName: 'EXPENSE',
  timestamps: false
});

module.exports = Expense;
