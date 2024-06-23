///<reference path="../../egret/EventDispatcher.ts"/>
namespace Core {

	class BindingItem {
		public _id: number;
		public _callback: (value: any) => void;
		public _thisArg: any;
		public _watch: Core.Watcher;

		public static _gId: number = 0;
	}

	export class BindingDelegate extends egret.EventDispatcher {
		private _watchers: Collection.Dictionary<string, Collection.Dictionary<number, BindingItem>>;

		public constructor() {
			super();
			this._watchers = new Collection.Dictionary<string, Collection.Dictionary<number, BindingItem>>();
		}

		public watchProp(prop: string, callback: (value: any) => void, thisArg: any) {
			if (!this._watchers.containsKey(prop)) {
				this._watchers.setValue(prop, new Collection.Dictionary<number, BindingItem>());
			} else {
			}
			let items = this._watchers.getValue(prop);
			let item = new BindingItem();
			item._id = ++ BindingItem._gId;
			item._callback = callback;
			item._thisArg = thisArg;
			item._watch = Core.Binding.bindHandler(this, [prop], callback, thisArg);
			items.setValue(item._id, item);
			return item._watch;
		}

		public watchPropImmediate(prop: string, callback: (value: any) => void, thisArg: any) {
			let watch = this.watchProp(prop, callback, thisArg);
			callback.call(thisArg, watch.getValue(), undefined);
		}

		public unwatchProp(prop: string, callback: (value: any) => void, thisArg: any) {
			if (!this._watchers.containsKey(prop)) {
				return;
			}
			let items = this._watchers.getValue(prop);
			let dels = new Array<BindingItem>();
			items.forEach((id, item) => {
				if (item._callback == callback && item._thisArg == thisArg) {
					item._watch.unwatch();
					dels.push(item);
				}
			});
			dels.forEach(item => {
				items.remove(item._id);
			});
		}
	}
}