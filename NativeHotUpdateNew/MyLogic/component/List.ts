/// <reference path="../fairygui/GComponent.ts" />
namespace UI {
    export enum ListOrientation {
        HORIZONTAL = 1,
        VERTICAL = 2
    }

    export enum ListType {
        NORMAL = 1,
        PAGE = 2, // TODO unsupported currently
    }

    interface IListConfig {
        orientation?: ListOrientation;
        type?: ListType;
        xalign?: fgui.AlignType;
        yalign?: fgui.VertAlignType;
        row?: number;
        rowGap?: number;
        col?: number;
        colGap?: number;
        itemSize: cc.Size;
        itemClass: typeof fgui.GObject;
        itemPool: fgui.GObjectPool;
        itemRenderer: (index: number, item: fgui.GObject) => void; 
        inertia?: boolean; // 惯性
        resilience?: boolean; // 回弹
        loop?: boolean; // 循环 TODO unsupported currently
    }

    class DragInfo {
        public start: cc.Vec2 = null;
        public last: cc.Vec2 = null;
        public cur: cc.Vec2 = null;
        public end: cc.Vec2 = null;

        public dragStart(pos: cc.Vec2) {
            this.start = pos;
            this.last = pos;
            this.cur = pos;
        }

        public dragMove(pos: cc.Vec2) {
            this.last = this.cur;
            this.cur = pos;
        }

        public dragEnd(pos: cc.Vec2) {
            this.end = pos;
        }

        public getDelta(): cc.Vec2 {
            return new cc.Vec2(this.cur.x - this.last.x, this.cur.y - this.last.y);
        }

        public cleanup() {
            this.start = null;
            this.end = null;
        }

        public minPos: cc.Vec2 = null;
        public maxPos: cc.Vec2 = new cc.Vec2(0, 0);
    }

    class ListItem {
        public width: number = 0;
        public height: number = 0;
        public row: number = -1;
        public col: number = -1;
        public obj: fgui.GObject = null;
        public index: number = -1;
        public expired: boolean = true;
        public pool: fgui.GObjectPool;
        public itemRenderer: (index: number, item: fgui.GObject) => void;
        public parent: fgui.GComponent;
        public orientation: ListOrientation = ListOrientation.VERTICAL;
        public hostList: VirtualList = null;
        public advance: number = 0;

        private _x: number = -1;
        private _y: number = -1;

        public setExpire(b: boolean) {
            if (this.expired == b) return;
            // console.log("[VList] ListItem setExpire: ", this.index, b);
            this.expired = b;
            if (b) {
                if (this.obj) {
                    this.obj.off(fgui.Event.CLICK, this._onClick, this);
                    this.obj.off(fgui.Event.TOUCH_BEGIN, this._onTouch, this);
                    this.parent.removeChild(this.obj);
                    this.pool.returnObject(this.obj);
                    this.obj = null;
                }
            } else {
                let t1 = new Date().getTime();
                this.obj = this.pool.getObject("");
                let t2 = new Date().getTime();
                // this.itemRenderer(this.index, this.obj);
                this._render();
                let t3 = new Date().getTime();
                this.hostList.profiler.getObject += t2 - t1;
                this.hostList.profiler.renderItem += t3 - t2;
                this.width = this.obj.width;
                this.height = this.obj.height;
                if (this._x >= 0 && this._y >= 0) {
                    this.obj.setPosition(this._x, this._y);
                }
                this.parent.addChild(this.obj);
                this.obj.on(fgui.Event.CLICK, this._onClick, this);
                this.obj.on(fgui.Event.TOUCH_BEGIN, this._onTouch, this);
            }
        }

        private _render() {
            this.obj.name = `$index_${this.index}`;
            this.itemRenderer(this.index, this.obj);
        }

        private _onClick(evt: fgui.Event) {
            if (this.hostList) {
                this.hostList.node.emit(fgui.Event.CLICK_ITEM, this.obj, evt);
            }
        }

        private _onTouch(evt: fgui.Event) {
            if (this.hostList) {
                this.hostList.node.emit(fgui.Event.TOUCH, this.obj, evt);
            }
        }

        public checkInView(vw: number, vh: number): boolean {
            let parent = this.parent;
            let px = parent.x, py = parent.y;
            // let advance = 20; // leave some gap to show advance
            // row gap or col gap is not considered here, cause we should have 'advance' any way
            if (this.orientation == ListOrientation.VERTICAL) {
                let my = 0;
                if (this.hostList) {
                    my = this.hostList.getTotalSizeToRowOrCol(this.row) + this.advance;
                } else {
                    my = this.row * (this.height + this.advance);
                }
                // console.log("[VList] checkInView index: ", this.index);
                // console.log("[VList]    checkInView my: ", my);
                // console.log("[VList]    checkInView py: ", py);
                // console.log("[VList]    checkInView this.height: ", this.height);
                // console.log("[VList]    checkInView vh: ", vh); 
                // console.log("[VList]    checkInView my + py + this.height: ", my + py + this.height);
                if (my + py + this.height > 0 && 
                    my + py < vh) {
                    return true;
                } else {
                    return false;
                }
            } else {
                let mx = 0;
                if (this.hostList) {
                    mx = this.hostList.getTotalSizeToRowOrCol(this.col) + this.advance;
                } else {
                    mx = this.col * (this.width + this.advance);
                }
                if (mx + px - this.width > 0 && 
                    mx + px < vw) {
                    return true;
                } else {
                    return false;
                }
            }
        }

        public set x(val: number) {
            this._x = val;
            if (this.obj) {
                this.obj.x = val;
            }
        }

        public get x(): number {
            return this._x;
        }

        public set y(val: number) {
            this._y = val;
            if (this.obj) {
                this.obj.y = val;
            }
        }

        public get y(): number {
            return this._y;
        }
    }

    // DONT support item size dynamic change after build 
    // AND all item MUST have the same size(not any more)
    // in consideration of rare need for that and effiency
    export class VirtualList extends fgui.GComponent {
        // private _parentObj: fgui.GComponent;
        private _conf: IListConfig;
        private _numItems: number;
        private _listItems: Array<ListItem>;
        private _dragInfo: DragInfo;
        private _itemHolder: fgui.GComponent;
        private _start: cc.Vec2;
        private _totalRow: number;
        private _totalCol: number;
        private _headCursor: number;
        private _tailCursor: number;
        private _rowOrCol2Size: {[key: number]: number};
        private _rowOrCol2TotalSize: {[key: number]: number};

        public profiler: {
            getObject: number,
            renderItem: number
        } = {getObject: 0, renderItem: 0};

        public constructor(parent: fgui.GComponent, holder: fgui.GObject) {
            super();
            this.name = "$vlist";
            // this._parentObj = parent;
            parent.addChild(this);
            holder.enabled = false;
            this.setPosition(holder.x, holder.y);
            this.setSize(holder.width, holder.height);
            this.addRelation(holder, fgui.RelationType.Width);
            this.addRelation(holder, fgui.RelationType.Height);
            this.displayListContainer.addComponent(cc.Mask);

            this._conf = {
                // default config
                orientation: ListOrientation.VERTICAL,
                type: ListType.NORMAL,
                xalign: fgui.AlignType.Center,
                yalign: fgui.VertAlignType.Middle,
                row: 1,
                rowGap: 10,
                col: 1,
                colGap: 10,
                itemSize: null,
                itemClass: fgui.GObject,
                itemPool: null,
                itemRenderer: null,
                inertia: true,
                resilience: true,
                loop: false,
            }
            this._numItems = 0;
            this._listItems = [];
            this._headCursor = -1;
            this._tailCursor = -1;

            this._dragInfo = new DragInfo();
            this._itemHolder = new fgui.GComponent();
            this._itemHolder.name = "$holder";
            this.addChild(this._itemHolder);
            this._itemHolder.setPosition(0, 0);
            this._itemHolder.setSize(0, 0);
            let self = this;
            this._itemHolder.hitTest = (globalPt: cc.Vec2): fgui.GObject => {
                let itemHolder = self._itemHolder;
                let pt: cc.Vec2 = itemHolder.node.convertToNodeSpaceAR(globalPt);
                pt.x += itemHolder.node.anchorX * itemHolder._width;
                pt.y += itemHolder.node.anchorY * itemHolder._height;
                pt.y = itemHolder.height - pt.y;
                // console.log("[VList] item holder hittest ", pt.x, pt.y);
                if (pt.x + itemHolder.x > 0 && pt.x + itemHolder.x < self.width
                    && pt.y + itemHolder.y > 0 && pt.y + itemHolder.y < self.height) {
                    let children = itemHolder._children;
                    let i = 0;
                    let numChildren = children.length;
                    for (; i < numChildren; ++ i) {
                        let target = children[i].hitTest(globalPt);
                        if (target) {
                            return target;
                        }
                    }
                    return null;
                } else {
                    return null;
                }
            }

            this._start = new cc.Vec2(0, 0);
            this._rowOrCol2Size = {};
            this._rowOrCol2TotalSize = {};
            this._itemHolder.on(fgui.Event.TOUCH_BEGIN, this._onDragStart, this);
            this._itemHolder.on(fgui.Event.TOUCH_MOVE, this._onDragMove, this);
            this._itemHolder.on(fgui.Event.TOUCH_END, this._onDragEnd, this);
            this._itemHolder.node.on(cc.Node.EventType.MOUSE_WHEEL, this._onMouseWheel, this);
            // this.on(fgui.Event.TOUCH_END, this._onDragEnd, this);
        }

        public getTotalSizeToRowOrCol(idx: number) {
            if (!this._rowOrCol2TotalSize[idx]) {
                let ret = 0;
                for (let i = 0; i < idx; ++ i) {
                    ret += this._rowOrCol2Size[i] || 0;
                    if (i > 0) {
                        if (this._conf.orientation == ListOrientation.VERTICAL) {
                            ret += this._conf.rowGap;
                        } else {
                            ret += this._conf.colGap;
                        }
                    }
                }
                this._rowOrCol2TotalSize[idx] = ret;
            }
            return this._rowOrCol2TotalSize[idx];
        }

        public enableEvent(b: boolean) {
            if (b) {
                this.node.resumeSystemEvents(true);
            } else {
                this.node.pauseSystemEvents(true);
            }
        }

        public getItem(index:number){
            return this._listItems[index];
        }

        public getLastItem() {
            return this._listItems[this._numItems - 1];
        }

        public set conf(conf: IListConfig) {
            let keys = Object.keys(conf);
            keys.forEach(k => {
                this._conf[k] = conf[k];
            });
            this._calcMetaInfo();
        }

        // calc info which can be calculated by specific configuration
        private _calcMetaInfo() {
            let conf = this._conf;
            let orientation = conf.orientation, itemSize = conf.itemSize;
            if (orientation == ListOrientation.VERTICAL) {
                let col = conf.col;
                let colGap = conf.colGap;
                // calc start x
                if (conf.xalign == fgui.AlignType.Center) {
                    this._start.x = (this.width - itemSize.width * col - colGap * (col - 1)) / 2;
                } else if (conf.xalign == fgui.AlignType.Left) {
                    this._start.x = 0;
                } else {
                    this._start.x = this.width - itemSize.width * col - colGap * (col - 1);
                }
                if (this._itemHolder.width == 0) {
                    this._itemHolder.setSize(this.width, 0);
                }
            } else {
                let row = conf.row;
                let rowGap = conf.rowGap;
                // calc start y
                if (conf.yalign == fgui.VertAlignType.Middle) {
                    this._start.y = (this.height - itemSize.height * row - rowGap * (row - 1)) / 2;
                } else if (conf.yalign == fgui.VertAlignType.Top) {
                    this._start.y = 0;
                } else {
                    this._start.y = this.height- itemSize.height * row - rowGap * (row - 1);
                }
                if (this._itemHolder.height == 0) {
                    this._itemHolder.setSize(0, this.height);
                }
            }
        }

        // calc info which can be calculated when numItems specified
        private _calcNumItemInfo() {
            let numItems = this._numItems;
            if (this._conf.orientation == ListOrientation.VERTICAL) {
                // calc total row
                this._totalRow = Math.ceil(numItems / this._conf.col);
                this._itemHolder.setSize(this.width, this._conf.itemSize.height * this._totalRow + this._conf.rowGap * (this._totalRow - 1));
                // calc min drag pos y
                this._dragInfo.minPos = new cc.Vec2(0, Math.min(0, - (this._itemHolder.height - this.height)));
            } else {
                // calc total col
                this._totalCol = Math.ceil(numItems / this._conf.row);
                this._itemHolder.setSize(this._conf.itemSize.width * this._totalCol + this._conf.colGap * (this._totalCol - 1), this.height);
                // calc min drag pos x
                this._dragInfo.minPos = new cc.Vec2(Math.min(0, - (this._itemHolder.width - this.width)), 0);
            }
            // console.log("[VList] item holder size: ", this._itemHolder.width, this._itemHolder.height);
        }

        private _expireItemsWithSameRowOrCol(item: ListItem, expired: boolean) {
            let orientation = this._conf.orientation;
            let itemSize = this._conf.itemSize;
            let self = this;

            function adjustPos(item: ListItem) {
                // calc position
                // once item position set, never set again
                if (item.x < 0 || item.y < 0) {
                    let rowOrColIdx = -1;
                    let itemWidthOrHeight = -1;
                    if (item.index == 0) {
                        // first
                        item.x = self._start.x;
                        item.y = self._start.y;
                        if (orientation == ListOrientation.VERTICAL) {
                            self._itemHolder.height += item.height - itemSize.height;
                            self._dragInfo.minPos.y = Math.min(0, - (self._itemHolder.height - self.height));
                            rowOrColIdx = item.row;
                            itemWidthOrHeight = item.height;
                        } else {
                            self._itemHolder.width += item.width - itemSize.width;
                            self._dragInfo.minPos.x = Math.min(0, - (self._itemHolder.width - self.width));
                            rowOrColIdx = item.col;
                            itemWidthOrHeight = item.width;
                        }
                    } else {
                        let prevItem = self._listItems[item.index - 1];
                        if (orientation == ListOrientation.VERTICAL) {
                            if (prevItem.row == item.row) {
                                item.x = prevItem.x + prevItem.width + self._conf.colGap;
                                item.y = prevItem.y;
                            } else {
                                // change row
                                item.x = self._start.x;
                                // item.y = prevItem.y + prevItem.height + self._conf.rowGap;
                                item.y = prevItem.y + self._rowOrCol2Size[prevItem.row] + self._conf.rowGap;
                                self._itemHolder.height += item.height - itemSize.height;
                                self._dragInfo.minPos.y = Math.min(0, - (self._itemHolder.height - self.height));
                            }
                            rowOrColIdx = item.row;
                            itemWidthOrHeight = item.height;
                        } else {
                            if (prevItem.col == item.col) {
                                item.x = prevItem.x;
                                item.y = prevItem.y + prevItem.height + self._conf.rowGap;
                            } else {
                                // change col 
                                // item.x = prevItem.x + prevItem.width + self._conf.colGap;
                                item.x = prevItem.x + self._rowOrCol2Size[prevItem.col] + self._conf.colGap;
                                item.y = self._start.y;
                                self._itemHolder.width += item.width - itemSize.width;
                                self._dragInfo.minPos.x = Math.min(0, - (self._itemHolder.width - self.width));
                            }
                            rowOrColIdx = item.col;
                            itemWidthOrHeight = item.width;
                        }
                    }
                    let size = self._rowOrCol2Size[rowOrColIdx] || 0;
                    self._rowOrCol2Size[rowOrColIdx] = Math.max(size, itemWidthOrHeight);
                }
            }

            function handle(idx: number) {
                let li = self._listItems[idx];
                if (!li) {
                    return false;
                }
                if (li.expired == false && expired == false) return true;
                if (orientation == ListOrientation.VERTICAL) {
                    if (li.row == item.row) {
                        li.setExpire(expired);
                        if (!expired) {
                            adjustPos(li);
                        }
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    if (li.col == item.col) {
                        li.setExpire(expired);
                        if (!expired) {
                            adjustPos(li);
                        }
                        return true;
                    } else {
                        return false;
                    }
                }
            }

            handle(item.index);

            if (orientation == ListOrientation.VERTICAL && this._conf.col == 1) return;
            else if (orientation == ListOrientation.HORIZONTAL && this._conf.row == 1) return;

            let i = item.index - 1;
            for (; i >= 0; -- i) {
                if (!handle(i)) {
                    break;
                }
            }
            i = item.index + 1;
            for (; i < this._numItems; ++ i) {
                if (!handle(i)) {
                    break;
                }
            }
        }

        private _checkList() {
            // this._checkListHead();
            // this._checkListTail();
            let orientation = this._conf.orientation;
            let vw = this.width;
            let vh = this.height;
            let itemSize = this._conf.itemSize;
            let realWidth = 0, realHeight = 0;
            let sizeDirty = false;
            let row = this._conf.row, col = this._conf.col;
            let numItems = this._numItems;
            let step = 0, step1;
            if (orientation == ListOrientation.VERTICAL) {
                step = col;
                step1 = this._totalRow;
            } else {
                step = row;
                step1 = this._totalCol;
            }
            function moveHeadForwardCursor(i) {
                return i + step;
            }
            function moveHeadBackwardCursor(i) {
                return i - step;
            }
            function moveTailForwardCursor(i) {
                return Math.min(numItems, i + step);
            }
            function moveTailBackwardCursor(i) {
                if (orientation == ListOrientation.VERTICAL) {
                    return Math.floor((i - col) / col) * (row - 1) + col;
                } else {
                    return Math.floor((i - row) / row) * (col - 1) + row; 
                }
            }

            if (this._headCursor < 0 || this._tailCursor < 0) {
                this._headCursor = this._tailCursor = 0;
                // initialize
                let i = 0;
                for (; i < this._numItems; ++ i) {
                    let li = this._listItems[i];
                    if (i == 0 || li.checkInView(vw, vh)) {
                        if (li.expired) {
                            this._expireItemsWithSameRowOrCol(li, false);
                        }
                        this._headCursor = Math.min(this._headCursor, i);
                        // move to next row or col
                        // tail cursor point to last in-view item
                        this._tailCursor = Math.max(this._tailCursor, i);
                        if (itemSize.width != li.width || itemSize.height != li.height) {
                            sizeDirty = true;
                            realWidth = li.width;
                            realHeight = li.height;
                        }
                        if (sizeDirty) {
                            let j = i, cnt = this._listItems.length;
                            for (; j < cnt; ++ j) {
                                let li = this._listItems[j];
                                li.width = realWidth;
                                li.height = realHeight;
                            }
                            sizeDirty = false;
                        }
                    } else {
                        break;
                    }
                }
                // console.log("[VList] checkList initialized itemSize = ", itemSize.width, itemSize.height);
                // console.log("[VList] checkList drag info = ", this._dragInfo);
            } else {
                // dragging
                // iterate items by the specific order several times
                // TODO efficiency optimize maybe

                // handle head cursor
                // firstly, from head to endian, break when encounter first not-in-view item
                let i1 = this._headCursor;
                for (; i1 < this._numItems;) {
                    let li = this._listItems[i1];
                    if (li.checkInView(vw, vh)) {
                        this._expireItemsWithSameRowOrCol(li, false);
                        this._headCursor = i1;
                        break;
                    } else {
                        this._expireItemsWithSameRowOrCol(li, true);
                        i1 = moveHeadForwardCursor(i1);
                    }
                }
                // secondly, from first step break point to beginning, break when
                // encounter first not-in-view item after in-view item  
                let firstHitInViewItem = false;
                let i2 = this._headCursor;
                for (; i2 >= 0;) {
                    let li = this._listItems[i2];
                    if (li.checkInView(vw, vh)) {
                        this._expireItemsWithSameRowOrCol(li, false);
                        this._headCursor = i2;
                        firstHitInViewItem = true;
                    } else {
                        this._expireItemsWithSameRowOrCol(li, true);
                        if (firstHitInViewItem) {
                            break;
                        }
                    }
                    i2 = moveHeadBackwardCursor(i2);
                }

                // handle tail cursor
                // firstly, from tail to beginning, break when encounter first not-in-view item
                let i3 = Math.floor(this._tailCursor / step) * step;
                for (; i3 >= 0;) {
                    let li = this._listItems[i3];
                    if (li.checkInView(vw, vh)) {
                        this._expireItemsWithSameRowOrCol(li, false);
                        this._tailCursor = Math.min(numItems - 1, i3 + step - 1);
                        break;
                    } else {
                        this._expireItemsWithSameRowOrCol(li, true);
                        i3 = moveHeadBackwardCursor(i3);
                    }
                }
                // secondly, from first step break point to endian, break when
                // encounter first not-in-view item after in-view item
                firstHitInViewItem = false;
                let i4 = Math.floor(this._tailCursor / step) * step;
                for (; i4 < this._numItems;) {
                    let li = this._listItems[i4];
                    if (li.checkInView(vw, vh)) {
                        this._expireItemsWithSameRowOrCol(li, false);
                        this._tailCursor = Math.min(numItems - 1, i4 + step - 1);
                        firstHitInViewItem = true;
                    } else {
                        this._expireItemsWithSameRowOrCol(li, true);
                        if (firstHitInViewItem) {
                            break;
                        }
                    }
                    i4 = moveHeadForwardCursor(i4);
                }
            }

            // console.log("[VList] checkList head = ", this._headCursor, ", tail = ", this._tailCursor);
        }

        public get numItems(): number {
            return this._numItems;
        }

        public set numItems(n: number) {
            if (!this._conf.itemRenderer) {
                throw Error("You have to provide item renderer callback func!!");
            }
            if (!this._conf.itemPool) {
                throw Error("You have to provide item pool object!!");
            }
            if (n < 0) {
                throw Error("are you kidding me?");
            }
            // console.log("[VList] set numItems ", n, this);
            if (this._numItems != n) {
                let conf = this._conf;
                let oldNum = this._listItems.length;
                this._numItems = n;
                let col = conf.col, row = conf.row;
                let isVertical = conf.orientation == ListOrientation.VERTICAL;
                if (oldNum < this._numItems) {
                    for (let i = oldNum; i < this._numItems; ++ i) {
                        let item = new ListItem();
                        item.width = conf.itemSize.width;
                        item.height = conf.itemSize.height;
                        item.pool = conf.itemPool;
                        item.parent = this._itemHolder;
                        item.index = i;
                        item.itemRenderer = conf.itemRenderer;
                        item.orientation = conf.orientation;
                        item.hostList = this;
                        if (isVertical) {
                            item.row = Math.floor(i / col);
                            item.col = i % col;
                            item.advance = this._conf.rowGap;
                        } else {
                            item.row = i % row;
                            item.col = Math.floor(i / row);
                            item.advance = this._conf.colGap;
                        }
                        this._listItems.push(item);
                    }
                } else {
                    for (let i = this._numItems; i < oldNum; ++ i) {
                        let item = this._listItems[i];
                        if (item) {
                            item.setExpire(true);
                            item.x = -1;
                            item.y = -1;
                        }
                    }
                    if (this._numItems == 0) {
                        this._reset();
                        return;
                    }
                }
                this._calcNumItemInfo();
                this._checkList();
            }
        }

        private _reset() {
            this._listItems = [];
            this._headCursor = this._tailCursor = -1;
            this._itemHolder.setPosition(0, 0);
            this._dragInfo.minPos = null;
            this.profiler.getObject = this.profiler.renderItem = 0;
            this._rowOrCol2Size = {};
            this._rowOrCol2TotalSize = {};
        }

        private _onMouseWheel(evt: cc.Event.EventMouse) {
            console.log("virtual list mouse wheel1", evt);
            let scroll = evt.getScrollY()/Math.abs(evt.getScrollY()) * 120  * 0.10;
            this._moveListByOffset(new cc.Vec2(0, scroll));
            this._rollBack();
            evt.stopPropagation();
        }

        private _onDragStart(evt: fgui.Event) {
            let touch = evt.touch;
            if (this.numItems <= 0 || !touch) return;
            this._dragInfo.dragStart(touch.getLocation());
            evt.captureTouch();
            egret.Tween.removeTweens(this._itemHolder);
        }

        private _moveListByOffset(offset: cc.Vec2) {
            if (this._conf.orientation == ListOrientation.VERTICAL) {
                let diffy = - offset.y / fgui.GRoot.contentScaleFactor;
                if (diffy != 0) {
                    if (this._conf.resilience) {
                        let y = this._itemHolder.y + diffy; 
                        if (y > this._dragInfo.maxPos.y) {
                            this._itemHolder.y = this._itemHolder.y + diffy / 3;
                        } else if (y < this._dragInfo.minPos.y) {
                            this._itemHolder.y = this._itemHolder.y + diffy / 3;
                        } else {
                            this._itemHolder.y = y;
                            this._checkList();
                        }
                    } else {
                        let y = this._itemHolder.y + diffy;
                        this._itemHolder.y = Math.min(Math.max(this._dragInfo.minPos.y, y), this._dragInfo.maxPos.y);
                        this._checkList();
                    }
                }
            } else {
                let diffx = - offset.x / fgui.GRoot.contentScaleFactor;
                if (diffx != 0) {
                    if (this._conf.resilience) {
                        let x = this._itemHolder.y + diffx; 
                        if (x > this._dragInfo.maxPos.x) {
                            this._itemHolder.x = this._itemHolder.x + diffx / 3; 
                        } else if (x < this._dragInfo.minPos.y) {
                            this._itemHolder.x = this._itemHolder.x + diffx / 3;
                        } else {
                            this._itemHolder.x = x;
                            this._checkList();
                        }
                    } else {
                        let x = this._itemHolder.x + diffx;
                        this._itemHolder.x = Math.min(Math.max(this._dragInfo.minPos.x, x), this._dragInfo.maxPos.x);
                        this._checkList();
                    }
                }
            }
        }

        private _onDragMove(evt: fgui.Event) {
            let touch = evt.touch
            if (this.numItems <= 0 || !touch) return;
            this._dragInfo.dragMove(touch.getLocation());
            this._moveListByOffset(this._dragInfo.getDelta());
        }

        private _onDragEnd(evt: fgui.Event) {
            let touch = evt.touch;
            if (this.numItems <= 0 || !touch) return;
            this._dragInfo.dragEnd(touch.getLocation());
            this._rollBack();
            this._dragInfo.cleanup();
        }

        private _rollBack() {
            if (this._conf.resilience) {
                if (this._conf.orientation == ListOrientation.VERTICAL) {
                    let y = this._itemHolder.y; 
                    if (y > this._dragInfo.maxPos.y) {
                        egret.Tween.get(this._itemHolder).to({y: this._dragInfo.maxPos.y}, 100);
                    } else if (y < this._dragInfo.minPos.y) {
                        egret.Tween.get(this._itemHolder).to({y: this._dragInfo.minPos.y}, 100);
                    }
                } else {
                    let x = this._itemHolder.x; 
                    if (x > this._dragInfo.maxPos.x) {
                        egret.Tween.get(this._itemHolder).to({x: this._dragInfo.maxPos.x}, 100);
                    } else if (x < this._dragInfo.minPos.x) {
                        egret.Tween.get(this._itemHolder).to({x: this._dragInfo.minPos.x}, 100);
                    }
                }
            }
        }

        public scrollToView(idx: number) {
            if (this.numItems <= 0) return;
            let targetCursor = 0, maxTailCursor = this._numItems - 1, orientation = this._conf.orientation;
            if (orientation == ListOrientation.VERTICAL) {
                targetCursor = idx / this._conf.col;
            } else {
                targetCursor = idx / this._conf.row;
            }
            this._checkList();
            if (this._headCursor < targetCursor) {
                while (this._headCursor < targetCursor && this._tailCursor < maxTailCursor) {
                    // console.log("======= ", this._headCursor, this._tailCursor, idx);
                    // take head cursor item, get width/height and move
                    let item = this._listItems[this._headCursor];
                    if (orientation == ListOrientation.VERTICAL) {
                        this._moveListByOffset(cc.v2(0, (item.height + this._conf.rowGap) * fgui.GRoot.contentScaleFactor));
                    } else {
                        this._moveListByOffset(cc.v2((item.width + this._conf.colGap) * fgui.GRoot.contentScaleFactor, 0));
                    }
                    this._checkList();
                    // console.log("=======        ", item.height * fgui.GRoot.contentScaleFactor, this._headCursor, this._tailCursor, idx);
                }
                if (this._tailCursor == maxTailCursor && idx == maxTailCursor) {
                    // move to end already, just move to bottom
                    if (orientation == ListOrientation.VERTICAL) {
                        this._itemHolder.y = this._dragInfo.minPos.y;
                    } else {
                        this._itemHolder.x = this._dragInfo.minPos.x;
                    }
                }
            } else if (this._headCursor > targetCursor) {
                while (this._headCursor > targetCursor && this._headCursor > 0) {
                    // console.log("======= ", this._headCursor, this._tailCursor, idx);
                    // take head cursor item, get width/height and move
                    let item = this._listItems[this._headCursor - 1];
                    if (orientation == ListOrientation.VERTICAL) {
                        this._moveListByOffset(cc.v2(0, -(item.height + this._conf.rowGap) * fgui.GRoot.contentScaleFactor));
                    } else {
                        this._moveListByOffset(cc.v2(-(item.width + this._conf.colGap) * fgui.GRoot.contentScaleFactor, 0));
                    }
                    this._checkList();
                    // console.log("=======        ", item.height * fgui.GRoot.contentScaleFactor, this._headCursor, this._tailCursor, idx);
                }
                if (this._headCursor == 0) {
                    if (orientation == ListOrientation.VERTICAL) {
                        this._itemHolder.y = this._dragInfo.maxPos.y;
                    } else {
                        this._itemHolder.x = this._dragInfo.maxPos.x;
                    }
                } else if (this._headCursor == targetCursor) {
                    if (orientation == ListOrientation.VERTICAL) {
                        let y = this._listItems[targetCursor].y;
                        let offset = this._itemHolder.y + y;
                        this._moveListByOffset(cc.v2(0, offset * fgui.GRoot.contentScaleFactor));
                    } else {
                        let x = this._listItems[targetCursor].x;
                        let offset = this._itemHolder.x + x;
                        this._moveListByOffset(cc.v2(offset * fgui.GRoot.contentScaleFactor, 0));
                    }
                    this._checkList();
                }
            } else {
                if (orientation == ListOrientation.VERTICAL) {
                    let y = this._listItems[targetCursor].y;
                    let offset = this._itemHolder.y + y;
                    this._moveListByOffset(cc.v2(0, offset * fgui.GRoot.contentScaleFactor));
                } else {
                    let x = this._listItems[targetCursor].x;
                    let offset = this._itemHolder.x + x;
                    this._moveListByOffset(cc.v2(offset * fgui.GRoot.contentScaleFactor, 0));
                }
                this._checkList();
            }

            
        }

        private _cleanupItems() {
            this._listItems.forEach(item => {
                item.setExpire(true);
            });
            this._listItems = [];
            this._tailCursor = this._headCursor = 0;
            this.profiler.getObject = this.profiler.renderItem = 0;
        }

        public dispose() {
            this._cleanupItems();
            super.dispose();
        }
    }
}