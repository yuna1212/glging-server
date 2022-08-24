class DtoBuilder {
  #dto;
  constructor() {
    this.#dto = {};
  }

  add_success(is_successed) {
    this.#dto.success = is_successed;
    return this;
  }

  add_existing(is_existing) {
    this.#dto.is_existing = is_existing;
    return this;
  }

  get_dto() {
    return this.#dto;
  }
}

exports.DtoBuilder = DtoBuilder;
