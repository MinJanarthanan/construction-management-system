const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LOW_STOCK_THRESHOLD = parseFloat(process.env.LOW_STOCK_THRESHOLD || '10');

const Material = sequelize.define('MATERIAL', {
  Material_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Material_ID'
  },
  Project_ID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'Project_ID'
  },
  Material_Name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'Material_Name'
  },
  Quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'Quantity'
  },
  Unit: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'Unit'
  },
  Unit_Cost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'Unit_Cost'
  },
  Total_Cost: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'Total_Cost'
  },
  Reorder_Level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
    field: 'Reorder_Level'
  }
}, {
  tableName: 'MATERIAL',
  timestamps: false,
  hooks: {
    beforeValidate: (material) => {
      const qty = parseFloat(material.Quantity) || 0;
      const cost = parseFloat(material.Unit_Cost) || 0;
      material.Total_Cost = (qty * cost).toFixed(2);
    },
    beforeSave: (material) => {
      const qty = parseFloat(material.Quantity) || 0;
      const cost = parseFloat(material.Unit_Cost) || 0;
      material.Total_Cost = (qty * cost).toFixed(2);
    }
  }
});

// JSON serializer with isLowStock helper flag
Material.prototype.toJSON = function() {
  const values = { ...this.get() };
  const qty = parseFloat(values.Quantity) || 0;
  values.isLowStock = qty <= LOW_STOCK_THRESHOLD;
  return values;
};

module.exports = Material;
