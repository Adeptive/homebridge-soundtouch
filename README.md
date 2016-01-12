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
			"name": "Bathroom Speakers",
			"room": "Bathroom"
		}
	],
```

Fields: 

* "accessory": Must always be "SoundTouch" (required)
* "name": The name you want to use to control the SoundTouch.
* "room": Should match exactly with the name of the SoundTouch device.