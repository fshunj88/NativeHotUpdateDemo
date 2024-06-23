namespace RES {
    let s_resourcePool: object = {};
    export let s_crossSiteResource: { [key: string]: Array<any> } = {}
    let s_getResAsyncPromise: { [url: string]: Promise<any> } = {};

    export function isHttpRes(url: string): boolean {
        return url.indexOf("http://") == 0 || url.indexOf("https://") == 0;
    }

    function hasResLoaded(url) {
        return s_resourcePool[url] && s_resourcePool[url] > 0;
    }

    class ResReleaseWatchDog {
        private static _inst: ResReleaseWatchDog = null;
        public static get inst(): ResReleaseWatchDog {
            if (this._inst == null) {
                this._inst = new ResReleaseWatchDog();
            }
            return this._inst;
        }

        private _urlLocks: {}
        private _url2Release: Array<{ url: string, t: typeof cc.Asset }>;

        private constructor() {
            this._urlLocks = {};
            this._url2Release = [];
            fgui.GTimers.inst.add(2000, -1, this._heartbeat, this);
        }

        private _heartbeat() {
            let urls = this._url2Release;
            this._url2Release = [];
            let locked = [];
            for (let i = 0; i < urls.length; ++i) {
                let urlInfo = urls[i];
                let url = urlInfo.url;
                if (this._urlLocks[url]) {
                    locked.push(urlInfo);
                } else if (!hasResLoaded(url)) {
                    this._doReleaseAssets(url, urlInfo.t);
                }
            }
            this._url2Release = this._url2Release.concat(locked);
        }

        private _doReleaseAssets(url: string, t: typeof cc.Asset) {
            let asset = cc.loader.getRes(url, t);
            if (asset) {
                let dependencies = cc.loader.getDependsRecursively(asset);
                if (dependencies) {
                    // console.log("[ResReleaseWatchDog][RES] release by deps", url, dependencies);
                    cc.loader.release(dependencies);
                } else {
                    // console.log(`[ResReleaseWatchDog][RES] manual release ${url}`, asset);
                    if (asset.nativeUrl) {
                        cc.loader.release(asset.nativeUrl);
                    }
                    asset.destroy();
                }
            }
        }

        public lockRes(url) {
            let cnt = this._urlLocks[url] | 0;
            this._urlLocks[url] = cnt + 1;
        }

        public unlockRes(url) {
            let cnt = this._urlLocks[url];
            if (cnt && cnt > 0) {
                cnt--;
                if (cnt <= 0) {
                    delete this._urlLocks[url];
                } else {
                    this._urlLocks[url] = cnt;
                }
            }
        }

        public addReleaseRes(url: string, t: typeof cc.Asset) {
            this._url2Release.push({ url: url, t: t });
        }
    }

    export function retain(url: string, asset?: cc.Asset) {
        if (!url) {
            return;
        }
        if (isHttpRes(url)) {
            if (asset) {
                let info = s_crossSiteResource[url];
                if (!info) {
                    info = [];
                    info.push(asset);
                    info.push(0);
                    s_crossSiteResource[url] = info;
                }
                info[1]++;
                // console.log(`[RES] retain ${url} ${info[1]}`);
            }
        } else {
            if (!fgui.ToolSet.startsWith(url, "ui://")) {
                let count = s_resourcePool[url] || 0;
                s_resourcePool[url] = count + 1;
                // console.log(`[RES] retain  ${url} ${s_resourcePool[url]}`);
            }
        }
        ResReleaseWatchDog.inst.unlockRes(url);
    }

    export function release(url: string, type?: typeof cc.Asset) {
        // console.log(`[RES] try release ${url}`);
        if (!url || url == "") return;
        if (isHttpRes(url)) {
            let info = s_crossSiteResource[url];
            if (info) {
                info[1]--;
                // console.log(`release ${url} ${info[1]}`);
                if (info[1] <= 0) {
                    let asset = info[0];
                    if (asset) {
                        cc.loader.releaseAsset(asset);
                        // console.log(`do release ${url}`);
                    }
                    s_crossSiteResource[url] = null;
                    delete s_crossSiteResource[url];
                }
            }
            return info[1];
        } else if (!fgui.ToolSet.startsWith(url, "ui://")) {
            let count = s_resourcePool[url] || 0;
            count--;
            // console.log(`[RES] release  ${url} ${count}`);
            if (count <= 0) {
                s_resourcePool[url] = null;
                delete s_resourcePool[url];
                if (!fgui.ToolSet.startsWith(url, "ui://")) {
                    // let asset = cc.loader.getRes(url, type);
                    // if (asset) {
                    //     let dependencies = cc.loader.getDependsRecursively(asset);
                    //     if (dependencies) {
                    //         console.log("[RES] release by deps", url, dependencies);
                    //         cc.loader.release(dependencies);
                    //     } else {
                    //         console.log(`[RES] manual release ${url}`, asset);
                    //         if (asset.nativeUrl) {
                    //             cc.loader.release(asset.nativeUrl);
                    //         }
                    //         asset.destroy();
                    //     }
                    // }
                    ResReleaseWatchDog.inst.addReleaseRes(url, type);
                }

            } else {
                s_resourcePool[url] = count;
            }
            return count;
        }
    }

    export async function getResAsync(url: string, type?: typeof cc.Asset, progressCallback?: (completedCount: number, totalCount: number, item: any) => void) {
        if (isHttpRes(url)) {
            return await getImageCrossSiteAsync(url, type);
        }
        let res;
        if (hasResLoaded(url)) {
            res = cc.loader.getRes(url, type);
        }
        if (res) return res;
        else {
            if (url.indexOf("ui://") == 0) {
                // 包资源
                if (type == cc.SpriteFrame) {
                    let item = fgui.UIPackage.getItemByURL(url);
                    if (item == null) {
                        return null;
                    } else {
                        item.load();
                        // console.log("getResAsync packageItem: ", item, item.getSizeRateInAtlas(), (<any>item.asset).uv);
                        if (item.asset == null) {
                            return null;
                        } else {
                            return <cc.SpriteFrame>item.asset;
                        }
                    }
                } else {
                    let loader = new fgui.GLoader();
                    loader.url = url;
                    return loader.texture;
                }
            }

            if (s_getResAsyncPromise[url]) {
                await s_getResAsyncPromise[url];
                return cc.loader.getRes(url, type);
            }
            ResReleaseWatchDog.inst.lockRes(url);
            let p = new Promise<any>(resolve => {
                // console.log(`[RES] load resource ${url}`);
                function onLoadComplete(err: Error, asset: any) {
                    if (!asset || !asset.loaded) {
                        console.log("getResAsync error: ", err);
                        resolve(null);
                    } else {
                        // console.log(asset);
                        if (asset instanceof cc.SpriteFrame) {
                            // console.log("[RES] asset instance of cc.SpriteFrame");
                            // cc.dynamicAtlasManager.insertSpriteFrame(asset);
                            resolve(asset);
                        } else if (asset instanceof cc.Texture2D) {
                            asset.packable = false;
                            // console.log("[RES] asset instance of cc.Texture2D");
                            let spriteFrame = new cc.SpriteFrame(asset);
                            // cc.dynamicAtlasManager.insertSpriteFrame(spriteFrame);
                            resolve(spriteFrame);
                        } else {
                            // console.log("[RES] asset instance of other");
                            resolve(asset);
                        }
                    }
                }

                // Asset资源
                if (!type) {
                    type = cc.Asset;
                }
                if (progressCallback) {
                    cc.loader.loadRes(url, type, progressCallback, onLoadComplete);
                } else {
                    cc.loader.loadRes(url, type, onLoadComplete);
                }
            });
            s_getResAsyncPromise[url] = p;
            let ret = await p;
            s_getResAsyncPromise[url] = null;
            return ret;
        }
    }

    export async function getJsonAsync(name: string, progressCallback?: (completedCount: number, totalCount: number, item: any) => void) {
        let asset: cc.JsonAsset = await getResAsync(name, cc.JsonAsset, progressCallback);
        //console.log(asset);
        if (!asset || !asset.loaded) {
            return null;
        } else {
            return asset.json;
        }
    }

    export async function getImageCrossSiteAsync(url: string, type?: typeof cc.Asset) {
        // if (s_crossSiteResource[url]) {
        //     return s_crossSiteResource[url][0];
        // }
        return await new Promise<any>(resolve => {
            function onLoadComplete(err: Error, asset: any) {
                if (!asset || !asset.loaded) {
                    console.log("getResAsync error: ", err);
                    resolve(null);
                }
                if (asset instanceof cc.SpriteFrame) {
                    // console.log("[getResAsync] load external image done (SpriteFrame): ", asset);
                    resolve(asset);
                } else if (asset instanceof cc.Texture2D) {
                    asset.packable = false;
                    // console.log("[getResAsync] load external image done (Texture2D): ", asset);
                    let ret = new cc.SpriteFrame(asset);
                    resolve(ret);
                } else {
                    resolve(null);
                }
            }
            console.log("[getResAsync] loading external image: ", url);
            cc.loader.load({ url: url + "?file=a.png", type: "png" }, onLoadComplete);
        });
    }

    export function getRes(url: string, type?: typeof cc.Asset) {
        return cc.loader.getRes(url, type);
    }

    export function destroyRes(asset: cc.Asset): void {
        cc.loader.releaseAsset(asset);
        /*
        let deps = cc.loader.getDependsRecursively(asset);
        cc.loader.release(deps);
        cc.loader.release(asset);
        */
    }

    export async function loadGroup(name: string, pri?: number, reporter?: any, temp?: boolean) {

    }

    export interface PromiseTaskReporter {
        onProgress?: (current: number, total: number) => void;
        onCancel?: () => void;
    }

    export async function loadPackage(name: string, loadingMask: boolean = false, loadRes: boolean = false, showMask: boolean = true) {
        //if (loadingMask && showMask) {
        //    Core.MaskUtils.showFakeLoadingMask(true);
        //}
        let ret = await new Promise<fgui.UIPackage>(resolve => {
            function onLoaded(err: any) {
                if (!err) {
                    let pkg = fgui.UIPackage.addPackage(name);
                    // console.log((<any>pkg)._sprites);
                    resolve(pkg);
                } else {
                    console.log(err);
                    resolve(null);
                }
            }
            try {
                fgui.UIPackage.loadPackage(name, loadRes, onLoaded);
            } catch (e) {
                console.log(e);
                resolve(null);
            }
        });
        //if (loadingMask) {
        //    Core.MaskUtils.showFakeLoadingMask(false);
        //}
        return ret;
    }

    export function unloadPackage(name: string) {
        fgui.UIPackage.removePackage(name);
    }

    ////@ts-ignore
    //fgui.GLoader.loadExtenalResFn = async function (url: string, type: typeof cc.Asset, callback: (err, asset) => void) {
    //    console.log("[GLoader.loadExtenalResFn]: ", url);
    //    let asset = await getResAsync(url, type);
    //    if (asset) {
    //        retain(url, asset);
    //        callback(null, asset);
    //    } else {
    //        callback("load " + url + " failed", null);
    //    }
    //}

    ////@ts-ignore
    //fgui.GLoader.freeExtenalResFn = async function (url: string, type: typeof cc.Asset) {
    //    console.log("[GLoader.freeExtenalResFn]: ", url);
    //    if (url) {
    //        release(url, type);
    //    }
    //}
}
