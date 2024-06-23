/// <reference path="WarFlagMgr.ts" />
/// <reference path="../uiFramework/BaseView.ts" />


class WarHomeView extends Core.BaseView {;
    public static open() {
        Core.ViewManager.inst.open("warHomeView");
    }

    public static async close() {
        await Core.ViewManager.inst.close("warHomeView");
    }

    public initUI() {
        super.initUI();
        this.adjust(this.getChild("bg"));
        this.getChild("top").height += window.support.topMargin;
        this.center();
    }

    @MVC.observe(WarFlagMgr, "openWarHomeFinished")
    private _openWarHomeFinished() {
        console.log("_openWarHomeFinished called");
    }

    public refreshUI() {

    }

    private static _inst: WarHomeView;
    public static get inst() { return this._inst; };
    public async open(...param: any[]) {
        await super.open(...param);
        this.refreshUI();
        MVC.Controller.inst.bind(WarFlagMgr.inst, this);
    }


    public async close(...param: any[]) {
        MVC.Controller.inst.unbind(WarFlagMgr.inst, this);
        WarHomeView._inst = null;
        await super.close(...param);
    }
}

