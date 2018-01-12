# Freckle Authentication Proxy

The [Freckle API](http://developer.letsfreckle.com/v2/oauth/) does not support
CORS or implicit grants, so it can't be directly used by JavaScript
applications. This simple proxy allows for the full OAuth flow to be completed,
while adding the bonus of keeping your application keys secure on your server.

## Getting started

1. `yarn install`
1. `cp example.env .env # Edit .env, or inject environment variables another way.`
1. `node index.js`
