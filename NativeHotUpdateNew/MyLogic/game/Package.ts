namespace UI {

  class PackageInfo {
    public load: Function; // 加载函数
    public unload: Function; // 卸载函数
    public count: number; // 包引用计数
    public static loadPromise: Collection.Dictionary<string, Promise<void>> = new Collection.Dictionary<string, Promise<void>>();
  }
  // 通过引用计数来控制一个包是否要加载或者卸载
  let s_packageCache: object = {};

  export function registerPackage(name: string, load: Function, unload: Function) {
    let info: PackageInfo = s_packageCache[name];
    if (info) {
      cc.error(`registerPackage failed, ${name} already exists!`);
      return;
    }
    info = new PackageInfo();
    info.count = 0;
    info.load = load;
    info.unload = unload;
    s_packageCache[name] = info;
  }

  export async function loadPackage(name: string, force: boolean = false) {
    let info: PackageInfo = s_packageCache[name];
    if (!info) {
      cc.error(`loadPackage error ${name}, no load function`);
      return;
    }
    if (info.count == 0 || force) {
      cc.log(`loadPackage ${name}`);
      info.count++;
      let p = info.load();
      PackageInfo.loadPromise.setValue(name, p);
      await p;
      PackageInfo.loadPromise.remove(name);
    } else {
      info.count++;
      if (PackageInfo.loadPromise.containsKey(name)) {
        await PackageInfo.loadPromise.getValue(name);
      }
    }
  }

  export function unloadPackage(name: string, force: boolean = false) {
    let info: PackageInfo = s_packageCache[name];
    if (!info) {
      cc.error(`unloadPackage error $[name], no load/unload function`);
      return;
    }
    info.count--;
    if (info.count <= 0 || force) {
      info.unload();
      info.count = 0;
      cc.log(`unloadPackage ${name}`);
    }
  }

  export function registerItemExtension(pkgName: string, itemName: string, cls: typeof fgui.GComponent) {
    let url = fgui.UIPackage.getItemURL(pkgName, itemName);
    if (url) {
      fgui.UIObjectFactory.setPackageItemExtension(url, cls);
    } else {
      console.error("can't find ", pkgName, ": ", itemName);
    }
  }

  export async function createObjectAsync(pkgName: string, resName: string, userClass: any = null): Promise<fgui.GObject> {
    if (Core.DeviceUtils.isiOS() && !Core.DeviceUtils.isMiniGame()) {
      return fgui.UIPackage.createObject(pkgName, resName, userClass);
    } else {
      return await new Promise<fgui.GObject>(resolve => {
        let asyncOp = new fgui.AsyncOperation();
        asyncOp.callback = (obj: fgui.GObject) => {
          resolve(obj);
        };
        asyncOp.createObject(pkgName, resName, userClass);
      });
    }
  }

  //组件扩展,自己写各个包的的东西
  export function setPackageItemExtension() {
    UI.registerItemExtension("common", "closeBg", UI.CloseBg);
  }
}
