var passport = require('koa-passport'),
    Router = require('koa-router'),
    DigestStrategy = require('passport-http').DigestStrategy,
    TwitterStrategy = require('passport-twitter').Strategy,
    GitHubStrategy = require('passport-github').Strategy,
    config = require('../config/config'),
    jwt = require('koa-jwt'),
    compose = require('koa-compose'),
    routes = {},
    tokenResponse;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(id, done) {
  done(null, user);
});

/**
 * Middleware to build sign and return a JSON Web Token
 */
function* tokenResponse(next){
  if (this.isAuthenticated()) {
    this.status = 200;
    this.body = { token: jwt.sign(this.req.user, config.jwt.secret) };
  } else {
    this.throw(401);
  }
}

// Admin auth if local user and pass were provided
if (config.auth.local.username && config.auth.local.password) {
  passport.use(new DigestStrategy({ qop: 'auth' },
    function(username, done) {
      if (username === config.auth.local.username) {
        // If the correct username is supplied return the user and pass word for verification
        done(null, {name: config.auth.local.username}, config.auth.local.password);
      } else {
        done(null, false);
      }
    },
    function(params, done) {
      // asynchronous validation, for effect...
      process.nextTick(function () {
        // check nonces in params here, if desired
        return done(null, true);
      });
    }
  ));

  routes.admin = {
    handler: compose([
      passport.authenticate('digest', { session: false }),
      tokenResponse
    ]),
    path: '/admin',
    method: 'get'
  };

}

// GitHub Auth if id and secret were provided
if (config.auth.github.client_id && config.auth.github.client_secret) {
  passport.use(new GitHubStrategy({
      clientID: config.auth.github.client_id,
      clientSecret: config.auth.github.client_secret,
      callbackURL: config.app.baseUrl + config.auth.mount + '/github/callback'
    },
    function(accessToken, refreshToken, profile, done) {
      return done(null, {name: profile.name});
    }
  ));

  routes.github = {
    handler: compose([
      passport.authenticate('github', {session: false })
    ]),
    path: '/github',
    method: 'get'
  };

  routes.github_callback = {
    handler: compose([
      passport.authenticate('github', { session: false }),
      tokenResponse
    ]),
    path: '/github/callback',
    method: 'get'
  };
}

module.exports.routes = routes;