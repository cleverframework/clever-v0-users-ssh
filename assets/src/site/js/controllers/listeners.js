export default (app) => {

  function sendDataAjax(options) {
    $.ajax({
      url : options.formURL,
      type: options.method, // POST or PUT or PATCH
      data : options.postData,
      success: options.successCallback,
      error: function(jqXHR, textStatus, errorThrown) {

        if(options.$success) options.$success.addClass('hidden');

        // Show the errors to the user
        options.$errorMessage.html(`${jqXHR.responseJSON[0].msg}.`);
        options.$error.removeClass('hidden');

        // Enable the submit form button
        options.$btn.removeClass('disabled');
      }
    });
  }

  app.on('appStarted', () => {
    console.log(`${app.config.name} started`);
  });

  app.on('showAddSSHKeyForm', (btn) => {
    $('#addSSHKeyPanel').removeClass('hidden');
  });

  app.on('deleteSSHKey', (btn) => {
    if(!confirm('Are you sure to want delete this key?')) return false;

    const $btn = $(btn);

    const request = $.ajax({
      url: `/settings/ssh/${$btn.data('id')}`,
      beforeSend: function (request) {
        request.setRequestHeader('csrf-token', window.csrf);
      },
      method: 'DELETE'
    });

    request.done(function(msg) {
      location.href = '/settings/ssh';
    });

    request.fail(function( jqXHR, textStatus ) {
      console.error(`Request failed: ${textStatus}`);
    });
  });

  app.on('addSSHKey', (form) => {

    const $addSSHKeyError = $('#addSSHKeyError');
    const $addSSHKeyBtn = $('#addSSHKeyBtn');
    const options = {
      formURL: $(form).attr('action'),
      method: $(form).attr('method'),
      postData: $(form).serialize(),
      successCallback: function(data, textStatus, jqXHR) {
        location.href = '/settings/ssh';
      },
      $error: $addSSHKeyError,
      $errorMessage: $('#addSSHKeyError .message'),
      $btn: $addSSHKeyBtn
    }

    // Clear the error message div
    $addSSHKeyError.addClass('hidden');

    // Send Ajax
    sendDataAjax(options);

    // Disable the submit form button
    $addSSHKeyBtn.addClass('disabled');

  });



  return app;
}
