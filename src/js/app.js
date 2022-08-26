import API from './API';
import ChatMessagesMaker from './ChatMessagesMaker';
import Modal from './Modal';
import Geolocation from './Geolocation';
import enterHandler from './enterHandler';
import WebSocketAPI from './WebSocketAPI';
import DnD from './DnD';
import MessagesControls from './MessagesControls';
import SideNavigator from './SideNavigator';

const chat = document.querySelector('.chat-widget');
const messagesContainer = chat.querySelector('.chat-widget__messages-container');
const messages = chat.querySelector('.chat-widget__messages');
const chatInput = chat.querySelector('.chat-widget__input');

const loading = document.querySelector('.status-loading');

const hostname = 'chaos-organizer-2021.herokuapp.com';

const api = new API(`https://${hostname}`, loading, messagesContainer, messages, chatInput);

api.preConnection();

const ws = new WebSocket(`wss://${hostname}`);

const chatMessagesMaker = new ChatMessagesMaker(
  chatInput,
  messages,
  messagesContainer,
  api,
  ws,
);

const webSocketAPI = new WebSocketAPI(
  ws,
  messages,
  messagesContainer,
  chatMessagesMaker,
);

webSocketAPI.handleIncomingMessages();
webSocketAPI.handleServerDisconnection();

const dropZoneInput = document.querySelector('.drop-zone__input');
const modalWindow = document.querySelector('.modal');
const modalHeader = modalWindow.querySelector('.modal__header');
const modalMessage = modalWindow.querySelector('.modal__message');
const modalForm = modalWindow.querySelector('.modal__form');
const modalFormInput = modalWindow.querySelector('.modal-form__input');
const modalCancelButton = modalWindow.querySelector('.modal-form__button-cancel');

const modal = new Modal(
  modalWindow,
  modalHeader,
  modalMessage,
  modalForm,
  modalFormInput,
  modalCancelButton,
  chatInput,
  dropZoneInput,
  chatMessagesMaker,
);

modal.assignInputCheckerHandler();
modal.assignSubmitHandler();
modal.assignCancelHandler();

const geolocation = new Geolocation(
  chatInput,
  modal,
);

const dropZone = messagesContainer;
const paperclip = document.querySelector('.paperclip');
const geoToggler = document.querySelector('.geolocation-toggler');

const dragAndDrop = new DnD(
  dropZone,
  dropZoneInput,
  paperclip,
  geolocation,
  geoToggler,
  chatMessagesMaker,
);

dragAndDrop.handleDropZoneInput();
dragAndDrop.handleDropZone();

chatInput.addEventListener('keyup', (event) => enterHandler(
  event,
  chatInput,
  chatMessagesMaker,
  geolocation,
  geoToggler,
));

const chatForm = document.querySelector('.chat__form');
chatForm.addEventListener('submit', (event) => event.preventDefault());

const messagesControls = new MessagesControls(
  messagesContainer,
  messages,
  api,
);

messagesControls.assignHandler();

function lazyLoadingCallback(response, scrolling) {
  response.json().then(
    (data) => {
      let html = '';
      data.body.forEach((message) => {
        html += chatMessagesMaker.getMessageHTML(message);
      });
      messages.insertAdjacentHTML('afterbegin', html);
      const pinnedMessage = messages.querySelector('[data-state="pinned"]');
      if (pinnedMessage) {
        const pin = pinnedMessage.querySelector('.message__pin');
        pin.click();
      }
      if (data.rest <= 0) {
        messages.classList.remove('lazy-loading');
      }
      messagesContainer.style.overflowY = 'auto';
      if (scrolling) {
        messagesContainer.scrollTo(0, messagesContainer.scrollHeight);
        chatInput.focus();
      }
    },
  );
}

api.getMessages(0, (response) => lazyLoadingCallback(response, true));

messagesContainer.addEventListener('scroll', (event) => {
  const { currentTarget } = event;

  if (messages.classList.contains('lazy-loading')) {
    const quarterScrolling = (currentTarget.scrollHeight - currentTarget.clientHeight) / 4;

    if (currentTarget.scrollTop < quarterScrolling) {
      api.getMessages(messages.children.length, (response) => lazyLoadingCallback(response, false));
    }
  }
});

const sideNav = chat.querySelector('.side-nav');
const sideNavControls = sideNav.querySelectorAll('a');
const sideNavigator = new SideNavigator(sideNavControls, messages, messagesContainer);

sideNavigator.handleClick();

setTimeout(() => {
  messagesContainer.scrollTo(0, messagesContainer.scrollHeight);
}, 300);
