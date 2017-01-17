//require('dotenv').config({ silent: true });

var debug = require('debug')('balance:server');
var express = require("express");
var avm = require('alexa-verifier-middleware');
var app = express();
var router = express.Router();
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");
var errorHandler = require('api-error-handler');

var app = express();

app.use(avm());

app.use(bodyParser.json());
// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
//var db;
//mongoose.connect(process.env.MONGODB_URI); // connect to our database

var domain = process.env.DOMAIN || 'balance.local';
console.log(domain);

//Initialize the api.
var server = app.listen(process.env.PORT || 8080  , function () {
  var port = server.address().port;
  console.log(port);
  console.log("Server now running on port", port);
});

// Generic error handler used by all endpoints.
function logErrors (err, req, res, next) {
  console.log("logging error");

  console.error(err.stack)
  next(err)
}
function clientErrorHandler (err, req, res, next) {
  console.log("client error handler");

  if (req.xhr) {
    res.status(500).send({ error: err })
  } else {
    next(err)
  }
}
function errorHandler (err, req, res, next) {
  console.log("error handler");

  res.status(500)
  res.render('error', { error: err })
}
function errorNotification(err, str, req) {
  console.log("error notification: " + err)
  // airbrake.notify(err, function(err, url) {
  //   if (err) throw err;
  // });
}

//Public endpoints
router.post('/balance', requestVerifier, function(req, res) {
  if (req.body.request.type === 'LaunchRequest') {
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": true,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>Hmm <break time=\"1s\"/> What account do you want me to check?</speak>"
        }
      }
    });
  }
  else if (req.body.request.type === 'SessionEndedRequest') {
    // Per the documentation, we do NOT send ANY response... I know, awkward.
    console.log('Session ended', req.body.request.reason);
  } else if (req.body.request.type === 'IntentRequest' &&
           req.body.request.intent.name === 'Forecast') {

    if (!req.body.request.intent.slots.Day ||
        !req.body.request.intent.slots.Day.value) {
      // Handle this error by producing a response like:
      // "Hmm, what day do you want to know the forecast for?"
    }
    let day = new Date(req.body.request.intent.slots.Day.value);

    // Do your business logic to get weather data here!
    // Then send a JSON response...

    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": true,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>$1333.45</speak>"
        }
      }
    });
  }
});

router.use(errorHandler());
// apply the routes to our application with the prefix /api
app.use('/api', router);

module.exports = app;
