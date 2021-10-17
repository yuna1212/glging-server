const Sequelize = require('sequelize');

module.exports = class Plogging extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        duration_time: {
          type: Sequelize.DataTypes.TIME,
          allowNull: false,
        },
        distance: {
          type: Sequelize.DataTypes.FLOAT,
          allowNull: false,
        },
        date: {
          type: Sequelize.DataTypes.DATEONLY,
          allowNull: false,
        },
        photo: {
          type: Sequelize.DataTypes.STRING(1024),
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: false,
        paronoid: false,
        underscored: true,
        modelName: 'Plogging',
        tableName: 'ploggings',
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
      }
    );
  }

  static associate(db) {
    db.Plogging.belongsTo(db.User, {
      foreignKey: 'user_id',
      targetKey: 'user_id',
    });
    db.Plogging.belongsTo(db.Litter, {
      foreignKey: 'litter',
      targetKey: 'id',
    });
  }
};
