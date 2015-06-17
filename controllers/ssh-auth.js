'use strict';

// Show user profile
exports.settingsSSH = function(SSHAuthPackage, userMenu, req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  userMenu.render(SSHAuthPackage.getCleverCore().getInstance(), req, function(err, renderedUserMenu) {
    if(err) return next(err);
    res.send(SSHAuthPackage.render('site/settings-ssh', {
      user: req.user,
      userMenu: renderedUserMenu,
      csrfToken: req.csrfToken()
    }));
  });
};
