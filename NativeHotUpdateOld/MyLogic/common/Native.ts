// TypeScript file
namespace Core {
    export function callJS(message: string): void {
        console.log("callJS:" + message);
        let data = JSON.parse(message);
        let msg: NativeMessage = data.msg;
        let items = NativeMsgCenter.inst.getListeners(msg);
        if (items) {
            items.forEach((item, _) => {
                if (item.callback) {
                    if (item.thisArg) {
                        item.callback.apply(item.thisArg, [data.args]);
                    } else {
                        item.callback(data.args);
                    }
                    if (item.resolve) {
                        item.resolve(data.args);
                    }
                }
            });
        }
    }

    export class
        NativeMessage {
        public static GET_GAME_CONFIG = "getGameConfig";
        public static INIT_SDK = "initSDK";
        public static INIT_SDK_DONE = "initSDKDone";
        public static LOGIN = "login";
        public static LOGIN_DONE = "loginDone";
        public static REPORT_USER_INFO = "reportUserInfo";
        public static LOGOUT = "logout";
        public static LOGOUT_DONE = "logoutDone";
        public static IS_TOURIST = "isTourist";
        public static BIND_ACC = "bindAcc";
        public static BIND_ACC_DONE = "bindAccDone";
        public static ON_START = "onStart";
        public static ON_STOP = "onStop";
        public static ON_RESUME = "onResume";
        public static ON_PAUSE = "onPause";
        public static ON_TICK = "onTick";
        public static USE_NATIVE_SOUND = "useNativeSound";
        public static PLAY_SOUND = "playSound";
        public static STOP_SOUND = "stopSound";
        public static PLAY_MUSIC = "playMusic";
        public static STOP_MUSIC = "stopMusic";
        public static SET_MUSIC_VOLUME = "setMusicVolume";
        public static RELEASE_ALL_SOUND = "releaseAllSound";
        public static ON_ENTER_GAME = "onEnterGame";
        public static ON_CREATE_ROLE = "onCreateRole";
        public static ON_LEVEL_UP = "onLevelUp";
        public static GET_TD_CHANNEL_ID = "getTDChannelID";
        public static START_RECORD = "startRecord";
        public static STOP_RECORD = "stopRecord";
        public static START_RECORD_COMPLETE = "startRecordComplete";
        public static ADS_INIT = "initAds";
        public static ADS_SHOW_RWD = "showRwdAds";
        public static ADS_FINISH_RWD = "finishRwdAds";
        public static ADS_IS_READY = "adsIsReady";
        public static ADS_READY = "adsReady";
        public static ON_START_MATCH = "onStartMatch";
        public static SAVE_TO_PHOTO = "saveToPhoto";
        public static SHARE_VIDEO = "shareVideo";
        public static SHARE_LINK = "shareLink";
        public static SHARE_LINK_COMPLETE = "shareLinkComplete";
        public static SHARE_IMAGE = "shareImage";
        public static SHARE_IMAGE_COMPLETE = "shareImageComplete";
        public static INIT_APPSTORE_PAY = "initAppstorePay";
        public static APPSTORE_REQ_PRODUCTS = "appstoreRequestProducts";
        public static APPSTORE_GET_PRODUCTS = "appstoreGetProducts";
        public static START_PAY = "startPay";
        public static FINISH_PAY = "finishPay";
        public static SET_SUPPORT_RECORD = "setSupportRecord";
        public static OPEN_APP_COMMENT = "openAppComment";
        public static ON_SHOW_LOADING = "onShowLoading";
        public static SHARE_APP2WECHAT = "shareApp2Wechat";
        public static SHARE_BY_PARAM = "shareByParam";
        public static SHARE_IMG2WECHAT = "shareImage2Wechat";
        public static LOGIN_GAME_CENTER = "loginGameCenter";
        public static SCORE_TO_GAME_CENTER = "scoreToGameCenter";
        public static SHOW_GAME_CENTER_RANK = "showGameCenterRank";
        public static SHOW_GAME_CENTER_ACHIEVE = "showGameCenterAchievement";
        public static PLATFORM_ACHIEVE_DONE = "platformAchieveDone";
        public static CREATE_NOTIFY = "createNotify";
        public static REMOVE_NOTIFY = "removeNotify";
        public static SET_LOADING_PERCENT = "setLoadingPercent";
        public static GOOGLEPLAY_REQ_PRODUCTS = "googleplayReqProducts";
        public static GOOGLEPLAY_GET_PRODUCTS = "googleplayGetProducts";
        public static SHARE_MINIPROGRAM2WECHAT = "shareMiniProgram2Wechat";

        // talkingdata native 接口
        public static TD_ACCOUNT = "td_Account";
        public static TD_ONPAGELEAVE = "td_onPageLeave";
        public static TD_ONMISSIONBEGIN = "td_onMissionBegin";
        public static TD_ONMISSIONCOMPLETED = "td_onMissionCompleted";
        public static TD_ONMISSIONFAILED = "td_onMissionFailed";
        public static TD_ONITEMPURCHASE = "td_onItemPurchase";
        public static TD_ONITEMUSE = "td_onItemUse";
        public static TD_ONEVENT = "td_onEvent";
        public static TD_SETLEVEL = "td_setLevel";

        public static SDK_STATISTIC = "sdkStatistic";

        public static GET_LOCALE = "getLocale";
        public static APPSTORE_CHECK_VERSION = "appStoreCheckVersion";
        public static OPEN_URL = "openUrl";

        public static VIBRATE = "vibrate";
        public static PATCH = "patch";
        public static PATCH_PROGRESS = "patchProgress";
        public static PATCH_UNZIP_PROGRESS = "patchUnzipProgress";
        public static PATCH_FINISH = "patchFinish";

        public static APK_UPDATE_READY = "apkUpdateReady";
        public static APK_UPDATE = "apkUpdate";
        public static APK_UPDATE_PROGRESS = "apkUpdateProgress";
        public static APK_UPDATE_FINISH = "apkUpdateFinish";

        // 推送(个推)
        public static PUSH_SILENT_TIME = "pushSilentTime"; // 设置推送的静默时段
        public static PUSH_CID = "pushCid"; // 获取推送的cid

        public static COPY_TO_CLIPBOARD = "copyToClipboard"; // 复制到剪贴板
        public static IOS_ATT_REQ = "iOSAttReq"; // iOS请求ATT权限
        public static ANDROID_DELAY_INIT_SDK = "delayInitSDK"; // 安卓
    }

    export class ListenerItem {
        public callback: (args: any) => void;
        public thisArg: any;
        public resolve: (value?: void | PromiseLike<void>) => void;
    }

    export class NativeMsgCenter {

        private static _inst: NativeMsgCenter = null;
        private _listeners: Collection.Dictionary<NativeMessage, Collection.Dictionary<ListenerItem, boolean>>;

        public static get inst(): NativeMsgCenter {
            if (!NativeMsgCenter._inst) {
                NativeMsgCenter._inst = new NativeMsgCenter();
            }
            return NativeMsgCenter._inst;
        }

        public constructor() {
            this._listeners = new Collection.Dictionary<NativeMessage, Collection.Dictionary<ListenerItem, boolean>>();

            // egret.ExternalInterface.addCallback("callJS", Core.callJS);
        }

        public getListeners(msg: NativeMessage) {
            return this._listeners.getValue(msg);
        }

        public addListener(name: NativeMessage, callback: (args: any) => void, thisArg: any): ListenerItem {
            let item = new ListenerItem();
            item.callback = callback;
            item.thisArg = thisArg;
            item.resolve = null;
            if (!this._listeners.containsKey(name)) {
                this._listeners.setValue(name, new Collection.Dictionary<ListenerItem, boolean>());
            }
            let items = this._listeners.getValue(name);
            items.setValue(item, true);
            return item;
        }

        public removeListener(name: NativeMessage, callback: (args: any) => void, thisArg: any) {
            let items = this._listeners.getValue(name);
            if (items) {
                let dels = Array<ListenerItem>();
                items.forEach((item, _) => {
                    if (item.callback == callback && item.thisArg == thisArg) {
                        dels.push(item);
                    }
                });
                dels.forEach(item => {
                    items.remove(item);
                });
            }
        }

        public callNative(name: NativeMessage, args: any = {}): boolean {
            if (!Core.DeviceUtils.isNative()) {
                return;
            }
            let callArgs = {
                "msg": name,
                "args": args
            }
            let message = JSON.stringify(callArgs);
            try {
                return window["GameLogic"]["callNative"](message);
            } catch (e) {
                console.error("callNative error ", e);
            }
        }

        private _waitMessageCallback(arg: any) {

        }

        public async sendAndWaitNativeMessage(sendName: NativeMessage, waitName: NativeMessage, args?: any) {
            let listener = this.addListener(waitName, this._waitMessageCallback, this);
            let self = this;
            let ret = await new Promise<any>(resolve => {
                listener.resolve = resolve;
                self.callNative(sendName, args);
            });
            this.removeListener(waitName, this._waitMessageCallback, this);
            return ret;
        }

        //public async sdkStatistic(t: SdkStatisticType, param?: any) {
        //    if (!Core.DeviceUtils.isNative()) {
        //        return;
        //    }
        //    if (!param) {
        //        param = {};
        //    }
        //    this.callNative(NativeMessage.SDK_STATISTIC, {"type":t, "param":param});
        //}
    }

    //export function sdkStatistic(t: SdkStatisticType, param?: any) {
    //    NativeMsgCenter.inst.sdkStatistic(t, param);
    //}

    //export function sdkStatisticRegister(accountId: string) {
    //    // accountId = "__deviceId__";
    //    if (Core.DeviceUtils.isWXGame()) {
    //        // if (TKIO && TKIO.register) {
    //        //     TKIO.register(accountId);
    //        // }
    //    } else if (Core.DeviceUtils.isNative()) {
    //        NativeMsgCenter.inst.sdkStatistic(SdkStatisticType.ACC_REGISTER, {accountId: accountId});
    //    }
    //}

    //export function sdkStatisticLogin(accountId: string) {
    //    // accountId = "__deviceId__";
    //    if (Core.DeviceUtils.isWXGame()) {
    //        // if (TKIO && TKIO.loggedin) {
    //        //     TKIO.loggedin(accountId);
    //        // }
    //    } else if (Core.DeviceUtils.isNative()) {
    //        NativeMsgCenter.inst.sdkStatistic(SdkStatisticType.ACC_LOGIN, {accountId: accountId});
    //    }
    //}
}
