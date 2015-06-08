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
    document.getElementById('header').className = "visible";
  }
  else {
    document.getElementById('header').className = "";
  }
}

// Initialize the code that evaluates wether we should
// show the menu bar or not.
window.addEventListener('scroll', onScroll, false);

// Make sure we scroll smoothly
smoothScroll.init();