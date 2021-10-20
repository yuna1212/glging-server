const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];
const User = require('./user');
const Plogging = require('./plogging');
const Litter = require('./litter');
const Challenge = require('./challenge');

const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

sequelize.dialect.supports.schemas = true;

db.sequelize = sequelize;

// export할 모듈에 모델 넣기
db.User = User;
db.Plogging = Plogging;
db.Litter = Litter;
db.Challenge = Challenge;
// 모델 초기화
User.init(sequelize);
Plogging.init(sequelize);
Litter.init(sequelize);
Challenge.init(sequelize);
// 모델 관계설정
User.associate(db);
Plogging.associate(db);
Litter.associate(db);
Challenge.associate(db);

module.exports = db;
