namespace Core {

    /**
     *  分帧处理
     */
    export class FrameExecutor {
        private _functions: Array<Array<any>>;
        private _isCancel: boolean = false;
        private _isExecuting: boolean = false;;
        private _FPSnum: number;

        private static _inst: FrameExecutor = null;

        public static get inst(): FrameExecutor {
            if (!this._inst) {
                this._inst = new FrameExecutor();
            }
            return this._inst;
        }

        constructor() {
            this._functions = [];
            if (Core.DeviceUtils.isNative() && Core.DeviceUtils.isiOS()) {
                this._FPSnum = fgui.GTimers.FPS30;
            } else {
                this._FPSnum = fgui.GTimers.FPS60;
            }
        }

        public regist(func: Function, thisObj: any, ...param: any[]): void {
            this._functions.push([func, thisObj, param]);
        }

        public cancel() {
            this._isCancel = true;
            this._functions = [];
        }

        public resume(interval: number = 1) {
            this._isCancel = false;
            this.execute(interval);
        }

        public resumeAll(interval: number = 1) {
            this._isCancel = false;
            while (this._functions.length > 0) {
                let arr: Array<any> = this._functions.shift();
                arr[0].call(arr[1], ...arr[2]);
                console.log("executing")
            }
        }

        private _doExec(interval: number) {
            if (this._functions.length) {
                this._isExecuting = true;
                let arr: Array<any> = this._functions.shift();
                arr[0].call(arr[1], ...arr[2]);
                fgui.GTimers.inst.add(interval, 1, this._doExec, this, interval);
            } else {
                this._isExecuting = false;
            }
        }

        public execute(interval?: number) {
            if (this._isCancel || this._isExecuting) {
                return
            }

            interval = interval || this._FPSnum;
            this._doExec(interval);
        }
    }

}
