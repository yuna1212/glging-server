const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.route('/dddiri123').get(async (req, res) => {
  try {
    await User.destroy({
      where: { user_id: 'dddiri123' },
    });
    console.log('dddiri 삭제됨');
    res.status(200).send('dddiri 삭제됨');
  } catch (e) {
    console.log(e);
    res.status(400).send('dddiri 삭제 못함');
  }
});
router.route('/dddiri123/auth').get(async (req, res) => {
  try {
    await User.update(
      { univ_cert_status: 2, cert_number: -1 },
      { where: { user_id: 'dddiri123' } }
    );
    console.log('dddiri 학교 정보 초기화');
    res.status(200).send('dddiri123 학교 정보 초기화');
  } catch (e) {
    console.log(e);
    res.status(400).send('dddiri 학교 인증 초기화 못함');
  }
});

module.exports = router;
