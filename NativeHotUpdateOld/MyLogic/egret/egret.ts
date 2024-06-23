// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

namespace egret {
    export function $error(code: number, code_point?: any) {
        cc.log("ERROR! code = ", code);
    }

    export function $warn(code: number) {
        cc.warn("WARN! code = ", code);
    }

    export let localStorage = cc.sys.localStorage;

    /**
     * The HashObject class is the base class for all objects in the Egret framework.The HashObject
     * class includes a hashCode property, which is a unique identification number of the instance.
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * Egret顶级对象。框架内所有对象的基类，为对象实例提供唯一的hashCode值。
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    export interface IHashObject {
        /**
         * a unique identification number assigned to this instance.
         * @version Egret 2.4
         * @platform Web,Native
         * @readOnly
         * @language en_US
         */
        /**
         * 返回此对象唯一的哈希值,用于唯一确定一个对象。hashCode为大于等于1的整数。
         * @version Egret 2.4
         * @platform Web,Native
         * @readOnly
         * @language zh_CN
         */
        hashCode: number;
    }

    /**
     * @private
     * 哈希计数
     */
    export let $hashCount: number = 1;

    /**
     * The HashObject class is the base class for all objects in the Egret framework.The HashObject
     * class includes a hashCode property, which is a unique identification number of the instance.
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * Egret顶级对象。框架内所有对象的基类，为对象实例提供唯一的hashCode值。
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    export class HashObject implements IHashObject {

        /**
         * Initializes a HashObject
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 创建一个 HashObject 对象
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public constructor() {
            this.$hashCode = $hashCount++;
        }

        /**
         * @private
         */
        $hashCode: number;
        /**
         * a unique identification number assigned to this instance.
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 返回此对象唯一的哈希值,用于唯一确定一个对象。hashCode为大于等于1的整数。
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public get hashCode(): number {
            return this.$hashCode;
        }
    }

    export class Event extends cc.Event.EventCustom {
        public static CONNECT: string = "connect";
        public static CLOSE: string = "close";
        public static IO_ERROR: string = "ioError";
        public static SOCKET_DATA: string = "socketData";
        private _hasHandled: boolean = false;
        $currentTarget: any = null;
        $target: any = null;
        $type: string;
        $isDefaultPrevented: boolean = false;

        public get currentTarget_(): any {
            return this.$currentTarget;
        }

        public set currentTarget_(tar: any) {
            this.$currentTarget = tar;
        }

        public get type_(): string {
            return this.$type;
        }

        public set type_(t: string) {
            this.$type = t;
        }

        public get target_(): any {
            return this.$target;
        }

        public set target_(tar: any) {
            this.$target = tar;
        }

        $setTarget(target: any): boolean {
            this.$target = target;
            return true;
        }

        public constructor(type: string, bubble?: boolean) {
            super(type, bubble);
            this.$type = type;
        }

        public get data(): any {
            return super.getUserData();
        }

        public set data(param: any) {
            super.setUserData(param);
        }

        public get hasHandled(): boolean {
            return this._hasHandled;
        }

        public set hasHandled(b: boolean) {
            this._hasHandled = b;
        }
    }

    //export class MovieClipEvent extends Event {
    //    public static COMPLETE: string = fgui.GMovieClip.COMPLETE;
    //    public static FRAME_LABEL: string = fgui.GMovieClip.FRAME_LABEL;

    //    public frameLabel: string = null;

    //    public constructor(type: string, bubbles: boolean = false, cancelable: boolean = false, frameLabel: string = null) {
    //        super(type, bubbles);
    //        this.frameLabel = frameLabel;
    //    }
    //}

    export function is(instance: any, typeName: string): boolean {
        if (!instance || typeof instance != "object") {
            return false;
        }
        let prototype: any = Object.getPrototypeOf(instance);
        let types = prototype ? prototype.__types__ : null;
        if (!types) {
            return false;
        }
        return (types.indexOf(typeName) !== -1);
    }

    export function log(msg: string | any, ...subst: any[]): void {
        cc.log(msg, ...subst);
    }
};

let DEBUG = false;
