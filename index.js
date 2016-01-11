var SoundTouchDiscovery = require('soundtouch');
var inherits = require('util').inherits;
var Service, Characteristic, VolumeCharacteristic;

var SoundTouch_SOURCES = require('soundtouch/utils/types').Source;

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    // we can only do this after we receive the homebridge API object
    makeVolumeCharacteristic();

    homebridge.registerAccessory("homebridge-soundtouch", "SoundTouch", SoundTouchAccessory);
};

//
// SoundTouch Accessory
//

function SoundTouchAccessory(log, config) {
    this.log = log;
    this.config = config;
    this.name = config["name"];
    this.room = config["room"];

    if (!this.room) throw new Error("You must provide a config value for 'room'.");

    this.service = new Service.Switch(this.name);

    this.service
        .getCharacteristic(Characteristic.On)
        .on('get', this._getOn.bind(this))
        .on('set', this._setOn.bind(this));

    this.service
        .addCharacteristic(VolumeCharacteristic)
        .on('get', this._getVolume.bind(this))
        .on('set', this._setVolume.bind(this));

    // begin searching for a SoundTouch device with the given name
    this.search();
}

SoundTouchAccessory.prototype.search = function() {
    var accessory = this;
    var soundtouch = new SoundTouchDiscovery();
    accessory.soundtouch = soundtouch;

    accessory.soundtouch.search(function(device) {

        accessory.log("Found Bose SoundTouch device: %s", device.name);

        if (accessory.room != device.name) {
            accessory.log("Ignoring device because the room name '%s' does not match the desired name '%s'.", device.name, accessory.room);
            return;
        }

        accessory.device = device;

        //we found the device, so stop looking
        soundtouch.stopSearching();
    }, function(device) {
        accessory.log("Bose SoundTouch device went offline: %s", device.name);
    });
};

SoundTouchAccessory.prototype.getInformationService = function() {
    var informationService = new Service.AccessoryInformation();
    informationService
        .setCharacteristic(Characteristic.Name, this.name)
        .setCharacteristic(Characteristic.Manufacturer, 'Bose SoundTouch')
        .setCharacteristic(Characteristic.Model, '1.0.0')
        .setCharacteristic(Characteristic.SerialNumber, this.room);
    return informationService;
};

SoundTouchAccessory.prototype.getServices = function() {
    return [this.service, this.getInformationService()];
};

SoundTouchAccessory.prototype._getOn = function(callback) {
    if (!this.device) {
        this.log.warn("Ignoring request; SoundTouch device has not yet been discovered.");
        callback(new Error("SoundTOuch has not been discovered yet."));
        return;
    }

    this.device.getNowPlaying(function(json) {
        var isOn = json.nowPlaying.source != SoundTouch_SOURCES.STANDBY;
        callback(null, isOn);
    });
};

SoundTouchAccessory.prototype._setOn = function(on, callback) {
    if (!this.device) {
        this.log.warn("Ignoring request; SoundTouch device has not yet been discovered.");
        callback(new Error("SoundTOuch has not been discovered yet."));
        return;
    }

    var accessory = this;

    if (on) {
        this.device.play(function() {
            accessory.log('Playing %s', accessory.room);
            callback(null);
        });
    } else {
        this.device.stop(function() {
            accessory.log('Stopping %s', accessory.room);
            callback(null);
        });
    }
};

SoundTouchAccessory.prototype._getVolume = function(callback) {
    if (!this.device) {
        this.log.warn("Ignoring request; SoundTouch device has not yet been discovered.");
        callback(new Error("SoundTOuch has not been discovered yet."));
        return;
    }

    var accessory = this;

    this.device.getVolume(function(json) {
        var volume = json.volume.actualvolume;
        accessory.log("Current volume: %s", volume);
        callback(null, volume * 1);
    });
};

SoundTouchAccessory.prototype._setVolume = function(volume, callback) {
    if (!this.device) {
        this.log.warn("Ignoring request; SoundTouch device has not yet been discovered.");
        callback(new Error("SoundTOuch has not been discovered yet."));
        return;
    }

    var accessory = this;

    this.device.setVolume(volume, function() {
        accessory.log('Setting volume to %s for %s', volume, accessory.room);
        callback(null);
    });
};

//
// Custom Characteristic for Volume
//
function makeVolumeCharacteristic() {

    VolumeCharacteristic = function() {
        Characteristic.call(this, 'Volume', '91288267-5678-49B2-8D22-F57BE995AA00');
        this.setProps({
            format: Characteristic.Formats.INT,
            unit: Characteristic.Units.PERCENTAGE,
            maxValue: 100,
            minValue: 0,
            minStep: 1,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };

    inherits(VolumeCharacteristic, Characteristic);
}
