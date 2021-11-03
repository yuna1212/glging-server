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
        client_id: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
        },
        duration_time: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
        },
        distance: {
          type: Sequelize.DataTypes.FLOAT,
          allowNull: false,
        },
        start_date: {
          type: Sequelize.DataTypes.DATEONLY,
          allowNull: false,
        },
        end_date: {
          type: Sequelize.DataTypes.DATEONLY,
          allowNull: false,
        },
        photo: {
          type: Sequelize.DataTypes.STRING(1024),
          allowNull: true,
        },
        count_of_badge_got: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        plastic_count: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        vinyles_count: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        glasses_count: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        cans_count: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        papers_count: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        trash_count: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
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
  }
};
