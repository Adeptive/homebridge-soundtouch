#Homebridge-soundtouch

[Bose SoundTouch](https://www.bose.com/soundtouch-systems.html) plugin for [Homebridge](https://github.com/nfarina/homebridge)

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