'use strict';

// Dependencies
let router = require('express').Router();

// Require CleverCore
let CleverCore = require('clever-core');

// Load config
let config = CleverCore.loadConfig();

// Load controller
let sshAuthCtrl = require('../controllers/ssh-auth');

// Exports
module.exports = function(SSHAuthPackage, app, auth, database, userMenu) {

  // Show settings user ssh
  router.get('/settings/ssh', sshAuthCtrl.settingsSSH.bind(null, SSHAuthPackage, userMenu));

  return new CleverCore.CleverRoute(router, 'site', true);

};
