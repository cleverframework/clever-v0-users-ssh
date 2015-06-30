'use strict';

let cleverCore = require('clever-core');
let Package = cleverCore.Package;

// Defining the Package
var UserSSHPackage = new Package('users-ssh');

// All CLEVER packages require registration
UserSSHPackage.register(function(app, auth, database, userMenu) {

  // Adding SSH option to user menu
  userMenu.addElement('SSH', '/settings/ssh', 3);

  UserSSHPackage.routes(app, auth, database, userMenu);

  return UserSSHPackage;

});
