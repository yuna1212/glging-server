const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        nickname: {
          type: Sequelize.STRING(32),
          allowNull: true,
          unique: true,
        },
        student_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          unique: true,
          defaultValue: null,
        },
        password: {
          type: Sequelize.STRING(45),
          allowNull: false,
        },
        user_id: {
          type: Sequelize.STRING(20),
          allowNull: false,
          primaryKey: true,
        },
        univ_cert_status: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 2,
        },
        cert_number: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: -1,
        },
      },
      {
        sequelize,
        timestamps: false,
        paronoid: false,
        underscored: true,
        modelName: 'User',
        tableName: 'users',
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
      }
    );
  }

  static associate(db) {
    db.User.hasMany(db.Plogging, {
      foreignKey: 'user_id',
      sourceKey: 'user_id',
    });
  }
};
