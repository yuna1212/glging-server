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
        kind: {
          type: Sequelize.STRING(524),
          allowNull: false,
          defaultValue: 'user custom',
        },
        title: {
          type: Sequelize.STRING(524),
          allowNull: false,
        },
        duration_time: {
          type: Sequelize.DataTypes.TIME,
        },
        distance_by_hakyo: {
          type: Sequelize.INTEGER,
        },
        litter_kind: {
          type: Sequelize.INTEGER,
        },
        litter_count: {
          type: Sequelize.INTEGER,
        },
      },
      {
        sequelize,
        timestamps: false,
        paronoid: false,
        underscored: true,
        modelName: 'Challenge',
        tableName: 'challenges',
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
      }
    );
  }
  static associate(db) {
    db.Plogging.belongsTo(db.User, {
      foreignKey: 'made_by',
      targetKey: 'user_id',
    });
  }
};
