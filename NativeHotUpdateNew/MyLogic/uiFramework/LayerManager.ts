namespace Core {

    export class WindowRoot extends fgui.GRoot {
        private _modalBg: fgui.GGraph;
        private _maxSiblingIndex: number = 9999;
        private _windowStack: Array<fgui.GObject> = [];
        private _popups: Collection.Dictionary<number, boolean>;

        public constructor() {
            super();
            this._popups = new Collection.Dictionary<number, boolean>();
            this._modalBg = new fgui.GGraph();
            this._modalBg.setSize(this.width, this.height);
            this._modalBg.drawRect(0, cc.Color.TRANSPARENT, fgui.UIConfig.modalLayerColor);
            this._modalBg.addRelation(this, fgui.RelationType.Size);
            this.on(fgui.Event.TOUCH_BEGIN, this._tryClosePopup, this);
        }

        public showWindow(win: fgui.Window) {
            let modal = win.modal;
            if (modal) {
                if (this._modalBg.parent == null) {
                    this.addChild(this._modalBg);
                }
                this._modalBg.visible = true;
                this._modalBg.node.setSiblingIndex(this._maxSiblingIndex - 1);
            }
            this.addChild(win);
            win.node.setSiblingIndex(this._maxSiblingIndex);
            this._windowStack.push(win);
        }

        public showPopup(popup: fgui.GObject, target?: fgui.GObject, downward?: any): void {
            // console.log("fuck show popup ", popup);
            this._popups.setValue(popup.hashIdx, true);
            if (!(popup instanceof Core.BaseWindow)) {
                this.addChild(popup);
                this._windowStack.push(popup);
                popup.node.setSiblingIndex(this._maxSiblingIndex);
            }
            // console.log("fuck after show popup ", this._windowStack);
        }

        public hideWindow(win: fgui.Window) {
            this._hidePopup(win);
        }

        private _tryClosePopup() {
            if (this._windowStack.length <= 0) return;
            let tar = this._windowStack[this._windowStack.length - 1];
            if (this._popups.containsKey(tar.hashIdx)) {
                this._hidePopup(tar);
                this._popups.remove(tar.hashIdx);
                // console.log("fuck after close popop: ", this._popups);
            }
        }

        private _hidePopup(popup: fgui.GObject) {
            // console.log("fuck hidePopup", popup);
            this._removePopup(popup);
            // 是否还有模态窗口
            let cnt = this._windowStack.length;
            let hasModal = false;
            let tar: fgui.GObject = null;
            for (let i = cnt - 1; i >= 0; --i) {
                let w = this._windowStack[i];
                if (w instanceof fgui.Window && (<fgui.Window>w).modal) {
                    tar = w;
                    hasModal = true;
                    break;
                }
            }
            if (!hasModal) {
                // console.log("fuck no modal")
                // this.removeChild(this._modalBg);
                this._modalBg.visible = false;
            } else {
                // console.log("fuck has modal");
                if (tar) {
                    // console.log("fuck reset modal window index, tar = ", tar);
                    if (tar == this._windowStack[cnt - 1]) {
                        // console.log("fuck target is last element")
                        this._modalBg.node.setSiblingIndex(this._maxSiblingIndex - 1);
                        tar.node.setSiblingIndex(this._maxSiblingIndex);
                    } else {
                        // console.log("fuck target is'nt last element")
                        this._modalBg.node.setSiblingIndex(tar.node.getSiblingIndex() - 1);
                        tar.node.setSiblingIndex(tar.node.getSiblingIndex());
                    }
                }
                this._modalBg.visible = true;
            }
        }

        private _removePopup(popup: fgui.GObject) {
            // console.log("fuck removing popup ", popup);
            this.removeChild(popup);
            let last = this._windowStack.pop();
            // console.log("fuck last popup ", last);
            if (popup.hashIdx != last.hashIdx) {
                // console.log("fuck target is not last popup ");
                // 小概率发生
                this._windowStack.push(last);
                // 查找并删除
                let idx = -1;
                let cnt = this._windowStack.length;
                for (let i = 0; i < cnt; ++i) {
                    if (popup.hashIdx == this._windowStack[i].hashIdx) {
                        idx = i;
                        break;
                    }
                }
                if (idx >= 0) {
                    this._windowStack.splice(idx, 1);
                }
            }

            // console.log("fuck after remove popup: ", this._windowStack);
        }
    }

    export class LayerManager {
        private static _inst: LayerManager;
        private static _designWidth: number;
        private static _designHeight: number;

        private _mapLayer: fgui.GRoot;
        private _mainLayer: fgui.GRoot;
        private _windowLayer: fgui.GRoot;
        private _maskLayer: fgui.GRoot;
        private _topLayer: fgui.GRoot;
        private _layers: Array<fgui.GRoot>;

        constructor() {
            let stage = cc.director.getScene();

            this._mapLayer = new fgui.GRoot();
            this._mapLayer.node.name = this._mapLayer.name = "mapLayer";

            this._mainLayer = fgui.GRoot.inst;
            this._mainLayer.node.name = this._mainLayer.name = "mainLayer";

            this._windowLayer = new fgui.GRoot();
            this._windowLayer.node.name = this._windowLayer.name = "windowLayer";

            this._maskLayer = new fgui.GRoot();
            this._maskLayer.node.name = this._maskLayer.name = "maskLayer";

            this._topLayer = new fgui.GRoot();
            this._topLayer.node.name = this._topLayer.name = "topLayer";

            if (LayerManager._designWidth && LayerManager._designHeight) {
                this._mapLayer.setDesignSize(LayerManager._designWidth, LayerManager._designHeight);
                this._mainLayer.setDesignSize(LayerManager._designWidth, LayerManager._designHeight);
                this._windowLayer.setDesignSize(LayerManager._designWidth, LayerManager._designHeight);
                this._maskLayer.setDesignSize(LayerManager._designWidth, LayerManager._designHeight);
                this._topLayer.setDesignSize(LayerManager._designWidth, LayerManager._designHeight);
            }

            this._windowLayer.node.parent = stage;
            this._maskLayer.node.parent = stage;
            this._topLayer.node.parent = stage;
            this._mapLayer.node.parent = stage;

            this._mapLayer.node.setSiblingIndex(1);
            this._mainLayer.node.setSiblingIndex(2);
            this._windowLayer.node.setSiblingIndex(3);
            this._topLayer.node.setSiblingIndex(4);
            this._maskLayer.node.setSiblingIndex(5);


            this._topLayer.modalLayer.drawRect(0, cc.Color.TRANSPARENT, new cc.Color(0x0, 0x0, 0x0, 0x77));

            this._layers = [this._mapLayer, this._mainLayer, this._windowLayer, this._topLayer, this._maskLayer];
        }


        public static get inst(): LayerManager {
            if (!LayerManager._inst) {
                LayerManager._inst = new LayerManager();
            }
            return LayerManager._inst;
        }

        public static setDesignSize(width: number, height: number) {
            LayerManager._designWidth = width;
            LayerManager._designHeight = height;

            if (LayerManager._inst) {
                LayerManager._inst._mapLayer.setDesignSize(LayerManager._designWidth, LayerManager._designHeight);
                LayerManager._inst._mainLayer.setDesignSize(LayerManager._designWidth, LayerManager._designHeight);
                LayerManager._inst._windowLayer.setDesignSize(LayerManager._designWidth, LayerManager._designHeight);
                LayerManager._inst._maskLayer.setDesignSize(LayerManager._designWidth, LayerManager._designHeight);
                LayerManager._inst._topLayer.setDesignSize(LayerManager._designWidth, LayerManager._designHeight);
            }
        }

        public destroyAllLayer() {
            this.mapLayer.dispose();
            this.mainLayer.dispose();
            this.windowLayer.dispose();
            this.topLayer.dispose();
            this.maskLayer.dispose();
            LayerManager._inst = null;
        }

        public get mapLayer(): fgui.GRoot {
            return this._mapLayer;
        }

        public get mainLayer(): fgui.GRoot {
            return this._mainLayer;
        }

        public get windowLayer(): fgui.GRoot {
            return this._windowLayer;
        }

        public get maskLayer(): fgui.GRoot {
            return this._maskLayer;
        }

        public get topLayer(): fgui.GRoot {
            return this._topLayer;
        }

        //public getTopView(): BaseView | BaseWindow {
        //    for (let i = this._layers.length - 1; i >= 0; i--) {
        //        let layer = this._layers[i];
        //        let cnt: number = layer.numChildren;
        //        for (let j = cnt - 1; j >= 0; j--) {
        //            let v = layer.getChildAt(j);
        //            if (v instanceof BaseView) {
        //                return <BaseView>v;
        //            } else if (v instanceof BaseWindow) {
        //                if (v.name != ViewName.apkUpdateWnd) {
        //                    return <BaseWindow>v;
        //                }
        //            }
        //        }
        //    }
        //    return null;
        //}

        //从最高层必然可以得到任何的TouchPos
        public getTouchFromTopestLayer(touchId?: number) {
            return Core.LayerManager.inst._layers[this._layers.length - 1].getTouchPosition(touchId);
        }

        public setTouchbleFromTopest(b: boolean) {
            Core.LayerManager.inst._layers[this._layers.length - 1].touchable = b;
        }

        public visibleMainLayerChildren(b: boolean, except?: fgui.GObject[]) {
            this._mainLayer._children.forEach((c) => {
                if (!except || except.indexOf(c) < 0) {
                    c.visible = b;
                }
            })
        }

    }

}