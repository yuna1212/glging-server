/* TODO: Dto builder에 대한 abstract class 선언하기. */

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

  add_user(user_id) {
    this.#dto.user = {
      nickname: null,
      student_id: null,
      user_id: user_id,
      univ_cert_status: 2,
      profile_image: 'http://18.119.6.206:8001/PLOGGING-PROFILE-IMAGES/DEFAULT-IMAGE.jpg',
    };
    return this;
  }

  get_dto() {
    return this.#dto;
  }
}

exports.DtoBuilder = DtoBuilder;
