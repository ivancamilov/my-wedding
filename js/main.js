var latestKnownScrollY = 0,
    ticking = false;

function onScroll() {
  latestKnownScrollY = window.scrollY;
  requestTick();
}

function requestTick() {
  if(!ticking) {
    requestAnimationFrame(update);
  }
  ticking = true;
}

function update() {
  // reset the tick so we can
  // capture the next onScroll
  ticking = false;
  var currentScrollY = latestKnownScrollY;
  var headerOffset = document.getElementById('we-meet').getBoundingClientRect().top;

  if(headerOffset <= 0) {
    document.getElementById('header').className = 'visible';
  }
  else {
    document.getElementById('header').className = '';
  }
}

function toggleMenuButton(e) {
  var navigation = document.getElementById('navigation');

  if(navigation.className != 'active')
    navigation.className = 'active';
  else
    navigation.className = '';

  if(e.currentTarget != "navigation-toggle")
    e.preventDefault();
}

document.addEventListener("DOMContentLoaded", function(e) {
  // Initialize the code that evaluates wether we should
  // show the menu bar or not.
  window.addEventListener('scroll', onScroll, false);

  // also, we make sure the page loads the menu properly when reloaded
  update();

  // Make sure we scroll smoothly when going to an anchor
  smoothScroll.init();

  // Initialize the (mobile & tablet) navigation-toggle button
  var navButton = document.getElementById('navigation-toggle');
  navButton.addEventListener('click', toggleMenuButton);

  // We should hide the menu when we click the nav links
  var navigation = document.getElementById('navigation');
  navigation.addEventListener('click', toggleMenuButton);
});