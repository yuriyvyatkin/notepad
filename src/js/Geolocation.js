export default class Geolocation {
  constructor(chatInput, modal) {
    this.chatInput = chatInput;
    this.modal = modal;
  }

  setGeoResponse() {
    this.chatInput.closest('form').style.visibility = 'hidden';

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => this.handleSuccess(position),
        (error) => this.handleRejection(error),
      );
    } else {
      this.chatInput.dataset.geoResponse = JSON.stringify({
        header: 'Ваш браузер не поддерживает геолокацию',
        message: 'Смените браузер, либо введите местоположение в ручную.',
      });
    }
  }

  call(callback) {
    this.setGeoResponse();

    const timerId = setInterval(() => {
      if (this.chatInput.dataset.geoResponse) {
        const geoResponse = JSON.parse(this.chatInput.dataset.geoResponse);

        this.chatInput.closest('form').style.visibility = 'initial';

        if (geoResponse.success) {
          delete geoResponse.success;
          callback(geoResponse);
        } else {
          this.modal.setContent(geoResponse);
          this.modal.toggle();
        }

        clearInterval(timerId);
      }
    }, 300);
  }

  handleSuccess(position) {
    this.chatInput.dataset.geoResponse = JSON.stringify({
      success: true,
      lat: position.coords.latitude,
      lon: position.coords.longitude,
    });
  }

  handleRejection(error) {
    const response = {
      header: '',
      message: '',
    };

    switch (error.code) {
      case error.PERMISSION_DENIED:
        response.header = 'Настройками текущего браузера запрещен запрос геолокации';
        response.message = 'Измените настройки конфиденциальности, либо введите местоположение в ручную.';
        break;
      case error.POSITION_UNAVAILABLE:
        response.header = 'Информация о вашем местоположении недоступна';
        response.message = 'Введите местоположение в ручную.';
        break;
      case error.TIMEOUT:
        response.header = 'Истекло время ожидания запроса вашего местоположения';
        response.message = 'Нажмите "Отмена" и попробуйте ещё раз, либо введите местоположение в ручную.';
        break;
      default:
        response.header = 'Произошла неизвестная ошибка';
        response.message = 'Нажмите "Отмена" и попробуйте ещё раз, либо введите местоположение в ручную.';
        break;
    }

    this.chatInput.dataset.geoResponse = JSON.stringify(response);
  }
}
