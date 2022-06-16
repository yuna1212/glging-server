const jwt = require('jsonwebtoken');
const tokenInfos = {
  refresh: require('../config/token_secret_keys').refresh_option,
  access: require('../config/token_secret_keys').access_option,
};
const TOKEN_EXPIRED = 'Token is expired';
const TOKEN_INVALID = 'Token is invalid';

const token = (secretKey, keyOptions) => ({
  sign: async (userId) => {
    const payload = {
      user_id: userId,
    };
    const token = jwt.sign(payload, secretKey, keyOptions);
    console.log(secretKey);
    return token;
  },
  verify: async (token) => {
    let decoded;
    try {
      decoded = jwt.verify(token, secretKey);
    } catch (err) {
      if (err.message === 'jwt expired') {
        console.error(err);
        return TOKEN_EXPIRED;
      } else {
        console.error(err);
        return TOKEN_INVALID;
      }
    }
    return decoded;
  },
});

const refresh = token(tokenInfos.refresh.secretKey, tokenInfos.refresh.option);
const access = token(tokenInfos.access.secretKey, tokenInfos.access.option);
module.exports = { refresh, access, TOKEN_EXPIRED, TOKEN_INVALID };
