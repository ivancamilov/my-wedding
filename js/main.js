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
  var jumpingHenOffset = document.getElementById('hen-jump-trigger').getBoundingClientRect().top;
  var flyingHenOffset = document.getElementById('flying-jump-trigger').getBoundingClientRect().top;
  var staticOffset = document.getElementById('static-trigger').getBoundingClientRect().top;

  if(headerOffset <= 0) {
    document.getElementById('header').className = 'visible';
  }
  else {
    document.getElementById('header').className = '';
  }

  var jumpingHen = document.getElementById('jumping-hen');

  if(staticOffset <= 0) {
    jumpingHen.className = 'jumping-hen flying static';
  }
  else if(jumpingHenOffset <= 0) {

    var flyAnimation = function(e) {
      jumpingHen.removeEventListener('animationend', flyAnimation);

      if(jumpingHen.className == 'jumping-hen falling-down') {
        document.getElementById('jumping-hen').className = 'jumping-hen falling-down flying';
      }
    };

    var fallAnimation = function(e) {
      jumpingHen.removeEventListener('animationend', fallAnimation);
      if(jumpingHen.className == 'jumping-hen doing-jump') {
        document.getElementById('jumping-hen').src = 'img/flying-hen.svg';
        document.getElementById('jumping-hen').className = 'jumping-hen falling-down';

        jumpingHen.addEventListener('animationend', flyAnimation);
      }
    };

    if(jumpingHen.className.indexOf('f') == -1 && jumpingHen.className.indexOf('static') == -1) {
      jumpingHen.src = 'img/jumping-hen.svg';
      jumpingHen.className = 'jumping-hen doing-jump';
      jumpingHen.addEventListener('animationend', fallAnimation);
    }
  }
  else {
    document.getElementById('jumping-hen').src = 'img/jumping-hen.svg';
    document.getElementById('jumping-hen').className = 'jumping-hen';
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

$(document).ready(function() {
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

  $('#intro .title').lettering();
  $('.couple-nicknames').lettering();
  $('#the-wedding .title').lettering();
  $('#rsvp .title').lettering();
});