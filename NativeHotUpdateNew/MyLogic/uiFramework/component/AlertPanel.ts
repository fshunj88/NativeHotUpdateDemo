namespace Core {

    export interface IAlertPanel extends fgui.GComponent {
        getAcceptBtn(): fgui.GButton
        getTitle(): fgui.GRichTextField
    }

    export interface IConfirmPanel extends IAlertPanel {
        getCancelBtn(): fgui.GButton
    }

    export class AlertPanel extends fgui.GComponent implements IAlertPanel {

        protected onConstruct(): void {
            super.onConstruct();
            //this.getChild("title").asRichTextField.funcParser = Core.StringUtils.parseFuncText;
        }

        public getAcceptBtn(): fgui.GButton {
            return this.getChild("acceptBtn").asButton;
        }

        public getTitle(): fgui.GRichTextField {
            return this.getChild("title").asRichTextField;
        }
    }

    export class ConfirmPanel extends fgui.GComponent implements IConfirmPanel {

        protected onConstruct(): void {
            super.onConstruct();
            //this.getChild("title").asRichTextField.funcParser = Core.StringUtils.parseFuncText;
        }

        public getAcceptBtn(): fgui.GButton {
            return this.getChild("acceptBtn").asButton;
        }

        public getCancelBtn(): fgui.GButton {
            return this.getChild("cancelBtn").asButton;
        }

        public getTitle(): fgui.GRichTextField {
            return this.getChild("title").asRichTextField;
        }
    }
    export class PrivShowPanel extends fgui.GComponent {
        private _privList: fgui.GList;
        private _time: number;

        protected onConstruct(): void {
            super.onConstruct();
            this.touchable = false;
            this.y += window.support.topMargin;
            this._privList = this.getChild("privList").asList;
        }

        public getPrivList(): fgui.GList {
            return this._privList;
        }

        //public showTip(priv: Priv) {
        //    this._time = 2;
        //    let com = this._privList.addItemFromPool().asCom;
        //    let iconUrl = "";
        //    let desc = "";
        //    if (priv == Priv.VIP_PRIV) {
        //        let vip = OutStatus.OutStatusMgr.inst.getVip();
        //        iconUrl = vip.icon;
        //        desc = Core.StringUtils.TEXT(10700);
        //    } else {
        //        let buff = OutStatus.OutStatusMgr.inst.getBuff(priv);
        //        iconUrl = buff.icon;
        //        desc = buff.getShortDesc();
        //    }
        //    com.getChild("icon").asLoader.url = iconUrl;
        //    com.getChild("text").asTextField.textParser = Core.StringUtils.parseColorText;
        //    com.getChild("text").asTextField.text = desc;
        //    com.getTransition("t0").play();
        //    fgui.GTimers.inst.remove(this._privTimer, this);
        //    fgui.GTimers.inst.add(1000, -1, this._privTimer, this);
        //}

        //private _privTimer() {
        //    this._time -= 1;
        //    if (this._time <= 0) {
        //        fgui.GTimers.inst.remove(this._privTimer, this);
        //        this._privList.removeChildrenToPool();
        //        TipsUtils.closePrivTips();
        //    }
        //}
    }
}