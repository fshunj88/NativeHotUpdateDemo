namespace egret {
    export interface ITextStyle {
        /**
         * text color
         * @version Egret 2.4
         * @platform Web,Native
         * @see http://edn.egret.com/cn/docs/page/146 多种样式混合文本的基本结构
         * @language en_US
         */
        /**
         * 颜色值
         * @version Egret 2.4
         * @platform Web,Native
         * @see http://edn.egret.com/cn/docs/page/146 多种样式混合文本的基本结构
         * @language zh_CN
         */
        textColor?:number;
        /**
         * stroke color
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 描边颜色值
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        strokeColor?:number;
        /**
         * size
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 字号
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        size?:number;
        /**
         * stroke width
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 描边大小
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        stroke?:number;
        /**
         * whether bold
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 是否加粗
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        bold?:boolean;
        /**
         * whether italic
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 是否倾斜
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        italic?:boolean;
        /**
         * fontFamily
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 字体名称
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        fontFamily?:string;
        /**
         * Link events or address
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 链接事件或者地址
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        href?:string;
        /**
         * @private
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * @private
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        target?:string;
        /**
         * Is underlined
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 是否加下划线
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        underline?:boolean;

        /**
         * 文字绘制的回调参数
         */
        drawParam?:any;
        /**
         * 文字绘制回调
         */
        drawCallback?:(textObj: fgui.GTextField, x: number, y: number, param: any, thisObj: any) => void;
        drawThis?:any;
    }

    export interface ITextElement {
        /**
         * String Content
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 字符串内容
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        text:string;
        /**
         * Text Style
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 文本样式
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        style?:ITextStyle;
    }
}