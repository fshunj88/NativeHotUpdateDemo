namespace Core {

    export class WaitPanel extends BaseView {
        private _waitImg: fgui.GLoader;
        private _waitBg: fgui.GLoader;
        private _waitProg: fgui.GComponent;
        private _hintText: fgui.GTextField;

        constructor() {
            super(LayerManager.inst.maskLayer);
            this._myParent = Core.LayerManager.inst.maskLayer;
        }

        public initUI() {
            super.initUI();
            this.adjust(this.getChild("bg"));
            this._waitImg = this.getChild("loadingCircle").asLoader;
            this._waitBg = this.getChild("loadingBg").asLoader;
            this._waitProg = this.getChild("loadingProg").asCom;
            if (this.getChild("hintText")) {
                this._hintText = this.getChild("hintText").asTextField;
            }
        }

        public async open(...param:any[]) {
            if (this.parent) {
                return;
            }
            this.addToParent();
            this._waitImg.visible = false;
            this._waitBg.visible = false;
            this._waitProg.visible = false;
            let delay = param[0] || 800; 
            if (this._hintText) {
                this._hintText.visible = false;
            }
            fgui.GTimers.inst.add(delay, 1, this._rotationWaitImg, this);
            fgui.GTimers.inst.add(delay + 100, 1, this._handleProgress, this);
        }

        private _rotationWaitImg() {
            this._waitImg.visible = true;
            this._waitBg.visible = true;
            this._waitProg.visible = true;
            if (this._hintText) {
                this._hintText.visible = true;
            }
            EffectUtil.rotationEffect(this._waitImg, 1500);
        }

        private _handleProgress() {
            let self = this;
            let minH = 0;
            let maxH = 74;
            let duration = 1500;
            let onComplete: Function = function() {
                if (self.node.isValid && self.parent) {
                    self._waitProg.height = minH;
                    egret.Tween.get(self._waitProg).to({height: maxH}, duration).call(onComplete, null);   
                }
            };
            this._waitProg.height = minH;
            egret.Tween.get(this._waitProg).to({height: maxH}, duration).call(onComplete, null);
        }

        public async close(...param:any[]) {
            fgui.GTimers.inst.remove(this._rotationWaitImg, this);
            EffectUtil.removeRotationEffect(this._waitImg);
            fgui.GTimers.inst.remove(this._handleProgress, this);
            egret.Tween.removeTweens(this._waitProg);
            if (this._hintText) {
                this._hintText.text = "";
            }
            if (!this.parent) {
                return;
            }
            this.parent.removeChild(this);
        }

        public updateProgress(percent: number, msg?: string) {
            if (this._hintText) {
                msg = msg || "加载中...";
                this._hintText.text = Core.StringUtils.format(msg + "{0}%", Math.ceil(percent * 100));
            }
        }
    }
}