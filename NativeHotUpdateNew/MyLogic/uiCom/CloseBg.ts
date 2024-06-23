namespace UI {

    export class CloseBg extends fgui.GComponent {
        private _triggerClose: boolean;
        private _callback: Function = null;
        public get triggerClose() { return this._triggerClose; };
        public set triggerClose(val: boolean) { this._triggerClose = val };

        public onConstruct() {
            super.onConstruct();
            this.onClick(this._onClick, this);
        }

        private _getWindowParent() {
            let parent = this.parent;
            if (parent instanceof fgui.Window) {
                return parent;
            } else {
                return parent._parent;
            }
        }

        protected async _onClick() {
            if (this._callback) {
                this._callback();
            } else {
                let parent = this._getWindowParent();
                if (parent && this._triggerClose) {
                    let view = parent.asCom as Core.BaseWindow;
                    if (view) {
                        await Core.ViewManager.inst.close(view.name);
                    }
                }
            }
        }

        public registerOtherClickMethod(callback: Function) {
            this._callback = callback;
        }
        public unregisterOtherClickMethod() {
            this._callback = null;
        }

        public setup_afterAdd(buffer: fgui.ByteBuffer, beginPos: number): void {
            if (this.data) {
                let str = (this.data).toString();
                this._triggerClose = str == "true" ? true : false;
            }
            super.setup_afterAdd(buffer, beginPos);
            this.addRelation(this.parent, fgui.RelationType.Center_Center);
            this.addRelation(this.parent, fgui.RelationType.Middle_Middle);
        }

        public dispose() {
            if (this._callback) {
                this._callback = null;
            }
            super.dispose();
        }
    }
}