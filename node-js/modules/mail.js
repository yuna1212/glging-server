const nodemailer = require('nodemailer');

SendMail = async (student_id, auth_number) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: `"Campus Plogging" <${process.env.NODEMAILER_USER}>`,
    to: `${student_id}@dankook.ac.kr`,
    subject: '캠퍼스 플로깅의 학교 인증',
    html: `
      <p>인증번호는 <span style="color: #FB7A01;"><b>${auth_number}</b></span>입니다.</p>`,
  });

  console.log('Message sent: %s', info.messageId);
};

module.exports = SendMail;
