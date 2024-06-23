//与 /// <reference path="..." />指令相似，这个指令是用来声明 依赖的； 一个 /// <reference types="..." />指令则声明了对某个包的依赖。
//对这些包的名字的解析与在 import语句里对模块名的解析类似。 可以简单地把三斜线类型引用指令当做 import声明的包。
//例如，把 /// <reference types="node" />引入到声明文件，表明这个文件使用了 @types/node/index.d.ts里面声明的名字； 并且，这个包需要在编译阶段与声明文件一起被包含进来。

/// <reference path="MailItem.ts" />
/// <reference path="MailItemPool.ts" />
/// <reference path="CCCExtend.ts" />
/// <reference path="WarHomeView.ts" />

class TestFgui {

    private static _inst: TestFgui = null;

    public static get inst(): TestFgui {
        if (this._inst == null) {
            this._inst = new TestFgui();
        }
        return this._inst;
    }

    public run() {
        console.log("TestFgui start");
        CCCExtend.init();//修改引擎代码，进行功能扩展
        fgui.addLoadHandler();
        fgui.GRoot.create();

        fgui.UIPackage.loadPackage("UI/common", true, () => {
            console.log("common loaded");
            this.test_view();
        }
        );
        //this.testNormalList();
        //this.testVirtualList();
        //this.test_UI_VirtualList();
        //this.testTouch();
    }

    public test1() {
        fgui.UIPackage.loadPackage("UI/Basics", true, () => {
            let view = fgui.UIPackage.createObject("Basics", "com").asCom;
            //view.makeFullScreen();
            fgui.GRoot.inst.addChild(view);
            let scene = cc.director.getScene();
        });
    }

    public testTouch() {
        fgui.UIPackage.loadPackage("UI/Basics", true, () => {
            let view = fgui.UIPackage.createObject("Basics", "com").asCom;
            //view.makeFullScreen();
            fgui.GRoot.inst.addChild(view);
            let bro1 = view.getChild("bro1").asCom;
            bro1.onClick(() => {
                console.log("bro1.onClick");
            }, this);
            let bro2 = view.getChild("bro2").asCom;
            bro2.onClick(() => {
                console.log("bro2.onClick");
            }, this);
        });
    }

    //坏方案
    public testNormalList() {
        console.log("testNormalList");
        fgui.UIPackage.loadPackage("UI/ListEffect", true, () => {
            fgui.UIObjectFactory.setExtension("ui://ListEffect/mailItem", MailItem);

            let view = fgui.UIPackage.createObject("ListEffect", "Main").asCom;
            view.setSize(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
            fgui.GRoot.inst.addChild(view);

            let list = view.getChild("mailList").asList;
            for (var i: number = 0; i < 1000; i++) {
                var item: MailItem = <MailItem>list.addItemFromPool();
                item.setFetched(i % 3 == 0);
                item.setRead(i % 2 == 0);
                item.setTime("5 Nov 2015 16:24:33");
                item.title = "Mail title here";
            }

            list.ensureBoundsCorrect();
            var delay: number = 0;
            for (var i: number = 0; i < 10; i++) {
                var item: MailItem = <MailItem>list.getChildAt(i);
                if (list.isChildInView(item)) {
                    item.playEffect(delay);
                    delay += 0.2;
                }
                else
                    break;
            }
        });
    }

    //虚拟列表
    private _renderListItem(index: number, obj: fgui.GObject): void {
        var item: MailItem = <MailItem>obj;
        item.setFetched(index % 3 == 0);
        item.setRead(index % 2 == 0);
        item.setTime("5 Nov 2015 16:24:33");
        item.title = index + " Mail title here";
    }

    public testVirtualList() {
        console.log("testVirtualList");
        fgui.UIPackage.loadPackage("UI/VirtualList", true, () => {
            fgui.UIObjectFactory.setExtension("ui://VirtualList/mailItem", MailItem);

            let view = fgui.UIPackage.createObject("VirtualList", "Main").asCom;
            view.makeFullScreen();
            fgui.GRoot.inst.addChild(view);

            view.getChild("n6").onClick(function (): void { list.addSelection(500, true); }, this);
            view.getChild("n7").onClick(function (): void { list.scrollPane.scrollTop(); }, this);
            view.getChild("n8").onClick(function (): void { list.scrollPane.scrollBottom(); }, this);

            let list = view.getChild("mailList").asList;
            //@ts-ignore
            let com = list.scrollPane._container;
            com["__enableLevelRender"] = true;
            list.setVirtual();

            list.itemRenderer = this._renderListItem.bind(this);
            list.numItems = 1000;
        });
    }



    private _renderItemList(index: number, obj: fgui.GObject) {
        var item: MailItem = <MailItem>obj;
        item.setFetched(index % 3 == 0);
        item.setRead(index % 2 == 0);
        item.setTime("5 Nov 2015 16:24:33");
        item.title = index + " Mail title here";
        console.log("herer");
    }

    //自己定制的虚拟列表
    public test_UI_VirtualList() {
        fgui.UIPackage.loadPackage("UI/VirtualList", true, () => {
            let view = fgui.UIPackage.createObject("VirtualList", "simpleCom").asCom;
            fgui.GRoot.inst.addChild(view);
            let listHolder = view.getChild("loader").asLoader
            let vlist = new UI.VirtualList(view, listHolder);
            console.log("ddd");
            let com = vlist.displayListContainer.getChildByName("GComponent");
            let con = com.getChildByName("Container");
            con["__enableLevelRender"] = true;
            vlist.conf = {
                col: 1,
                rowGap: 1,
                itemSize: MailItemPool.itemSize,
                itemClass: MailItem,
                itemPool: new MailItemPool(),
                itemRenderer: this._renderItemList.bind(this)
            };
            vlist.numItems = 1000;
        });
    }


    /*********************************************测试一下各种view和MVVM***************************/
    public async test_view() {
        UI.registerPackage("war", this.loadEvent, this.unloadEvent);

        //register view
        Core.ViewManager.inst.registerUIView("war", "warHomeView", WarHomeView);

        //register wnd
        //Core.ViewManager.inst.registerUIWnd("war", "warShopWnd", WarShopWnd);
        await UI.loadPackage("war");
        Core.ViewManager.inst.open("warHomeView");
        WarFlagMgr.inst.openWarHomeFinished = true;
    }

    public async loadEvent() {
        console.log("loadEvent is called");
        await RES.loadPackage(`UI/war`, true, true);
        /////////loadItem/////////
        //let registerItemExtension = UI.registerItemExtension;
        //registerItemExtension("war", "warCityItem", WarCityItem);
    }

    public async unloadEvent() {
        console.log("unloadEvent is called");
        RES.unloadPackage(`UI/war`);
    }

}
