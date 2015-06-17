'use strict';

// Dependencies
let router = require('express').Router();

// Require CleverCore
let CleverCore = require('clever-core');

// Load config
let config = CleverCore.loadConfig();

// Load controller
let sshAuthAdminCtrl = require('../controllers/ssh-auth-admin');

// Exports
module.exports = function(SSHAuthPackage, app, auth, database) {

  return new CleverCore.CleverRoute(router, 'admin', true);

};
