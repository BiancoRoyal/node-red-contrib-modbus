# [5.43.0](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v5.41.0...v5.43.0) (2024-11-02)


### Bug Fixes

* **buffer:** nodejs Buffer alloc update ([9a6350c](https://github.com/biancoroyal/node-red-contrib-modbus/commit/9a6350cd67361f10310629a145f8a595e9f3d85c))
* **codeql:** version codeql ([163101f](https://github.com/biancoroyal/node-red-contrib-modbus/commit/163101f91c784a5202acd86b0a10302a22414495))
* **config:** [#442](https://github.com/biancoroyal/node-red-contrib-modbus/issues/442) fixing optional to save correct ([de88e25](https://github.com/biancoroyal/node-red-contrib-modbus/commit/de88e25b10e7e92ea8836d22ee91cb25796f3909))
* **issue#472:** Implemented message queue to handle incoming messages asynchronously ([65ea2a7](https://github.com/biancoroyal/node-red-contrib-modbus/commit/65ea2a7dce2e391a0b46412b798fdc4c14e6f750)), closes [issue#472](https://github.com/issue/issues/472)
* **modbus-client-core:** fixed test cases ([0697df3](https://github.com/biancoroyal/node-red-contrib-modbus/commit/0697df3f4fdf71434e3757f9ae68c6e6db22a948))
* **modbus-client-flow:** fixed modbus client flow example ([8613c89](https://github.com/biancoroyal/node-red-contrib-modbus/commit/8613c892c54d7c73ca818a5fb34729232fb8acef))
* **modbus-fc-flex:** fixed test case for modbus flex fc file ([93b22f8](https://github.com/biancoroyal/node-red-contrib-modbus/commit/93b22f8cafe5dc269811cfef78fba1c05dc57c69))
* **modbus-flex-getter:** fixed port server and tcp port ([b48d92f](https://github.com/biancoroyal/node-red-contrib-modbus/commit/b48d92f28c108a1c6e7b6ad03db7089cfe5b13af))
* **modbus-flex-write:** fixed flow for modbus flex write ([a31b4c4](https://github.com/biancoroyal/node-red-contrib-modbus/commit/a31b4c40259d4ebc8033fbcd006758186efb347e))
* **modbus-getter:** fixed test cases of modbus getter file ([693087b](https://github.com/biancoroyal/node-red-contrib-modbus/commit/693087bf3c3a92fa52d82a802c7f561e5b980e65))
* **modbus-io-core:** fixed error  RangeError [ERR_OUT_OF_RANGE]: ([ab932f3](https://github.com/biancoroyal/node-red-contrib-modbus/commit/ab932f3de4a3c362f73ba701da9fd1b0964fb21e))
* **modbus-read:** fixed test cases of modbus read file ([5c5879e](https://github.com/biancoroyal/node-red-contrib-modbus/commit/5c5879ecb30ca05e61a66fbc8c1a20ee07bf8b8d))
* **modbus-write:** fix example flow for modbus write node ([04fd17c](https://github.com/biancoroyal/node-red-contrib-modbus/commit/04fd17c9890ce760e36b2ec9402814accfdc2459))
* **modbus:** added a new example flow and fixed test cases ([8181fd4](https://github.com/biancoroyal/node-red-contrib-modbus/commit/8181fd4f05abff6f57a7b4de636689e890cf0ea9))
* **modbus:** commented the test cases that are failed ([5998a5d](https://github.com/biancoroyal/node-red-contrib-modbus/commit/5998a5d2fceaaf1b8ba972ddba771b70e2a4c2a2))
* **test_cases:** fixed test flow of modbus queue info ([732fa9c](https://github.com/biancoroyal/node-red-contrib-modbus/commit/732fa9c57e6b0c536bc50378f8e39081d12e11bc))
* **test_cases:** improved test cases ([bdafa18](https://github.com/biancoroyal/node-red-contrib-modbus/commit/bdafa18508069876ca522ace6e4a73be4c272c49))
* **test_flows:** fixed old test flows of read node, queue info node ([37b73ee](https://github.com/biancoroyal/node-red-contrib-modbus/commit/37b73ee0c845bb63b9b00d768b52bf8f76898290))
* **testcase:** fixed test case assertion ([803e7e0](https://github.com/biancoroyal/node-red-contrib-modbus/commit/803e7e08a53052f02ef6d0f4fa517353c228a88b))
* **test:** fixed  test case for modbus read node ([8fb71e9](https://github.com/biancoroyal/node-red-contrib-modbus/commit/8fb71e9914ceb43249d16498054c5ed2a14cbd5a))
* **test:** fixed port issue ([28115fe](https://github.com/biancoroyal/node-red-contrib-modbus/commit/28115fe2e5e27a5cb66a403a3d68ee65c96a241b))
* **test:** fixed test case ([c16da3c](https://github.com/biancoroyal/node-red-contrib-modbus/commit/c16da3c4c23b06856e15de9138ae9943d5a7a0dc))
* **tests:** some test fixes ([45c3c86](https://github.com/biancoroyal/node-red-contrib-modbus/commit/45c3c86d137a7f2dc929d0e3b189efa026df88b5))


### Features

* **flex-fc:** add load button ([04fb46e](https://github.com/biancoroyal/node-red-contrib-modbus/commit/04fb46ed4d2764276b7bcfae1800f9ac342da85a))
* **flex-fc:** add load button for an improved ui experience ([895f446](https://github.com/biancoroyal/node-red-contrib-modbus/commit/895f446bd99c8ea65bb5f96f7e4d0d79dec3da8e))
* **flex-fc:** map file needs to be json ([28f6010](https://github.com/biancoroyal/node-red-contrib-modbus/commit/28f60102e07b54d4bd5b86660b4d382341dd54b3))
* **modbus-client-core:** Improve code in modbus-client-core.js file ([f0691e2](https://github.com/biancoroyal/node-red-contrib-modbus/commit/f0691e2cdf8e0986912d60d31432a592de264769))
* **modbus:** new option for the flex-fc to get input msg ([5ff8167](https://github.com/biancoroyal/node-red-contrib-modbus/commit/5ff81672ac9c575a71bb241fc5861f25357012c8))
* **test-flow:** added tets flow for github issue 473 ([6130171](https://github.com/biancoroyal/node-red-contrib-modbus/commit/6130171e2542dc5c8a2c900b4f6b81d5f07367cf))



## [5.27.2](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v5.26.0...v5.27.2) (2023-08-29)


### Bug Fixes

* added missing verbose warn ([4082952](https://github.com/biancoroyal/node-red-contrib-modbus/commit/4082952624d6336d9463d8793415d786d45a2d9f))
* adjusted failing tests to tcp ports ([5db0e99](https://github.com/biancoroyal/node-red-contrib-modbus/commit/5db0e996c2b95b27cb245ee335cc53d82bdecb65))
* **deps:** can now successfully install deps ([f8e0a64](https://github.com/biancoroyal/node-red-contrib-modbus/commit/f8e0a6491d4eeed9b295d327f065540e1b2027bd))
* **deps:** updated scope names for requires ([9c643f6](https://github.com/biancoroyal/node-red-contrib-modbus/commit/9c643f6c5608a164d549fffbc9206341d4b6c75e))
* fixed failing tests using same ports ([06080d4](https://github.com/biancoroyal/node-red-contrib-modbus/commit/06080d452b0efd71d5f516d14137c24161e984c7))
* **flex-getter:** corrected isReadyForInput ([806ee4c](https://github.com/biancoroyal/node-red-contrib-modbus/commit/806ee4cb33659744708e80fad7d51e9f7b7c9edc))
* **flex-getter:** fixed failing tests ([1ab96b3](https://github.com/biancoroyal/node-red-contrib-modbus/commit/1ab96b30ec198aafffc288f1b81d626929c262a1))
* **flex-getter:** revise DelayOnStart ([c9d246a](https://github.com/biancoroyal/node-red-contrib-modbus/commit/c9d246a1627dbadb7a0bbd3e3b39c9429a10f859))
* **flex-server:** changed var to const ([d638d53](https://github.com/biancoroyal/node-red-contrib-modbus/commit/d638d5368b3e13700a0fd3aaaa434aae6be8d522))
* **flex-write:** deleted unused flow ([2f0baee](https://github.com/biancoroyal/node-red-contrib-modbus/commit/2f0baee699a25d0c21eaf95773ab67f4dccd47f6))
* **flexFC:** fixed routes for codes map ([e2e2cc5](https://github.com/biancoroyal/node-red-contrib-modbus/commit/e2e2cc525f3297d5bb113a68f4292dc444f43e36))
* **flexGetter-verboseWarn:** node.serverInfo is left from client - removed ([94c58db](https://github.com/biancoroyal/node-red-contrib-modbus/commit/94c58db6b17d58097a5db413301b0e8b2bd43751))
* **isReadyForInput:** now checks ONLY for readyforinput. Rest in onInput ([99f60a8](https://github.com/biancoroyal/node-red-contrib-modbus/commit/99f60a821d1a8192a9074016f668c7c04b0c740c))
* Node-RED PLUS changed to PLUS for Node-RED ([f726949](https://github.com/biancoroyal/node-red-contrib-modbus/commit/f72694954b2d3d07e65766c00dcb9274ffb1fd66))
* **not-ready-for-input-warning:** removed unnecessary variable/option ([d435b9b](https://github.com/biancoroyal/node-red-contrib-modbus/commit/d435b9b5964c11644af9d951879e61ff84009b40))
* **npmrc:** added npmrc file to packed files ([40ebf4d](https://github.com/biancoroyal/node-red-contrib-modbus/commit/40ebf4d48a9b74af961d6bd4ede9c69cdcfc9e10))
* **require:** now requires correct fork of lib ([2f936f8](https://github.com/biancoroyal/node-red-contrib-modbus/commit/2f936f8ca7093288456582399b8ddb7f5fab415f))
* **server:** [#333](https://github.com/biancoroyal/node-red-contrib-modbus/issues/333) Cannot read property 'disableMsgOutput' of undefined ([5c28e02](https://github.com/biancoroyal/node-red-contrib-modbus/commit/5c28e02a1d870635161881152dff7590bd0bfabb))
* **server:** [#333](https://github.com/biancoroyal/node-red-contrib-modbus/issues/333) new check of msg object ([4631795](https://github.com/biancoroyal/node-red-contrib-modbus/commit/463179555df7e91165dc200bde457e17f441272d))
* **test:** same port on test ([b6f531f](https://github.com/biancoroyal/node-red-contrib-modbus/commit/b6f531fafbe7b22b4d3812dd20fa68e2f7a9e97f))
* **verboseWarn:** verboseWarn accidentally used func left from client ([c0d88cd](https://github.com/biancoroyal/node-red-contrib-modbus/commit/c0d88cd424eee6287fec3fa71c295d30fe4cad7c))
* **web:** get routes for FlowForge ([21102c6](https://github.com/biancoroyal/node-red-contrib-modbus/commit/21102c6fa09811eed3cdca8c83249d2b80f33c25))


### Features

* add custom function code client functionality ([505329f](https://github.com/biancoroyal/node-red-contrib-modbus/commit/505329fbfef527935f11d4f1f089d67311903aab))
* add flex-fc node ([2766989](https://github.com/biancoroyal/node-red-contrib-modbus/commit/27669895fd847b18fcc0849b447abb91d193b4a7))
* add modbus-flex-fc to package.json ([2bbea1e](https://github.com/biancoroyal/node-red-contrib-modbus/commit/2bbea1e24c47438bd1f89acc7e58bc7a7a63a82a))
* add path for customModbusMessage event ([8a56fed](https://github.com/biancoroyal/node-red-contrib-modbus/commit/8a56fedd6fa8ca1c424e8650a7d4715fbed0a153))
* add reset template button for request map ([859c563](https://github.com/biancoroyal/node-red-contrib-modbus/commit/859c563cb61b2faa3279146e6cd06929a01eed51))
* add tests ([94a3870](https://github.com/biancoroyal/node-red-contrib-modbus/commit/94a387085400c4cba93fce4ab4276dfe7b4d3a2f))
* added "inactive"-test ([03c744a](https://github.com/biancoroyal/node-red-contrib-modbus/commit/03c744ae8c3bfbae0d3e9df58ab08b8e6d2f7529))
* added isActive function ([6005960](https://github.com/biancoroyal/node-red-contrib-modbus/commit/6005960dc15ad21f8c3511ddc8e101494e25f955))
* added isInactive check on input ([92f49da](https://github.com/biancoroyal/node-red-contrib-modbus/commit/92f49da992f7ebf0bec2d7b81bcf63046c1576c2))
* added more point to Todo ([84f39ad](https://github.com/biancoroyal/node-red-contrib-modbus/commit/84f39ad70b60ba98b0d000f333b2784043add9a6))
* added more Todo notes ([30c5e80](https://github.com/biancoroyal/node-red-contrib-modbus/commit/30c5e808750e4c6ae9505ce045f4a1eff152e7aa))
* added planned updates for release ([765a549](https://github.com/biancoroyal/node-red-contrib-modbus/commit/765a5494f2db059d16ad25d4983219fdbabf9e9e))
* added test coverage to Todo ([6148dd5](https://github.com/biancoroyal/node-red-contrib-modbus/commit/6148dd5dca533b2e5a628dc1a40cece7c77c4be6))
* added test-helper-extension ([c4b493d](https://github.com/biancoroyal/node-red-contrib-modbus/commit/c4b493d9fad7a3d1ff17b71fda117ca7a35b5216))
* added tests for Client check ([55c235e](https://github.com/biancoroyal/node-red-contrib-modbus/commit/55c235e347885c06e7f37e03e096384fca0fc7de))
* added Todo content ([94d46e8](https://github.com/biancoroyal/node-red-contrib-modbus/commit/94d46e8c4b14e8ba695e4c5edcdf6849e2f8e4c0))
* added Todo content, excecuted clean.sh ([8f1977c](https://github.com/biancoroyal/node-red-contrib-modbus/commit/8f1977c01bde6a53cafae6224a7156f8ea827ec2))
* adjusted TODO and package.json ([c481b6f](https://github.com/biancoroyal/node-red-contrib-modbus/commit/c481b6f7885fad2349e98bf1e46d61ab7318a61f))
* **clex-connector-test:** organized code ([92c9e37](https://github.com/biancoroyal/node-red-contrib-modbus/commit/92c9e37d6f1e94975b86fe4b16e96601e1ef477e))
* **client-flows:** extracted and updated flows ([7c40530](https://github.com/biancoroyal/node-red-contrib-modbus/commit/7c405300e8fea8ceeabd8e0e4e15145fcd67a2cd))
* **client-test:** added "ready to send"-tests ([368e6cd](https://github.com/biancoroyal/node-red-contrib-modbus/commit/368e6cdea7201914137a5a207ce619530c917bfd))
* **client-tests:** organized code ([830b0ce](https://github.com/biancoroyal/node-red-contrib-modbus/commit/830b0cee067ad9e5ef35478eb06e589ea3affcbc))
* **client:** more options and tabs for the client node  ([1048021](https://github.com/biancoroyal/node-red-contrib-modbus/commit/10480216ca52cf743a27dac2a7d494c9f4d64033))
* **delay-flex-getter:** added delay after start ([f68d666](https://github.com/biancoroyal/node-red-contrib-modbus/commit/f68d66632461d2642f531d84eaa884777b640132))
* flex fc debug test ([2785c7e](https://github.com/biancoroyal/node-red-contrib-modbus/commit/2785c7e67994b7d6f8f1a42bfb605f71a965dee9))
* **flex-connector-flows:** extracted and updated flows ([6f4330c](https://github.com/biancoroyal/node-red-contrib-modbus/commit/6f4330c9a57bce71c696a9ed499759f1d227e3a1))
* **flex-connector:** added "ready to send" tests ([11d5b1e](https://github.com/biancoroyal/node-red-contrib-modbus/commit/11d5b1e3526b658b9f385aad66874b0673395801))
* **flex-getter-flows:** extracted and updated flows ([db2471b](https://github.com/biancoroyal/node-red-contrib-modbus/commit/db2471bff6e0009b7fa45644a53267e45ad163a4))
* **flex-getter-test:** organized code ([981a15e](https://github.com/biancoroyal/node-red-contrib-modbus/commit/981a15e302f05c8ea6f1c1d742d9876a5ad37d61))
* **flex-getter:** added html information for node ([c74dc2d](https://github.com/biancoroyal/node-red-contrib-modbus/commit/c74dc2dba7820707cbe7aebe29b0a3b5d7b95e91))
* **flex-getter:** finished implementing delay +  ([9656e8f](https://github.com/biancoroyal/node-red-contrib-modbus/commit/9656e8f6886d2cb941eb1d54f2e7a71c9bebebf8))
* **flex-getter:** finished implementing delay + warnings ([9782a0d](https://github.com/biancoroyal/node-red-contrib-modbus/commit/9782a0daf180fcaebae0aaf39a4da254cdcd4b8f))
* **flex-getter:** further implementing "delayOnStart" ([7666d95](https://github.com/biancoroyal/node-red-contrib-modbus/commit/7666d957ebaf89593d1d004dd8cdae437134e2e1))
* **flex-getter:** implemented readyForInput ([70bff72](https://github.com/biancoroyal/node-red-contrib-modbus/commit/70bff720af0175eee6a4662bb7415d5ce79aac96))
* **flex-getter:** started implementing "showWarnings" + "DelayOnStart" ([d9db52a](https://github.com/biancoroyal/node-red-contrib-modbus/commit/d9db52a5fa4851c71dbc8ea41ff020056bc6ab69))
* **flex-getter:** startted implementing showReadyForInput ([55b107c](https://github.com/biancoroyal/node-red-contrib-modbus/commit/55b107c0a281a57fa80de921dd35bd5df759c6bd))
* **flex-sequencer-test:** changed var to const ([ffbf9ff](https://github.com/biancoroyal/node-red-contrib-modbus/commit/ffbf9ffae7c10f66ab8bc8224784ffb10249ed02))
* **flex-sequencer:** added "Ready-To-Read" tests ([43e34d6](https://github.com/biancoroyal/node-red-contrib-modbus/commit/43e34d61e4d3e2fe7b3bd1b60407627955ba6346))
* **flex-sequencer:** extracted and updated flows ([b8c12b9](https://github.com/biancoroyal/node-red-contrib-modbus/commit/b8c12b94e8f3e485348b462d1a0f0cd031a19723))
* **flex-sequencer:** input delay  on start ([758a3a5](https://github.com/biancoroyal/node-red-contrib-modbus/commit/758a3a595b4ff9bb2980f3f0bd91aa1d911f8177))
* **flex-server:** extracted and updated flows ([64d69ea](https://github.com/biancoroyal/node-red-contrib-modbus/commit/64d69ea0a83d20a5d3951e540c0fbba261aaf22c))
* **flex-write:** added "ready to send"-tests ([9d35d13](https://github.com/biancoroyal/node-red-contrib-modbus/commit/9d35d131358ba8ac2dc44c1cff2b5c1460f117e7))
* **flex-write:** delay on input and check client is active ([e1bce6c](https://github.com/biancoroyal/node-red-contrib-modbus/commit/e1bce6c3001e0beb2feba9e2e54663947fa8c09c))
* **flex-write:** extracted and updated flows ([38e4b18](https://github.com/biancoroyal/node-red-contrib-modbus/commit/38e4b18e6e1b56630cd37c5a8aa70e5f87b45a05))
* **getter-flows:** updated flows to be organized ([5c6239a](https://github.com/biancoroyal/node-red-contrib-modbus/commit/5c6239a5e5220b96d2585ff16da32df64be19402))
* **getter:** input delay  on start ([b7acd97](https://github.com/biancoroyal/node-red-contrib-modbus/commit/b7acd97ab8f940decb0889f9bf8125fa278f1f57))
* **getter:** organized Code ([19da2dc](https://github.com/biancoroyal/node-red-contrib-modbus/commit/19da2dc4cd02ea9cc1e7c29a8d0c6ec6e5af8dbf))
* **io-config:** extracted and updated flows ([e037a59](https://github.com/biancoroyal/node-red-contrib-modbus/commit/e037a59d726b1ad3fddadac3948befcc367f18ae))
* optimized and extracted server flows ([7456528](https://github.com/biancoroyal/node-red-contrib-modbus/commit/745652821bc7a341f966f4762711c43df900ed1c))
* option show warning and tabs for optionals ([12fa45e](https://github.com/biancoroyal/node-red-contrib-modbus/commit/12fa45e58a5fb83a1e9c06dc01cbadb7ca1fcaba))
* **queue-info:** extracted and updated flows ([1b668fa](https://github.com/biancoroyal/node-red-contrib-modbus/commit/1b668fa2679e0d121a27093671eae1464d76aa7c))
* ran clean script, updated Todo ([f6f142f](https://github.com/biancoroyal/node-red-contrib-modbus/commit/f6f142f4ceab790395d159e8ccf43ce613a66436))
* **read-flows:** updated flows to be organized ([ccfece8](https://github.com/biancoroyal/node-red-contrib-modbus/commit/ccfece87345f28d3bbf8bff658710e34ee47fc59))
* **ReadyToSend:** added test to test-classes ([ee1f924](https://github.com/biancoroyal/node-red-contrib-modbus/commit/ee1f924f6007b6a3d0be358919497ef475041f48))
* **response-filter:** added Client check test ([9db71b6](https://github.com/biancoroyal/node-red-contrib-modbus/commit/9db71b6b762df1956ef209f0600ede4a4dee439c))
* **response-filter:** extracted and updated flows ([93e10f8](https://github.com/biancoroyal/node-red-contrib-modbus/commit/93e10f8df273efbe417b4cc1db984bb039d15054))
* **response-filter:** prepared flow-extraction ([39092de](https://github.com/biancoroyal/node-red-contrib-modbus/commit/39092de5f800c2301cb11b1d58485351ba3ca26f))
* **response:** extracted and updated flows ([6930e37](https://github.com/biancoroyal/node-red-contrib-modbus/commit/6930e37c94aa5b2e7c0899c2c78fdec074e49d50))
* simplified code with new function ([15c06e2](https://github.com/biancoroyal/node-red-contrib-modbus/commit/15c06e28e748fd87ace7b70e5b09f656fe32f276))
* ui issues fixed and rudimentary working ([5fb77f8](https://github.com/biancoroyal/node-red-contrib-modbus/commit/5fb77f821621f108ebe9242635fc9790a40bf348))
* working flex fc node ([b75f826](https://github.com/biancoroyal/node-red-contrib-modbus/commit/b75f8260aa3e3e2f8fa0102439858d250aa135e6))
* **write-flows:** updated flows to be organized ([b32cd54](https://github.com/biancoroyal/node-red-contrib-modbus/commit/b32cd5457d4aa16c5c1b7abac04fb415e20264ee))
* **write:** input delay  on start ([7d3567e](https://github.com/biancoroyal/node-red-contrib-modbus/commit/7d3567ed28807d5bb030cf002b7168c0b9eb926d))
* wrote test for messageAllowedStates ([e2c92ec](https://github.com/biancoroyal/node-red-contrib-modbus/commit/e2c92ec24561eea85c5d90f60d30b1c46501808c))



# [5.23.0](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v5.15.0...v5.23.0) (2022-08-01)


### Bug Fixes

* [#253](https://github.com/biancoroyal/node-red-contrib-modbus/issues/253) queue info reset ([9ad4531](https://github.com/biancoroyal/node-red-contrib-modbus/commit/9ad45314e874caa2016caf80e5b5102acf29964d))
* [#274](https://github.com/biancoroyal/node-red-contrib-modbus/issues/274) ([fccd59b](https://github.com/biancoroyal/node-red-contrib-modbus/commit/fccd59be03ec79deae4698e4ce11064f3de825c1))
* [#277](https://github.com/biancoroyal/node-red-contrib-modbus/issues/277), [#253](https://github.com/biancoroyal/node-red-contrib-modbus/issues/253), [#263](https://github.com/biancoroyal/node-red-contrib-modbus/issues/263), [#266](https://github.com/biancoroyal/node-red-contrib-modbus/issues/266) ([920d6d0](https://github.com/biancoroyal/node-red-contrib-modbus/commit/920d6d0e089e27e21fa92b4b6a313a66dad6452b))
* **client:** writeable instead readable on write ([2ae4b12](https://github.com/biancoroyal/node-red-contrib-modbus/commit/2ae4b12ff7b328d47bfddcd275435158e7423b39))
* ghactions ([ee04b3a](https://github.com/biancoroyal/node-red-contrib-modbus/commit/ee04b3a5e21c6727e16a0bad0dc50d637b2ccbc1))
* lock ([6fce00e](https://github.com/biancoroyal/node-red-contrib-modbus/commit/6fce00eb10ef62d5eca84e51040f138e9dbbb5f1))
* python 3.9 for travis ([2afdb63](https://github.com/biancoroyal/node-red-contrib-modbus/commit/2afdb63e3b2c384327d6044e40f8d4f519ccedcc))
* remove wire to none existing node of example code  ([be770c4](https://github.com/biancoroyal/node-red-contrib-modbus/commit/be770c4ed8f36ccaeb2a5f614e569a25965fb17f))
* source-map not optional ([7adac0b](https://github.com/biancoroyal/node-red-contrib-modbus/commit/7adac0b318b067c307a1d9e285dd9237608da659))
* travis ([d34f5a8](https://github.com/biancoroyal/node-red-contrib-modbus/commit/d34f5a81e9d55cb2a3ffb482641bb48832645e1a))
* upgrade @xstate/fsm from 1.6.4 to 1.6.5 ([81383f4](https://github.com/biancoroyal/node-red-contrib-modbus/commit/81383f43c2a234c29bdabfe7f0968c17e3427dd2))


### Features

* IO Modbus examples and node-red version spec in package ([707d572](https://github.com/biancoroyal/node-red-contrib-modbus/commit/707d572f214e8d11728260303784d830b324cbfe))
* less logging switch ([716d17c](https://github.com/biancoroyal/node-red-contrib-modbus/commit/716d17c8aea7a2a9c64518829f526a73f6c9d7ba))
* npm stats ([1ff2b80](https://github.com/biancoroyal/node-red-contrib-modbus/commit/1ff2b802eed06cf6bb69d3ce8ff96c9dab51efd0))
* unitid 0 allowed and tested ([a5ee552](https://github.com/biancoroyal/node-red-contrib-modbus/commit/a5ee5521163afbb9d8a7dfa5cc7f33f76189f024))
* upgrade serialport to v10 for ARM ([5e93d11](https://github.com/biancoroyal/node-red-contrib-modbus/commit/5e93d1145686185dfe17d00dd4c0e682fc3354b1))



## [5.14.1](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v5.14.0...v5.14.1) (2021-08-07)



# [5.14.0](https://github.com/biancoroyal/node-red-contrib-modbus/compare/v5.13.1...v5.14.0) (2021-04-10)


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



