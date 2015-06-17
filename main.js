'use strict';

let cleverCore = require('clever-core');
let Package = cleverCore.Package;

// Defining the Package
var SSHAuthPackage = new Package('ssh-auth');

// All CLEVER packages require registration
SSHAuthPackage.register(function(app, auth, database, userMenu) {

  // Adding SSH option to user menu
  userMenu.addElement('SSH', '/settings/ssh', 3);

  SSHAuthPackage.routes(app, auth, database, userMenu);

  return SSHAuthPackage;

});
