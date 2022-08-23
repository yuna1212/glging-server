const User = require('../../models/user');
const token = require('../../modules/token');
const DtoBuilder = require('./login_dto').DtoBuilder;

const id_login_service = async (user_id, user_password) => {
  if (!(user_id && user_password)) return _get_failed_dto('실패');

  const user = await _find_user(user_id, user_password);

  return await _get_dto(user);
};

const token_login_service = async (access_token) => {
  if (!access_token) return _get_failed_dto('실패');

  const token_validation = await token.access.verify(access_token);

  switch (token_validation) {
    case token.TOKEN_EXPIRED:
      return _get_failed_dto('token expired');

    case token.TOKEN_INVALID:
      return _get_failed_dto('token invalid');

    default:
      const user = await _find_user(token_validation.user_id);
      return await _get_dto(user);
  }
};

const _find_user = async (user_id, user_password = null) => {
  let where_condition = { user_id: user_id };
  if (user_password) where_condition.password = user_password;
  try {
    return await User.findOne({
      attributes: ['nickname', 'student_id', 'user_id', 'univ_cert_status', 'profile_image'],
      where: where_condition,
    });
  } catch (error) {
    return null;
  }
};

const _get_dto = async (user) => {
  if (user)
    return new DtoBuilder()
      .add_description('로그인 성공')
      .add_success(true)
      .add_refresh_token(await token.refresh.sign(user.user_id))
      .add_access_token(await token.access.sign(user.user_id))
      .add_user(user)
      .get_dto();
  else return _get_failed_dto('해당 계정이 존재하지 않습니다.'); // 기존 '아이디 또는 비밀번호가 일치하지 않습니다' 설명을 통일함
};

const _get_failed_dto = (description) => {
  return new DtoBuilder().add_description(description).add_success(false).get_dto();
};

exports.id_login_service = id_login_service;
exports.token_login_service = token_login_service;
