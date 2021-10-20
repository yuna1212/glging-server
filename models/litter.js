const Sequelize = require('sequelize');

module.exports = class Litter extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
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
        modelName: 'Litter',
        tableName: 'litter',
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
      }
    );
  }

  static associate(db) {
    db.Litter.hasOne(db.Plogging, {
      foreignKey: 'litter',
      sourceKey: 'id',
    });
  }
};
