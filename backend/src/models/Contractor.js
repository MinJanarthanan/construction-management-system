const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Contractor = sequelize.define('CONTRACTOR', {
  Contractor_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Contractor_ID'
  },
  Contractor_Name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'Contractor_Name'
  },
  Phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'Phone'
  },
  Email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'Email',
    validate: {
      isEmail: true
    }
  },
  Address: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Address'
  }
}, {
  tableName: 'CONTRACTOR',
  timestamps: false
});

module.exports = Contractor;
