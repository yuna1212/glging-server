const User = require('../../models/user');
const token = require('../../modules/token');
const DtoBuilder = require('./join_dto').DtoBuilder;

const join_service = async (user_id, user_password) => {
  if (await _create_user(user_id, user_password)) return await _get_successed_dto(user_id);
  else return _get_failed_dto();
};

const _create_user = async (user_id, user_password) => {
  try {
    await User.create({
      user_id: user_id,
      password: user_password,
    });
    return true;
  } catch (err) {
    return false;
  }
};

const _get_successed_dto = async (user_id) => {
  return new DtoBuilder()
    .add_description('회원가입 성공!')
    .add_success(true)
    .add_user(user_id)
    .add_refresh_token(await token.refresh.sign(user_id))
    .add_access_token(await token.access.sign(user_id))
    .get_dto();
};

const _get_failed_dto = () => {
  return new DtoBuilder().add_description('회원가입 실패.. 다시 시도해주세요.').add_success(false).get_dto();
};

module.exports = join_service;
