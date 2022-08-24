const User = require('../../models/user');
const DtoBuilder = require('./id_check_dto').DtoBuilder;

const id_check_service = async (user_id) => {
  if (await _exists(user_id)) return _get_successed_dto();
  return _get_failed_dto();
};

const _get_successed_dto = () => {
  return new DtoBuilder().add_existing(true).add_success(true).get_dto();
};

const _get_failed_dto = () => {
  // FIXME: existing과 success는 항상 동일한 값 갖는다.
  return new DtoBuilder().add_existing(false).add_success(false).get_dto();
};

const _exists = async (user_id) => {
  try {
    const user = await User.findOne({
      where: { user_id: user_id },
    });

    return user !== null;
  } catch (err) {
    return null;
  }
};

module.exports = id_check_service;
