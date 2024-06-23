namespace Core {

    export class DeviceUtils {
        private _isQQPlay: false;
        /**
         * 当前是否Html5版本
         */
        public static isHtml5(): boolean {
            //if (GM.MonitorMgr.inst.monitoring) return GM.MonitorDevice.DeviceData.isHtml5;
            return cc.sys.isBrowser;
        }

        /**
         * 当前是否是Native版本
         */
        public static isNative(): boolean {
            //if (GM.MonitorMgr.inst.monitoring) return GM.MonitorDevice.DeviceData.isNative;
            return cc.sys.isNative;
        }
        /**
         * 当前是否是小游戏版本 
         * */
        public static isMiniGame(): boolean {
            //if (GM.MonitorMgr.inst.monitoring) return GM.MonitorDevice.DeviceData.isMiniGame;
            return cc.sys.platform == cc.sys.WECHAT_GAME;
        }
        /**
         * 当前是否是微信小游戏版本
         */
        public static isWXGame(): boolean {
            //if (GM.MonitorMgr.inst.monitoring) return GM.MonitorDevice.DeviceData.isWXGame;
            return cc.sys.platform == cc.sys.WECHAT_GAME && !DeviceUtils.isQQPlay() && !DeviceUtils.isTTGame();
        }

        /**
         * 当前是否是QQ小游戏版本
         */
        public static isQQPlay(): boolean {
            return false;
            //if (GM.MonitorMgr.inst.monitoring) return GM.MonitorDevice.DeviceData.isQQPlay;
            //return QQGame.QQGameMgr.inst.isQQPlay;
        }
        /**
         * 当前是否是头条系小游戏
         */
        public static isTTGame(): boolean {
            //if (GM.MonitorMgr.inst.monitoring) return GM.MonitorDevice.DeviceData.isTTGame;
            //return TouTiao.TTGameMgr.inst.isTTGame;
            return false;
        }

        /**
         * 是否是在手机上
         */
        public static isMobile(): boolean {
            //if (GM.MonitorMgr.inst.monitoring) return GM.MonitorDevice.DeviceData.isMobile;
            return cc.sys.isMobile;
        }

        /**
         * 是否是在PC上
         */
        public static isPC(): boolean {
            //if (GM.MonitorMgr.inst.monitoring) return GM.MonitorDevice.DeviceData.isPC;
            return !cc.sys.isMobile;
        }

        /**
         * 是否是android系统
         */
        public static isAndroid(): boolean {
            //if (GM.MonitorMgr.inst.monitoring) return GM.MonitorDevice.DeviceData.isAndroid;
            return cc.sys.os == cc.sys.OS_ANDROID;
        }

        /**
         * 是否是iOS系统
         */
        public static isiOS(): boolean {
            //if (GM.MonitorMgr.inst.monitoring) return GM.MonitorDevice.DeviceData.isiOS;
            return cc.sys.os == cc.sys.OS_IOS;
        }
        public static isOSX(): boolean {
            //if (GM.MonitorMgr.inst.monitoring) return GM.MonitorDevice.DeviceData.isOSX;
            return cc.sys.os == cc.sys.OS_OSX;

        }

    }
}