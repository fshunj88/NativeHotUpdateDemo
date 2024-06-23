//namespace fgui {
//
//    export class AsyncOperation {
//        public callback: (obj: GObject) => void;
//
//        private _node: cc.Node;
//
//        public createObject(pkgName: string, resName: string): void {
//            if (this._node)
//                throw 'Already running';
//
//            var pkg: UIPackage = UIPackage.getByName(pkgName);
//            if (pkg) {
//                var pi: PackageItem = pkg.getItemByName(resName);
//                if (!pi)
//                    throw new Error("resource not found: " + resName);
//
//                this.internalCreateObject(pi);
//            }
//            else
//                throw new Error("package not found: " + pkgName);
//        }
//
//        public createObjectFromURL(url: string): void {
//            if (this._node)
//                throw 'Already running';
//
//            var pi: PackageItem = UIPackage.getItemByURL(url);
//            if (pi)
//                this.internalCreateObject(pi);
//            else
//                throw new Error("resource not found: " + url);
//        }
//
//        public cancel(): void {
//            if (this._node) {
//                this._node.destroy();
//                this._node = null;
//            }
//        }
//
//        private internalCreateObject(item: PackageItem): void {
//            this._node = new cc.Node("[AsyncCreating:" + item.name + "]");
//            this._node.parent = cc.director.getScene();
//            this._node.on("#", this.completed, this);
//            this._node.addComponent(AsyncOperationRunner).init(item);
//        }
//
//        private completed(result: GObject): void {
//            this.cancel();
//
//            if (this.callback)
//                this.callback(result);
//        }
//    }
//
//    class AsyncOperationRunner extends cc.Component {
//
//        private _itemList: Array<DisplayListItem>;
//        private _objectPool: Array<GObject>;
//        private _index: number;
//
//        public constructor() {
//            super();
//
//            this._itemList = new Array<DisplayListItem>();
//            this._objectPool = new Array<GObject>();
//        }
//
//        public init(item: PackageItem): void {
//            this._itemList.length = 0;
//            this._objectPool.length = 0;
//
//            var di: DisplayListItem = new DisplayListItem(item, 0);
//            di.childCount = this.collectComponentChildren(item);
//            this._itemList.push(di);
//
//            this._index = 0;
//        }
//
//        protected onDestroy(): void {
//            this._itemList.length = 0;
//            var cnt: number = this._objectPool.length;
//            if (cnt > 0) {
//                for (var i: number = 0; i < cnt; i++)
//                    this._objectPool[i].dispose();
//                this._objectPool.length = 0;
//            }
//        }
//
//        private collectComponentChildren(item: PackageItem): number {
//            var buffer: ByteBuffer = item.rawData;
//            buffer.seek(0, 2);
//
//            var di: DisplayListItem;
//            var pi: PackageItem;
//            var i: number;
//            var dataLen: number;
//            var curPos: number;
//            var pkg: UIPackage;
//
//            var dcnt: number = buffer.readShort();
//            for (i = 0; i < dcnt; i++) {
//                dataLen = buffer.readShort();
//                curPos = buffer.position;
//
//                buffer.seek(curPos, 0);
//
//                var type: number = buffer.readByte();
//                var src: string = buffer.readS();
//                var pkgId: string = buffer.readS();
//
//                buffer.position = curPos;
//
//                if (src != null) {
//                    if (pkgId != null)
//                        pkg = UIPackage.getById(pkgId);
//                    else
//                        pkg = item.owner;
//
//                    pi = pkg != null ? pkg.getItemById(src) : null;
//                    di = new DisplayListItem(pi, type);
//
//                    if (pi != null && pi.type == PackageItemType.Component)
//                        di.childCount = this.collectComponentChildren(pi);
//                }
//                else {
//                    di = new DisplayListItem(null, type);
//                    if (type == ObjectType.List) //list
//                        di.listItemCount = this.collectListChildren(buffer);
//                }
//
//                this._itemList.push(di);
//                buffer.position = curPos + dataLen;
//            }
//
//            return dcnt;
//        }
//
//        private collectListChildren(buffer: ByteBuffer): number {
//            buffer.seek(buffer.position, 8);
//
//            var listItemCount: number = 0;
//            var i: number;
//            var nextPos: number;
//            var url: string;
//            var pi: PackageItem;
//            var di: DisplayListItem;
//            var defaultItem: string = buffer.readS();
//            var itemCount: number = buffer.readShort();
//
//            for (i = 0; i < itemCount; i++) {
//                nextPos = buffer.readShort();
//                nextPos += buffer.position;
//
//                url = buffer.readS();
//                if (url == null)
//                    url = defaultItem;
//                if (url) {
//                    pi = UIPackage.getItemByURL(url);
//                    if (pi != null) {
//                        di = new DisplayListItem(pi, pi.objectType);
//                        if (pi.type == PackageItemType.Component)
//                            di.childCount = this.collectComponentChildren(pi);
//
//                        this._itemList.push(di);
//                        listItemCount++;
//                    }
//                }
//                buffer.position = nextPos;
//            }
//
//            return listItemCount;
//        }
//
//        protected update(): void {
//            var obj: GObject;
//            var di: DisplayListItem;
//            var poolStart: number;
//            var k: number;
//            var t: number = ToolSet.getTime();
//            var frameTime: number = UIConfig.frameTimeForAsyncUIConstruction;
//            var totalItems: number = this._itemList.length;
//
//            while (this._index < totalItems) {
//                di = this._itemList[this._index];
//                if (di.packageItem != null) {
//                    obj = UIObjectFactory.newObject(di.packageItem);
//                    this._objectPool.push(obj);
//
//                    UIPackage._constructing++;
//                    if (di.packageItem.type == PackageItemType.Component) {
//                        poolStart = this._objectPool.length - di.childCount - 1;
//
//                        (<GComponent><any>obj).constructFromResource2(this._objectPool, poolStart);
//
//                        this._objectPool.splice(poolStart, di.childCount);
//                    }
//                    else {
//                        obj.constructFromResource();
//                    }
//                    UIPackage._constructing--;
//                }
//                else {
//                    obj = UIObjectFactory.newObject2(di.type);
//                    this._objectPool.push(obj);
//
//                    if (di.type == ObjectType.List && di.listItemCount > 0) {
//                        poolStart = this._objectPool.length - di.listItemCount - 1;
//
//                        for (k = 0; k < di.listItemCount; k++) //把他们都放到pool里，这样GList在创建时就不需要创建对象了
//                            (<GList><any>obj).itemPool.returnObject(this._objectPool[k + poolStart]);
//
//                        this._objectPool.splice(poolStart, di.listItemCount);
//                    }
//                }
//
//                this._index++;
//                if ((this._index % 5 == 0) && ToolSet.getTime() - t >= frameTime)
//                    return;
//            }
//
//            var result: GObject = this._objectPool[0];
//            this._itemList.length = 0;
//            this._objectPool.length = 0;
//
//            this.node.emit("#", result);
//        }
//    }
//
//    class DisplayListItem {
//        public packageItem: PackageItem;
//        public type: ObjectType;
//        public childCount: number;
//        public listItemCount: number;
//
//        public constructor(packageItem: PackageItem, type: ObjectType) {
//            this.packageItem = packageItem;
//            this.type = type;
//        }
//    }
//}
namespace fgui {

    export class AsyncOperation {
        public callback: (obj: GObject) => void;

        private _runner: AsyncOperationRunner = null;

        private static _asyncRunners: Array<AsyncOperationRunner> = [];

        public static updateRunners() {
            if (this._asyncRunners.length <= 0) {
                return;
            }
            let rest = [];
            var i = 0;
            var cnt = this._asyncRunners.length;
            for (; i < cnt; ++i) {
                var runner = this._asyncRunners[i];
                if (!runner.update()) {
                    rest.push(runner);
                }
            }
            this._asyncRunners.length = 0;
            this._asyncRunners = rest;
        }

        public createObject(pkgName: string, resName: string, userClass: any = null): void {
            if (this._runner)
                throw 'Already running';

            var pkg: UIPackage = UIPackage.getByName(pkgName);
            if (pkg) {
                var pi: PackageItem = pkg.getItemByName(resName);
                if (!pi)
                    throw new Error("resource not found: " + resName);

                this.internalCreateObject(pi, userClass, resName);
            }
            else
                throw new Error("package not found: " + pkgName);
        }

        public createObjectFromURL(url: string): void {
            if (this._runner)
                throw 'Already running';

            var pi: PackageItem = UIPackage.getItemByURL(url);
            if (pi)
                this.internalCreateObject(pi, null, url);
            else
                throw new Error("resource not found: " + url);
        }

        public cancel(): void {
            // if (this._node) {
            //     this._node.destroy();
            //     this._node = null;
            // }
            if (this._runner) {
                this._runner.onDestroy();
                this._runner = null;
            }
        }

        private internalCreateObject(item: PackageItem, userClass: any = null, name: string): void {
            // this._node = new cc.Node("[AsyncCreating:" + item.name + "]");
            // this._node.parent = cc.director.getScene();
            // this._node.on("#", this.completed, this);
            // this._node.addComponent(AsyncOperationRunner).init(item, userClass);
            this._runner = new AsyncOperationRunner();
            this._runner.init(item, this, userClass, name);
            AsyncOperation._asyncRunners.push(this._runner);
        }

        public completed(result: GObject): void {
            if (this.callback) {
                this.callback(result);
            }
            this.cancel();
        }
    }

    class AsyncOperationRunner {

        private _itemList: Array<DisplayListItem>;
        private _objectPool: Array<GObject>;
        private _index: number;
        private _host: AsyncOperation;

        public constructor() {
            this._itemList = new Array<DisplayListItem>();
            this._objectPool = new Array<GObject>();
            this._host = null;
        }

        public init(item: PackageItem, host: AsyncOperation, userClass: any = null, name: string): void {
            this._itemList.length = 0;
            this._objectPool.length = 0;
            this._host = host;
            var di: DisplayListItem = new DisplayListItem(item, 0);
            di.userClass = userClass;
            di.name = name;
            di.childCount = this.collectComponentChildren(item);
            this._itemList.push(di);

            this._index = 0;
        }

        public onDestroy(): void {
            this._itemList.length = 0;
            var cnt: number = this._objectPool.length;
            if (cnt > 0) {
                for (var i: number = 0; i < cnt; i++)
                    this._objectPool[i].dispose();
                this._objectPool.length = 0;
            }
        }

        private collectComponentChildren(item: PackageItem): number {
            var buffer: ByteBuffer = item.rawData;
            buffer.seek(0, 2);

            var di: DisplayListItem;
            var pi: PackageItem;
            var i: number;
            var dataLen: number;
            var curPos: number;
            var pkg: UIPackage;

            var dcnt: number = buffer.readShort();
            for (i = 0; i < dcnt; i++) {
                dataLen = buffer.readShort();
                curPos = buffer.position;

                buffer.seek(curPos, 0);

                var type: number = buffer.readByte();
                var src: string = buffer.readS();
                var pkgId: string = buffer.readS();

                buffer.position = curPos;

                if (src != null) {
                    if (pkgId != null)
                        pkg = UIPackage.getById(pkgId);
                    else
                        pkg = item.owner;

                    pi = pkg != null ? pkg.getItemById(src) : null;
                    di = new DisplayListItem(pi, type);

                    if (pi != null && pi.type == PackageItemType.Component)
                        di.childCount = this.collectComponentChildren(pi);
                }
                else {
                    di = new DisplayListItem(null, type);
                    if (type == ObjectType.List) //list
                        di.listItemCount = this.collectListChildren(buffer);
                }

                this._itemList.push(di);
                buffer.position = curPos + dataLen;
            }

            return dcnt;
        }

        private collectListChildren(buffer: ByteBuffer): number {
            buffer.seek(buffer.position, 8);

            var listItemCount: number = 0;
            var i: number;
            var nextPos: number;
            var url: string;
            var pi: PackageItem;
            var di: DisplayListItem;
            var defaultItem: string = buffer.readS();
            var itemCount: number = buffer.readShort();

            for (i = 0; i < itemCount; i++) {
                nextPos = buffer.readShort();
                nextPos += buffer.position;

                url = buffer.readS();
                if (url == null)
                    url = defaultItem;
                if (url) {
                    pi = UIPackage.getItemByURL(url);
                    if (pi != null) {
                        di = new DisplayListItem(pi, pi.objectType);
                        if (pi.type == PackageItemType.Component)
                            di.childCount = this.collectComponentChildren(pi);

                        this._itemList.push(di);
                        listItemCount++;
                    }
                }
                buffer.position = nextPos;
            }

            return listItemCount;
        }

        public update(): boolean {
            var obj: GObject;
            var di: DisplayListItem;
            var poolStart: number;
            var k: number;
            var t: number = ToolSet.getTime();
            var frameTime: number = UIConfig.frameTimeForAsyncUIConstruction;
            var totalItems: number = this._itemList.length;

            while (this._index < totalItems) {
                di = this._itemList[this._index];
                if (di.packageItem != null) {
                    if (di.userClass) {
                        obj = new di.userClass();
                    } else {
                        obj = UIObjectFactory.newObject(di.packageItem);
                    }
                    obj.packageItem = di.packageItem;
                    obj.name = di.name;
                    this._objectPool.push(obj);

                    UIPackage._constructing++;
                    if (di.packageItem.type == PackageItemType.Component) {
                        poolStart = this._objectPool.length - di.childCount - 1;

                        (<GComponent><any>obj).constructFromResource2(this._objectPool, poolStart);

                        this._objectPool.splice(poolStart, di.childCount);
                    }
                    else {
                        obj.constructFromResource();
                    }
                    UIPackage._constructing--;
                }
                else {
                    obj = UIObjectFactory.newObject2(di.type);
                    this._objectPool.push(obj);

                    if (di.type == ObjectType.List && di.listItemCount > 0) {
                        poolStart = this._objectPool.length - di.listItemCount - 1;

                        for (k = 0; k < di.listItemCount; k++) //把他们都放到pool里，这样GList在创建时就不需要创建对象了
                            (<GList><any>obj).itemPool.returnObject(this._objectPool[k + poolStart]);

                        this._objectPool.splice(poolStart, di.listItemCount);
                    }
                }

                this._index++;
                if ((this._index % 5 == 0) && ToolSet.getTime() - t >= frameTime)
                    return false;
            }

            var result: GObject = this._objectPool[0];
            this._itemList.length = 0;
            this._objectPool.length = 0;

            // this.node.emit("#", result);
            if (this._host) {
                this._host.completed(result);
            }
            return true;
        }
    }

    class DisplayListItem {
        public packageItem: PackageItem;
        public type: ObjectType;
        public userClass: any = null;
        public childCount: number;
        public listItemCount: number;
        public name: string;

        public constructor(packageItem: PackageItem, type: ObjectType) {
            this.packageItem = packageItem;
            this.type = type;
        }
    }
}
