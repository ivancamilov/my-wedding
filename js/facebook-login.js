/*
 * This code is largely taken from:
 * https://developers.facebook.com/docs/facebook-login/login-flow-for-web/v2.4
 *
 * There are only a few minor modifications made by me.
 */

var confirmButton = document.getElementById('confirm-button');
confirmButton.addEventListener('click', loginToFacebook);

var rsvpMessages = document.getElementById('rsvp-messages');

var rsvpForm = document.getElementById('rsvp-form');
rsvpForm.addEventListener('submit', submitGuestForm);

var guestList;

var SERVICEURL = 'http://wedding-reservation.herokuapp.com';

// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
  // The response object is returned with a status field that lets the
  // app know the current login status of the person.
  // Full docs on the response object can be found in the documentation
  // for FB.getLoginStatus().
  if (response.status === 'connected') {
    // Logged into your app and Facebook.
    confirmButton.className = 'confirm button';

    FB.api('/me', {fields: 'id,name,first_name'}, registerFacebookUser);
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
      // TODO Handle this properly
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

  var listener = function(e) {
    rsvpMessages.removeEventListener('transitionend', listener);
    rsvpMessages.innerHTML = message;
    rsvpMessages.className = 'story-text';
  };

  rsvpMessages.addEventListener('transitionend', listener);
}

// Handles Facebook's response.
function registerFacebookUser(response) {
  if(authorizedUser(response.name)) {
    checkAndConfirmUser(response.name);
  }
  else {
    showMessage('Parece que no estás en la lista de invitados. Es posible que esto sea un error del desarrollador (es decir, Iván). El pobre muchacho anda distraído con su futura esposa y no da pie con bola, así que es mejor que te comuniques con Mafe o Iván para aclarar este impase.');
  }
}

function checkAndConfirmUser(theName) {
  $.ajax({
    url:      encodeURI(SERVICEURL + '/reservations/' + theName),
    method:   'GET',
    success:  function(response) {
      if(response.data.guests.length > 0) {
        var userGuestArray = response.data.guests;
        var userGuests = '';

        for(var i = 0; i < userGuestArray.length; i++) {
          userGuests += '<li>' + userGuestArray[i] + '</li>';
        }

        showMessage('Ya has confirmado tu asistencia, ' + theName + '. Asistirás con: <ul>' + userGuests + '</ul><small>Si deseas cambiar el estado de tu confirmación, por favor comunícate con Ivan o Mafe.</small>');
      }
      else {
        showMessage('Ya has confirmado tu asistencia, ' + theName + ' :).<br><br> <small>Si deseas cambiar el estado de tu confirmación, por favor comunícate con Ivan o Mafe.</small>');
      }
      return;
    },
    error:    function(response) {
      if(response.status == 404) {
        // This is a new reservation!
        guests = userGuestList(theName);
        if(guests.length > 0) {
          // We make sure the form appears at the same time as the message:
          var listener = function(e) {
            rsvpMessages.removeEventListener('transitionend', listener);
            showGuestsForm(guests, theName);
          };

          showMessage('¡Puedes asistir con invitados, ' + theName + '! Por favor, escribe los nombres abajo.');
          rsvpMessages.addEventListener('transitionend', listener);
        }
        else {
          confirmUser(theName);
        }
      }
      else {
        showMessage('ERROR!!!');
        console.log(response);
      }
    }
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
  for(var i = 0; i < guestList.length; i++) {
    if(guestList[i].name == name) {
      if(guestList[i].comingWith) {
        return guestList[i].comingWith.length;
      }
      else {
        return 0;
      }
    }
  }

  return 0;
}

function userGuestList(name) {
  for(var i = 0; i < guestList.length; i++) {
    if(guestList[i].name == name) {
      if(guestList[i].comingWith) {
        return guestList[i].comingWith;
      }
      else {
        return 0;
      }
    }
  }
}

// Confirms the user has RSVPed yes.
function confirmUser(theName, theGuests) {
  if(!theGuests) {
    theGuests = [];
  }

  var theData = {
    'name': theName,
    'date': (new Date()).toISOString(),
    'guests': theGuests
  };

  $.ajax({
    url:        SERVICEURL + '/reservations',
    type:       'POST',
    contentType: 'application/json',
    dataType:   'json',
    data:       JSON.stringify(theData),
    success:    function(response) {
      if(theGuests && theGuests.length > 0) {
        var userGuestList = '';

        for(var i = 0; i < theGuests.length; i++) {
          userGuestList += theGuests[i];

          if(i != (theGuests.length - 1)) {
            userGuestList += ', ';
          }
        }

        showMessage('Gracias por confirmar tu asistencia y la de tus invitados. ¡No olvides guardar la fecha en tu calendario!<br><br> <small>Si deseas cambiar el estado de tu confirmación, por favor comunícate con Ivan o Mafe.</small>');
      }
      else {
        showMessage('Gracias por confirmar tu asistencia. ¡No olvides guardar la fecha en tu calendario!<br><br> <small>Si deseas cambiar el estado de tu confirmación, por favor comunícate con Ivan o Mafe.</small>');
      }
    },
    error:      function(error) {
      showMessage('error!!!!');
      console.log(error);
    }
  });
}

// Shows the guests form (duh) showing as many fields
// as guestCount indicates.
function showGuestsForm(guests, name) {
  rsvpForm.className = 'visible';
  rsvpForm.dataset.name = name;

  var submitButton = document.getElementById('guest-confirm-button');

  for(var i = 0; i < guests.length; i++) {
    var label = document.createElement('label');
    label.className = 'full-name';
    label.setAttribute('form', 'full-name-guest-' + i);
    label.innerHTML = 'Nombre de invitado #' + (i + 1);

    var input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.className = 'full-name';
    input.id = 'full-name-guest-' + i;
    input.value = guests[i];

    label.appendChild(input);
    rsvpForm.insertBefore(label, submitButton);
  }
}

function hideGuestForm() {
  rsvpForm.className = '';
}

function submitGuestForm(e) {
  var mainName = rsvpForm.dataset.name;
  var guests = rsvpForm.querySelectorAll('input.full-name');
  var continueAnyway = false;

  // First we need to check if any of the fields is empty
  for(var i = 0; i < guests.length; i++) {
    var name = guests[i].value;

    if(guests[i].value.length == 0) {
      if(!continueAnyway){
        continueAnyway = window.confirm('No incluiste el nombre de uno de tus invitados. ¿Estás seguro de que deseas continuar?');

        if(!continueAnyway) {
          e.preventDefault();
          return false;
        }

        break;
      }
    }
  }

  // If we continue, it means the user has filled all the inputs
  // or she doesn't mind that one of the fields is empty

  // Now, we need to get the entire guest array, including the current
  // user
  var guestArray = new Array();
  guestArray.push(mainName);

  for(var i = 0; i < guests.length; i++) {
    var name = guests[i].value;
    guestArray.push(name);
  }

  // Now we confirm all of the users
  for(var i = 0; i < guestArray.length; i++) {
    var me = guestArray[i];
    // We need to clone the guest array to handle it properly
    var myGuests = JSON.parse(JSON.stringify(guestArray));
    myGuests.splice(i, 1);

    confirmUser(me, myGuests);
  }

  hideGuestForm();
  e.preventDefault();
  return false;
}