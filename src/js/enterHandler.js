export default function enterHandler(event, chatInput, chatMessagesMaker, geolocation) {
  if (event.key === 'Enter') {
    const { value } = chatInput;
    if (!value || !value.trim()) {
      chatInput.setAttribute('value', '');
      return;
    }

    geolocation.call(
      (geoResponse) => {
        chatMessagesMaker.addMessage(geoResponse, value, 'text');
      },
    );
  }
}
