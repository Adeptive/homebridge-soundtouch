var soundtouch = require('soundtouch');
var inherits = require('util').inherits;
var Service, Characteristic, VolumeCharacteristic, PresetCharacteristic;

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    // we can only do this after we receive the homebridge API object
    makeVolumeCharacteristic();
    makePresetCharacteristic();

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
    this.isSpeaker = config["type"] === 'speaker';

    if (!this.room) throw new Error("You must provide a config value for 'room'.");

    if (this.isSpeaker) {
        this.service = new Service.Speaker(this.name);

        this.service
            .getCharacteristic(Characteristic.Mute)
            .on('get', this._getOn.bind(this))
            .on('set', this._setOn.bind(this));

        this.service
            .addCharacteristic(Characteristic.Volume)
            .on('get', this._getVolume.bind(this))
            .on('set', this._setVolume.bind(this));

    } else {
        this.service = new Service.Lightbulb(this.name);

        this.service
            .getCharacteristic(Characteristic.On)
            .on('get', this._getOn.bind(this))
            .on('set', this._setOn.bind(this));

        this.service
            .addCharacteristic(new Characteristic.Brightness())
            .on('get', this._getVolume.bind(this))
            .on('set', this._setVolume.bind(this));
    }

    this.service
        .addCharacteristic(PresetCharacteristic)
        .on('get', this._getPreset.bind(this))
        .on('set', this._setPreset.bind(this));

    // begin searching for a SoundTouch device with the given name
    this.search();
}

SoundTouchAccessory.prototype.search = function() {
    var accessory = this;
    accessory.soundtouch = soundtouch;

    accessory.soundtouch.search(function(device) {

        if (accessory.room != device.name) {
            //accessory.log("Ignoring device because the room name '%s' does not match the desired name '%s'.", device.name, accessory.room);
            return;
        }

        accessory.log("Found Bose SoundTouch device: %s", device.name);

        accessory.device = device;

        //we found the device, so stop looking
        soundtouch.stopSearching();
    }, function(device) {
        accessory.log("Bose SoundTouch device goes offline: %s", device.name);
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
        callback(new Error("SoundTouch has not been discovered yet."));
        return;
    }

    var accessory = this;

    this.device.isAlive(function(isOn) {
        accessory.log('Check if is playing: %s', isOn);
        callback(null, isOn);
    });
};

SoundTouchAccessory.prototype._setOn = function(on, callback) {
    if (!this.device) {
        this.log.warn("Ignoring request; SoundTouch device has not yet been discovered.");
        callback(new Error("SoundTouch has not been discovered yet."));
        return;
    }

    var accessory = this;

    if (on) {
        this.device.powerOn(function(isTurnedOn) {
            accessory.log(isTurnedOn ? 'Power On' : 'Was already powered on');
            accessory.device.play(function(json) {
                accessory.log('Playing...');
                callback(null);
            });
        });
    } else {
        this.device.powerOff(function() {
            accessory.log('Powering Off...');
            callback(null);
        });
    }
};

SoundTouchAccessory.prototype._getMute = function(callback) {
    if (!this.device) {
        this.log.warn("Ignoring request; SoundTouch device has not yet been discovered.");
        callback(new Error("SoundTouch has not been discovered yet."));
        return;
    }

    var accessory = this;

    this.device.getVolume(function(json) {
        accessory.log('Check if is muted: %s', json.volume.muteenabled === 'true');
        callback(null, json.volume.muteenabled === 'true');
    });
};

SoundTouchAccessory.prototype._setMute = function(on, callback) {
    if (!this.device) {
        this.log.warn("Ignoring request; SoundTouch device has not yet been discovered.");
        callback(new Error("SoundTouch has not been discovered yet."));
        return;
    }

    var accessory = this;

    this.device.pressKey("MUTE", function() {
        accessory.log(on ? 'Muting ...' : 'Unmuting ...');
        callback(null);
    });
};

SoundTouchAccessory.prototype._getVolume = function(callback) {
    if (!this.device) {
        this.log.warn("Ignoring request; SoundTouch device has not yet been discovered.");
        callback(new Error("SoundTouch has not been discovered yet."));
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
        callback(new Error("SoundTouch has not been discovered yet."));
        return;
    }

    var accessory = this;

    this.device.setVolume(volume, function() {
        accessory.log('Setting volume to %s', volume);
        callback(null);
    });
};

SoundTouchAccessory.prototype._getPreset = function(callback) {
    if (!this.device) {
        this.log.warn("Ignoring request; SoundTouch device has not yet been discovered.");
        callback(new Error("SoundTouch has not been discovered yet."));
        return;
    }

    var accessory = this;

    accessory.device.getPresets(function(json) {
        accessory.device.getNowPlaying(function(jsonNowPlaying) {
            for (var presetIndex in json.presets.preset) {
                var preset = json.presets.preset[presetIndex];
                if (JSON.stringify(preset.ContentItem) === JSON.stringify(jsonNowPlaying.nowPlaying.ContentItem)) {

                    accessory.log("Current preset: %s", preset.id);
                    callback(null, preset.id * 1);
                    return;
                }
            }
            callback(null, 1);
        });
    });
};

SoundTouchAccessory.prototype._setPreset = function(preset, callback) {
    if (!this.device) {
        this.log.warn("Ignoring request; SoundTouch device has not yet been discovered.");
        callback(new Error("SoundTouch has not been discovered yet."));
        return;
    }

    var accessory = this;

    this.device.setPreset(preset, function() {
        accessory.log('Setting preset to %s', preset);
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

//
// Custom Characteristic for Preset
//
function makePresetCharacteristic() {

    PresetCharacteristic = function() {
        Characteristic.call(this, 'Preset', '91288999-5678-49B2-8D22-F57BE995AA00');
        this.setProps({
            format: Characteristic.Formats.INT,
            //unit: Characteristic.Units.PERCENTAGE,
            maxValue: 6,
            minValue: 1,
            minStep: 1,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };

    inherits(PresetCharacteristic, Characteristic);
}