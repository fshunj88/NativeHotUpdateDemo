class Test {

    private static _inst: Test = null;

    public static get inst(): Test {
        if (this._inst == null) {
            this._inst = new Test();
        }
        return this._inst;
    }

    public async run() {
        console.log("run start");
        //init
        window["timerTestJSCallBck"] = Test.timerTestJSCallBck;
        cc.dynamicAtlasManager.enabled = false;//禁止合图
        cc.debug.setDisplayStats(false);//禁止文字Debug渲染，只渲染精灵
        //test
        //this.test1();
        //this.testRes1()
        //TestTouch.inst.testTouch2();
        //this.test500();
        //this.testBanner();
        //this.testMat();
        //TestFgui.inst.run();
        //TestShiPie.inst.run();
        //TestJsb.inst.run();
        this.testHotUpdate();
        //TestPromise.inst.run();
        //TestFont.inst.run();
        let btn = cc.find("Canvas/close");
        if (btn) {
            btn.on(cc.Node.EventType.TOUCH_END, () => {
                cc.game.end();
            });
        }
    }

    public test1() {
        cc.loader.loadRes('card_m/204', cc.SpriteFrame, function (err, spriteFrame) {
            if (err) {
                cc.error(err.message || err);
                return;
            }

            const sprite = cc.find("Canvas/sprite").addComponent(cc.Sprite);
            sprite.spriteFrame = spriteFrame;
        });
    }

    public test2() {
        cc.loader.loadRes('card_m/204', cc.SpriteFrame, function (err, spriteFrame) {
            if (err) {
                cc.error(err.message || err);
                return;
            }

            let rootNode = cc.find("Canvas/Root")
            const sprite = rootNode.addComponent(cc.Sprite);
            sprite.spriteFrame = spriteFrame;
        });
    }

    //这个函数通常用来请求最新的版本号,或者获取资源服务器上的配置文件等等
    public async test3() {
        //let url = NATIVE_VERSION_API_URL + "build=" + this._buildType + "&os=" + this._osType;
        //if (Core.DeviceUtils.isAndroid()) {
        //    url = url + "&subchannel=" + Home.GlobalConfig.inst.subChannel;
        //}
        //XMLHttpRequest（XHR）对象用于与服务器交互。通过 XMLHttpRequest 可以在不刷新页面的情况下请求特定 URL，获取数据。
        let xmlReq = cc.loader.getXMLHttpRequest();
        xmlReq.open("GET", "https://fshunj.oss-cn-guangzhou.aliyuncs.com/json/app.json");
        xmlReq.responseType = "text";
        //设置 HTTP 请求标头的值。必须在 open() 之后、send() 之前调用 setRequestHeader() 方法。
        //当action为get时候，浏览器用x-www-form-urlencoded的编码方式把form数据转换成一个字串（name1=value1&name2=value2…），
        //然后把这个字串append到url后面，用?分割，加载这个新的url。
        xmlReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xmlReq.onreadystatechange = function () {
            //当 readyState 属性发生变化时，调用的事件处理器。
            if (xmlReq.readyState == 4) {
                let errcode = 0;
                if (xmlReq.status >= 200 && xmlReq.status <= 304) {
                    var response = JSON.parse(xmlReq.responseText);
                    console.log("json issss", response);
                    let code = response["code"];
                    if (code == 0) {
                    }
                } else {
                    errcode = 9000;
                }
                console.log("_checkVersion request error status: ", xmlReq.status);
            }
        }

        xmlReq.onload = function () {
            //XMLHttpRequest请求成功完成时触发。

        }

        xmlReq.ontimeout = function () {
            //在预设时间内没有接收到响应时触发。
        }

        xmlReq.onerror = function () {
            //当 request 遭遇错误时触发。
        }

        //发送请求。如果请求是异步的（默认），那么该方法将在请求发送后立即返回。
        xmlReq.send();

    }


    // 获取文件的可写目录,是一个内部存储的目录，手机会为每个APP分配一个可读写的路径，但是这个App如果卸载以后，这个数据也会删除
    //jsb.fileUtils.getSearchPaths();
    //jsb.fileUtils.getWritablePath()
    //cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(newSearchPaths));
    //jsb.fileUtils.setSearchPaths(newSearchPaths);
    //console.log("[SearchPath] set: ", newSearchPaths);
    //console.log("[SearchPath] get: ", JSON.stringify(jsb.fileUtils.getSearchPaths()));
    public async test4() {
        console.log("jsb.fileUtils.getSearchPaths():", jsb.fileUtils.getSearchPaths());
        console.log("jsb.fileUtils.getWritablePath()):", jsb.fileUtils.getWritablePath());
    }

    //热更测试,热更图片card_m/204
    public async testHotUpdate() {
        console.log("testHotUpdate start");
        HotUpdateHelper.inst.init()
        let checkUpdateBtn = cc.find("Canvas/update_panel/check_btn");
        let updateBtn = cc.find("Canvas/update_panel/update_btn");
        let loadbtn = cc.find("Canvas/update_panel/load_btn");
        checkUpdateBtn.on(cc.Node.EventType.TOUCH_END, () => {
            HotUpdateHelper.inst.checkUpdate();
        });
        updateBtn.on(cc.Node.EventType.TOUCH_END, () => {
            HotUpdateHelper.inst.hotUpdate();
        });

        loadbtn.on(cc.Node.EventType.TOUCH_END, () => {
            cc.loader.loadRes('card_m/204', cc.SpriteFrame, function (err, spriteFrame) {
                if (err) {
                    cc.error(err.message || err);
                    return;
                }

                const sprite = cc.find("Canvas/update_panel/spr").getComponent(cc.Sprite);
                sprite.spriteFrame = spriteFrame;
            });
        });

        //TestHotUpdate.inst.init();
        //cc.loader.loadRes('card_m/204', cc.SpriteFrame, function (err, spriteFrame) {
        //    if (err) {
        //        cc.error(err.message || err);
        //        return;
        //    }

        //    let rootNode = cc.find("Canvas/Root")
        //    const sprite = rootNode.addComponent(cc.Sprite);
        //    sprite.spriteFrame = spriteFrame;
        //});
        //let buttonNode = cc.find("Canvas/Root/button")
        //buttonNode.on(cc.Node.EventType.TOUCH_END, () => {
        //    console.log("TestHotUpdate.hotUpdate is called");
        //    TestHotUpdate.inst.hotUpdate();
        //});
    }

    //Js调用Java测试
    public async test6() {
        console.log("test6 start");
        let testBtn = cc.find("Canvas/Root/testBtn");
        testBtn.on(cc.Node.EventType.TOUCH_END, () => {
            if (Core.DeviceUtils.isAndroid()) {
                //是安卓平台
                console.log("call Android!!!");
                jsb.reflection.callStaticMethod(
                    "org/cocos2dx/javascript/AppActivity",	//路径
                    "showAd",	//方法名
                    "(Ljava/lang/String;)V",	//如果有两个(Ljava/lang/String;Ljava/lang/String;)V
                    "测试"	//需要传入的参数
                );	//void没有返回值，不需要接收
                console.log("after call Android!!!");
            }
        }, this);
    }

    /*******************************Js调用OC测试*****************/
    // 无参数，无返回值
    public test100() {
        jsb.reflection.callStaticMethod("AppController", "oneHundred");
    }

    // 无参数，有返回值
    public test200() {
        var result = jsb.reflection.callStaticMethod("AppController", "twoHundred");
        console.log("result is ", result);
    }

    // 有参数，有返回值
    public test300() {
        let result: string = "", adId = "cocos10086", age = 18;
        result = jsb.reflection.callStaticMethod("AppController", "threeHundred:withContent:", adId, age);
        console.log("返回值", result);
    }

    // 有参数，无返回值
    public test400() {
        let result: string = "", adId = "cocos10086", age = 18;
        jsb.reflection.callStaticMethod("AppController", "fourHundred:withContent:", adId, age);
        console.log("无 返回值");
    }

    public test500() {
        let result: string = "", sec = 1;
        result = jsb.reflection.callStaticMethod("AppController", "fiveHundred:", sec);
        console.log("返回值", result);
    }

    //oc 调用js
    public static timerTestJSCallBck(param: string) {
        console.log("js 收到：", param);
    }



    /***************************************Android广告接入测试 */
    //播放一个激励视频
    public async testShowRewardVedio() {
        let testBtn = cc.find("Canvas/Root/testBtn");
        testBtn.on(cc.Node.EventType.TOUCH_END, () => {
            if (Core.DeviceUtils.isAndroid()) {
                //是安卓平台
                console.log("call Android!!!");
                jsb.reflection.callStaticMethod(
                    "org/cocos2dx/javascript/AppActivity",	//路径
                    "showRewardVideoAd",	//方法名
                    "(Ljava/lang/String;)V",	//如果有两个(Ljava/lang/String;Ljava/lang/String;)V
                    "ff"	//需要传入的参数
                );	//void没有返回值，不需要接收
                console.log("after call Android!!!");
            }
        }, this);
    }

    //播放一个插屏
    public async testInsertAd() {
        let testBtn = cc.find("Canvas/Root/testBtn");
        testBtn.on(cc.Node.EventType.TOUCH_END, () => {
            if (Core.DeviceUtils.isAndroid()) {
                //是安卓平台
                console.log("call Android!!!");
                jsb.reflection.callStaticMethod(
                    "org/cocos2dx/javascript/AppActivity",	//路径
                    "showInsertAd",	//方法名
                    "(Ljava/lang/String;)V",	//如果有两个(Ljava/lang/String;Ljava/lang/String;)V
                    "ff"	//需要传入的参数
                );	//void没有返回值，不需要接收
                console.log("after call Android!!!");
            }
        }, this);
    }

    //播放一个Banner
    public async testBanner() {
        let testBtn = cc.find("Canvas/Root/testBtn");
        testBtn.on(cc.Node.EventType.TOUCH_END, () => {
            if (Core.DeviceUtils.isAndroid()) {
                //是安卓平台
                console.log("call Android!!!");
                jsb.reflection.callStaticMethod(
                    "org/cocos2dx/javascript/AppActivity",	//路径
                    "initBannerAd",	//方法名
                    "(Ljava/lang/String;)V",	//如果有两个(Ljava/lang/String;Ljava/lang/String;)V
                    "ff"	//需要传入的参数
                );	//void没有返回值，不需要接收
                console.log("after call Android!!!");
            }
        }, this);
    }

    /***********************************IOS广告接入测试 */

    public async test8() {
        //切换到SDKScene
        cc.director.loadScene("SDKScene");
        console.log("test8 start");
        let testBtn = cc.find("Canvas/Root/btn_Splash");
        testBtn.on(cc.Node.EventType.TOUCH_END, () => {
            jsb.reflection.callStaticMethod(
                "AppController",	//路径
                "showSplashAd",	//方法名
            );	//void没有返回值，不需要接收
        }, this);


        testBtn = cc.find("Canvas/Root/btn_rewardVideo");
        testBtn.on(cc.Node.EventType.TOUCH_END, () => {
            jsb.reflection.callStaticMethod(
                "AppController",	//路径
                "showRewardAd",	//方法名
            );	//void没有返回值，不需要接收
        }, this);

        testBtn = cc.find("Canvas/Root/btn_quanPing");
        testBtn.on(cc.Node.EventType.TOUCH_END, () => {
            jsb.reflection.callStaticMethod(
                "AppController",	//路径
                "showQuanPingAd",	//方法名
            );	//void没有返回值，不需要接收
        }, this);

    }

    /***********************************资源管理相关*/
    //```js
    //// Release all dependencies of a loaded prefab
    //var deps = cc.loader.getDependsRecursively(prefab);
    //cc.loader.release(deps);
    //// Retrieve all dependent textures
    //var deps = cc.loader.getDependsRecursively('prefabs/sample');
    //var textures = [];
    //for (var i = 0; i < deps.length; ++i) {
    //    var item = cc.loader.getRes(deps[i]);
    //    if (item instanceof cc.Texture2D) {
    //        textures.push(item);
    //    }
    //}
    //``` 
    public testRes1() {
        cc.loader.loadRes('card_m/205', cc.SpriteFrame, function (err, spriteFrame) {
            if (err) {
                cc.error(err.message || err);
                return;
            }

            let s1 = cc.find("Canvas/Root/s1");
            const sprite = s1.addComponent(cc.Sprite);
            sprite.spriteFrame = spriteFrame;
        });
        cc.loader.loadRes('card_m/205', cc.SpriteFrame, function (err, spriteFrame) {
            if (err) {
                cc.error(err.message || err);
                return;
            }

            let s2 = cc.find("Canvas/Root/s2");
            const sprite = s2.addComponent(cc.Sprite);
            sprite.spriteFrame = spriteFrame;
        });

        let buttonNode = cc.find("Canvas/Root/testBtn");
        buttonNode.on(cc.Node.EventType.TOUCH_END, () => {
            var sprite = cc.find("Canvas/Root/s1").getComponent(cc.Sprite);
            //var deps = cc.loader.getDependsRecursively(sprite);
            //console.log("s1.deps -->", deps);
            cc.loader.release(sprite.spriteFrame.getTexture());
        });
    }


    /***********************************渲染相关*/
    public testMat() {
        console.log(new cc.Mat4(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ).toString());
    }

    public testSpriteMat() {
        let spriteNode = cc.find("Canvas/sprite");
        let spriteNode2 = cc.find("Canvas/sprite");
    }



}



