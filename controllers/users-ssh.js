'use strict';

// Module dependencies.
const mongoose = require('mongoose');
const Q = require('q');
const SSHKey = mongoose.model('SSHKey');
const async = require('async');
const config = require('clever-core').loadConfig();
const settings = require('clever-core').loadSettings();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const RSABearerAuthClient = require('rsa-bearer-auth').Client;
const rsaBearerAuthSettings = settings.rsaBearerAuth;
const rsaClient = new RSABearerAuthClient({
  apiKey: rsaBearerAuthSettings ? rsaBearerAuthSettings.apiKey : 'API_KEY'
});
const util = require('../util');


// Show user ssh list
exports.showKeys = function(UserSSHPackage, userMenu, req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  userMenu.render(UserSSHPackage.getCleverCore().getInstance(), req, function(err, renderedUserMenu) {
    if(err) return next(err);

    function renderUserSSHKeyList(keys) {
      res.send(UserSSHPackage.render('site/list', {
        user: req.user,
        userMenu: renderedUserMenu,
        csrfToken: req.csrfToken(),
        keys: keys
      }));
    }

    SSHKey.getSSHKeysByUserId(req.user._id)
      .then(renderUserSSHKeyList)
      .catch(function(err) {
        next(err);
      });
  });
};

// Add ssh user key
exports.add = function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }

  req.assert('title', 'SSH Key must have a title').notEmpty();
  req.assert('data', 'You must add a valid ssh public key').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).json(errors);
  }

  function addKeyOnRSABearerAuthService() {
    const defer = Q.defer();
    rsaClient.addKey(req.body.data, req.user.toJSON(), function(err) {
      if(err) {
        if (typeof err === 'object' && err.message === 'Unauthorized') {
          return next(err);
        }

        // TODO: make a serius error parser
        console.error(err);
        return defer.reject([{
          msg: 'You must add a valid key',
          status: 400
        }]);
      }

      defer.resolve();
    });
    return defer.promise;
  }

  addKeyOnRSABearerAuthService()
    .then(SSHKey.addSSHKey.bind(null, req.body, req.user._id))
    .then(function() {
      res.status(201).json({added: true});
    })
    .catch(util.sendErrorAsHttpResponse.bind(null, res, 400));

};

// Delete ssh user key by id
exports.deleteById = function(req, res, next) {

  function deleteKeyOnRSABearerAuthService(key) {
    const defer = Q.defer();
    rsaClient.delKey(key.data, function(err) {
      if(err) {
        if (typeof err === 'object' && err.message === 'Unauthorized') {
          return next(err);
        }

        // TODO: make a serius error parser
        console.error(err);
        return defer.reject(err);
      }

      defer.resolve();
    });
    return defer.promise;
  }

  SSHKey.deleteSSHKeyByIdAndUserId(req.params.id, req.user._id)
    .then(deleteKeyOnRSABearerAuthService)
    .catch(util.sendErrorAsHttpResponse.bind(null, res, 400));

  res.status(202).json({deleted: true});
};
