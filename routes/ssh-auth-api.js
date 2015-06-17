'use strict';

// Dependencies
let router = require('express').Router();

// Require CleverCore
let CleverCore = require('clever-core');

// Load config
let config = CleverCore.loadConfig();

// Load controller
let sshAuthApiCtrl = require('../controllers/ssh-auth-api');

// Exports
module.exports = function(SSHAuthPackage, app, auth, database, passport) {

  /*
   * Only JSON-like API
   */

  return new CleverCore.CleverRoute(router, 'api', false);

};
