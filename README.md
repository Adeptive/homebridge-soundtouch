#Homebridge-soundtouch

[Bose SoundTouch](https://www.bose.com/soundtouch-systems.html) plugin for [Homebridge](https://github.com/nfarina/homebridge)

This allows you to control your SoundTouch devices with HomeKit and Siri.

##Installation
1. Install homebridge using: npm install -g homebridge
2. Install this plugin using: npm install -g homebridge-soundtouch
3. Update your configuration file. See the sample below.

##Configuration
Example config.json:

```
    "accessories": [
		{
			"accessory": "SoundTouch",
			"name": "Speaker Bathroom",
			"room": "Bathroom"
		}
	],
```

Example config.json for multiple speakers:

```
    "accessories": [
		{
			"accessory": "SoundTouch",
			"name": "Speaker Bathroom",
			"room": "Bathroom"
		},
		{
            "accessory": "SoundTouch",
            "name": "Speaker Kitchen",
            "room": "Kitchen"
        }
	],
```

Example config.json to configure the device as type speaker:

```
    "accessories": [
		{
			"accessory": "SoundTouch",
			"name": "Speaker Bathroom",
			"room": "Bathroom"
			"type": "speaker"
		}
	],
```

Fields: 

* "accessory": Must always be "SoundTouch" (required)
* "name": The name you want to use to control the SoundTouch.
* "room": Should match exactly with the name of the SoundTouch device.
* "type": Must be 'Switch' or 'Speaker' (Switch is default). This determine the type of device for HomeKit. (Switch is supported by the official Apple HomeKit app, if you use another third party app, speaker could be used)

Don't use soundtouch or music as name, because Siri will try to open the SoundTouch or Apple Music app.

Controlling the volume with Siri is not possible, because volume is not (yet) supported as a Characteristic.
In fact, for HomeKit this accessory is treated like a switch (because speaker accessories are not supported). Unless you use another HomeKit app and configure the type parameter.

##Connecting

1. Install the Insteon+ app on your iPhone or iPad.
2. Add a home
3. Add a device and select the found 'HomeBridge' accessory (pin code is 031-45-154)


##Siri (English)

* Hé Siri, is speaker bathroom enabled?
* Hé Siri, is speaker bathroom playing?
* Hé Siri, turn speaker bathroom on
* Hé Siri, turn speaker bathroom off


##Siri (Dutch)

* Hé Siri, is de speaker badkamer ingeschakeld?
* Hé Siri, is speaker badkamer aan het spelen?
* Hé Siri, schakel speaker badkamer in
* Hé Siri, schakel speaker badkamer uit