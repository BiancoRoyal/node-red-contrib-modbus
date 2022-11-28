# TODO

- closed Issues
  - excel list
  - work on tcp first
    - serial modbus server
      - extract Todo (Jira)
      - set priorities
      - Stale issues
        - recreate and rebuild with helper-node
          - use as test-flow (issues flow - server flows - read - write)
          - look for tests in modbus-serial
          - mention new test in new version in issue-comments
- milestones for 6.12.
  - better exception handling (security issue)
    - Systemexceptions abfangen Javascript?
    - [Errors-V.18](https://nodejs.org/docs/latest-v18.x/api/errors.html)
    - Welche Exceptions gibt es, was passiert bei den verschiedenen Fehlern und wie kann ich sie einfangen
  - testing examples (function)
    - e2e usable examples
      - change to test helper (--> already changed to Test Helper)
- nvm install
- v. 14/16/18 node.js (with Node-RED)
  - 18 set default
  - check e2e in all versions
    - write shell script
      - 14/16/18 
- version 18
  - check failing tests
- modbus serial new version put in v.18
- Research Modbus Lib

- Modbus Client
  - Funktionen
    - Read
    - Multiple Read
    - Write
    - Multiple Write
- Modbus Crawler
  - Adresse 0 - n durchlaufen bis unbekannte Adresse
    - ggf. set area
    - goAhead on errors option (jump empty inbetween)
- Sequence Read (Sequencer)
  - Sequencer Write
    - write around five things after each other
- Modbus Server
  - TSL-Verschlüsselung möglich (nicht für 6.12.)
    - secured modbus vorbereiten
- Modbus Flex-Server
  - rework
  - maybe different package
    - vm critical point (security issues)
- Modbus Flex-Getter
  - more tests for mentioned issues
  
- Issue
  - js Modbus unsafe / schlecht gepflegt

- Payload Structure
  - modbusBuffer: []
  - modbusItems: []
  - modbusItem: Any
  - metadata
    - serviceType: String (switch-case)
    - modbusBufferLength: Int
    - modbusItemsLength: Int
    - hasModbusBuffer: bool
    - hasModbusItem: bool
    - hasModbusItems: bool
- last priority
  - separate serial and tcp
  - separation with new core packages
- Goal: core
  - which test is for serial
- own modbus simulator / demo server (for PlusForNodeRED)
  - [Modbus simulator installation](https://www.youtube.com/watch?v=c9flM7UZ-gY)
  - [Modbus Simulator ModRSsim2](https://sourceforge.net/projects/modrssim2/)
- Modbus serial
  - serialport check node.js version
  - which node.js allowed
  - package.json "engines" checken
  - (node-modbus-serial no engines!)

- Bibliothek keep current forked project
  - right version (check)
    - for test and for dev
    - use sh shell
- package.json
  - dependency ~
  - dev-dependency ^
  - use npx for script in package.json (test, build, coverage)
  - xstate/fsm check for version (2.0.0)
    - find tests or write tests

- Research
  - "npm install" or "npm i" when it comes to dev-dependencies/dependencies

- JS Source 2021
  - [JS Version W3school](https://www.w3schools.com/js/js_2021.asp)
- JS Deploy 2017

- Modbus Specifications
  - Modbus SunSpec (PV-protocol)
    - issue [#340](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/340)

- contact creator and seller of PV Wallbox and heat pumps

- check nvm versioning in Shell
- **Always same Output for Node-RED package**


Current State (14.11. - v5.23.3): 
- Tests
  - check tests (231 master - 166 develop)
  - compare tests
- Test Coverage (14.11. - v5.23.3)
  - Statements   : 74.7% (1813/2427)
    Branches     : 63.18% (719/1138)
    Functions    : 75.61% (217/287)
    Lines        : 74.75% (1809/2420)

- Documentation
  - Funktionsbausteine extra erwähnen
- Specification
  - if missing, maybe contribution

Flex-Getter
- mehr Tests
- für jeden Function Code einen Test
- Filter Github-Issues:
  - "closed" obwohl noch nicht geklärt? (Stale issues)

Flex-Writer
- mehr Tests

## Video für Releases
- Deutsch/Englisch
  - Vermerk auf andere Sprache
  - Kamera von oben herab
  - Shorts mit einbauen
- Vermerk Plus4NodeRed
- Sterne
- MacBook einrichten
  - Tutorials
- Was wurde gemacht?
- Was wurde dazu in Plus4NodeRed Content geschrieben
- Nicht länger als eine Minute
Präsentation --> 6.12.
Video --> 9.12.
- Verweis Kontaktformular auf noderedplus.de

Client
- function isConnected (queueing, active)

F1, F3, F4

**Issue: Check Client Ready To Send**

Flex-Getter line 148, use similar in all nodes using the client.
- flex-connector
- flex-sequencer
- flex-write
- getter
- write

use receive with random message (test)  
do we have the client  
is client inactive?
- flex-connector
- flex-getter
- flex-write




inject once - helper not receive anything

Node-RED option to catch "warnings". Maybe catch-Node set to warnings if possible

Read - interval

Ports doppelt? &#x2611;

Node-RED read with Aqua-Tool Jetbrains?

0 als Broadcast


Funktionalität delay 

Write/getter

Input on first delay (10 seconds)
Wie bei Read (Delay on Start)
isReady
verboseWarn if not ready (Wait for one delay)

Option do not warn on not ready for input
verboseWarn output disable/enable warnings