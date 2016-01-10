var soundtouch = require('soundtouch');
var inherits = require('util').inherits;
var Service, Characteristic, VolumeCharacteristic;

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

    // begin searching for a Sonos device with the given name
    this.search();
}

SoundTouchAccessory.zoneTypeIsPlayable = function(zoneType) {
    // 8 is the Sonos SUB, 4 is the Sonos Bridge, 11 is unknown
    return zoneType != '11' && zoneType != '8' && zoneType != '4';
};

SoundTouchAccessory.prototype.search = function() {
    /*var search = sonos.search(function(device) {
        var host = device.host;
        this.log.debug("Found sonos device at %s", host);

        device.deviceDescription(function (err, description) {

            var zoneType = description["zoneType"];
            var roomName = description["roomName"];

            if (!SonosAccessory.zoneTypeIsPlayable(zoneType)) {
                this.log.debug("Sonos device %s is not playable (has an unknown zone type of %s); ignoring", host, zoneType);
                return;
            }

            if (roomName != this.room) {
                this.log.debug("Ignoring device %s because the room name '%s' does not match the desired name '%s'.", host, roomName, this.room);
                return;
            }

            this.log("Found a playable device at %s for room '%s'", host, roomName);
            this.device = device;
            search.socket.close(); // we don't need to continue searching.

        }.bind(this));
    }.bind(this));*/
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
    /*if (!this.device) {
        this.log.warn("Ignoring request; Sonos device has not yet been discovered.");
        callback(new Error("Sonos has not been discovered yet."));
        return;
    }

    this.device.getCurrentState(function(err, state) {

        if (err) {
            callback(err);
        }
        else {
            var on = (state == "playing");
            callback(null, on);
        }

    }.bind(this));*/
};

SoundTouchAccessory.prototype._setOn = function(on, callback) {
    /*if (!this.device) {
        this.log.warn("Ignoring request; Sonos device has not yet been discovered.");
        callback(new Error("Sonos has not been discovered yet."));
        return;
    }

    this.log("Setting power to " + on);

    if (on) {
        this.device.play(function(err, success) {
            this.log("Playback attempt with success: " + success);
            if (err) {
                callback(err);
            }
            else {
                callback(null);
            }
        }.bind(this));
    }
    else {
        this.device.stop(function(err, success) {
            this.log("Stop attempt with success: " + success);
            if (err) {
                callback(err);
            }
            else {
                callback(null);
            }
        }.bind(this));
    }*/
};

SoundTouchAccessory.prototype._getVolume = function(callback) {
    /*if (!this.device) {
        this.log.warn("Ignoring request; Sonos device has not yet been discovered.");
        callback(new Error("Sonos has not been discovered yet."));
        return;
    }

    this.device.getVolume(function(err, volume) {

        if (err) {
            callback(err);
        }
        else {
            this.log("Current volume: %s", volume);
            callback(null, Number(volume));
        }

    }.bind(this));*/
};

SoundTouchAccessory.prototype._setVolume = function(volume, callback) {
    /*if (!this.device) {
        this.log.warn("Ignoring request; Sonos device has not yet been discovered.");
        callback(new Error("Sonos has not been discovered yet."));
        return;
    }

    this.log("Setting volume to %s", volume);

    this.device.setVolume(volume + "", function(err, data) {
        this.log("Set volume response with data: " + data);
        if (err) {
            callback(err);
        }
        else {
            callback(null);
        }
    }.bind(this));*/
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
