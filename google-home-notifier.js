var Client = require('castv2-client').Client;
var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
var googletts = require('google-tts-api');
var mdns = require('mdns');
var sequence = [
  mdns.rst.DNSServiceResolve(),
  'DNSServiceGetAddrInfo' in mdns.dns_sd ?
    mdns.rst.DNSServiceGetAddrInfo() :
      mdns.rst.getaddrinfo({families:[4]}),
      mdns.rst.makeAddressesUnique()
];
var browser = mdns.createBrowser(mdns.tcp('googlecast'),
    {resolverSequence: sequence});
var deviceAddress;
var language = 'us';
var speechRate = 1;
var ttsTimeout = 1000;
var speakerVolume;

var notify = (message, callback) => {
  if (!deviceAddress){
    browser.start();
    browser.on('error', (err) => {
      console.log('Browser Error: %s', err.message);
      browser.stop();
      callback();
    });
    browser.on('serviceUp', (service) => {
      console.log('Device "%s" at %s:%d', service.name, service.addresses[0], service.port);
      if (service.name.includes(device.replace(' ', '-'))){
        deviceAddress = service.addresses[0];
        ttsAndPlay(message, deviceAddress, (res) => {
          callback(res);
        });
      }
      browser.stop();
    });
  } else {
    ttsAndPlay(message, deviceAddress, (res) => {
      callback(res);
    });
  }
};

var play = (mp3_url, callback) => {
  if (!deviceAddress){
    browser.start();
    browser.on('error', (err) => {
      console.log('Browser Error: %s', err.message);
      browser.stop();
      callback();
    });
    browser.on('serviceUp', (service) => {
      console.log('Device "%s" at %s:%d', service.name, service.addresses[0], service.port);
      if (service.name.includes(device.replace(' ', '-'))){
        deviceAddress = service.addresses[0];
        playMp3onDevice(deviceAddress, mp3_url, (res) => {
          callback(res)
        });
      }
      browser.stop();
    });
  } else {
    playMp3onDevice(deviceAddress, mp3_url, (res) => {
      callback(res)
    });
  }
};

var ttsAndPlay = (text, host, callback) => {
  googletts(text, language, speechRate, ttsTimeout).then((url) => {
    playMp3onDevice(host, url, (res) => {
      callback(res)
    });
  }).catch((err) => {
    console.error(err.stack);
    callback();
  });
};

var playMp3onDevice = (host, url, callback) => {
  console.log('playing %s on %s', url, host);
  var client = new Client();
  client.connect(host, () => {
    if (speakerVolume) {
      client.setVolume({level: speakerVolume}, (err, vol) => {
        if (err) {
          console.log('Failed to set volume: %s', err.message);
          client.close();
          callback();
        }
        speakerVolume = undefined;
      });
    };
    client.launch(DefaultMediaReceiver, (err, player) => {
      if (err) {
        console.log('Failed to launch: %s', err.message);
        client.close();
        callback();
      }
      var media = {
        contentId: url,
        contentType: 'audio/mp3',
        streamType: 'BUFFERED' // or LIVE
      };
      player.load(media, { autoplay: true }, (err, status) => {
        if (err) {
          console.log('Failed to load: %s', err.message);
          client.close();
          callback();
        }
        client.close();
        callback('Device notified');
      });
      player.on('status', (status) => {
        console.log('player status: %s', status.playerState);
      });
    });
  });

  client.on('error', (err) => {
    console.log('Client Error: %s', err.message);
    client.close();
    callback();
  });
};

exports.ip = (ip) => {
  deviceAddress = ip;
  return this;
}
exports.device = (name) => {
  device = name;
  return this;
};
exports.language = (lang) => {
  language = lang;
  return this;
};
exports.speed = (speed) => {
  speechRate = speed;
  return this;
};
exports.timeout = (timeout) => {
  ttsTimeout = timeout;
  return this;
};
exports.volume = (volume) => {
  if (volume < 0.0 || volume > 1.0) {
    console.log('Invalid volume value: %f', volume);
  } else {
    speakerVolume = volume;
  }
  return this;
};
exports.notify = notify;
exports.play = play;



