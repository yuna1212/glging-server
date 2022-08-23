class DtoBuilder {
  #dto;
  constructor() {
    this.#dto = {};
  }

  add_success(is_successed) {
    this.#dto.success = is_successed;
    return this;
  }

  add_description(description) {
    this.#dto.description = description;
    return this;
  }

  add_access_token(access_token) {
    this.#dto.access_token = access_token;
    return this;
  }

  add_refresh_token(refresh_token) {
    this.#dto.refresh_token = refresh_token;
    return this;
  }

  add_user(user) {
    this.#dto.user = {
      nickname: user.univ_cert_status === 0 ? user.nickname || user.student_id.toString() : null,
      student_id: user.student_id,
      user_id: user.user_id,
      univ_cert_status: user.univ_cert_status,
      profile_image: 'http://18.119.6.206:8001/PLOGGING-PROFILE-IMAGES/' + user.profile_image,
    };
    return this;
  }

  get_dto() {
    return this.#dto;
  }
}

exports.DtoBuilder = DtoBuilder;
