class TestJsb {

    private static _inst: TestJsb = null;

    public static get inst(): TestJsb {
        if (this._inst == null) {
            this._inst = new TestJsb();
        }
        return this._inst;
    }

    public run() {
        console.log("TestJsb..");
        //this.test1();
        //this.test2();
        //this.test3();
        this.test4();
    }

    public test1() {
        if (typeof jsb === 'undefined') return;
        let ns = window["ns"];
        if (typeof ns !== 'undefined' && ns.TestJsb) {
            const jsbTestObj = new ns.TestJsb();
            console.log('jsbTestObj is ', jsbTestObj);
            jsbTestObj.console("hello my baby");

            // jsbTestObj.name = "nb";
            console.log('name is ', jsbTestObj.name);

            jsbTestObj.name = "lck";
            console.log('After set name,name is ', jsbTestObj.name);
            console.log('age is ', jsbTestObj.age);
            console.log('id is ', jsbTestObj.id);

            // 静态函数调用
            if (ns.TestJsb.goHome) {
                ns.TestJsb.goHome();
            }
            if (ns.TestJsb.age) {
                console.log(ns.TestJsb.age);
            }

        } else {
            console.log('testJsb is not founded');
            console.log('ns is ', ns);
        }
    }

    //看看jsb在原生平台调用到什么函数
    public test2() {
        if (Core.DeviceUtils.isNative())
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

    //关于new Image在原生平台上的实现
    public test3() {
        var img = new Image();
        img.src = "https://fshunj.oss-cn-guangzhou.aliyuncs.com/MiniGameRes/LatestVer/res/raw-assets/19/19129252-4633-4b80-8afc-1e7a41add2a9.png";
        //img.src = "res/raw-assets/ed/ed906df4-ada9-4765-9126-d46862d58785.png"
        img.onload = function (info) {
            console.log("info is ", info);
        }
    }

    public test4() {
        cc.loader.loadRes('card_m/204', cc.SpriteFrame, function (err, spriteFrame) {
            if (err) {
                cc.error(err.message || err);
                return;
            }

            let node = new cc.Node("newNode");
            cc.find("Canvas").addChild(node);
            const sprite = node.addComponent(cc.Sprite);
            sprite.spriteFrame = spriteFrame;
        });
    }
    
}