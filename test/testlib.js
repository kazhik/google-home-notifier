require('log-timestamp');
var expect = require('expect.js');

var googlehome = require('../google-home-notifier');
var deviceName = 'Google Home';
var deviceAddress = '192.168.1.4';

describe('google-home-notifier library test', function() {
  this.timeout(10000);

  beforeEach(function() {
    googlehome.ip(undefined)
      .device(undefined);
  });

  it('No device name and address', function(done) {
    googlehome.notify('no device name and address', (notifyRes) => {
      expect(notifyRes).to.be(undefined);
      done();
    });
  });

  it('Invalid device name', function(done) {

    googlehome.device('InvalidName')
    googlehome.notify('Invalid device name', (notifyRes) => {
      expect(notifyRes).to.be(undefined);
      setTimeout(() => {
        googlehome.notify('Second search of Google Home', (notifyRes) => {
          expect(notifyRes).to.be(undefined);
          done();
        });
      }, 0);
    });
  });

  it('Invalid language', function(done) {
    googlehome.device(deviceName)
      .language('xx')
      .notify('invalid language', (notifyRes) => {
        expect(notifyRes).to.be(undefined);
        done();
      });
  });

  it('device name is supplied', function(done) {
    googlehome.device(deviceName)
      .language('ja')
      .volume(1.0)
      .speed(1.0)
      .notify('device name is supplied', (notifyRes) => {
        expect(notifyRes).not.to.be(undefined);
        setTimeout(done, 3000);
      });
  });

  it('ip address is supplied', function(done) {
    googlehome.ip(deviceAddress)
      .language('en')
      .volume(1.0)
      .speed(1.0)
      .timeout(1000)
      .notify('ip address is supplied', (notifyRes) => {
        expect(notifyRes).not.to.be(undefined);
        setTimeout(done, 3000);
      });
  });

  it('ip address and invalid device name', function(done) {
    googlehome.ip(deviceAddress)
      .device('Invalid name')
      .speed(0.5)
      .timeout(1000)
      .notify('ip address and invalid device name', (notifyRes) => {
        expect(notifyRes).not.to.be(undefined);
        setTimeout(done, 3000);
      });
  });

  it('tts timeout', function(done) {
    googlehome.ip(deviceAddress)
      .timeout(10)
      .notify('tts timeout', (notifyRes) => {
        expect(notifyRes).to.be(undefined);

        googlehome.timeout(1000);
        done();
      });
  });
 
  it('invalid timeout value should be ignored', function(done) {
    googlehome.ip(deviceAddress)
      .timeout('aaa')
      .notify('invalid timeout value', (notifyRes) => {
        expect(notifyRes).not.to.be(undefined);
        setTimeout(done, 3000);
      });
  });

  it('invalid speed value should be ignored', function(done) {
    googlehome.ip(deviceAddress)
      .speed('bbb')
      .notify('invalid speed value', (notifyRes) => {
        expect(notifyRes).not.to.be(undefined);
        setTimeout(done, 3000);
      });
  });

  it('invalid volume value should be ignored', function(done) {
    googlehome.ip(deviceAddress)
      .volume('ccc')
      .notify('invalid volume value', (notifyRes) => {
        expect(notifyRes).not.to.be(undefined);
        setTimeout(done, 3000);
      });
  });

  it('invalid volume value should be ignored #2', function(done) {
    googlehome.ip(deviceAddress)
      .volume(1.1)
      .notify('invalid volume value #2', (notifyRes) => {
        expect(notifyRes).not.to.be(undefined);
        setTimeout(done, 3000);
      });
  });

  it('invalid ip address', function(done) {
    googlehome.ip('192.168.1.41')
      .notify('invalid ip address', (notifyRes) => {
        expect(notifyRes).to.be(undefined);
        done();
      });
  });

  /* node-casttv2-client will time out in 2 minutes.
  it('invalid ip address #2', function(done) {
    this.timeout(180 * 1000);
    googlehome.ip('192.168.200.1')
      .notify('invalid ip address #2', (notifyRes) => {
        expect(notifyRes).to.be(undefined);
        done();
      });
  });
  */

  it('ip address or device name should be supplied before play', function(done) {
    googlehome.play('https://www.gnu.org/music/FreeSWSong.ogg', (notifyRes) => {
        expect(notifyRes).to.be(undefined);
        done();
      });
  });

  it('play sound file', function(done) {
    this.timeout(20 * 1000);
    googlehome.ip(deviceAddress)
      .play('https://www.gnu.org/music/FreeSWSong.ogg', (notifyRes) => {
        expect(notifyRes).not.to.be(undefined);
        setTimeout(done, 5000);
      });
  });
    
  it('play sound file #2', function(done) {
    this.timeout(20 * 1000);
    googlehome.device(deviceName)
      .play('https://www.gnu.org/music/FreeSWSong.ogg', (notifyRes) => {
        expect(notifyRes).not.to.be(undefined);
        setTimeout(done, 5000);
      });
  });
  it('sound file not found', function(done) {
    googlehome.ip(deviceAddress)
      .play('https://www.gnu.org/music/xxxx.ogg', (notifyRes) => {
        expect(notifyRes).to.be(undefined);
        done();
      });
  });

  it('unknown sound file format', function(done) {
    googlehome.ip(deviceAddress)
      .play('https://www.gnu.org/music/free-software-song.au', (notifyRes) => {
        expect(notifyRes).to.be(undefined);
        done();
      });
  });
    
});
