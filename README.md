![Platform Node-RED](https://img.shields.io/badge/Platform-Node--RED-red.png)
![Contribution Modbus](https://img.shields.io/badge/Contribution-Modbus-orange.png)
[![Financial Contributors on Open Collective](https://opencollective.com/node-red-contrib-modbus/all/badge.svg?label=financial+contributors)](https://opencollective.com/node-red-contrib-modbus)
[![NPM version](https://badge.fury.io/js/node-red-contrib-modbus.png)](https://www.npmjs.com/package/node-red-contrib-modbus)
![ES_Sourdce_Version](https://img.shields.io/badge/JS_Source-ES2019-yellow.png)
![ES_Deploy_Version](https://img.shields.io/badge/JS_Deploy-ES2015-yellow.png)
![NodeJS_Version](https://img.shields.io/badge/NodeJS-LTS-green.png)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![NPM download](https://img.shields.io/npm/dm/node-red-contrib-modbus.svg)](https://npm-stat.com/charts.html?package=node-red-contrib-modbus)
[![Build and publish](https://github.com/BiancoRoyal/node-red-contrib-modbus/actions/workflows/build.yml/badge.svg)](https://github.com/BiancoRoyal/node-red-contrib-modbus/actions/workflows/build.yml)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/6cbeb40ab5604b3ab99e6badc9469e8a)](https://www.codacy.com/gh/BiancoRoyal/node-red-contrib-modbus?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=BiancoRoyal/node-red-contrib-modbus&amp;utm_campaign=Badge_Grade)
[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/BiancoRoyal/node-red-contrib-modbus)


# node-red-contrib-modbus

### The all-in-one Modbus TCP and Serial contribution package for Node-RED

[![nodemodbus64](images/modbus-icon64.png)](https://www.npmjs.com/package/node-red-contrib-modbus)

If you like that contributor's package for Modbus, then please **give us your star at [GitHub][12]** !

## P4NR B2B Community

The [P4NR B2B Community][16] driven by [Iniationware][15] takes now care about the development and improvements 
for Modbus.
Books, Tutorials and much more will be provided over time and if you need some support the P4NR team 
can help you.
Bianco Royal is in partnership with the P4NR B2B Community. 

- [PLUS for Node-RED International][16]
- [PLUS for Node-RED Germany][17]

## Leanpub Live-Book

We're excited to announce our [Online Leanpub Book](https://leanpub.com/p4nr-contribution-modbus/) that covers each v5.x
version in detail. This comprehensive guide is aimed to help you learn more about our nodes and the various options inside them.
What's unique about this book is its "buy once, update forever" approach. We continuously update the content to bring
the latest v5.x changes or new options with each v5.x release version.

Moreover, we're dedicated to responding to your queries. If you have a question, not only will we answer it,
but we can also incorporate the insightful answers into the book's future editions. This ensures that all readers
stay informed and engaged. Thanks to the [P4NR B2B Community](https://p4nr.com/)

Purchasing our book will greatly support us in our mission to incrementally improve Modbus for Node-RED and beyond
with every release in the upcoming decade. Your support will undoubtedly contribute to building a robust Modbus
for Node-RED ecosystem.

## Contribution Information

[Node-RED][1] contribution package for [Modbus][8] version overview:

Based on [modbus-serial][2] with TCP, C701, Telnet, Serial, RTU buffered, and ASCII

* stress tested with Node-RED v1.0.4 and Node.js LTS
* works with queueing per unit and round-robin scheduling

[Version History](HISTORY.md)

If you like that contributor's package for Modbus, then please **give us your star at [GitHub][12]** !

## Install

Run the following command in the root directory of your Node-RED install

    npm install node-red-contrib-modbus

Run the following command for global install

    npm install -g node-red-contrib-modbus

try these options on npm install to build if you have problems to install

    --unsafe-perm --build-from-source
    
### modbus-serial, serialport and jsmodbus

The [serialport][14] optional dependency is just to list all ports on your system in the client configuration.
It is not the [serialport][14] version to work with Modbus at runtime. 
For that check the [modbus-serial][2] or [jsmodbus][13] package.json, please!
The [modbus-serial][2] supports and works for TCP connections in that package, too.
The [jsmodbus][13] package is just to provide a simple Modbus Server node. 
All Modbus commands running on [modbus-serial][2].

### TCP or Serial testing
If you get in trouble *with TCP* connections, then check and test with just [modbus-serial][2] first, please!

If you get in trouble *with Serial* connections, then check with just [serialport][14] first, please!

## Update/Upgrade/Downgrade

To update the dependencies or the whole package, you have just to install again.

    npm show node-red-contrib-modbus@* version

To get a special version, please set the version with @M.M.F:

    npm install node-red-contrib-modbus@3.6.1

or global by

    npm install -g node-red-contrib-modbus@3.6.1

## Modbus Flex Server

The Modbus-Flex-Server now got its own package.
The P4NR team started to work on fixing the vm2 issue, but first, we think as the community here it has to get out of
this package to close the issue on vm2 now.
The P4NR team will split this package more in the next time into client and server packages to get a better
development flow and to react faster on CVE or other issues.
This is a first step to v6 of the package.

## How to use

* see [Wiki][10] pages
* use the [Flow example][3] to see how it works ...
* see [YouTube Playlist][9]

![Flow Example](images/Screenshot01V210.png)

## Errors

Since v5.22+ the package will catch network and other errors of the client and server node. 
That means, you have to handle the error status of the node and Node-RED should not crash in the handled cases.

## Debug

Debug will be activated by starting Node-RED with debug mode:

    DEBUG=contribModbus*,modbus-serial node-red -v

    or

    DEBUG=contribModbus:{option},contribModbus:{option},...

see [Wiki][10] pages to get more options in detail

## Contributing

Let's work together! Contributors are welcome.
Please, fork the repo and send your pull requests from your repo 
to our develop branch or open issues while you're testing!

## For Developers

See the scripts of the package and the additional Shell scripts to clean, update, or upgrade this NPM package.

* dev-link (local testing with Node-RED)
* testing (unit, integration)
* coverage
* docs generation
* standard-version alpha, beta, release
* git-flow

## For Testers

Report issues, share your experiences, record tutorials,
write Wiki articles and Blogs to share more about this package, please!

## Authors

since April 2016 by [Klaus Landsdorf][4] and Community Driven

### History

* contribution since 2016 by [Contributors][6]
* license changed in 2016 by [Jason D. Harper][7]
* started in early 2015 by [Mika Karaila][5]

[1]:https://nodered.org
[2]:https://www.npmjs.com/package/modbus-serial
[3]:https://flows.nodered.org/flow/bf06a87e84395e4bce276714c6f5f884
[4]:https://github.com/biancode
[5]:https://github.com/mikakaraila
[6]:https://github.com/BiancoRoyal/node-red-contrib-modbus/graphs/contributors
[7]:https://github.com/jayharper
[8]:http://www.modbus.org/
[9]:http://bit.ly/2jzwjqP
[10]:https://github.com/BiancoRoyal/node-red-contrib-modbus/wiki/DEBUG
[11]:https://plus4nodered.com/
[12]:https://github.com/BiancoRoyal/node-red-contrib-modbus
[13]:https://www.npmjs.com/package/jsmodbus
[14]:https://www.npmjs.com/package/serialport
[15]:https://iniationware.com/
[16]:https://plus4nodered.com/
[17]:https://plus4nodered.com/de/

## Contributors

### Code Contributors

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].
<a href="https://github.com/BiancoRoyal/node-red-contrib-modbus/graphs/contributors"><img src="https://opencollective.com/node-red-contrib-modbus/contributors.svg?width=890&button=false" /></a>

### Financial Contributors

Become a financial contributor and help us sustain our community. [[Contribute](https://opencollective.com/node-red-contrib-modbus/contribute)]

#### Individuals

<a href="https://opencollective.com/node-red-contrib-modbus"><img src="https://opencollective.com/node-red-contrib-modbus/individuals.svg?width=890"></a>

#### Organizations

Support this project with your organization. Your logo will show up here with a link to your website. [[Contribute](https://opencollective.com/node-red-contrib-modbus/contribute)]

<a href="https://opencollective.com/node-red-contrib-modbus/organization/0/website"><img src="https://opencollective.com/node-red-contrib-modbus/organization/0/avatar.svg"></a>
<a href="https://opencollective.com/node-red-contrib-modbus/organization/1/website"><img src="https://opencollective.com/node-red-contrib-modbus/organization/1/avatar.svg"></a>
<a href="https://opencollective.com/node-red-contrib-modbus/organization/2/website"><img src="https://opencollective.com/node-red-contrib-modbus/organization/2/avatar.svg"></a>
<a href="https://opencollective.com/node-red-contrib-modbus/organization/3/website"><img src="https://opencollective.com/node-red-contrib-modbus/organization/3/avatar.svg"></a>
<a href="https://opencollective.com/node-red-contrib-modbus/organization/4/website"><img src="https://opencollective.com/node-red-contrib-modbus/organization/4/avatar.svg"></a>
<a href="https://opencollective.com/node-red-contrib-modbus/organization/5/website"><img src="https://opencollective.com/node-red-contrib-modbus/organization/5/avatar.svg"></a>
<a href="https://opencollective.com/node-red-contrib-modbus/organization/6/website"><img src="https://opencollective.com/node-red-contrib-modbus/organization/6/avatar.svg"></a>
<a href="https://opencollective.com/node-red-contrib-modbus/organization/7/website"><img src="https://opencollective.com/node-red-contrib-modbus/organization/7/avatar.svg"></a>
<a href="https://opencollective.com/node-red-contrib-modbus/organization/8/website"><img src="https://opencollective.com/node-red-contrib-modbus/organization/8/avatar.svg"></a>
<a href="https://opencollective.com/node-red-contrib-modbus/organization/9/website"><img src="https://opencollective.com/node-red-contrib-modbus/organization/9/avatar.svg"></a>
