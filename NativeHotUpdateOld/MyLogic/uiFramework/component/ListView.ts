namespace Core {

    export interface ILayerObject {
        object: fgui.GObject;
        offsetx: number;
        offsety: number;
    }

    export interface ILayerItem {
        layerCnt: number;
        getLayerByIndex(idx: number): ILayerObject;
        getSize(): cc.Size;
        getNode(): fgui.GObject;
        refresh(): void;
        registerOnAddLayer(callback: (layer: ILayerObject) => void): void;
        dispose(): void;
    }

    class ListItem {
        public item: ILayerItem;
        public layers: Array<ILayerObject>;
        public index: number;
        public x: number;
        public y: number;

        public updatePosition() {
            if (!this.layers) {
                return;
            }
            this.layers.forEach(layer => {
                layer.object.setPosition(this.x + layer.offsetx, this.y + layer.offsety); 
            })
        }

        public getNode(): fgui.GObject {
            return this.item.getNode();
        }

        public registerOnAddLayer(callback: (layer: ILayerObject, item: ListItem) => void) {
            let self = this;
            this.item.registerOnAddLayer((layer: ILayerObject) => {
                this.layers.push(layer);
                callback(layer, self);
            });
        }

        public dispose() {
            this.layers = [];
            this.item.dispose();
        }
    }

    export class LayerListView {
        private _list: fgui.GList = null;
        private _items: Array<ListItem> = null;
        private _contentCom: fgui.GComponent = null;
        private _meta: any;

        private _isAdding: boolean;
        private _addItems: Array<Array<ILayerItem>> = null;
        private _isDeling: boolean;
        private _delItems: Array<ListItem> = null;

        public constructor(list: fgui.GList) {
            this._list = list;
            this._meta = {
                xgap: list.columnGap,
                xcnt: list.columnCount,
                ygap: list.lineGap,
                ycnt: list.lineCount,
                gindex: 0,
            }
            list.columnCount = 1;
            list.columnGap = 0;
            list.lineCount = 1;
            list.lineGap = 0;
            list.layout = fgui.ListLayoutType.SingleRow;
            this._items = [];
            this._addItems = [];
            this._delItems = [];
            // console.log("fuck === ", this._meta);
        }

        public async addItems(items: Array<ILayerItem>) {
            if (!items || items.length <= 0) {
                return;
            }

            if (!this._list) {
                return;
            }

            if (!this._contentCom) {
                this._contentCom = new fgui.GComponent();
                this._list.addChild(this._contentCom);
            }
            if (this._isAdding || this._addItems.length > 0) {
                this._addItems.push(items);
                return;
            }
            this._isAdding = true;
            let list = this._list;
            let xgap = this._meta.xgap;
            let ygap = this._meta.ygap;
            let xcnt = this._meta.xcnt;

            let size = items[0].getSize();

            // xgap = (list.width - xcnt * size.width) /  (xcnt - 1);

            // let startx = 0;
            // let startx = (list.width % (size.width + xgap) + xgap) / 2;
            let startx = (list.width - size.width * xcnt - xgap * (xcnt - 1)) / 2;
            let starty = 0;
            let zeroX = startx;
            if (this._items.length > 0) {
                let startItem = this._items[this._items.length - 1];
                startx = startItem.x + size.width + xgap;
                starty = startItem.y;
                
                if (startx + size.width >= list.width) {
                    startx = zeroX;
                    starty = starty + size.height + ygap;
                }
            }

            let x = startx;
            let y = starty;

            let tempItems: ListItem[] = [];
            let layerCnt = items[0].layerCnt;
            let self = this;
            let t1 = new Date().getTime();
            items.forEach(item => {
                let listItem = new ListItem();
                listItem.index = this._meta.gindex ++;
                listItem.item = item;
                listItem.x = x;
                listItem.y = y;
                listItem.layers = [];
                // let i = 0;
                // for (; i < layerCnt; ++ i) {
                //     let layer = item.getLayerByIndex(i);
                //     if (layer) {
                //         listItem.layers.push(layer);
                //     }
                // }
                listItem.registerOnAddLayer(self.onItemAddLayer.bind(this));
                tempItems.push(listItem);
                x = x + size.width + xgap;
                if (x + size.width >= list.width) {
                    x = zeroX;
                    y = y + size.height + ygap;
                }
            });
            let t2 = new Date().getTime();
            let i = 0;
            for (; i < layerCnt; ++ i) {
                tempItems.forEach(listItem => {
                    let layer = listItem.item.getLayerByIndex(i);
                    // let layer = listItem.layers[i];
                    if (layer) {
                        listItem.layers.push(layer);
                        if(self._contentCom){
                            self._contentCom.addChild(layer.object);
                            layer.object.setPosition(listItem.x + layer.offsetx, listItem.y + layer.offsety); 
                        }
                    }
                });
                await fgui.GTimers.inst.waitTime(1);
            };
            if(!self._contentCom){
                return;
            }
            this._items = this._items.concat(tempItems);
            let t3 = new Date().getTime();
            console.log("------------- gen time: ", t2 - t1, ", add time: ", t3 - t2);

            // 调整大小
            let contentWidth = 0,
                contentHeight = 0;
            let curItemCnt = this._items.length;
            if (curItemCnt >= xcnt) {
                contentWidth = list.width;
            } else {
                contentWidth = curItemCnt * size.width + (curItemCnt - 1) * xgap;
            }
            let curLineCnt = Math.ceil(curItemCnt / xcnt);
            contentHeight = curLineCnt * size.height + (curLineCnt - 1) * ygap;
            this._contentCom.setSize(contentWidth, contentHeight);
            // this._contentCom.ensureBoundsCorrect();
            // this._list.ensureBoundsCorrect();
            this._list.setBoundsChangedFlag();

            // console.log("fuck ------- ", list.height, curLineCnt, this._contentCom.width, this._contentCom.height);
            items.forEach(item => {
                item.refresh();
            });
            this._isAdding = false;
            if (this._addItems.length > 0) {
                let _items = this._addItems.shift();
                await this.addItems(_items);
            }
        }

        public delItem(item: ListItem) {
            if (!this._items) {
                return;
            }
            if (!this._list) {
                return;
            }
            if (this._items.indexOf(item) < 0) {
                if (this._delItems.length > 0) {
                    let item = this._delItems.shift();
                    this.delItem(item);
                }
                return;
            }
            if (this._isDeling || this._delItems.length > 0) {
                this._delItems.push(item);
                return;
            }
            this._isDeling = true;
            let index = this._items.length - 1;
            // this._items.splice()
            for(; index > item.index; index --) {
                let curItem = this._items[index];
                let frontItem = this._items[index - 1];
                curItem.index = frontItem.index;
                curItem.x = frontItem.x;
                curItem.y = frontItem.y;
                curItem.updatePosition();
            }
            //del item
            this._items.splice(item.index, 1);
            let layers = item.layers;
            if (this._contentCom) {
                let i = layers.length - 1;
                for (; i >= 0; i--) {
                    let layer = layers[i];
                    if (layer) {
                        this._contentCom.removeChild(layer.object);
                    }
                }
            }
            item.dispose();
            item = null;
            this._contentCom.ensureBoundsCorrect();
            this._list.ensureBoundsCorrect();
            this._list.setBoundsChangedFlag();
            this._meta.gindex --;
            this._isDeling = false;
            if (this._delItems.length > 0) {
                let item = this._delItems.shift();
                this.delItem(item);
                
            }
        }

        public getItemAt(index: number): ListItem {
            return this._items[index];
            // return null;
        }

        public get numItems() {
            return this._items.length;
        }

        public onItemAddLayer(layer: ILayerObject, item: ListItem) {
            if (layer) {
                this._contentCom.addChild(layer.object);
                layer.object.setPosition(item.x + layer.offsetx, item.y + layer.offsety); 
            }
        }

        public clearAll() {
            if (this._items.length > 0) {
                this._items.forEach(item => {
                    item.dispose();
                });
            }
            this._items = [];
            this._list.removeChildren(0, -1, true);
            this._contentCom = null;
        }
    }
}
