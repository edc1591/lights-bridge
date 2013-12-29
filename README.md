# Lights-Bridge

Lights-Bridge is a collection of apps that communicate with RGB LEDs and X10 devices to be used in conjunction with the [Lights iOS app](https://github.com/edc1591/Lights-iOS) and [Lights-Rails backend](https://github.com/edc1591/lights-rails).

## Links

* Documentation: <https://github.com/edc1591/lights-rails/wiki>
* Lights iOS app: <https://github.com/edc1591/Lights-iOS>
* Lights-Rails backend: <https://github.com/edc1591/lights-rails>

## Descriptions

* `lights-mochad.js` interacts with mochad to control X10 devices and does not control RGB LEDs.
* `lights-serial.py` sends commands over a serial connection (i.e. xbee) to an Arduino and supports X10 devices and RGB LEDs.

## Installation

In your selected bridge app, set the zone variable at the top of the file to the id of the zone on the lights-rails backend. You'll need to create a new zone on the rails backend for each instance of a bridge app.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

Copyright (c) 2014 Evan Coleman, released under the [MIT license](LICENSE).