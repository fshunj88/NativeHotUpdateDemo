namespace Core {

    export class BaseView extends fgui.GComponent implements IBaseView {
        protected _myParent: fgui.GComponent;
        private _isInit: boolean;
        private _viewCommon: ViewCommon;
        protected _concertBackKey: boolean = true;
        public forceCloseFlag: boolean = false;

        constructor(parent?: fgui.GComponent) {
            super();
            if (parent) {
                this._myParent = parent;
            } else {
                this._myParent = fgui.GRoot.inst;
            }
            this._isInit = false;
            this._viewCommon = new ViewCommon(this);
        }

        public handleBackKey(): boolean {
            let backBtnChild = this.getChild("closeBtn");
            if (!backBtnChild) {
                backBtnChild = this.getChild("backBtn");
            }
            if (backBtnChild) {
                let backBtn = backBtnChild.asButton;
                backBtn.fireClick();
                return true;
            } else {
                return false;
            }
        }

        public get isConcernBackKey(): boolean {
            return this._concertBackKey;
        }

        public adjust(display: fgui.GObject, adjustType: AdjustType = AdjustType.EXACT_FIT) {
            if (adjustType == AdjustType.EXCEPT_MARGIN) {
                this._viewCommon.adjust(display, AdjustType.EXACT_FIT);
                display.height -= window.support.topMargin;
            } else {
                this._viewCommon.adjust(display, adjustType);
            }
        }

        public setVisible(flag: boolean): void {
            // if (flag) {
            //     this.alpha = 1;
            // } else {
            //     this.alpha = 0;
            // }
            this.hidden = !flag;
            console.log("set hidden ", this.name, this.hidden);
        }

        public isInit(): boolean {
            return this._isInit;
        }

        public isShow(): boolean {
            return this.parent != null && this.visible;
        }

        public addToParent(parent?: fgui.GComponent): void {
            if (parent) {
                this._myParent = parent;
            }
            if (this.parent != this._myParent) {
                this._myParent.addChild(this);
            }
        }

        public removeFromParent(): void {
            if (this.parent) {
                this.parent.removeChild(this);
            }
        }

        public initUI(): void {
            this._isInit = true;
        }

        public async open(...param: any[]) {
            Core.EventCenter.inst.dispatchEventWith(GameEvent.OpenView, false, this);
            Core.EventCenter.inst.addEventListener(Core.Event.OpenViewEvt, this._onViewOpen, this);
            Core.EventCenter.inst.addEventListener(Core.Event.CloseViewEvt, this._onViewClose, this);
        }

        public async close(...param: any[]) {
        }

        private _onViewOpen(evt: egret.Event) {
            let name = <string>evt.data;
            //if (this.name != name && name == ViewName.battle) {
            //    this.hidden = true;
            //}
        }

        private _onViewClose(evt: egret.Event) {
            let name = <string>evt.data;
            //if (this.name != name && name == ViewName.battle) {
            //    this.hidden = false;
            //}
        }

        public toTopLayer() {
            Core.LayerManager.inst.topLayer.addChild(this);
        }

        public toMainLayer() {
            Core.LayerManager.inst.mainLayer.addChild(this);
        }

        public destroy() {
            // 有些界面是直接调用dispose进行销毁的
            // 因此清理逻辑放到dispose中
            this.dispose();
        }

        public dispose() {
            Core.EventCenter.inst.removeEventListener(Core.Event.OpenViewEvt, this._onViewOpen, this);
            Core.EventCenter.inst.removeEventListener(Core.Event.CloseViewEvt, this._onViewClose, this);
            this._myParent = null;
            this._viewCommon.destroy();
            super.dispose();
        }

        public async getNode(nodeName: string): Promise<fgui.GObject> {
            return this._viewCommon.getNode(nodeName);
        }

        public destroyWhileClose(): boolean {
            return true;
        }
    }

}