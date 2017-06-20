![Node-RED Modbus](http://b.repl.ca/v1/Node--RED-Modbus-green.png)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![NPM download](https://img.shields.io/npm/dm/node-red-contrib-modbus.svg)](http://www.npm-stats.com/~packages/node-red-contrib-modbus)
[![NPM version](https://badge.fury.io/js/node-red-contrib-modbus.png)](http://badge.fury.io/js/node-red-contrib-modbus)
[![Build Status](https://travis-ci.org/biancode/node-red-contrib-modbus.svg?branch=master)](https://travis-ci.org/biancode/node-red-contrib-modbus)

[![nodemodbus64](images/modbus-icon64.png)](https://www.npmjs.com/package/node-red-contrib-modbus)

node-red-contrib-modbus 
========================

[Node-RED][1] contribution package for [Modbus][8]

Based on [modbus-serial][2] with TCP, C701, Telnet, Serial, RTU buffered, and ASCII

* stress tested with Node-RED v0.16.2 and Node.js (4.7/6.9 LTS)
* works with queueing per unit and round robin scheduling

# Install

Run the following command in the root directory of your Node-RED install

    npm install node-red-contrib-modbus

Run the following command for global install

    npm install -g node-red-contrib-modbus

try these options on npm install to build, if you have problems to install

    --unsafe-perm --build-from-source
    
# Update/Upgrade

To update the dependencies or the whole package, you have just to install again.
To get a special version please set the version with @M.M.F:

    npm install node-red-contrib-modbus@1.0.16
or

    npm install -g node-red-contrib-modbus@1.0.16
    
# How to use

see [Wiki][10] pages

use the [Flow example][3] to see how it works ...

see [YouTube Playlist][9]

![Flow Example](images/Screenshot02V100.png)

# Debug

Debug will be activated by starting Node-RED with debug mode: 

    DEBUG=node_red_contrib_modbus node-red -v

see [Wiki][10] pages to get more options in detail

# Authors

since April 2016 by [Klaus Landsdorf][4]

### History 

* contribution in 2016 by [iurly][6]

* license changed in 2016 by [Jason D. Harper][7]

* started in early 2015 by [Mika Karaila][5]

[1]:https://nodered.org
[2]:https://www.npmjs.com/package/modbus-serial
[3]:https://flows.nodered.org/flow/bf06a87e84395e4bce276714c6f5f884
[4]:https://github.com/biancode
[5]:https://github.com/mikakaraila
[6]:https://github.com/iurly
[7]:https://github.com/jayharper
[8]:http://www.modbus.org/
[9]:http://bit.ly/2jzwjqP
[10]:https://github.com/biancode/node-red-contrib-modbus/wiki
