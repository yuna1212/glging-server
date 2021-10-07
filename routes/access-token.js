const express = require('express');
const app = express();
const router = express.Router();
const User = require('../models/user');
const tokens = require('../modules/token');
// Token 실패 코드
const TOKEN_EXPIRED = require('../modules/token').TOKEN_EXPIRED;
const TOKEN_INVALID = require('../modules/token').TOKEN_INVALID;

// 미들웨어 설정
app.use(express.json());

router.get('', async (req, res) => {
  let result = { description: 'failed' };
  let userRefreshToken = req.query.refresh_token;

  token = await tokens.refresh.verify(userRefreshToken);
  // 적합하지 않은 토큰이면
  if (TOKEN_EXPIRED === token) {
    result.description = 'token expired';
    res.json(result);
  } else if (TOKEN_INVALID === token) {
    result.description = 'token invalid';
    res.json(result);
  }
  // 적합한 토큰이면
  userId = token.user_id;

  // access 토큰 발급
  result.access_token = await tokens.access.sign(userId);
  result.description = 'successed';

  res.json(result);
});

module.exports = router;
