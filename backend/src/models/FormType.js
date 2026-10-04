const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FormType = sequelize.define('FORM_TYPE', {
  Type_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Type_Name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  Report_Group: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  Created_At: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'FORM_TYPE',
  timestamps: false
});

module.exports = FormType;
