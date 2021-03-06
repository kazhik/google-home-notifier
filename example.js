var express = require('express');
var googlehome = require('./google-home-notifier');
var ngrok = require('ngrok');
var bodyParser = require('body-parser');
var app = express();
const serverPort = 8091; // default port

var deviceName = 'Google Home';
var ip; // Google Home IP address

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.post('/google-home-notifier', urlencodedParser, function (req, res) {
  
  if (!req.body) return res.sendStatus(400)
  console.log(req.body);
  
  var language = 'pl'; // default language code
  if (req.body.language) {
    language = req.body.language;
  }
  if (req.body.ip) {
    googlehome.ip(req.body.ip, language);
    ip = req.body.ip;
  } else {
    googlehome.device(deviceName, language);
  }
  if (req.body.timeout) {
    googlehome.timeout(Number(req.body.timeout));
  }

  var text = req.body.text;
  if (text){
    try {
      if (text.startsWith('http')){
        var mp3_url = text;
        googlehome.play(mp3_url, function(notifyRes) {
          if (!notifyRes) {
            res.send(deviceName + ' cannot play sound.\n');
            return;
          }
          console.log(notifyRes);
          res.send(deviceName + ' will play sound from url: ' + mp3_url + '\n');
        });
      } else {
        googlehome.notify(text, function(notifyRes) {
          if (!notifyRes) {
            res.send(deviceName + ' cannot say text.\n');
            return;
          }
          console.log(notifyRes);
          res.send(deviceName + ' will say: ' + text + '\n');
        });
      }
    } catch(err) {
      console.log(err);
      res.sendStatus(500);
      res.send(err);
    }
  }else{
    res.send('Please POST "text=Hello Google Home"');
  }
})

app.get('/google-home-notifier', function (req, res) {

  console.log(req.query);

  var language = 'pl'; // default language code
  if (req.query.language) {
    language = req.query.language;
  }
  if (req.query.ip) {
    googlehome.ip(req.query.ip, language);
    ip = req.query.ip;
  } else {
    googlehome.device(deviceName, language);
  }
  if (req.query.timeout) {
    googlehome.timeout(Number(req.query.timeout));
  }

  var text = req.query.text;
  if (text) {
    try {
      if (text.startsWith('http')){
        var mp3_url = text;
        googlehome.play(mp3_url, function(notifyRes) {
          if (!notifyRes) {
            res.send(deviceName + ' cannot play sound.\n');
            return;
          }
          console.log(notifyRes);
          res.send(deviceName + ' will play sound from url: ' + mp3_url + '\n');
        });
      } else {
        googlehome.notify(text, function(notifyRes) {
          if (!notifyRes) {
            res.send(deviceName + ' cannot say text.\n');
            return;
          }
          console.log(notifyRes);
          res.send(deviceName + ' will say: ' + text + '\n');
        });
      }
    } catch(err) {
      console.log(err);
      res.sendStatus(500);
      res.send(err);
    }
  }else{
    res.send('Please GET "text=Hello+Google+Home"');
  }
})

app.listen(serverPort, function () {
  ngrok.connect({configPath: '/home/pi/.ngrok2/ngrok.yml', addr: serverPort}, function (err, url) {
    if (err) {
      console.log('ngrok.connect failed');
      console.log(err);
      return;
    }
    console.log('Endpoints:');
    console.log('    http://localhost:' + serverPort + '/google-home-notifier');
    console.log('    ' + url + '/google-home-notifier');
    console.log('GET example:');
    console.log('curl -X GET ' + url + '/google-home-notifier?text=Hello+Google+Home');
	console.log('POST example:');
	console.log('curl -X POST -d "text=Hello Google Home" ' + url + '/google-home-notifier');
  });
})

