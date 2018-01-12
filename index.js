/**
 * OAuth proxy for Freckle, keeping application keys stored safely on the
 * server.
 *
 * Initiate the OAuth flow by redirecting to /start. In your application,
 * respond to the route defined by FRECKLE_REDIRECT_URI. In that route, make
 * a request to /authorize?code=<code>, where the code is that returned by
 * Freckle. If authorization is successful, a JSON response containing the
 * access_token and refresh_token will be returned.
 *
 * It is highly recommended that a TLS proxy be used in front of this
 * application.
 *
 * @see http://developer.letsfreckle.com/v2/oauth/
 */
const express = require('express');
const OAuth2 = require('oauth').OAuth2;
const morgan = require('morgan');
require('dotenv').config();

// Place these values in .env for local environments.
let consumerKey = process.env.FRECKLE_CONSUMER_KEY || exit('FRECKLE_CONSUMER_KEY is not defined.');
let consumerSecret = process.env.FRECKLE_CONSUMER_SECRET || exit('FRECKLE_CONSUMER_SECRET is not defined.');
let redirectUri = process.env.FRECKLE_REDIRECT_URI || exit('FRECKLE_REDIRECT_URI is not defined.');
let host = process.env.HOST || 'localhost';
let port = process.env.PORT || 80;
let corsOrigin = process.env.CORS_ORIGIN || exit('CORS_ORIGIN is not defined.');

// These constants are defined in the Freckle OAuth docs.
oauth = new OAuth2(
  consumerKey,
  consumerSecret,
  'https://secure.letsfreckle.com',
  '/oauth/2/authorize',
  '/oauth/2/access_token'
);

/**
 * Exit with an error message.
 *
 * @param {string} message
 *   The error message to log.
 */
function exit(message) {
  console.error(message);
  process.exit(1);
}

/**
 * Initiate the OAuth flow.
 *
 * This will 302 redirect to the authorization URL returned by Freckle.
 *
 */
function start(req, res) {
  let url = oauth.getAuthorizeUrl({
    response_type: 'code',
    redirect_uri: redirectUri,
  });
  res.status(302);
  res.location(url);
  res.send('Redirecting...');
}

/**
 * Authorize with an OAuth access code, returning access and refresh tokens.
 */
function authorize(req, res) {
  let code = req.query.code;
  oauth.getOAuthAccessToken(code, {
    grant_type:'authorization_code',
    redirect_uri: redirectUri
  }, function (error, access_token, refresh_token, results) {
    res.header('Access-Control-Allow-Origin', corsOrigin);
    res.send({
      access_token: access_token,
      refresh_token: refresh_token,
    });
  });
}

const app = express();

// Log all requests in the usual NCSA combined format.
app.use(morgan('combined'));
app.get('/start', (req, res) => start(req, res));
app.get('/authorize', (req, res) => authorize(req, res));
console.info('Starting freckle_auth server on http://' + host + ':' + port + '.');
app.listen(port, host);
