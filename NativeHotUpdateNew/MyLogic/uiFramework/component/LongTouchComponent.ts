namespace Core {

/**
 *  长按监听
 */

    export class LongTouchComponet {
        private _touchInterval: number;  // 长按多少毫秒会发出事件
        private _isTouching: boolean = false;
        private _display: fgui.GObject;

        private _longTouchCallback: (...args:any) => void;
        private _callbackArgs:Array<any>;
        private _thisObj: any;

        constructor(display:fgui.GObject, touchInterval: number = 500) {
            this._display = display;
            this._touchInterval = touchInterval;
            this.enable = true;
        }

        public set enable(val:boolean) {
            if (!this._display.node) {
                return;
            }
            if (val) {
                // cc.Node.EventType
                this._display.on(fgui.Event.TOUCH_BEGIN, this._onTouchStart, this);
                this._display.on(fgui.Event.TOUCH_END, this._onTouchEnd, this);
                this._display.on(fgui.Event.ROLL_OUT, this._onTouchCancel, this);
            } else {
                this._display.off(fgui.Event.TOUCH_BEGIN, this._onTouchStart, this);
                this._display.off(fgui.Event.TOUCH_END, this._onTouchEnd, this);
                this._display.off(fgui.Event.ROLL_OUT, this._onTouchCancel, this);
            }
        }

        private _onTouchStart(evt:fgui.Event) {
            console.log("LongTouchComponet._onTouchStart");
            if (this._isTouching) {
                return;
            }

            // if (this._display.node.getBoundingBoxToWorld().contains(evt.pos)) {
            //     this._isTouching = true;
            // } else {
            //     this._isTouching = false;
            // }

            this._isTouching = true;
            if (this._isTouching) {
                fgui.GTimers.inst.add(this._touchInterval, 1, this._touchCallback, this, evt);
            }
        }

        private _onTouchEnd() {
            console.log("LongTouchComponet._onTouchEnd");
            this._isTouching = false;
            fgui.GTimers.inst.remove(this._touchCallback, this);
        }

        private _onTouchCancel() {
            console.log("LongTouchComponet._onTouchCancel");
            this._isTouching = false;
            fgui.GTimers.inst.remove(this._touchCallback, this);
        }

        private _touchCallback(evt:fgui.Event) {
            console.log("LongTouchComponet._touchCallback");
            if (this._isTouching) {
                if (this._longTouchCallback) {
                    this._longTouchCallback.apply(this._thisObj, ...this._callbackArgs);
                }
            } else {
                fgui.GTimers.inst.remove(this._touchCallback, this);
            }
        }

        public onLongTouch(callback:(...args:any)=>void, thisObj:any, ...args:any) {
            this._longTouchCallback = callback;
            this._thisObj = thisObj;
            this._callbackArgs = args;
        }

        public removeListener(callback:(...args:any)=>void, thisObj:any) {
            if (this._longTouchCallback == callback && this._thisObj == thisObj) {
                this._longTouchCallback = null;
                this._thisObj = null;
                this._callbackArgs = [];
            }
        }
    }

}