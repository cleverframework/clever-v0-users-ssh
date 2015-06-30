'use strict';

// Module dependencies.
const mongoose = require('mongoose');
const Schema  = mongoose.Schema;
const crypto = require('crypto');
const _ = require('lodash');
const Q = require('q');
const fingerprint = require('ssh-fingerprint');

// Mongoose Error Handling
function hasErrors(err) {
  if (err) {
    console.log(err);
    let modelErrors = [];
    switch (err.code) {
      case 11000: {}
      case 11001: {
        modelErrors.push({
          msg: 'SSH Key already used',
          param: 'data'
        });
        break;
      }
      default: {
        if (err.errors) {
          for (var x in err.errors) {
            modelErrors.push({
              param: x,
              msg: err.errors[x].message,
              value: err.errors[x].value
            });
          }
        }
      }
    }
    return modelErrors;
  }

  return null;
}

// Validations
function validateUniqueSSHKeyData(value, callback) {
  const SSHKey = mongoose.model('SSHKey');
  SSHKey.find({
    $and: [{
      data: value
    }, {
      _id: {
        $ne: this._id
      }
    }]
  }, function(err, user) {
    callback(err || user.length === 0);
  });
};

// Getter
function escapeProperty(value) {
  return _.escape(value);
};

// Schema
const SSHKeySchema = new Schema({
  title: {
    type: String,
    required: true,
    get: escapeProperty
  },
  data: {
    type: String,
    required: true,
    unique: true,
    validate: [validateUniqueSSHKeyData, 'SSH Key is already in-use']
  },
  user: {
    type: String,
    required: true,
    get: escapeProperty
  },
});

// Virtuals
SSHKeySchema.virtual('fingerprint').get(function() {
  return fingerprint(this.data);
});

// Static Methods
SSHKeySchema.statics = {
  /**
   * CountSSHKeysByUserId - count the number of ssh keys by user
   *
   * @param {String} userId
   * @return {Object}
   * @api public
   */
  countSSHKeysByUserId: function(userId) {
    if(!userId) throw new Error('SSHKey.countSSHKeysByUserId: userId parameter is mandatory');
    const SSHKey = mongoose.model('SSHKey');
    const defer = Q.defer();
    SSHKey.count({user: userId}, function(err, nKeys) {
      if (err) return defer.reject(err);
      return defer.resolve(nKeys);
    });
    return defer.promise;
  },

  /**
   * GetSSHKeysByUserId - get the ssh keys by user
   *
   * @param {String} userId
   * @return {Object}
   * @api public
   */
  getSSHKeysByUserId: function(userId) {
    if(!userId) throw new Error('SSHKey.getSSHKeysByUserId: userId parameter is mandatory');
    const SSHKey = mongoose.model('SSHKey');
    const defer = Q.defer();
    SSHKey.find({user: userId}, function(err, keys) {
      if (err) return defer.reject(err);
      return defer.resolve(keys);
    });
    return defer.promise;
  },

  /**
   * GetKeyById - return the ssh matching the id
   *
   * @param {String} id
   * @return {Object}
   * @api public
   */
  getKeyById: function(id) {
    if(!id) throw new Error('SSHKey.getKeyById: id parameter is mandatory');
    const SSHKey = mongoose.model('SSHKey');
    const defer = Q.defer();
    SSHKey.findOne({_id: id}, function(err, key) {
      if (err) return defer.reject(err);
      return defer.resolve(key);
    });
    return defer.promise;
  },

  /**
   * DeleteSSHKeyByIdAndUserId - delete ssh user key by id and userid
   * It uses the userId to double check
   *
   * @param {String} id
   * @param {String} userId
   * @return {Object}
   * @api public
   */
  deleteSSHKeyByIdAndUserId: function(id, userId) {
    if(!id) throw new Error('SSHKey.deleteSSHKeyByIdAndUserId: id parameter is mandatory');
    if(!userId) throw new Error('SSHKey.deleteSSHKeyByIdAndUserId: userId parameter is mandatory');
    const SSHKey = mongoose.model('SSHKey');
    const defer = Q.defer();

    SSHKey.getKeyById(id)
      .then(function(key) {
        SSHKey.remove({_id: key._id, user: userId}, function(err, result) {
          if (err) return defer.reject(err);
          return defer.resolve(key);
        });
      })
      .catch(function(err) {
         defer.reject(err);
      });

    return defer.promise;
  },

  /**
   * DeleteSSHKeyById - delete ssh user key by id
   *
   * @param {String} id
   * @return {Object}
   * @api public
   */
  deleteSSHKeyById: function(id) {
    if(!id) throw new Error('SSHKey.deleteSSHKeyByIdAndUserId: id parameter is mandatory');
    const SSHKey = mongoose.model('SSHKey');
    const defer = Q.defer();

    SSHKey.getKeyById(id)
      .then(function(key) {
        SSHKey.remove({_id: key._id}, function(err, result) {
          if (err) return defer.reject(err);
          return defer.resolve(key);
        });
      })
      .catch(function(err) {
         defer.reject(err);
      });

    return defer.promise;
  },

  /**
   * AddSSHKey - add ssh user key
   *
   * @param {String} id
   * @return {Object}
   * @api public
   */
  addSSHKey: function(sshKeyParams, userId) {
    const SSHKey = mongoose.model('SSHKey');
    sshKeyParams.user = userId;

    const key = new SSHKey(sshKeyParams);

    const defer = Q.defer();
    key.save(function(err) {
      const errors = hasErrors(err);
      if(errors) return defer.reject(errors);
      defer.resolve(key);
    });

    return defer.promise;
  }
}

// Instance Methods
SSHKeySchema.methods = {
  /**
   *
   * @returns {*|Array|Binary|Object}
   */
  toJSON: function() {
    const obj = this.toObject();
    return obj;
  }
};

mongoose.model('SSHKey', SSHKeySchema);
