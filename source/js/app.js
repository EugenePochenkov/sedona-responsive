const mainNav = document.querySelector('.main-nav');
const buttonToggle = document.querySelector('.button-toggle');

mainNav.classList.remove('main-nav--nojs');

buttonToggle.addEventListener('click', () => {
  if (mainNav.classList.contains('main-nav--closed')) {
    mainNav.classList.remove('main-nav--closed');
    mainNav.classList.add('main-nav--opened');
    buttonToggle.classList.add('button-toggle--opened');
  } else {
    mainNav.classList.add('main-nav--closed');
    mainNav.classList.remove('main-nav--opened');
    buttonToggle.classList.remove('button-toggle--opened');
  }
});
