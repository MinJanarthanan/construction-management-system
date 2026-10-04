const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Role = sequelize.define('ROLE', {
  Role_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Role_ID'
  },
  Role_Name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'Role_Name'
  },
  Description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'Description'
  }
}, {
  tableName: 'ROLE',
  timestamps: false
});

module.exports = Role;
