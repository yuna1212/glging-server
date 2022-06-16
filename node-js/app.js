const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const logger = require('./modules/log_winston');

// .env로 비밀키 보관
const dotenv = require('dotenv');
dotenv.config();

// 라우터 가져오기
const loginRouter = require('./routes/login');
const joinRouter = require('./routes/join');
const schoolAuthenticationRouter = require('./routes/school-authentication');
const refreshRouter = require('./routes/access-token');
const ploggingResultRouter = require('./routes/plogging-result');
const challengesRouter = require('./routes/challenges');
const plogginghistoryRouter = require('./routes/plogging-history');
const rankingRouter = require('./routes/ranking');
const testRouter = require('./routes/test');

// MySQL 설정 설정
const { sequelize } = require('./models/index');

const app = express();
app.enable('trust proxy');

app.set('port', process.env.PORT || 8001);

// 로그 설정
app.use(morgan('short', { stream: logger.stream })); // morgan 로그 설정

sequelize
  .sync({ force: false })
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.log('데이터베이스 연결 실패');
    console.error(err);
  });

app.use(
  '/PLOGGING-RESULT-IMAGES',
  express.static('../PLOGGING-RESULT-IMAGES/')
); // 플로깅 결과 로그에 대한 이미지
app.use(
  '/PLOGGING-PROFILE-IMAGES',
  express.static('../PLOGGING-PROFILE-IMAGES/')
); // 플로깅 결과 로그에 대한 이미지
app.use(express.json());
app.unsubscribe(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

// 라우트 연결
app.use('/login', loginRouter);
app.use('/join', joinRouter);
app.use('/school-authentication', schoolAuthenticationRouter);
app.use('/access-token', refreshRouter);
app.use('/plogging-result', ploggingResultRouter);
app.use('/challenges', challengesRouter);
app.use('/plogging-history', plogginghistoryRouter);
app.use('/ranking', rankingRouter);
app.use('/test', testRouter);

app.use((req, res, next) => {
  const error = new Error();
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  err.status = err.status || 500;
  res.sendStatus(err.status);
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중');
});
