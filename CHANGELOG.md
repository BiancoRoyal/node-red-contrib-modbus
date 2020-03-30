# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [5.4.1-beta.1](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v5.4.1-beta.0...v5.4.1-beta.1) (2020-03-30)


### Bug Fixes

* activate sending with promise ([fcb816e](https://github.com/biancoroyal/node-red-contrib-modbus/commit/fcb816e39754ab3f8840a0d481b0831f375e6a3f))
* issue [#179](https://github.com/biancoroyal/node-red-contrib-modbus/issues/179) ([1824032](https://github.com/biancoroyal/node-red-contrib-modbus/commit/18240323cb0b50716987a9dfec2a5de0f9930d12))
* issue [#180](https://github.com/biancoroyal/node-red-contrib-modbus/issues/180) msg as expected from other msg structures ([f1e9a43](https://github.com/biancoroyal/node-red-contrib-modbus/commit/f1e9a4381449d99cc32109844d60ef98dfb0920c))
* less EMPTY switches to the FSM ([29d79bc](https://github.com/biancoroyal/node-red-contrib-modbus/commit/29d79bc7e81a2ef9b890371950045f58a6b9126b))
* the server does not support that feature since jsmodbus is used instead of node-modbus ([abd88d8](https://github.com/biancoroyal/node-red-contrib-modbus/commit/abd88d889e738f1e43e7de6623b9740a3f5ddcfa))

### [5.4.1-beta.0](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v5.4.0...v5.4.1-beta.0) (2020-03-29)

# [5.4.0](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v5.4.0-alpha.4...v5.4.0) (2020-03-28)



# [5.4.0-alpha.4](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v5.4.0-alpha.3...v5.4.0-alpha.4) (2020-03-27)


### Bug Fixes

* needs new on re-register nodes ([464662b](https://github.com/biancoroyal/node-red-contrib-modbus/commit/464662b711a92ad94691cf266e9ebff5ac0ca4ce))



# [5.4.0-alpha.3](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v5.4.0-alpha.2...v5.4.0-alpha.3) (2020-03-26)


### Bug Fixes

* issue  [#182](https://github.com/biancoroyal/node-red-contrib-modbus/issues/182) to get better information from the FSM ([78be12b](https://github.com/biancoroyal/node-red-contrib-modbus/commit/78be12b72403e6de12d6f8c1ee11f633828ff04e))



# [5.4.0-alpha.2](https://github.com/biancoroyal/node-red-contrib-modbus/compare/5.1.0-0...v5.4.0-alpha.2) (2020-03-26)


### Bug Fixes

* **client:** FSM message FSM Reset while failure handling and on unplanned state changes, now it raises only on failures  ([944786c](https://github.com/biancoroyal/node-red-contrib-modbus/commit/944786cdd6f9e8322c3e3264cd1ef8aa4a244118))
* [#160](https://github.com/biancoroyal/node-red-contrib-modbus/issues/160) error on show activities true ([af27fe6](https://github.com/biancoroyal/node-red-contrib-modbus/commit/af27fe616654eb074bb29f34a163d4ffabc742bd))
* [#178](https://github.com/biancoroyal/node-red-contrib-modbus/issues/178) debug per node to see where it is not correct or fallback core log ([ff69134](https://github.com/biancoroyal/node-red-contrib-modbus/commit/ff691343ab7c93451642922bf6fa237f777b934f))
* [#178](https://github.com/biancoroyal/node-red-contrib-modbus/issues/178) too get no crash on internal debug log ([a0389e7](https://github.com/biancoroyal/node-red-contrib-modbus/commit/a0389e7b051d736bc958fee4fbfeb1879cda99e3)), closes [#180](https://github.com/biancoroyal/node-red-contrib-modbus/issues/180)
* serialport list call ([f401c58](https://github.com/biancoroyal/node-red-contrib-modbus/commit/f401c58cb384ce87489aecaa99a3000f18e4222b))
* supporter file missing ([d24fad6](https://github.com/biancoroyal/node-red-contrib-modbus/commit/d24fad66e8730f9535b8d9edc0512087e55b7d07))
* travis build ([7a7294e](https://github.com/biancoroyal/node-red-contrib-modbus/commit/7a7294e9fd2fa14d54412586af8c81e25d5b30cd))
* typo config node client ([9be8b16](https://github.com/biancoroyal/node-red-contrib-modbus/commit/9be8b1634469abfe6b8b6fb471a16f9387b6cee4))


### Features

* [#161](https://github.com/biancoroyal/node-red-contrib-modbus/issues/161) multiple RTU devices via UnitID ([b0b5011](https://github.com/biancoroyal/node-red-contrib-modbus/commit/b0b5011be4ab5e7c06ab44fd9df7b0ff5ddd0fd8))
* [#180](https://github.com/biancoroyal/node-red-contrib-modbus/issues/180) msg on fail pre-release alpha ([282a7c4](https://github.com/biancoroyal/node-red-contrib-modbus/commit/282a7c46a26c91f387b024ec1703f090a14f1816))
* msg or error on flex connector ([16a947b](https://github.com/biancoroyal/node-red-contrib-modbus/commit/16a947b9eed12a600b5315bf41e63606305ccbd4))
* new output for flex config ([f78e775](https://github.com/biancoroyal/node-red-contrib-modbus/commit/f78e775f2e84ae5d8ce406457a2b747daa3abd38))
* set default on serial for queue by the type checkbox switch ([65edb52](https://github.com/biancoroyal/node-red-contrib-modbus/commit/65edb52b393a421d7c5db3dd8749a2a0da7d4393))



# [5.1.0-0](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v4.1.3...5.1.0-0) (2019-11-24)


### Features

* new state machine from xstate ([57aef99](https://github.com/biancoroyal/node-red-contrib-modbus/commit/57aef9956187ee9d70e862b226f3a3ef5e091528))



## [4.1.1](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v4.1.0...v4.1.1) (2018-11-13)


### Bug Fixes

* modbus flex server ([7d332f0](https://github.com/biancoroyal/node-red-contrib-modbus/commit/7d332f0add6e6912f2dd91e8c92bce751d97e6d7))
* **log:** remove console logs ([a859d91](https://github.com/biancoroyal/node-red-contrib-modbus/commit/a859d91a9ad8dad56f985457916a5b809b22a586))



## [4.0.1](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v4.0.0...v4.0.1) (2018-11-08)


### Features

* update libs  ([a4c1aab](https://github.com/biancoroyal/node-red-contrib-modbus/commit/a4c1aab5130c8018ab5374099caf3dcc299afe82))



# [4.0.0](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v3.6.1...v4.0.0) (2018-08-19)


### Bug Fixes

* **test:** counter has to add some ([f183135](https://github.com/biancoroyal/node-red-contrib-modbus/commit/f183135e0a1458bb071bdb791ceb25e5707392e7))
* **test:** faster travis CI ([3857c29](https://github.com/biancoroyal/node-red-contrib-modbus/commit/3857c296be8e262a46c916a3db5504b652b95bf8))


### Features

* **clients:** register and deregister for all client nodes issue [#105](https://github.com/biancoroyal/node-red-contrib-modbus/issues/105) ([c7a00a3](https://github.com/biancoroyal/node-red-contrib-modbus/commit/c7a00a393ae07cd2f57d4356ec47f1a01c8e509b))
* **read:** log IO option ([61d22ea](https://github.com/biancoroyal/node-red-contrib-modbus/commit/61d22ea0d658dd8cb8dde6e4f0c0d7789c8f0b9c))
* **server:** discrete input for the flex server ([54d7028](https://github.com/biancoroyal/node-red-contrib-modbus/commit/54d70286b245e532dd3a3333cb9790a775bb1d0d))
* **server:** upgrade to jsmodbus 3.0.0 ([12a045e](https://github.com/biancoroyal/node-red-contrib-modbus/commit/12a045e94286438f6a920d6be899573a206b014c)), closes [#105](https://github.com/biancoroyal/node-red-contrib-modbus/issues/105)



## [3.6.1](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v3.6.0...v3.6.1) (2018-06-08)



# [3.6.0](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v3.5.0...v3.6.0) (2018-05-28)



# [3.5.0](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v3.4.0...v3.5.0) (2018-05-21)


### Features

* **server:** IPv6 support ([2eb2973](https://github.com/biancoroyal/node-red-contrib-modbus/commit/2eb297336cb3083cb3cd6f2752c7997a6722e71b))



# [3.4.0](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v3.3.4...v3.4.0) (2018-03-05)



## [3.3.4](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v3.3.2...v3.3.4) (2018-03-05)



## [3.3.2](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v3.3.1...v3.3.2) (2018-02-21)



## [3.3.1](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v3.0.2...v3.3.1) (2018-02-20)



## [3.0.2](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v3.0.1...v3.0.2) (2018-01-10)



## [3.0.1](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v3.0.0...v3.0.1) (2018-01-09)



# [2.5.0](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v2.3.2...v2.5.0) (2017-12-19)



## [2.3.2](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v2.2.3...v2.3.2) (2017-11-21)



## [2.2.3](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v2.2.2...v2.2.3) (2017-11-08)



## [2.2.2](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v2.1.1...v2.2.2) (2017-11-08)



## [2.1.1](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v1.0.16...v2.1.1) (2017-10-22)



## [1.0.16](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v1.0.12...v1.0.16) (2017-05-10)



## [1.0.12](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v1.0.8...v1.0.12) (2017-05-06)



## [1.0.8](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v1.0.0...v1.0.8) (2017-03-05)



# 1.0.0 (2017-01-18)
