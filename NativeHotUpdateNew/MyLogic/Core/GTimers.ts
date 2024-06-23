
namespace fgui {

    export class GTimers extends cc.Node {
        private _items: any;
        private _itemPool: any;

        private _enumI: number = 0;
        private _enumCount: number = 0;
        // private _lastTime: number = 0;

        public static deltaTime: number = 0;
        // public static time: number = 0;

        public static inst: GTimers = new GTimers();

        private static FPS24: number = 1000 / 24;
        public static FPS30: number = 1000 / 30;
        public static FPS60: number = 1000 / 60;

        public static daysTime: number = 86400;

        private static _inited: boolean = false; 
        private static _root = null;

        public constructor() {
            super();
            this.name = "[GTimer]";
            this._items = new Array<TimerItem>();
            this._itemPool = new Array<TimerItem>();

            // this._lastTime = new Date().getTime();// egret.getTimer();
            // GTimers.time = this._lastTime;
            //egret.startTick(this.__timer, this);
            // let self = this;

            // setInterval(() => {
            //     let t = new Date().getTime();
            //     self.__timer(t);
            // }, 1000/60);
        }

        private getItem(): TimerItem {
            if (this._itemPool.length)
                return this._itemPool.pop();
            else
                return new TimerItem();
        }

        private findItem(callback: Function, thisObj: any): TimerItem {
            var len: number = this._items.length;
            for (var i: number = 0; i < len; i++) {
                var item: TimerItem = this._items[i];
                if (item.callback == callback && item.thisObj == thisObj)
                    return item;
            }
            return null;
        }

        public add(delayInMiniseconds: number, repeat: number, callback: Function, thisObj: any, ...callbackParam: any[]): void {
            var item: TimerItem = this.findItem(callback, thisObj);
            if (!item) {
                item = this.getItem();
                item.callback = callback;
                //item.hasParam = callback.length >= 1;
                item.thisObj = thisObj;
                this._items.push(item);
            }
            item.delay = delayInMiniseconds;
            item.counter = 0;
            item.repeat = repeat;
            item.param = callbackParam;
            item.end = false;
            if (!GTimers._inited) {
                // if (!GTimers._root) {
                    // GTimers._root = new cc.Node("[GTimers]");
                    // cc.game["addPersistRootNode"](GTimers._root); 
                // }
                cc.game.addPersistRootNode(this);
                // cc.game["addPersistRootNode"](this); 
                cc.director.getScheduler().scheduleUpdate(this, 0, false);
                // cc.director.getScheduler().schedule(this.__timer.bind(this), GTimers._root, 0, false);
                GTimers._inited = true;
            }
        }

        public update(dt: number) {
            this.__timer(dt);
        }

        public callLater(callback: Function, thisObj: any, callbackParam: any = null): void {
            this.add(1, 1, callback, thisObj, callbackParam);
        }

        public callDelay(delay: number, callback: Function, thisObj: any, callbackParam: any = null): void {
            this.add(delay, 1, callback, thisObj, callbackParam);
        }

        public callBy24Fps(callback: Function, thisObj: any, callbackParam: any = null): void {
            this.add(GTimers.FPS24, 0, callback, thisObj, callbackParam);
        }

        public async waitTime(delay: number): Promise<any> {
            return new Promise<any>(resolve => {
                this.add(delay, 1, ()=>{
                    resolve(null);
                }, this);
            });
        }

        public async wait30FpsFrame(delay: number): Promise<any> {
            return new Promise<any>(resolve => {
                this.add(GTimers.FPS30 * delay, 1, ()=>{
                    resolve(null);
                }, this);
            });
        }

        public exists(callback: Function, thisObj: any): boolean {
            var item: TimerItem = this.findItem(callback, thisObj);
            return item != null;
        }

        public remove(callback: Function, thisObj: any): void {
            var item: TimerItem = this.findItem(callback, thisObj);
            if (item) {
                var i: number = this._items.indexOf(item);
                this._items.splice(i, 1);
                if (i < this._enumI)
                    this._enumI--;
                this._enumCount--;

                // item.reset();
                // this._itemPool.push(item);
            }
        }

        private __timer(dt: number, paused: boolean = false): boolean {
            // GTimers.time = timeStamp;
            GTimers.deltaTime = dt * 1000; //timeStamp - this._lastTime;
            // this._lastTime = timeStamp;
            
            this._enumI = 0;
            this._enumCount = this._items.length;

            while (this._enumI < this._enumCount) {
                var item: TimerItem = this._items[this._enumI];
                this._enumI++;

                if (item.advance(GTimers.deltaTime)) {
                    if (item.end) {
                        this._enumI--;
                        this._enumCount--;
                        this._items.splice(this._enumI, 1);
                    }

                    if (item.param)
                        item.callback.call(item.thisObj, ...item.param);
                    else
                        item.callback.call(item.thisObj);

                    // if (item.end) {
                    //     item.reset();
                    //     this._itemPool.push(item);
                    // }
                }
            }

            return false;
        }
    }


    class TimerItem {
        public delay: number = 0;
        public counter: number = 0;
        public repeat: number = 0;
        public callback: Function;
        public thisObj: any;
        public param: any[];

        public hasParam: boolean;
        public end: boolean;

        public constructor() {
        }

        public advance(elapsed: number = 0): boolean {
            this.counter += elapsed;
            if (this.counter >= this.delay) {
                this.counter -= this.delay;
                if (this.counter > this.delay)
                    this.counter = this.delay;

                if (this.repeat > 0) {
                    this.repeat--;
                    if (this.repeat == 0)
                        this.end = true;
                }

                return true;
            }
            else
                return false;
        }

        public reset(): void {
            this.callback = null;
            this.thisObj = null;
            this.param = null;
        }
    }
}