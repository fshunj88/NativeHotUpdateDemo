/** 
 * 平台数据接口。
 * 由于每款游戏通常需要发布到多个平台上，所以提取出一个统一的接口用于开发者获取平台数据信息
 * 推荐开发者通过这种方式封装平台逻辑，以保证整体结构的稳定
 * 由于不同平台的接口形式各有不同，白鹭推荐开发者将所有接口封装为基于 Promise 的异步形式
 */
declare interface Platform {
    init(): Promise<any>;
    getUserInfo(): Promise<any>;
    clearUserInfo();
    login(args?: any): Promise<any>;
    reportRoleInfo(args: any);
    logout(): Promise<any>;
    canMakePay(): boolean;
}

declare interface AdvertisePlatform {
    init(): Promise<any>;
    isAdsOpen(): boolean;
    isAdsReady(adsId: string): Promise<{ success: boolean, reason: string }>;
    showRewardAds(adsId: string): Promise<{ success: boolean, reason: string }>;
    showBannerAds(): Promise<any>;
}

declare interface RecorderPlatform {
    startRecord(): Promise<boolean>;
    stopRecord(): Promise<boolean>;
    shareRecord(): Promise<boolean>;
    isRealTimeRecord: boolean;
    hasRecordToShare: boolean;
}

enum ShareType {
    SHARE_NONE = 0,
    SHARE_WECHAT = 1,
    SHARE_FACEBOOK = 2
}

declare interface SharePlatform {
    init(): Promise<any>;
    enableShareMenu(b: boolean, title: string, image: string, query: string): Promise<any>;
    shareAppMsg(title: string, image: string, query: string): Promise<any>;
    getShareType(): number;
    getShareLink(): string;
}

declare interface IGameGlobal {
    debug: boolean
    channel: string
    subChannel: string
    areaChannel: string
    tdChannel: string
    tdAppid: string
    isPC: boolean
    locale: string
    isSDKLogin: boolean
    isSDKLogout: boolean
    isMixLogin: boolean
    isSDKPay: boolean
    version: string
    resPrefix: string
    isMultiLan: boolean
    isFbAdvert: boolean
    ipaPrefix?: string
    packageName: string
    apkVersionCode: number
    apkVersionName: string
    appstoreAppId: string
}

declare interface DeviceSupport {
    record: boolean
    nativeSound: boolean
    topMargin: number
    bottomMargin: number
}

class DebugSharePlatform implements SharePlatform {
    async init() { }
    async enableShareMenu(b: boolean, title: string, image: string, query: string) { }
    async shareAppMsg(title: string, image: string, query: string) { }
    getShareType(): ShareType {
        return ShareType.SHARE_NONE;
    }
    getShareLink(): string {
        return "";
    }
}

class DebugRecorderPlatform implements RecorderPlatform {
    async startRecord() { return false }
    async stopRecord() { return false }
    isRealTimeRecord: boolean = false;
    hasRecordToShare: boolean = false;
    async shareRecord() { return false }
}

if (!window.sharePlatform) {
    window.sharePlatform = new DebugSharePlatform();
}

if (window.recorderPlatform) {
    window.recorderPlatform = new DebugRecorderPlatform();
}

declare let platform: Platform;
declare let sharePlatform: SharePlatform;
declare let adsPlatform: AdvertisePlatform;
declare let recorderPlatform: RecorderPlatform;

declare interface Window {
    platform: Platform
    sharePlatform: SharePlatform
    adsPlatform: AdvertisePlatform
    recorderPlatform: RecorderPlatform
    gameGlobal: IGameGlobal
    Data: any
    support: DeviceSupport
}