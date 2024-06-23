/// <reference path= "../Core/WXConfig.ts"/>

class Entry {

    private static _inst: Entry = null;

    public static get inst(): Entry {
        if (this._inst == null) {
            this._inst = new Entry();
        }
        return this._inst;
    }

    public enterMain() {
        WXConfig.inst;
        Test.inst.run();
    }

}

function main() {
    Entry.inst.enterMain();
}

function start() {
}

function update() {
    fgui.AsyncOperation.updateRunners();
    //this._callLaters();
}

function destroy() {

}
function _callLaters(): void {
    let functionList: any[];
    let thisList: any[];
    let argsList: any[];
    if (egret.$callLaterFunctionList.length > 0) {
        functionList = egret.$callLaterFunctionList;
        egret.$callLaterFunctionList = [];
        thisList = egret.$callLaterThisList;
        egret.$callLaterThisList = [];
        argsList = egret.$callLaterArgsList;
        egret.$callLaterArgsList = [];
    }

    if (functionList) {
        console.log("executes callLaters");
        let length: number = functionList.length;
        for (let i: number = 0; i < length; i++) {
            let func: Function = functionList[i];
            if (func != null) {
                func.apply(thisList[i], argsList[i]);
            }
        }
    }
}

if (!window["GameLogic"]) {
    window["GameLogic"] = {};
}
window["GameLogic"]["entry"] = main;
window["GameLogic"]["start"] = start;
window["GameLogic"]["update"] = update;
window["GameLogic"]["destroy"] = destroy;
//window["SCENE_GRAPH_PRIORITY_LISTENER_HITTEST_ALL"] = true;

