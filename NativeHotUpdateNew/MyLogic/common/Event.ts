///<reference path="../egret/EventDispatcher.ts" />
namespace Core {

    export class EventCenter extends egret.EventDispatcher {
        private static _inst: EventCenter;

        public static get inst(): EventCenter {
            if (!EventCenter._inst) {
                EventCenter._inst = new EventCenter();
            }
            return EventCenter._inst;
        }
    }

    export class Event {
        public static CloseViewEvt = "CloseViewEvt";
        public static OpenViewEvt = "OpenViewEvt";
        //退环境事件
        public static OpenEnvChangeView = "OpenEnvChangeView";
        public static CloseEnvChangeView = "CloseEnvChangeView";

        /**
         * 登录事件。只在登录时触发一次。重登不会触发。如果想要关注重登时的
         * 登录事件，请用Player.inst.addEventListern(Player.LoginEvt, callback, xxx);
         */
        public static LoginOnceEv = "LoginOnceEv";
        public static ReLoginEv = "ReLoginEv";
        public static AddTreasureEvt = "AddTreasureEv";
        public static DelTreasureEvt = "DelTreasureEv";
        public static UpdateTreasureEvt = "UpdateTreasureEvt";
        public static UpdateDailyTreasureEvt = "UpdateDailyTreasureEvt";
        public static UpdateADTreasureEvt = "UpdateADTreasureEvt";
        public static HomeListChangedEvt = "HomeListChangeEvt";
        public static CardHintNumChangeEv = "CardHintNumChangeEv";
        public static LevelHintNumChangeEv = "LevelHintNumChangeEv";
        public static AvatarHintNumChangeEv = "AvatarHintNumChangeEv";
        public static ReConnectEv = "ReConnectEv";
    }
}