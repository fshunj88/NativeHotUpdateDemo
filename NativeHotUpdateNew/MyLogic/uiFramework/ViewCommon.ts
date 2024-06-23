namespace Core {

    export class ViewCommon {
        private _adjustObjs: Array<[fgui.GObject, AdjustType]>;
        private _view: fgui.GComponent;

        constructor(view:fgui.GComponent) {
            this._view = view;
        }

        public adjust(display:fgui.GObject, adjustType:AdjustType=AdjustType.EXACT_FIT) {
            
            if (Core.DeviceUtils.isMiniGame()) {
                this._doAdjust(display, adjustType);
                return;
            }  
            
            if (!this._adjustObjs) {
                this._adjustObjs = new Array<[fgui.GObject, AdjustType]>();
                fgui.GRoot.inst.node.on("root-change-size", this._onResize, this);
            }
            this._adjustObjs.push([display, adjustType]);
            this._doAdjust(display, adjustType);
        }

        private _onResize() {
            this._adjustObjs.forEach(objArr => {
                this._doAdjust(objArr[0], objArr[1]);
            });
        }

        private _doAdjust(display:fgui.GObject, adjustType:AdjustType=AdjustType.EXACT_FIT) {
            // if (!display.node || !display.node.isValid) return;
            let uiRoot = fgui.GRoot.inst;
            let rootWidth = uiRoot.getDesignViewWidth();
            let rootHeight = uiRoot.getDesignViewHeight();
            if (adjustType == AdjustType.NO_BORDER) {
                let scaleX = rootWidth / this._view.width;
                let scaleY = rootHeight / this._view.height;
                let scale = scaleX > scaleY ? scaleX : scaleY;
                display.width = display.initWidth * scale;
                display.height = display.initHeight * scale;
            } else {
                let adjustContext: fgui.GObject;
                if (display instanceof fgui.GComponent) {
                    adjustContext = (<fgui.GComponent>display).getChild("adjustContext");
                }
                display.width = rootWidth;
                display.height = rootHeight /* - window.support.topMargin */;
                if (adjustContext) {
                    let scaleX = rootWidth / this._view.width;
                    let scaleY = rootHeight / this._view.height;
                    let scale = scaleX > scaleY ? scaleX : scaleY;
                    adjustContext.width = adjustContext.initWidth * scale;
                    adjustContext.height = adjustContext.initHeight * scale/* - window.support.topMargin */;
                }
            }
            console.log(`${display.width},${window.support.topMargin}`);
            display.x = this._view.width / 2 - display.width / 2;
            display.y = this._view.height / 2 - display.height / 2/* + window.support.topMargin/2*/;
            // if (Core.DeviceUtils.isWXGame()) {
            this._view.y = -display.y;
            // }
        }

        public destroy() {
            if (this._adjustObjs) {
                fgui.GRoot.inst.node.off("root-change-size", this._onResize, this);
                this._adjustObjs = null;
            }
            this._view = null;
        }

        private getSubNode(parent: fgui.GComponent, nodeName: string, childs: Array<fgui.GComponent>): fgui.GObject {
            let node = parent.getChild(nodeName);
            if (node) {
                return node;
            }
            let childAmount = parent.numChildren;
            for (let i = 0; i < childAmount; i++) {
                let c = parent.getChildAt(i);
                if (!c) {
                    break;
                }
                if (c instanceof fgui.GComponent) {
                    childs.push(c);
                }
            }
            return null;
        }

        public getNode(nodeName: string): fgui.GObject {
            let childs: Array<fgui.GComponent> = [];
            let c = this.getSubNode(this._view, nodeName, childs)
            if (c) {
                return c;
            }

            for (let i = 0; i < childs.length; i++) {
                c = this.getSubNode(childs[i], nodeName, childs)
                if (c) {
                    return c;
                }
            }
            return null;
        }
    }

}