namespace Core {

    export enum ColorType {
        None = "",
        Red = "red",
        Green = "green",
        Yellow = "yellow",
        Gray = "gray",
        Blue = "blue",
        Black = "black",
        White = "white",
        Orange = "orange",
    }

    export function str2ColorStrText(type: ColorType, str: string): string {
        if (type != ``) {
            return `[color=${type}]${str}[/color]`;
        }
        return `${str}`;
    }


    export function toColor(colorValue:number):cc.Color {
        return cc.color((colorValue >> 16) & 0xFF, (colorValue >> 8) & 0xFF, colorValue & 0xFF );
    }

    export var TextColors = {
        white:toColor(0xFFFFFF),//白色
        milkWhite:toColor(0xfbf1af),//乳白色 
        grayWhite:toColor(0xceb6a2),//灰白色
        gray:toColor(0x333333), // 灰色
        yellow:toColor(0xfcdb00),//黄色 
        lightYellow:toColor(0xffd375),//淡黄色
        orangeYellow:toColor(0xff9900),//橘黄色
        orange:toColor(0xe08328),//橘色 卡牌
        red:toColor(0xd33737),//红色
        green:toColor(0x2fb431),//绿色 
        blue:toColor(0x38a5e4),//蓝色 
        grayBlue:toColor(0x2f5177),//墨蓝色 
        purple:toColor(0xf13ad1),//紫色 
        pink:toColor(0xFF3030),//粉色 
        black:toColor(0x000000),//黑色
        golden:toColor(0xFFD700), //金色
        brownness:toColor(0x691313)//褐色
    }

    export var ColorsCode = {
        "g": 0x2fb431, //绿
        "b": 0x38a5e4, //蓝
        "p": 0xf13ad1, //紫
        "o": 0xe08328, //橙
        "r": 0xd33737, //红
        // "y": 0xfcdb00, //黄
        "y": 0xFF9900, //黄
        "m": 0xffd4a9, //米
        "z": 0x3b3421, //棕
        "B": 0x000000, //黑
        "w": 0xffffff, //白
        "l": 0x691313, //褐
        "R": 0x5b2b0e, //深红
        "G": 0x645c4d, //灰色
    }

    export var ColorsPrefix = {
        "g": "2fb431", //绿
        "b": "38a5e4", //蓝
        "p": "f13ad1", //紫
        "o": "e08328", //橙
        "r": "d33737", //红
        // "y": "fcdb00", //黄
        "y": "ff9900", //黄
        "m": "ffd4a9", //米
        "z": "3b3421", //棕
        "B": "000000", //黑
        "w": "ffffff", //白
        "l": "691313", //褐
        "R": "5b2b0e", //深红
        "G": "645c4d", //灰色
    }
}