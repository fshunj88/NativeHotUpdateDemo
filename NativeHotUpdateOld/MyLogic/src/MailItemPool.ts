class MailItemPool extends fgui.GObjectPool {
    //public count: number;
    public constructor() {
        super();
        this.count = MailItemPool._items.length;
    }
    public clear(): void {
    }

    public getObject(url: string): fgui.GObject {
        return MailItemPool._withDraw();
    }

    public returnObject(obj: fgui.GObject): void {
        MailItemPool._deposite(<MailItem>obj);
    }

    public static itemSize: cc.Size = cc.size(100,200);
    private static _items: MailItem[] = [];
    private static _initSize: number = 1;

    private static _createItem() {
        let item = fgui.UIPackage.createObject("VirtualList", "mailItem", MailItem).asCom as MailItem;
        if (this.itemSize == null) {
            this.itemSize = new cc.Size(item.width, item.height);
        }
        this._items.push(item);
    }

    public static initPool() {
        if (this._items.length > 0) return;
        for (let i = 0; i < this._initSize; ++i) {
            Core.FrameExecutor.inst.regist(this._createItem, this);
        }
        Core.FrameExecutor.inst.execute();
    }

    private static _withDraw(): MailItem {
        if (this._items.length <= 0) {
            return fgui.UIPackage.createObject("VirtualList", "mailItem", MailItem).asCom as MailItem;
        } else {
            return this._items.pop();
        }
    }

    private static _deposite(item: MailItem) {
        //item.resetData();
        this._items.push(item);
    }
}