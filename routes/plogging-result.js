const express = require('express');
const router = express.Router();
const multer = require('multer');
const Litter = require('../models/litter');
const Plogging = require('../models/plogging');
const tokens = require('../modules/token');
// Token 실패 코드
const TOKEN_EXPIRED = require('../modules/token').TOKEN_EXPIRED;
const TOKEN_INVALID = require('../modules/token').TOKEN_INVALID;

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../PLOGGING-RESULT-IMAGES/'); // 해당 경로에 폴더가 있는지 확인.. 없으면 에러
  },
  filename: function (req, file, cb) {
    let extArray = file.mimetype.split('/');
    let extension = extArray[extArray.length - 1];
    cb(null, Date.now() + '.' + extension); // 확장자 붙여서 저장
  },
});

const upload = multer({
  limits: { filesize: 50 * 1024 * 1024 },
  storage: storage,
});

router.post('', upload.single('image'), async (req, res) => {
  var ploggingUpdateResult = { success: false };
  let userAccessToken = req.body.access_token;
  //////////////////// 토큰 검증
  let token = await tokens.access.verify(userAccessToken);
  // 적합하지 않은 토큰이면
  if (TOKEN_EXPIRED === token) {
    ploggingUpdateResult.description = 'token expired';
    res.json(ploggingUpdateResult);
  } else if (TOKEN_INVALID === token) {
    ploggingUpdateResult.description = 'token invalid';
    res.json(ploggingUpdateResult);
  }
  // 적합한 토큰이면
  userId = token.user_id;

  // litter 모델로 DB에 row 추가
  var litter_id;
  Litter.create({
    plastic_count: req.body.plastic_count,
    vinyles_count: req.body.vinyles_count,
    glasses_count: req.body.glasses_count,
    cans_count: req.body.cans_count,
    papers_count: req.body.papers_count,
    trash_count: req.body.trash_count,
  })
    .then((result) => {
      console.log('플로깅 쓰레기 정보 저장');
      litter_id = result.get({ plain: true }).id;
      // plogging 모델로 DB에 row 추가
      Plogging.create({
        user_id: userId,
        litter: litter_id,
        duration_time: req.body.duration_time,
        distance: req.body.distance,
        date: req.body.date,
        photo: req.file.filename,
      })
        .then((result) => {
          ploggingUpdateResult.success = true;
          ploggingUpdateResult.description =
            '플로깅 결과를 서버에 저장했습니다.';
          console.log('플로깅결과 저장');
          res.json(ploggingUpdateResult);
        })
        .catch((err) => {
          ploggingUpdateResult.description = '플로깅 정보가 올바르지 않습니다.';
          console.error(err);
          res.json(ploggingUpdateResult);
        });
    })
    .catch((err) => {
      ploggingUpdateResult.description =
        '쓰레기 개수 형식이 올바르지 않습니다.';
      console.error(err);
      res.json(ploggingUpdateResult);
    });
});

module.exports = router;
