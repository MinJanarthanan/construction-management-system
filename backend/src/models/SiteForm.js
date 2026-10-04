const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SiteForm = sequelize.define('SITE_FORM', {
  Form_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Source_Ref: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  Project_ID: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  Type_ID: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  Form_Name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  Form_Status: {
    type: DataTypes.STRING(80),
    allowNull: false
  },
  Status_Class: {
    type: DataTypes.ENUM('Open', 'Closed'),
    allowNull: true
  },
  Location_Path: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  Created_Date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  Status_Changed_Date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  Open_Actions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  Total_Actions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  Association: {
    type: DataTypes.ENUM('parent', 'child'),
    allowNull: true
  },
  Is_Overdue: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  Has_Images: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  Has_Comments: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  Has_Documents: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  Created_At: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'SITE_FORM',
  timestamps: false
});

module.exports = SiteForm;
