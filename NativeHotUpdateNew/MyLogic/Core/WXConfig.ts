class WXConfig {
    private static _inst: WXConfig = null;
    private _systemInfo: SystemInfo;
    private _model: string;
    public static get inst(): WXConfig {
        if (WXConfig._inst == null) {
            WXConfig._inst = new WXConfig();
        }
        return WXConfig._inst;
    }


    public constructor() {
        window.support = {
            "nativeSound": false,
            "record": false,
            "topMargin": 0,
            "bottomMargin": 0
        }

        window.support.record = false;
        window.support.topMargin = 0;
        window.support.bottomMargin = 0;
        if (Core.DeviceUtils.isMiniGame()) {
            this._systemInfo = wx.getSystemInfoSync();
            //console.log("_systemInfo:",this._systemInfo);
            //console.log("this._systemInfo.model:",this._systemInfo.model);
            window.support.topMargin = this._getTopMargin();
            if (window.support.topMargin < 0) {
                console.log("window.support.topMargin < 0");
                let liuhai: Array<string> = ["iPhone X", "PAR-AL00", "MI 8",
                    "ONEPLUS A6000", "COL-AL10", "EML-AL00", "PACM00", "vivo X21A",
                    "vivo Y85A", "V1914A", "PBAM00", "LYA_AL10"];
                for (let i = 0; i < liuhai.length; i++) {
                    if (this._systemInfo.model.indexOf(liuhai[i]) >= 0) {
                        window.support.topMargin = 48;
                        window.support.bottomMargin = 0;
                        break;
                    }
                }
                window.support.topMargin = 0;
            }
            else {
                //iponeX是这个
                console.log("window.support.topMargin > 0");
            }
        }
    }

    private _getTopMargin(): number {
        let safeArea = this._systemInfo.safeArea || {};
        if (safeArea["top"] == undefined) {
            //Native
            let navbarPosition = this._systemInfo["navbarPosition"] || {};
            if (navbarPosition["marginTop"] == undefined) {
                return -1;
            } else {
                return navbarPosition["marginTop"];
            }
        } else {
            // wxgame
            let top = safeArea["top"];
            if (top > 0) {
                let scale = cc.view.getScaleX();
                let ratio = this._systemInfo.pixelRatio;
                // let factor = scale / ratio;
                // return top / factor;
                return top * ratio;
            } else {
                return top;
            }
        }
    }

}
