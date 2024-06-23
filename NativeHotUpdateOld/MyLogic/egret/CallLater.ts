namespace egret {
    /**
     * @private
     */
    export let $callLaterFunctionList:any[] = [];
    /**
     * @private
     */
    export let $callLaterThisList:any[] = [];
    /**
     * @private
     */
    export let $callLaterArgsList:any[] = [];

    /**
     * Delay the function to run unless screen is redrawn.
     * @param method {Function} The function to be delayed to run
     * @param thisObject {any} this reference of callback function
     * @param ...args {any} Function parameter list
     * @version Egret 2.4
     * @platform Web,Native
     * @includeExample egret/utils/callLater.ts
     * @language en_US
     */
    /**
     * 延迟函数到屏幕重绘前执行。
     * @param method {Function} 要延迟执行的函数
     * @param thisObject {any} 回调函数的this引用
     * @param ...args {any} 函数参数列表
     * @version Egret 2.4
     * @platform Web,Native
     * @includeExample egret/utils/callLater.ts
     * @language zh_CN
     */
    export function callLater(method:Function,thisObject:any,...args):void
    {
        $callLaterFunctionList.push(method);
        $callLaterThisList.push(thisObject);
        $callLaterArgsList.push(args);
    }
}