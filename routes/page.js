const express = require('express');
const app = express();
const router = express.Router();
const User = require('../models/user');
app.use(express.json());

let sessions = 0; // 추후 삭제
// 모두모두 반환 라우터 -> 나중에 삭제
router.get('/', async (req, res) => {
  try {
    const user_in_db = await User.findAll({});
    res.json(user_in_db);
  } catch (err) {
    console.error(err);
  }
});

// 로그인
router.post('/login', async (req, res) => {
  let user_id = req.body.user.user_id;
  let password = req.body.user.password;
  let login_result = { description: '', session_id: -1 };
  try {
    const user_in_db = await User.findAll({
      where: { user_id: user_id, password: password },
    });
    if (user_in_db.length > 0) {
      login_result.description = 'successed';
      login_result.session_id = ++sessions;
    } else {
      login_result.description = 'failed';
      login_result.session_id = -1;
    }
  } catch (err) {
    console.error(err);
    login_result.description = 'failed';
    login_result.session_id = -1;
  }
  res.json(login_result);
});

// 회원가입
router
  .route('/join')
  .get(async (req, res) => {
    let user_id = req.query.user_id;
    let join_result = { is_existing: null };
    try {
      const user_in_db = await User.findOne({
        where: { user_id: user_id },
      });
      if (user_in_db === null) {
        join_result.is_existing = false;
      } else {
        join_result.is_existing = true;
      }
    } catch (err) {
      console.error(err);
      join_result.is_existing = true;
    }
    res.json(join_result); // 아 근데 어차피 에러 캐치되면 여기 실행 안되는구나..? 올리는게 낫나.. 아니네 실행되네?왜되지
  })
  .post(async (req, res) => {
    let user_id = req.body.user.user_id;
    let password = req.body.user.password;
    let join_result = { description: 'failed', session_id: -1 };
    try {
      const user_in_db = await User.create({
        user_id: user_id,
        password: password,
      });
      join_result.description = 'successed';
      join_result.session_id = ++sessions;
    } catch (err) {
      console.error(err);
    }
    res.json(join_result);
  });

// 인증번호 요청
router.post('/authentication-number', async (req, res) => {
  let student_id = req.body.user.student_id;
  let user_id = req.body.user.user_id;
  let auth_number_result = { description: 'failed' };
  try {
    const auth_num = Math.floor(Math.random() * (1000000 - 100000)) + 100000;
    const user_in_db = await User.update(
      {
        cert_number: auth_num,
        univ_cert_status: 1,
        student_id: student_id,
      },
      {
        where: { user_id: user_id },
      }
    );
    // 메일서버에서, student_id에 해당하는 메일로 내용 보내기
    if (user_in_db[0] > 0) auth_number_result.description = 'successed';
  } catch (err) {
    console.error(err);
  }
  res.json(auth_number_result);
});

// 학생 이메일에서 얻은 인증번호를 사용자가 입력한 것 검증
router.post('/student-email', async (req, res) => {
  let authenticate_number = req.body.authenticate_number;
  let user_id = req.body.user.user_id;
  let student_auth_result = { description: 'failed' };
  try {
    const user_in_db = await User.findOne({
      where: { user_id: user_id, cert_number: authenticate_number },
    });
    if (user_in_db === null);
    else {
      //   사용자가 입력한 인증번호와 DB의 인증번호 일치한다면, 인증 완료로 바꾸기
      const user_update = await User.update(
        {
          cert_number: -1,
          univ_cert_status: 0,
        },
        {
          where: { user_id: user_id },
        }
      );
      if (user_update && user_update[0]) {
        student_auth_result.description = 'successed';
      }
    }
  } catch (err) {
    console.error(err);
  }
  res.json(student_auth_result);
});

module.exports = router;
