namespace Collection {
    // Least Recently Used(1) 缓存
    export class LruCache<T> {
        private _size: number = 0;
        private _maxSize: number = 1;
        private _keyToObj: {[key: string]: T} = {};
        private _lruList: List<T>;
        private _toStr: (k: T) => string;
        private _onDestroy: (k: T) => void;

        public constructor(size: number, toStringFunc: (k: T) => string, onDestroyFunc: (k: T) => void) {
            this._maxSize = size;
            this._toStr = toStringFunc;
            this._onDestroy = onDestroyFunc;
            this._lruList = new List<T>(toStringFunc);
        }

        public get(k: string): T {
            return this._keyToObj[k];
        }

        public use(obj: T) {
            this._lruList.pushFront(obj);
            let key = this._toStr(obj);
            // console.log("[LruCache] use obj: ", key);
            if (!this._keyToObj[key]) {
                this._keyToObj[key] = obj;
                this._size ++;
                if (this._size > this._maxSize) {
                    this._tidy(this._size - this._maxSize);
                }
            }
        }

        private _tidy(cnt: number) {
            for (let i = 0; i < cnt; ++ i) {
                let obj = this._lruList.popBack();
                if (obj) {
                    this._onDestroy(obj);
                    delete this._keyToObj[this._toStr(obj)];
                    this._size --;
                    // console.log("[LruCache][tidy] delete obj: ", this._toStr(obj));
                }
            }
        }

        public clear(destroy: boolean = false) {
            this._size = 0;
            this._keyToObj = {};
            if (destroy) {
                this._lruList.forEach((obj: T) => {
                    this._onDestroy(obj);
                    // console.log("[LruCache][clear] delete obj: ", this._toStr(obj));
                });
            }
            this._lruList.clear();
        }
    }
}