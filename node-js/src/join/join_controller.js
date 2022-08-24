const express = require('express');
const app = express();
const router = express.Router();
const join_service = require('./join_service');
const id_check_service = require('./id_check_service');

// 미들웨어 설정
app.use(express.json());

// 회원가입
router.post('', async (req, res) => {
  res.json(await join_service(req.body.user_id, req.body.password));
});

// id 중복체크
router.get('/id', async (req, res) => {
  res.json(await id_check_service(req.query.user_id));
});

module.exports = router;
