import StoriesView from '../views/StoriesView.js';
import LoginView from '../views/LoginView.js';
import RegisterView from '../views/RegisterView.js';
import UploadView from '../views/UploadView.js';
import DetailView from '../views/DetailView.js';
import GuestUploadView from '../views/GuestUploadView.js';

export default {
    '#/': StoriesView,
    '#/login': LoginView,
    '#/register': RegisterView,
    '#/upload': UploadView,
    '#/guest-upload': GuestUploadView,
    '#/detail': DetailView,
};
