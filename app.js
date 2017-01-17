let express = require('express'),
    bodyParser = require('body-parser'),
    app = express();
let alexaVerifier = require('alexa-verifier'); // at the top of our file

function requestVerifier(req, res, next) {
  alexaVerifier(
      req.headers.signaturecertchainurl,
      req.headers.signature,
      req.rawBody,
      function verificationCallback(err) {
          if (err) {
              res.status(401).json({ message: 'Verification Failure', error: err });
          } else {
              next();
          }
      }
  );
}
app.use(bodyParser.json({
    verify: function getRawBody(req, res, buf) {
        req.rawBody = buf.toString();
    }
}));
app.post('/balance', requestVerifier, function(req, res) {
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
app.listen(3000);
