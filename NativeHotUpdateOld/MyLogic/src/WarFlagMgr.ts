/// <reference path="../MVVM/Model.ts" />
/**
 * WarFlagRefreshMgr普遍用于各种事件的控制
 */
@MVC.autoModelName
class WarFlagMgr extends MVC.Model {
    private static _inst: WarFlagMgr;

    public static get inst(): WarFlagMgr {
        if (!WarFlagMgr._inst) {
            WarFlagMgr._inst = new WarFlagMgr();
        }
        return WarFlagMgr._inst;
    }

    public init() {

    }

    public constructor() {
        super();
    }


    private _openWarHomeFinished: boolean;
    public get openWarHomeFinished() { return false; };
    public set openWarHomeFinished(val: boolean) { this._openWarHomeFinished = val; };

}