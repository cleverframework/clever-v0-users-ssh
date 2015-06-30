export default (app) => {

  function callListener(e, eventName) {
    // STOP default action
    e.preventDefault();
    e.stopImmediatePropagation();

    // Emit event
    console.log(`Emit: ${eventName}`);
    app.emit(eventName, this);
  }

  $('#addSSHKey').submit(function(e) {
    callListener.call(this, e, 'addSSHKey');
  });

  $('#showAddSSHKeyForm').click(function(e) {
    callListener.call(this, e, 'showAddSSHKeyForm');
  })

  $('.deleteSSHKey').click(function(e) {
    callListener.call(this, e, 'deleteSSHKey');
  });

  return app;
}
