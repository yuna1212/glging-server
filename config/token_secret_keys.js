const dotenv = require('dotenv');
dotenv.config();

const refresh_option = {
  secretKey: process.env.JWT_REFRESH_SECRET_KEY,
  option: {
    algorithm: 'HS256',
    expiresIn: '60 days',
    issuer: 'plogging_server',
  },
};

const access_option = {
  secretKey: process.env.JWT_ACCESS_SECRET_KEY,
  option: {
    algorithm: 'HS256',
    expiresIn: '60 days',
    issuer: 'plogging_server',
  },
};
module.exports = { refresh_option, access_option };
