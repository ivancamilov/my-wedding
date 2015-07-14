/*
 * This code is largely taken from:
 * https://developers.facebook.com/docs/facebook-login/login-flow-for-web/v2.4
 *
 * There are only a few minor modifications made by me.
 */

var confirmButton = document.getElementById('confirm-button');
confirmButton.addEventListener('click', loginToFacebook);

var rsvpMessages = document.getElementById('rsvp-messages');

var guestList;

// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
  // The response object is returned with a status field that lets the
  // app know the current login status of the person.
  // Full docs on the response object can be found in the documentation
  // for FB.getLoginStatus().
  if (response.status === 'connected') {
    // Logged into your app and Facebook.
    confirmButton.className = 'confirm button';

    FB.api('/me', {fields: 'id,name,first_name'}, function(response) {
      if(authorizedUser(response.name)) {
        guests = guestCount(response.name);
        if(guests > 0) {
          showMessage('¡Puedes asistir con invitados, ' + response.first_name + '! Por favor, escribe los nombres abajo.');
          showGuestsForm(guests);
        }
        else {
          confirmUser(response.name);
          showMessage('Gracias por confirmar tu asistencia, ' + response.first_name + '. ¡No olvides guardar la fecha en tu calendario!<br><br> <small>Si deseas cambiar el estado de tu confirmación, por favor comunícate con Ivan o Mafe.</small>');
        }
      }
      else {
        showMessage('Parece que no estás en la lista de invitados. Es posible que esto sea un error del desarrollador (es decir, Iván). El pobre muchacho anda distraído con su futura esposa y no da pie con bola, así que es mejor que te comuniques con Mafe o Iván para aclarar este impase.');
      }
    });
  }
  else if (response.status === 'not_authorized') {
    // The person is logged into Facebook, but not your app.
    showMessage('Nos gustaría que nos acompañaras a la ceremonia. Por favor, da clic en el botón para confirmar tu asistencia.');
    confirmButton.className = 'confirm button visible';
  }
  else {
    // The person is not logged into Facebook, so we're not sure if
    // they are logged into this app or not.
    showMessage('Nos gustaría que nos acompañaras a la ceremonia. Por favor, da clic en el botón para confirmar tu asistencia.');
    confirmButton.className = 'confirm button visible';
  }
}

window.fbAsyncInit = function() {
FB.init({
  //appId      : '1447839545539933', // LIVE APP
  appId      : '1447844372206117', // TEST APP
  cookie     : true,
  xfbml      : true,
  version    : 'v2.4'
  });

  // Now that we've initialized the JavaScript SDK, we call
  // FB.getLoginStatus().  This function gets the state of the
  // person visiting this page and can return one of three states to
  // the callback you provide.  They can be:
  //
  // 1. Logged into your app ('connected')
  // 2. Logged into Facebook, but not your app ('not_authorized')
  // 3. Not logged into Facebook and can't tell if they are logged into
  //    your app or not.
  //
  // These three cases are handled in the callback function.

  $.ajax({
    url: 'json/guests.json',
    dataType: 'json',
    success: function(data) {
      guestList = data.guests;

      FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
      });
    },
    error: function() {
      // TODO: Handle this properly
      alert('hubo un error :(');
    }
  });
};

(function(d, s, id){
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {return;}
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/es_LA/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// This function is called when someone finishes with the Login
// Button.  See the onlogin handler attached to it in the sample
// code below.
function checkLoginState() {
  FB.getLoginStatus(function(response) {
    statusChangeCallback();
  });
}

function loginToFacebook(e) {
  e.preventDefault();
  FB.login(statusChangeCallback, {scope: 'public_profile,user_friends,email'});
}

function showMessage(message) {
  rsvpMessages.className = 'story-text hidden';
  rsvpMessages.addEventListener('transitionend', function(e) {
    rsvpMessages.removeEventListener('transitionend');
    rsvpMessages.innerHTML = message;
    rsvpMessages.className = 'story-text';
  });
}

// Checks if the FB user is on the Guestlist or not.
// This feels a bit hacky, because it's relying on names
// instead of IDs. However, it seems Facebook won't let us
// uniquely identify a user, so...
function authorizedUser(name) {
  for(var i = 0; i < guestList.length; i++) {
    if(guestList[i].name == name)
      return true;
  }

  return false;
}

// Determines the number of guests someone is allowed
// to bring.
function guestCount(name) {
  // TODO: calculate this!
  return 0;
}

// Confirms the user has RSVPed yes.
// It doesn't take into account duplicates,
// so it's our job to handle this properly.
function confirmUser(name) {
  //TODO this!
}

// Shows the guests form (duh) showing as many fields
// as guestCount indicates.
function showGuestsForm(guestCount) {
  rsvpForm = document.getElementById('rsvp-form');
  rsvpForm.className = 'visible';

  var submitButton = document.getElementById('guest-confirm-button');

  for(var i = 0; i < guestCount; i++) {
    var label = document.createElement('label');
    label.className = 'full-name';
    label.setAttribute('form', 'full-name-guest-' + i);
    label.innerHTML = 'Nombre de invitado #' + (i + 1);

    var input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.className = 'full-name';
    input.id = 'full-name-guest-' + i;

    label.appendChild(input);
    rsvpForm.insertBefore(label, submitButton);
  }

}