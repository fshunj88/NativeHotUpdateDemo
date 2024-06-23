class TestTouch {

    private static _inst: TestTouch = null;

    public static get inst(): TestTouch {
        if (this._inst == null) {
            this._inst = new TestTouch();
        }
        return this._inst;
    }

    public run() {
        console.log("TestTouch..");
        this.testTouch2();
    }

    public testTouch() {
        //on<T extends Function>(type: string, callback: T, target?: any, useCapture?: boolean): T;		
        let parent = cc.find("Canvas/parent");
        let child = cc.find("Canvas/parent/child");
        let canvas = cc.find("Canvas");
        let node = parent;
        node.on(cc.Node.EventType.TOUCH_START, function (event) {
            console.log('[Parent]touchStart:', event);
        }.bind(node));

        node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            var delta = event.touch.getDelta();
            console.log('[Parent]touchMove:', event, delta);
        }.bind(node));

        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            var delta = event.touch.getDelta();
            console.log('[Parent]touchEnd:', event, delta);
        }.bind(node));

        node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            var delta = event.touch.getDelta();
            console.log('[Parent]touchCancel:', event, delta);
        }.bind(node));

        node = child;
        node.on(cc.Node.EventType.TOUCH_START, function (event) {
            console.log('[Child]touchStart:', event);
        }.bind(node));

        node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            var delta = event.touch.getDelta();
            console.log('[Child]touchMove:', event, delta);
        }.bind(node));

        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            var delta = event.touch.getDelta();
            console.log('[Child]touchEnd:', event, delta);
        }.bind(node));

        node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            var delta = event.touch.getDelta();
            console.log('[Child]touchCancel:', event, delta);
        }.bind(node));

        node = canvas;
        node.on(cc.Node.EventType.TOUCH_START, function (event) {
            console.log('[canvas]touchStart:', event);
        }.bind(node));

        node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            var delta = event.touch.getDelta();
            console.log('[canvas]touchMove:', event, delta);
        }.bind(node));

        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            var delta = event.touch.getDelta();
            console.log('[canvas]touchEnd:', event, delta);
        }.bind(node));

        node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            var delta = event.touch.getDelta();
            console.log('[canvas]touchCancel:', event, delta);
        }.bind(node));

    }

    public testTouch2() {
        let broRed = cc.find("Canvas/broRed");
        let broGreen = cc.find("Canvas/broGreen");
        let canvas = cc.find("Canvas");
        let node = broRed;
        node.on(cc.Node.EventType.TOUCH_START, function (event) {
            console.log('[broRed]touchStart:', event);
        }.bind(node));

        node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            var delta = event.touch.getDelta();
            console.log('[broRed]touchMove:', event, delta);
        }.bind(node));

        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            var delta = event.touch.getDelta();
            console.log('[broRed]touchEnd:', event, delta);
        }.bind(node));

        node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            var delta = event.touch.getDelta();
            console.log('[broRed]touchCancel:', event, delta);
        }.bind(node));

        node = broGreen;
        node.on(cc.Node.EventType.TOUCH_START, function (event) {
            console.log('[broGreen]touchStart:', event);
        }.bind(node));

        node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            var delta = event.touch.getDelta();
            console.log('[broGreen]touchMove:', event, delta);
        }.bind(node));

        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            var delta = event.touch.getDelta();
            console.log('[broGreen]touchEnd:', event, delta);
        }.bind(node));

        node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            var delta = event.touch.getDelta();
            console.log('[broGreen]touchCancel:', event, delta);
        }.bind(node));

        node = canvas;
        node.on(cc.Node.EventType.TOUCH_START, function (event) {
            console.log('[canvas]touchStart:', event);
        }.bind(node));

        node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            var delta = event.touch.getDelta();
            console.log('[canvas]touchMove:', event, delta);
        }.bind(node));

        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            var delta = event.touch.getDelta();
            console.log('[canvas]touchEnd:', event, delta);
        }.bind(node));

        node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            var delta = event.touch.getDelta();
            console.log('[canvas]touchCancel:', event, delta);
        }.bind(node));
    }

}

//(function () {
//    function r(e, n, t) {
//        function o(i, f) {
//            if (!n[i]) {
//                if (!e[i]) {
//                    var c = "function" == typeof require && require;
//                    if (!f && c) return c(i, !0);
//                    if (u) return u(i, !0);
//                    var a = new Error("Cannot find module '" + i + "'");
//                    throw a.code = "MODULE_NOT_FOUND", a
//                }
//                var p = n[i] = { exports: {} };
//                e[i][0].call(p.exports, function (r) {
//                    var n = e[i][1][r];
//                    return o(n || r)
//                }, p, p.exports, r, e, n, t)
//            }
//            return n[i].exports
//        }
//        for (var u = "function" == typeof require && require, i = 0; i < t.length; i++)
//            o(t[i]);
//        return o
//    }
//    return r
//})()({
//    1: [function (require, module, exports) {
//        console.log("execute something");
//    }, {}]
//}, {}, [24]);