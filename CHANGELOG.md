## [5.21.2](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v5.15.0...v5.21.2) (2022-02-15)


### Bug Fixes

* [#253](https://github.com/biancoroyal/node-red-contrib-modbus/issues/253) queue info reset ([9ad4531](https://github.com/biancoroyal/node-red-contrib-modbus/commit/9ad45314e874caa2016caf80e5b5102acf29964d))
* [#274](https://github.com/biancoroyal/node-red-contrib-modbus/issues/274) ([fccd59b](https://github.com/biancoroyal/node-red-contrib-modbus/commit/fccd59be03ec79deae4698e4ce11064f3de825c1))
* [#277](https://github.com/biancoroyal/node-red-contrib-modbus/issues/277), [#253](https://github.com/biancoroyal/node-red-contrib-modbus/issues/253), [#263](https://github.com/biancoroyal/node-red-contrib-modbus/issues/263), [#266](https://github.com/biancoroyal/node-red-contrib-modbus/issues/266) ([920d6d0](https://github.com/biancoroyal/node-red-contrib-modbus/commit/920d6d0e089e27e21fa92b4b6a313a66dad6452b))
* ghactions ([ee04b3a](https://github.com/biancoroyal/node-red-contrib-modbus/commit/ee04b3a5e21c6727e16a0bad0dc50d637b2ccbc1))
* lock ([6fce00e](https://github.com/biancoroyal/node-red-contrib-modbus/commit/6fce00eb10ef62d5eca84e51040f138e9dbbb5f1))
* python 3.9 for travis ([2afdb63](https://github.com/biancoroyal/node-red-contrib-modbus/commit/2afdb63e3b2c384327d6044e40f8d4f519ccedcc))
* remove wire to none existing node of example code  ([be770c4](https://github.com/biancoroyal/node-red-contrib-modbus/commit/be770c4ed8f36ccaeb2a5f614e569a25965fb17f))
* source-map not optional ([7adac0b](https://github.com/biancoroyal/node-red-contrib-modbus/commit/7adac0b318b067c307a1d9e285dd9237608da659))
* travis ([d34f5a8](https://github.com/biancoroyal/node-red-contrib-modbus/commit/d34f5a81e9d55cb2a3ffb482641bb48832645e1a))


### Features

* IO Modbus examples and node-red version spec in package ([707d572](https://github.com/biancoroyal/node-red-contrib-modbus/commit/707d572f214e8d11728260303784d830b324cbfe))



## [5.14.1](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v5.14.0...v5.14.1) (2021-08-07)



# [5.14.0](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v5.13.3...v5.14.0) (2021-04-10)


### Bug Fixes

* **basics:** [#210](https://github.com/biancoroyal/node-red-contrib-modbus/issues/210) missing parameter node ([806f944](https://github.com/biancoroyal/node-red-contrib-modbus/commit/806f944d3acdb46750611b74497940224463acfa))
* **msg:** modbus request data in msg object [#203](https://github.com/biancoroyal/node-red-contrib-modbus/issues/203) ([380357f](https://github.com/biancoroyal/node-red-contrib-modbus/commit/380357f825ebe0b3648b1d146bad136f1a195d89))



## [5.13.1](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v5.12.0...v5.13.1) (2020-05-24)


### Bug Fixes

* **serial:** [#202](https://github.com/biancoroyal/node-red-contrib-modbus/issues/202) locked queue on serial error ([757f341](https://github.com/biancoroyal/node-red-contrib-modbus/commit/757f34192885e7cf157aa438e22266928d477357))
* **serial:** queue serial sequenced sending [#202](https://github.com/biancoroyal/node-red-contrib-modbus/issues/202) ([e11cb49](https://github.com/biancoroyal/node-red-contrib-modbus/commit/e11cb492037e0d91eb13f82596cbecbc87c6e24d))


### Features

* **broadcast:** [#195](https://github.com/biancoroyal/node-red-contrib-modbus/issues/195) extracting from payload.unitid, msg.queeuid or node UnitId ([11afe1c](https://github.com/biancoroyal/node-red-contrib-modbus/commit/11afe1c07440c9f0006f696385347d909d2c05ff))



# [5.12.0](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v5.11.0...v5.12.0) (2020-05-17)


### Bug Fixes

* **reader:** issue [#200](https://github.com/biancoroyal/node-red-contrib-modbus/issues/200) missing topic in msg ([b099b1f](https://github.com/biancoroyal/node-red-contrib-modbus/commit/b099b1f6e95a60504658d3f9ce9945d719cba934))


### Features

* **reader:** empty msg on error ([15a8e01](https://github.com/biancoroyal/node-red-contrib-modbus/commit/15a8e012f92e8df5d76223a4287f594b14a87881))



# [5.11.0](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v5.10.1...v5.11.0) (2020-05-12)


### Bug Fixes

* HTTP msg requests ([685f788](https://github.com/biancoroyal/node-red-contrib-modbus/commit/685f788b4a250e03e4690d0f1a5d356387517712))
* **tcp:** allow 0 for uintId ([0086b5c](https://github.com/biancoroyal/node-red-contrib-modbus/commit/0086b5c8e72088c12ac4a7cdec80eeef9d0b5f71))


### Features

* **msg:** keep msg properties ([3c4738e](https://github.com/biancoroyal/node-red-contrib-modbus/commit/3c4738e66ac621a6a963b59383ac37541035738d))
* **msg:** keep msg properties with testing it ([46cb858](https://github.com/biancoroyal/node-red-contrib-modbus/commit/46cb858d4a4eded594cfa5dc09cc30a02b0cdce7))



## [5.10.1](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v5.8.0...v5.10.1) (2020-04-10)


### Bug Fixes

* FSM double take on running in the same states with multiple consumer ([5072e40](https://github.com/biancoroyal/node-red-contrib-modbus/commit/5072e407961ba5145ea9d50bc742c7494ba482b4))
* HTTP messaging did not work ([8e87053](https://github.com/biancoroyal/node-red-contrib-modbus/commit/8e870534f14c0f20f7445bfe214c790b8124e7fd))
* improve register and de-register for issue  [#165](https://github.com/biancoroyal/node-red-contrib-modbus/issues/165)  ([c68d59b](https://github.com/biancoroyal/node-red-contrib-modbus/commit/c68d59b41a8081bb9a345165098e360b787e2336))
* issue [#187](https://github.com/biancoroyal/node-red-contrib-modbus/issues/187) - listener remove for partial deploy ([5220d27](https://github.com/biancoroyal/node-red-contrib-modbus/commit/5220d2712c357fd385feb860fe79587e1f828793))
* nodejs 13 fsm problem dynamic reconnect  ([919db9b](https://github.com/biancoroyal/node-red-contrib-modbus/commit/919db9bad7edbb0532783b893a969d8725a44eb6))
* read node should not use basic status handling cause of the own interval ([dea606f](https://github.com/biancoroyal/node-red-contrib-modbus/commit/dea606f8d7bcf15c385f0b9336d195e82100126a))
* remove all listeners was lost in code ([92ada63](https://github.com/biancoroyal/node-red-contrib-modbus/commit/92ada63499a9bd0683817308cbb3f3c27393e4bb))
* test timeout passing ([0dcf966](https://github.com/biancoroyal/node-red-contrib-modbus/commit/0dcf966d021d7abc7726976bec8be84d7d1b968b))
* timer problem on partial deploy  issue [#187](https://github.com/biancoroyal/node-red-contrib-modbus/issues/187) ([66066c0](https://github.com/biancoroyal/node-red-contrib-modbus/commit/66066c07b9b5f9e7666ebcc9e16ebf8e9d53de85))


### Features

* **getter:** empty msg on catch error ([c8ac4a6](https://github.com/biancoroyal/node-red-contrib-modbus/commit/c8ac4a675ce17ca1992a1018ad113652cd5b97a4))
* new status update concept for nodes with less traffic ([eb2afba](https://github.com/biancoroyal/node-red-contrib-modbus/commit/eb2afbabac913eaa3d017735dc7a11eb9d02d60f))
* queue info can handle all queues from one node issue [#175](https://github.com/biancoroyal/node-red-contrib-modbus/issues/175) ([1a094b2](https://github.com/biancoroyal/node-red-contrib-modbus/commit/1a094b27bf0846118e1db18ea4e567898a788e37))
* **write:** empty msg on fail as the other node ([d6fd30b](https://github.com/biancoroyal/node-red-contrib-modbus/commit/d6fd30b20cf638b824852cad4a66ef42de6a07da))



# [5.8.0](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v5.4.0...v5.8.0) (2020-04-02)


### Bug Fixes

* [#178](https://github.com/biancoroyal/node-red-contrib-modbus/issues/178) debug per node to see where it is not correct or fallback core log ([ff69134](https://github.com/biancoroyal/node-red-contrib-modbus/commit/ff691343ab7c93451642922bf6fa237f777b934f))
* [#178](https://github.com/biancoroyal/node-red-contrib-modbus/issues/178) too get no crash on internal debug log ([a0389e7](https://github.com/biancoroyal/node-red-contrib-modbus/commit/a0389e7b051d736bc958fee4fbfeb1879cda99e3)), closes [#180](https://github.com/biancoroyal/node-red-contrib-modbus/issues/180)
* activate sending with promise ([fcb816e](https://github.com/biancoroyal/node-red-contrib-modbus/commit/fcb816e39754ab3f8840a0d481b0831f375e6a3f))
* **client:** FSM message FSM Reset while failure handling and on unplanned state changes, now it raises only on failures  ([944786c](https://github.com/biancoroyal/node-red-contrib-modbus/commit/944786cdd6f9e8322c3e3264cd1ef8aa4a244118))
* GUI problems and performance while verbose mode is active ([9453fcc](https://github.com/biancoroyal/node-red-contrib-modbus/commit/9453fcc4afd81177c7bc46a9a20f28ba8c91b271))
* issue  [#182](https://github.com/biancoroyal/node-red-contrib-modbus/issues/182) to get better information from the FSM ([78be12b](https://github.com/biancoroyal/node-red-contrib-modbus/commit/78be12b72403e6de12d6f8c1ee11f633828ff04e))
* issue [#175](https://github.com/biancoroyal/node-red-contrib-modbus/issues/175) less update queue info node on queue-changes ([45eae4e](https://github.com/biancoroyal/node-red-contrib-modbus/commit/45eae4e405fa788e5189d19c1c55d828b03b52b1))
* issue [#179](https://github.com/biancoroyal/node-red-contrib-modbus/issues/179) ([1824032](https://github.com/biancoroyal/node-red-contrib-modbus/commit/18240323cb0b50716987a9dfec2a5de0f9930d12))
* issue [#180](https://github.com/biancoroyal/node-red-contrib-modbus/issues/180) msg as expected from other msg structures ([f1e9a43](https://github.com/biancoroyal/node-red-contrib-modbus/commit/f1e9a4381449d99cc32109844d60ef98dfb0920c))
* less EMPTY switches to the FSM ([29d79bc](https://github.com/biancoroyal/node-red-contrib-modbus/commit/29d79bc7e81a2ef9b890371950045f58a6b9126b))
* needs new on re-register nodes ([464662b](https://github.com/biancoroyal/node-red-contrib-modbus/commit/464662b711a92ad94691cf266e9ebff5ac0ca4ce))
* queue problems with issue [#175](https://github.com/biancoroyal/node-red-contrib-modbus/issues/175) ([154c8a0](https://github.com/biancoroyal/node-red-contrib-modbus/commit/154c8a02ac757b0162c654930dda4d09775dded4))
* **read:** show active again with new state ([ed2eb88](https://github.com/biancoroyal/node-red-contrib-modbus/commit/ed2eb88dd792e46e98f1b5a0166a5951870ab87e))
* reconnect could just go to init or stopped ([d9e13b9](https://github.com/biancoroyal/node-red-contrib-modbus/commit/d9e13b950a9894061ec447b79ceadcd8d7c07ecf))
* response delay in server in not available  for now ([4542763](https://github.com/biancoroyal/node-red-contrib-modbus/commit/45427637a5a18a3a345594311e2eae1969fdea2f))
* serial config via flex connector missing parameter ([45e41ee](https://github.com/biancoroyal/node-red-contrib-modbus/commit/45e41ee1a4fe30c87a99355662bdee4b78d29656))
* serial lock toggle for issue [#175](https://github.com/biancoroyal/node-red-contrib-modbus/issues/175) ([45e4be8](https://github.com/biancoroyal/node-red-contrib-modbus/commit/45e4be85710eb6db18cb4cbc7d3a21e62a3eea68))
* serial multiple UnitIds issue [#175](https://github.com/biancoroyal/node-red-contrib-modbus/issues/175) ([2f6fedf](https://github.com/biancoroyal/node-red-contrib-modbus/commit/2f6fedfb7a815f92434f22ee9110bf1b6a5fa68a))
* similar empty msg structure ([cfbd834](https://github.com/biancoroyal/node-red-contrib-modbus/commit/cfbd8345cc489d2766708a2413d6c5b14f5bc021))
* testing works with new flaqs and clean code ([65dba5e](https://github.com/biancoroyal/node-red-contrib-modbus/commit/65dba5e744030221c006ce249499e340fafed7a4))
* the server does not support that feature since jsmodbus is used instead of node-modbus ([abd88d8](https://github.com/biancoroyal/node-red-contrib-modbus/commit/abd88d889e738f1e43e7de6623b9740a3f5ddcfa))
* travis build ([7a7294e](https://github.com/biancoroyal/node-red-contrib-modbus/commit/7a7294e9fd2fa14d54412586af8c81e25d5b30cd))


### Features

* [#180](https://github.com/biancoroyal/node-red-contrib-modbus/issues/180) msg on fail pre-release alpha ([282a7c4](https://github.com/biancoroyal/node-red-contrib-modbus/commit/282a7c46a26c91f387b024ec1703f090a14f1816))
* faster client with clean timeouts and less states ([cdf4735](https://github.com/biancoroyal/node-red-contrib-modbus/commit/cdf473529d01d73d94fa82019884649e70a213bf))
* keep the whole msg and add data for tcp request answers ([74271d3](https://github.com/biancoroyal/node-red-contrib-modbus/commit/74271d3be55f4719e83e8a044b956be64c20ca57))
* msg or error on flex connector ([16a947b](https://github.com/biancoroyal/node-red-contrib-modbus/commit/16a947b9eed12a600b5315bf41e63606305ccbd4))
* new output for flex config ([f78e775](https://github.com/biancoroyal/node-red-contrib-modbus/commit/f78e775f2e84ae5d8ce406457a2b747daa3abd38))
* new sending state to improve sequential sending ([7802dea](https://github.com/biancoroyal/node-red-contrib-modbus/commit/7802dea8fde23f39a28e54b8c7bb43c85e8c68dd))
* new server write concept via input msg and Uint8 list ([ad485ea](https://github.com/biancoroyal/node-red-contrib-modbus/commit/ad485ea07e1d0be139b32e035344fa043f3b1e99))
* set default on serial for queue by the type checkbox switch ([65edb52](https://github.com/biancoroyal/node-red-contrib-modbus/commit/65edb52b393a421d7c5db3dd8749a2a0da7d4393))



# [5.2.0](https://github.com/biancoroyal/node-red-contrib-modbus/compare/5.1.0-0...v5.2.0) (2019-12-08)


### Bug Fixes

* [#160](https://github.com/biancoroyal/node-red-contrib-modbus/issues/160) error on show activities true ([af27fe6](https://github.com/biancoroyal/node-red-contrib-modbus/commit/af27fe616654eb074bb29f34a163d4ffabc742bd))
* serialport list call ([f401c58](https://github.com/biancoroyal/node-red-contrib-modbus/commit/f401c58cb384ce87489aecaa99a3000f18e4222b))
* supporter file missing ([d24fad6](https://github.com/biancoroyal/node-red-contrib-modbus/commit/d24fad66e8730f9535b8d9edc0512087e55b7d07))
* typo config node client ([9be8b16](https://github.com/biancoroyal/node-red-contrib-modbus/commit/9be8b1634469abfe6b8b6fb471a16f9387b6cee4))


### Features

* [#161](https://github.com/biancoroyal/node-red-contrib-modbus/issues/161) multiple RTU devices via UnitID ([b0b5011](https://github.com/biancoroyal/node-red-contrib-modbus/commit/b0b5011be4ab5e7c06ab44fd9df7b0ff5ddd0fd8))



# [5.1.0-0](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v4.1.3...5.1.0-0) (2019-11-24)


### Features

* new state machine from xstate ([57aef99](https://github.com/biancoroyal/node-red-contrib-modbus/commit/57aef9956187ee9d70e862b226f3a3ef5e091528))



## [4.1.1](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v4.1.0...v4.1.1) (2018-11-13)


### Bug Fixes

* **log:** remove console logs ([a859d91](https://github.com/biancoroyal/node-red-contrib-modbus/commit/a859d91a9ad8dad56f985457916a5b809b22a586))
* modbus flex server ([7d332f0](https://github.com/biancoroyal/node-red-contrib-modbus/commit/7d332f0add6e6912f2dd91e8c92bce751d97e6d7))



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



