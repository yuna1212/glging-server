const express = require('express');
const app = express();
const router = express.Router();
const { id_login_service, token_login_service } = require('./login_service');

// 미들웨어 설정
app.use(express.json());

router
  .route('')
  .post(async (req, res) => {
    res.json(await id_login_service(req.body.user_id, req.body.password));
  })
  .get(async (req, res) => {
    res.json(await token_login_service(req.query.access_token));
  });

module.exports = router;
