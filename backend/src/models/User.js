const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('USER', {
  User_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'User_ID'
  },
  Username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'Username'
  },
  Email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'Email',
    validate: {
      isEmail: true
    }
  },
  Password_Hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Password_Hash'
  },
  Full_Name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'Full_Name'
  },
  Role_ID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'Role_ID'
  },
  Status: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Suspended'),
    allowNull: false,
    defaultValue: 'Active',
    field: 'Status'
  }
}, {
  tableName: 'USER',
  timestamps: false,
  hooks: {
    beforeCreate: async (user) => {
      if (user.Password_Hash && !user.Password_Hash.startsWith('$2a$') && !user.Password_Hash.startsWith('$2b$')) {
        const salt = await bcrypt.genSalt(10);
        user.Password_Hash = await bcrypt.hash(user.Password_Hash, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('Password_Hash') && !user.Password_Hash.startsWith('$2a$') && !user.Password_Hash.startsWith('$2b$')) {
        const salt = await bcrypt.genSalt(10);
        user.Password_Hash = await bcrypt.hash(user.Password_Hash, salt);
      }
    }
  }
});

User.prototype.validatePassword = async function(password) {
  return bcrypt.compare(password, this.Password_Hash);
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.Password_Hash;
  return values;
};

module.exports = User;
