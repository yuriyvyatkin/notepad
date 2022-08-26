export default function enterHandler(event, chatInput, chatMessagesMaker, geolocation, geoToggler) {
  if (event.key === 'Enter') {
    const { value } = chatInput;
    if (!value || !value.trim()) {
      chatInput.setAttribute('value', '');
      return;
    }

    if (geoToggler.checked) {
      geolocation.call(
        (geoResponse) => {
          chatMessagesMaker.addMessage(geoResponse, value, 'text');
        },
      );
    } else {
      chatMessagesMaker.addMessage({ lat: 0, lon: 0 }, value, 'text');
    }
  }
}
