'use strict';

// Dependencies
let router = require('express').Router();

// Require CleverCore
let CleverCore = require('clever-core');

// Load config
let config = CleverCore.loadConfig();

// Load controller
let usersSSHCtrl = require('../controllers/users-ssh');

// Exports
module.exports = function(UserSSHPackage, app, auth, database, userMenu) {

  // Show user ssh keys
  router.get('/settings/ssh', auth.requiresLoginRedirect, usersSSHCtrl.showKeys.bind(null, UserSSHPackage, userMenu));

  // Add user ssh key
  router.post('/settings/ssh', auth.requiresLoginRedirect, usersSSHCtrl.add);

  // Delete user ssh key
  router.delete('/settings/ssh/:id', auth.requiresLoginRedirect, usersSSHCtrl.deleteById);

  return new CleverCore.CleverRoute(router, 'site', true);

};
