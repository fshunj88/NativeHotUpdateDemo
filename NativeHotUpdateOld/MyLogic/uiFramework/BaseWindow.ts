namespace Core {

    export class BaseWindow extends fgui.Window implements IBaseView {
        private _isInit: boolean;
        protected _myParent: fgui.GRoot;
        private _viewCommon: ViewCommon;
        protected _concertBackKey: boolean = true;
        protected _closeOnViewOpen: boolean = true;
        protected _needGaussMaskWhenModal: boolean = true;
        protected _gaussMaskBrightness: number = -1;
        public forceCloseFlag: boolean = false;
        protected __closeBg: UI.CloseBg = null;

        constructor() {
            super();
            this._viewCommon = new ViewCommon(this);
        }

        public enableTouchClose() {
            if (!this.__closeBg && !this.contentPane.getChild("closeBg")) {
                this.__closeBg = fgui.UIPackage.createObject("common", "closeBg", UI.CloseBg).asCom as UI.CloseBg;
                let idx = 0;
                if (this.contentPane.getChild("bg")) {
                    idx = 1;
                }
                this.contentPane.addChildAt(this.__closeBg, idx);
                this.__closeBg.triggerClose = true;
                this.adjust(this.__closeBg);
            }
        }

        public handleBackKey(): boolean {
            let backBtnChild: fgui.GObject = null;
            if (this.contentPane) {
                backBtnChild = this.contentPane.getChild("closeBtn");
                if (!backBtnChild) {
                    backBtnChild = this.contentPane.getChild("backBtn");
                }
            } else {
                backBtnChild = this.getChild("closeBtn");
                if (!backBtnChild) {
                    backBtnChild = this.getChild("backBtn");
                }
            }
            if (backBtnChild) {
                backBtnChild.asButton.fireClick();
                return true;
            } else {
                return false;
            }
        }

        public get isConcernBackKey(): boolean {
            return this._concertBackKey;
        }


        public get closeOnViewOpen(): boolean {
            return this._closeOnViewOpen;
        }

        public set closeOnViewOpen(b: boolean) {
            this._closeOnViewOpen = b;
        }

        public setVisible(flag: boolean) {
            // if (flag) {
            //     this.alpha = 1;
            // } else {
            //     this.alpha = 0;
            // }
            this.hidden = !flag;
        }

        public adjust(display: fgui.GObject, adjustType: AdjustType = AdjustType.EXACT_FIT) {
            if (adjustType == AdjustType.EXCEPT_MARGIN) {
                this._viewCommon.adjust(display, AdjustType.EXACT_FIT);
                display.height -= window.support.topMargin;
            } else {
                this._viewCommon.adjust(display, adjustType);
            }
        }

        public isInit(): boolean {
            return this._isInit;
        }

        public isShow(): boolean {
            return this.parent != null && this.visible && !this.hidden;
        }

        public addToParent(): void {

        }

    public removeFromParent(): void {

        }
        public battleChangeLayer() {
            // if (Core.ViewManager.inst.isShow(ViewName.battle)) {
            //     // this.toTopLayer();
            //     this._myParent = Core.LayerManager.inst.maskLayer;
            // } else {
            //     this.toMainLayer();
            // }
        }
        public toMapLayer() {
            this._myParent = Core.LayerManager.inst.mapLayer;
        }
        public toTopLayer() {
            this._myParent = Core.LayerManager.inst.topLayer;
        }
        public toMaskLayer() {
            this._myParent = Core.LayerManager.inst.maskLayer;
        }
        public toMainLayer() {
            this._myParent = Core.LayerManager.inst.mainLayer;
        }
        public toWindowLayer() {
            this._myParent = Core.LayerManager.inst.windowLayer;
        }

        public initUI(): void {
            this._isInit = true;
            Core.EventCenter.inst.addEventListener(GameEvent.OpenView, this._onViewOpen, this);

            let content = null;
            if (this.contentPane) {
                content = this.contentPane;
            } else {
                content = this;
            }
            let closeBgCom = content.getChild("closeBg");
            if (closeBgCom && closeBgCom instanceof UI.CloseBg) {
                this.adjust(closeBgCom);
            }
        }

        public async open(...param: any[]) {
            if (this._myParent) {
                this._myParent.showWindow(this);
            } else {
                Core.LayerManager.inst.windowLayer.showWindow(this);
            }
        }

        public async close(...param: any[]) {
            if (this._myParent) {
                this._myParent.hideWindow(this, this.destroyWhileClose());
            } else {
                Core.LayerManager.inst.windowLayer.hideWindow(this, this.destroyWhileClose());
            }
            if (this.__closeBg) {
                this.__closeBg.removeFromParent();
                this.__closeBg.dispose();
            }
        }

        public requestFocus(): void {
            super.requestFocus();
            //if (this.modal && this._needGaussMaskWhenModal) {
            //    Shader.GaussMask.inst.show(this._gaussMaskBrightness);
            //}
        }

        public hide(remove: boolean = true): void {
            super.hide(remove);
            //if (this.modal && this._needGaussMaskWhenModal) {
            //    Shader.GaussMask.inst.hide();
            //}
        }

        public destroy() {
            // 有些界面是直接调用dispose进行销毁的
            // 因此清理逻辑放到dispose中
            this.dispose();
        }

        public dispose() {
            Core.EventCenter.inst.removeEventListener(GameEvent.OpenView, this._onViewOpen, this);
            this._viewCommon.destroy();
            super.dispose();
        }

        public async getNode(nodeName: string): Promise<fgui.GObject> {
            return this._viewCommon.getNode(nodeName);
        }

        public destroyWhileClose(): boolean {
            return true;
        }

        protected async _onViewOpen(evt: egret.Event) {
            let name = <string>evt.data.name;
            //if (this.closeOnViewOpen || name == ViewName.battle) {
            //    await Core.ViewManager.inst.closeView(this);
            //}
        }
    }

}