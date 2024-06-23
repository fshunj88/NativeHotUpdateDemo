namespace Core {

    export enum AdjustType {
        NO_BORDER,
        EXACT_FIT,
        EXCEPT_MARGIN,
    }

    export interface IBaseView {
        name: string

        isInit():boolean

        isShow():boolean

        addToParent(parent?:fgui.GComponent):void

        removeFromParent():void

        initUI():void

        setVisible(flag:boolean):void

        open(...param:any[]):Promise<any>

        close(...param:any[]):Promise<any>

        destroy()

        getNode(nodeName:string): Promise<fgui.GObject>

        adjust(display:fgui.GObject, adjustType:AdjustType)

        isConcernBackKey: boolean

        handleBackKey(): boolean;

        destroyWhileClose(): boolean;

        forceCloseFlag: boolean;
    }

}