namespace Core {

    class TextToken {
        protected stream: string[] = [];
        protected _isDone: boolean = true;
        protected _isHead: boolean = true;
        private _id: number;

        constructor(_id: number) {
            this._id = _id;
        }

        get id() {
            return this._id;
        }

        get isDone() {
            return this._isDone;
        }
        set isDone(_isDone: boolean) {
            this._isDone = _isDone;
        }

        get isHead() {
            return this._isHead;
        }

        public toTextElement(): egret.ITextElement {
            return { text: this.stream.join("") };
        }

        public addChar(c: string) {
            this.stream.push(c);
        }

        public getBaseText(): string {
            return this.stream.join("");
        }

        public toUbbText(): string {
            return this.getBaseText();
        }
    }

    class ColorTextToken extends TextToken {
        private _color: string;
        private _rgbColor: number;

        constructor(_id: number, color: string, rgbColor: number, isHead: boolean) {
            super(_id);
            this._color = color;
            this._rgbColor = rgbColor;
            this._isHead = isHead;
            this._isDone = false;
        }

        get color() {
            return this._color;
        }
        get rgbColor() {
            return this._rgbColor;
        }

        public toTextElement(): egret.ITextElement {
            let baseTxt = this.stream.join("");
            if (!this._isDone) {
                if (this._isHead) {
                    return { text: "#c" + this._color + baseTxt };
                } else {
                    return { text: baseTxt };
                }
            } else {
                return { text: baseTxt, style: { "textColor": this.rgbColor } };
            }
        }

        public static getRgbColor(colorCode: string): number {
            if (colorCode.length == 1) {
                return ColorsCode[colorCode];
            }
            return parseInt(colorCode, 16);
        }

        public toUbbText(): string {
            let color = Core.toColor(this._rgbColor);
            let ret = `[color=#${color.toHEX("#rrggbb")}]${this.getBaseText()}[/color]`;
            // console.log("toUbbText: ", ret);
            return ret;
        }
    }

    declare interface TextGameData {
        get(id: number): any
    }

    export class StringUtils {
        public static textGameData: TextGameData;
        public static textGameData2: TextGameData;
        public static textGameData3: TextGameData;

        public static time2RemainText(sec: number) {
            let hours = Math.round((sec - 30 * 60) / (60 * 60));
            let minutes = Math.round((sec - 30) / 60) % 60;
            if (hours > 0) {
                return Core.StringUtils.format(Core.StringUtils.TEXT(60153), hours);
            } else if (minutes > 0) {
                return Core.StringUtils.format(Core.StringUtils.TEXT(60150), minutes);
            } else {
                return Core.StringUtils.TEXT(60141);
            }
        }

        public static TEXT(id: number): string {
            if (!StringUtils.textGameData) {
                return "";
            }
            let txtLocaleInfo = StringUtils.textGameData.get(id);
            if (!txtLocaleInfo) {
                if (StringUtils.textGameData2) {
                    txtLocaleInfo = StringUtils.textGameData2.get(id);
                    if (!txtLocaleInfo) {
                        if (StringUtils.textGameData3) {
                            txtLocaleInfo = StringUtils.textGameData3.get(id);
                            if (!txtLocaleInfo) {
                                return "";
                            }
                        }
                    }
                } else {
                    return "";
                }
            }
        }

        public static parseColorText(str: string): string {
            // let ret: Array<egret.ITextElement> = [];
            let panding: Array<TextToken> = [];
            let complete: Array<TextToken> = [];

            let tokenId = 0;
            let curToken: TextToken;
            let strLen = str.length;
            let curStatus = 0;  // 0.raw  1.parsing color
            for (let i = 0; i < strLen;) {
                let c = str[i];
                if (curStatus == 0) {
                    if (c == "#") {
                        if (str[i + 1] == "c") {
                            let colorCode = str[i + 2];
                            let rgb = ColorTextToken.getRgbColor(colorCode);
                            if (!rgb) {
                                colorCode = str.slice(i + 2, i + 8);
                                rgb = ColorTextToken.getRgbColor(colorCode);
                            }

                            if (rgb) {
                                // begin parse color
                                if (curToken != null) {
                                    complete.push(curToken);
                                }
                                curToken = new ColorTextToken(tokenId, colorCode, rgb, true)
                                tokenId += 1;
                                i += colorCode.length + 2;
                                curStatus = 1;
                                continue;
                            }
                        }
                    }

                    // raw text
                    i += 1;
                    if (curToken == null) {
                        curToken = new TextToken(tokenId);
                        tokenId += 1;
                    }
                    curToken.addChar(c);
                } else {
                    if (c == "#") {
                        if (str[i + 1] == "n") {
                            // parse color done
                            i += 2;
                            curToken.isDone = true;
                            complete.push(curToken);
                            if (!curToken.isHead) {
                                while (panding.length > 0) {
                                    curToken = panding.pop();
                                    curToken.isDone = true;
                                    complete.push(curToken);
                                    if (curToken.isHead) {
                                        break;
                                    }
                                }
                            }

                            if (panding.length > 0) {
                                let lastPandingToken = panding[panding.length - 1] as ColorTextToken;
                                curToken = new ColorTextToken(tokenId, lastPandingToken.color, lastPandingToken.rgbColor, false);
                                tokenId += 1;
                            } else {
                                curToken = null;
                                curStatus = 0;
                            }
                            continue;
                        } else if (str[i + 1] == "c") {
                            let colorCode = str[i + 2];
                            let rgb = ColorTextToken.getRgbColor(colorCode);
                            if (!rgb) {
                                colorCode = str.slice(i + 2, i + 8);
                                rgb = ColorTextToken.getRgbColor(colorCode);
                            }

                            if (rgb) {
                                // 嵌套color
                                panding.push(curToken);
                                curToken = new ColorTextToken(tokenId, str[i + 2], ColorsCode[str[i + 2]], true)
                                tokenId += 1;
                                i += 3;
                                curStatus = 1;
                                continue;
                            }
                        }
                    }

                    // color text
                    i += 1;
                    curToken.addChar(c);
                }
            }

            if (curToken != null) {
                complete.push(curToken);
            }

            panding.forEach(t => {
                complete.push(t);
            })

            complete.sort(function (a: TextToken, b: TextToken): number {
                if (a.id > b.id) {
                    return 1;
                } else {
                    return -1;
                }
            })

            let ret = "";
            complete.forEach(t => {
                ret += t.toUbbText();
            });

            return ret;

            // complete.forEach(t => {
            //     ret.push(t.toTextElement());
            // })

            // return ret;
        }

        public static parseFuncText(textObj: fgui.GTextField, exitsElements?: Array<egret.ITextElement>): Array<egret.ITextElement> {
            return null;
        }

        public static secToString(sec: number, fmt: string): string {
            let hours = Math.round((sec - 30 * 60) / (60 * 60));
            let minutes = Math.round((sec - 30) / 60) % 60;
            let seconds = sec % 60;
            if (fmt.toLowerCase() == "hms") {
                if (hours > 0) {
                    return Core.StringUtils.format(Core.StringUtils.TEXT(60128), hours, minutes, seconds);
                } else if (minutes > 0) {
                    return Core.StringUtils.format(Core.StringUtils.TEXT(60070), minutes, seconds);
                } else {
                    return Core.StringUtils.format(Core.StringUtils.TEXT(60021), seconds);
                }
            } else if (fmt.toLowerCase() == "h") {
                if (hours > 0) {
                    return Core.StringUtils.format(Core.StringUtils.TEXT(60058), hours);
                } else {
                    let m = Math.max(1, minutes);
                    return Core.StringUtils.format(Core.StringUtils.TEXT(60055), m);
                }
            } else if (fmt.toLowerCase() == "hm") {
                if (hours > 0) {
                    if (minutes > 0) {
                        return Core.StringUtils.format(Core.StringUtils.TEXT(60112), hours, minutes);
                    } else {
                        return Core.StringUtils.format(Core.StringUtils.TEXT(60058), hours);
                    }
                } else {
                    if (minutes <= 0) {
                        return Core.StringUtils.format(Core.StringUtils.TEXT(60021), seconds);
                    } else if (seconds > 0) {
                        return Core.StringUtils.format(Core.StringUtils.TEXT(60070), minutes, seconds);
                    } else {
                        return Core.StringUtils.format(Core.StringUtils.TEXT(60055), minutes);
                    }
                }
            } else if (fmt.toLowerCase() == "dhm") {
                let hours = Math.round((sec - 30 * 60) / (60 * 60));
                let days = Math.round(hours / 24);
                let minutes = Math.round((sec - 30) / 60) % 60;
                if (days > 0) {
                    return Core.StringUtils.format(Core.StringUtils.TEXT(60032), days);
                } else if (hours > 0) {
                    return Core.StringUtils.format(Core.StringUtils.TEXT(60058), hours);
                } else if (minutes > 0) {
                    return Core.StringUtils.format(Core.StringUtils.TEXT(60055), minutes);
                } else {
                    return Core.StringUtils.TEXT(60042);
                }
            } else if (fmt.toLowerCase() == "dhms") {
                let hours = Math.round((sec - 30 * 60) / (60 * 60));
                let days = Math.floor(hours / 24);
                hours = hours % 24;
                let minutes = Math.round((sec - 30) / 60) % 60;
                let seconds = sec % 60;
                return Core.StringUtils.format(Core.StringUtils.TEXT(70124), days, hours, minutes);
            } else if (fmt.toLowerCase() == "mmss") {
                let m = minutes < 10 ? `0${minutes}` : minutes;
                let s = seconds < 10 ? `0${seconds}` : seconds;
                return `${m}:${s}`;
            } else if (fmt.toLowerCase() == "hhmm") {

                let h = hours < 10 ? `0${hours}` : hours;
                let m = minutes < 10 ? `0${minutes}` : minutes;
                return `${h}:${m}`;
            } else if (fmt.toLowerCase() == "hhmmss") {
                let h = hours < 10 ? `0${hours}` : hours;
                let m = minutes < 10 ? `0${minutes}` : minutes;
                let s = seconds < 10 ? `0${seconds}` : seconds;
                return `${h}:${m}:${s}`;
            } else if (fmt.toLocaleLowerCase() == "brief") {
                if (hours > 0) {
                    return Core.StringUtils.format(Core.StringUtils.TEXT(60058), hours);
                } else if (minutes > 0) {
                    return Core.StringUtils.format(Core.StringUtils.TEXT(60055), minutes);
                } else {
                    return Core.StringUtils.format(Core.StringUtils.TEXT(60021), seconds);
                }
            } else {
                return Core.StringUtils.format(Core.StringUtils.TEXT(60021), seconds);
            }
        }

        public static secToDate(sec: number, fmt: string): string {
            let date = new Date(sec * 1000);
            let year = date.getFullYear();
            let month = date.getMonth() + 1;
            let day = date.getDate();
            let hour = date.getHours();
            let minutes = date.getMinutes();
            let seconds = date.getSeconds();
            if (fmt.toLowerCase() == "ymdhms") {
                return Core.StringUtils.format(Core.StringUtils.TEXT(60206), year, month, day, hour, minutes, seconds);
            } else if (fmt.toLowerCase() == "ymd") {
                return Core.StringUtils.format(Core.StringUtils.TEXT(60115), year, month, day);
            } else if (fmt.toLowerCase() == "mdh") {
                return Core.StringUtils.format(Core.StringUtils.TEXT(60121), month, day, hour);
            } else if (fmt.toLowerCase() == "server") {
                let h = hour < 10 ? `0${hour}` : hour;
                let m = minutes < 10 ? `0${minutes}` : minutes;
                return `${h}:${m}`;
            } else if (fmt.toLowerCase() == "hms") {
                let h = hour < 10 ? `0${hour}` : hour;
                let m = minutes < 10 ? `0${minutes}` : minutes;
                let s = seconds < 10 ? `0${seconds}` : seconds;
                return Core.StringUtils.format("{0}:{1}:{2}", h, m, s);
            } else if (fmt.toLowerCase() == "hm") {
                let h = hour < 10 ? `0${hour}` : hour;
                let m = minutes < 10 ? `0${minutes}` : minutes;
                return Core.StringUtils.format("{0}:{1}", h, m);
            } else if (fmt.toLowerCase() == "mdhm") {
                return Core.StringUtils.format("{0}年{1}月{2}日{3}时{4}分", year, month, day, hour, minutes);
            } else {
                return Core.StringUtils.format(Core.StringUtils.TEXT(60183), month, day, hour, minutes, seconds);
            }
        }

        //public static stringToLong(str: string): Long {
        //    let bits = protobuf.Writer.create().uint64(str).finish();
        //    return protobuf.Reader.create(bits).uint64();
        //}

        public static utf8ArrayToString(array: Uint8Array): string {
            var out, i, len, c;
            var char2, char3;

            out = "";
            len = array.length;
            i = 0;
            while (i < len) {
                c = array[i++];
                switch (c >> 4) {
                    case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                        // 0xxxxxxx
                        out += String.fromCharCode(c);
                        break;
                    case 12: case 13:
                        // 110x xxxx   10xx xxxx
                        char2 = array[i++];
                        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                        break;
                    case 14:
                        // 1110 xxxx  10xx xxxx  10xx xxxx
                        char2 = array[i++];
                        char3 = array[i++];
                        out += String.fromCharCode(((c & 0x0F) << 12) |
                            ((char2 & 0x3F) << 6) |
                            ((char3 & 0x3F) << 0));
                        break;
                }
            }

            return out;
        }

        public static format(formatter: string, ...param: any[]): string {
            return formatter.replace(/{(\d+)}/g, (match, number) => {
                return typeof (param[number]) != "undefined" ?
                    param[number] : match;
            });
        }

        public static formatTextId(textId: number, ...param: any[]): string {
            let formatter = this.TEXT(textId);
            return formatter.replace(/{(\d+)}/g, (match, number) => {
                return typeof (param[number]) != "undefined" ?
                    param[number] : match;
            });
        }

        public static utf8Length(str: string): number {
            let byteLen = 0, len = str.length;
            if (!str) return 0;
            for (var i = 0; i < len; i++) {
                byteLen += str.charCodeAt(i) > 255 ? 2 : 1;
            }
            return byteLen;
        }

        public static getRealName(str: string): string {
            let realName: string = str.replace(/#c\w(.*)#n/, "$1");
            return realName;
        }

        public static filterEmoji(str: string): string {
            if (!str) return "";
            let ret = str.replace(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g, "#");
            return ret.replace(/[\r\n]/g, "");
        }

        public static readableSize(size: number): string {
            if (size < 1024) return `${size}`;
            else if (size >= 1024 && size < 1024 * 1024) return `${(size / 1024.0).toFixed(2)}K`;
            else return `${(size / 1024.0 / 1024.0).toFixed(2)}M`;
        }

        public static getSimpleResText(num: number, url: string) {
            let size = 60;
            let color: string = "660000";
            return `[img]${url}[/img][size=${size}]#c${color}${num}#n[/size]`;
        }

        //public static getResConfirmText(num: number, resTypeOrId: ResType | String, color: string = "ffffff", size: number = 60, rtype: Reward.RKey = Reward.RKey.K_RESOURCE) {
        //    let ritem = new Reward.RewardItem(rtype, resTypeOrId.toString(), num);
        //    let resIcon = ritem.getIconUrl();
        //    // return `[img]${resIcon}[/img][size=${size}]#c${color}${num}#n[/size]`;
        //    if (!num) {
        //        return `[img]${resIcon}[/img][size=${size}]#c${color}#n[/size]`;
        //    } else {
        //        return `[img]${resIcon}[/img][size=${size}]#c${color}${num}#n[/size]`;
        //    }
        //}

        //public static cardObj2MsgString(card: UI.ICardObj) {
        //    // for example:
        //    // let msg = "#fcard,(cardId:1;stage:1;skin:1;gMlt:1;gFor:1;gCmd:1;gInt:1;gPlt:1;knowledge:1|2,2|2,3|2,4|2,5|2)#e"
        //    let msg = "#fcard,(";
        //    let end = ")#e"
        //    msg += `cardId:${card.cardId};`;
        //    msg += `stage:${card.stage};`;
        //    msg += `skin:${card.skin};`;
        //    msg += `gMlt:${card.growUpMilitary};`;
        //    msg += `gFor:${card.growUpForce};`;
        //    msg += `gCmd:${card.growUpCommand};`;
        //    msg += `gInt:${card.growUpIntelligence};`;
        //    msg += `gPlt:${card.growUpPolitics};`;

        //    let k = "knowledge:";
        //    card.curGCard.knowledges.forEach((__k, __index) => {
        //        k += `${__k.confId}|${__k.rare}`;
        //        if (__index != card.curGCard.knowledges.length - 1) {
        //            k += ",";
        //        }
        //    });
        //    msg += k;
        //    msg += end;
        //    return msg;
        //}



        public static limitNameLenth(str: string, maxLenth: number = 10): string {
            // 设置玩家名字在聊天频道的显示长度
            let name = str;
            let temp = 0;
            let lenth = 0; // 表示被限制后名字的长度
            let bit = Core.StringUtils.utf8Length(name);
            if (bit > maxLenth * 2) {
                // 名字需要限制
                // 求字符串应截取的长度
                for (let i = 0; i < name.length; i++) {
                    let ascll = name.charCodeAt(i);
                    if (ascll < 256) {
                        temp += 1;
                    } else {
                        temp += 2;
                    }
                    if (temp > maxLenth * 2) {
                        break;
                    }
                    // 判断是否是表情
                    let char = name.charAt(i).concat(name.charAt(i + 1));
                    let bool = char.search(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g);
                    if (bool != -1) {
                        i++;
                        lenth += 2;
                    } else {
                        lenth += 1;
                    }
                }
                // 判断截取的最后一个位置是否为表情
                let lastChar = name.charAt(lenth - 1).concat(name.charAt(lenth));
                let bool = lastChar.search(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g);
                if (bool != -1) {
                    lenth++;
                }
                name = name.substr(0, lenth);
                if (temp > maxLenth * 2) {
                    name = name.concat("...");
                }
            }
            return name;
        }

        public static isNumber(val: string) {
            var regPos = /^\d+(\.\d+)?$/; //非负浮点数
            var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
            if (regPos.test(val) || regNeg.test(val)) {
                return true;
            } else {
                return false;
            }
        }
        public static printStack() {
            let e = new Error();
            let lines = e.stack.split('\n');
            lines.shift();
            lines.forEach((line) => {
                console.log('line:', line);
            });
        }
    }

}
