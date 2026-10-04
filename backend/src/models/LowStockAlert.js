const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LowStockAlert = sequelize.define('LOW_STOCK_ALERT', {
  Alert_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Material_ID: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  Project_ID: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  Material_Name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  Current_Quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  Reorder_Level: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  Alert_Date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  Status: {
    type: DataTypes.ENUM('Active', 'Resolved'),
    defaultValue: 'Active'
  }
}, {
  tableName: 'LOW_STOCK_ALERT',
  timestamps: false
});

module.exports = LowStockAlert;
