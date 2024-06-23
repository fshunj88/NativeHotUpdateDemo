class Utils {

    //public static async resType2Texture(resType: ResType): Promise<cc.SpriteFrame> {
    //    return await RES.getResAsync(Utils.resType2Icon(resType), cc.SpriteFrame);
    //}

    //public static getCardAvatarUrl(cardId: number) {
    //    return `ui://video/${cardId}`
    //}
    //public static getSkinAvatarUrl(skinID: string) {
    //    return `ui://video/${CardPool.CardSkinMgr.inst.getSkinInfo(skinID).head}`
    //}
    //public static getPvpTeamAvatarUrls(pvpTeam: number): string[] {
    //    switch (pvpTeam) {
    //        case 1:
    //            return [`ui://video/${9001}`, `ui://video/${9002}`];
    //        default:
    //            return [`ui://video/${9001 + pvpTeam}`];
    //    }
    //}
    //public static getDefaultAvatarUrl(): string {
    //    return `ui://video/${1}`;
    //}
    //public static getFuncPrice(type: PriceType) {
    //    return Data.function_price.get(type).price;
    //}

    //public static getTreasureDouble(type: PriceType) {
    //    return Data.treasure_event.get(type).double;
    //}

    //public static getTreasureEvent(rare: number, event: TreasureEventType) {
    //    let eventNum = 0;
    //    let data = Data.treasure_event.get(rare);
    //    if (data) {
    //        switch (event) {
    //            case TreasureEventType.UpRare:
    //                eventNum = data.upRarePrice;
    //                break;
    //            case TreasureEventType.AddCardPrice:
    //                eventNum = data.addCardPrice;
    //                break;
    //            case TreasureEventType.AddCardCnt:
    //                eventNum = data.addCardCnt;
    //                break;
    //            default:
    //                break;
    //        }
    //    }
    //    return eventNum;

    //}
    public static str2num(str: string) {
        str = str.trim();
        let strNum = parseInt(str);
        if (isNaN(strNum) || str.length <= 0 || str.length != strNum.toString().length) {
            return false;
        }
        return strNum;
    }

    //public static async setImageUrlPicture(img: fgui.GImage, url: string) {
    //    let texture = await Social.SocialMgr.inst.getTextureByResUrl(url);
    //    if (texture) {
    //        let w = img.width;
    //        let h = img.height;
    //        img.texture = texture;
    //        img.width = w;
    //        img.height = h;
    //    }
    //}



    public static setCardNameText(text: fgui.GTextField, data: any) {
        text.text = Core.StringUtils.getRealName(data.name);
        if (data.rare >= 98) {
            text.color = Core.TextColors.brownness;
        } else {
            switch (data.level) {
                case 1:
                    text.color = Core.TextColors.white;
                    break;
                case 2:
                    text.color = Core.TextColors.green;
                    break;
                case 3:
                    text.color = Core.TextColors.blue;
                    break;
                case 4:
                    text.color = Core.TextColors.purple;
                    break;
                case 5:
                    text.color = Core.TextColors.orange;
                    break;
                default:
                    text.color = Core.TextColors.white;
                    break;
            }
        }
    }

    public static getResolutionDistance(): number {
        return (fgui.GRoot.inst.height - 1600 - window.support.topMargin - window.support.bottomMargin);
    }

    public static setDefaultNameColor(text: fgui.GTextField, name: string) {
        if (name.indexOf("#c") < 0) {
            text.color = cc.Color.WHITE;
        }
    }

    ////js中的number类型转换成protobuf中的Long类型
    //public static NumberToLong(v: number): Long {
    //    let longNumber = protobuf.util.LongBits.fromNumber(v).toLong();
    //    return longNumber;
    //}

    ////protobuf中的Long类型转换成js中的number类型
    //public static LongToNumber(v: Long): number {
    //    if (!v) { return 0; };
    //    let num = protobuf.util.LongBits.from(v).toNumber();
    //    return num;
    //}

    public static propertyDecorator = (target: any, propertyKey: string | symbol) => {
        let protoVal = target[propertyKey];
        Object.defineProperty(target, propertyKey, {
            get() {
                return protoVal;
            },
            set(val: any) {
                protoVal = val;
            }
        });
    }

    public static compareVersion(v1: string, v2: string) {
        let v1s = v1.split('.')
        let v2s = v2.split('.')
        const len = Math.max(v1s.length, v2s.length)

        while (v1s.length < len) {
            v1s.push('0')
        }
        while (v2s.length < len) {
            v2s.push('0')
        }

        for (let i = 0; i < len; i++) {
            const num1 = parseInt(v1s[i])
            const num2 = parseInt(v2s[i])

            if (num1 > num2) {
                return 1
            } else if (num1 < num2) {
                return -1
            }
        }
        return 0
    }

    //递归让所有孩子都是3D节点
    public static makeNode3DIfSupported(node: cc.Node, group: string = "Model") {
        if (node.is3DNode) {
            return;
        }
        let supported = true;
        if (supported) {
            node.is3DNode = true;
            node.group = group;
            let children = node.children;
            if (children) {
                children.forEach(child => {
                    this.makeNode3DIfSupported(child, group);
                });
            }
            return true;
        } else {
            return false;
        }
    }

    public static cancelNode3D(node: cc.Node) {
        if (node.is3DNode) {
            node.is3DNode = false;
            node.group = "UI";
            let children = node.children;
            if (children) {
                children.forEach(child => {
                    this.cancelNode3D(child);
                });
            }
        }
    }

    // 返回函数的导函数
    public static derivative(fn: Function) {
        let h = 0.00001;
        return function (x) { return (fn(x + h) - fn(x - h)) / (2 * h); };
    }

    public static async blink(displayObj: fgui.GComponent, color: cc.Color = Core.TextColors.red, rect?: cc.Rect, maskIndex: number = null) {
        let mask = new fgui.GGraph();
        if (rect) {
            mask.width = rect.width;
            mask.height = rect.height;
            mask.x = rect.x;
            mask.y = rect.y;
        } else {
            mask.width = displayObj.width;
            mask.height = displayObj.height;
        }
        mask.drawRect(0, color.setA(0), color.setA(Math.floor(0.8 * 0xFF)), [3]);
        Utils.makeNode3DIfSupported(mask.node);

        if (maskIndex != null) {
            displayObj.addChildAt(mask, maskIndex);
        } else {
            displayObj.addChild(mask);
        }

        await new Promise<void>(resolve => {
            egret.Tween.get(mask).to({ alpha: 0.4 }, 110).wait(35).call(() => {
                displayObj.removeChild(mask);
            }, null).wait(263).call(() => {
                resolve();
            }, this);
        })
    }

    //public static assert(cond: any, log: string): boolean {
    //    if (!cond) {
    //        let battle = Battle.BattleMgr.inst.battle;
    //        if (battle) {
    //            log += "_" + battle.battleID;
    //        }
    //        Net.rpcPush(pb.MessageID.C2S_CLIENT_LOG, pb.ClientLog.encode({
    //            Log: log,
    //        }));
    //    }
    //    return cond;
    //}

    public static getAccurateTime(sec: number, mode: string = "hms") {
        return Core.StringUtils.secToString(sec, mode);
    }

    public static getMaxTime(sec: number): string {
        let time = null;
        let day = null;
        let hour = Math.round((sec - 30 * 60) / (60 * 60));
        let min = Math.round((sec - 30) / 60) % 60;
        let seconds = sec % 60;

        if (hour >= 24) {
            day = Math.ceil((hour / 24));
            time = day.toString() + "天";
        }
        else if (hour >= 1 && hour < 24 && min == 0 && seconds == 0) {
            time = hour.toString() + "小时";
        }
        else if (hour >= 1 && hour < 24 && (min > 0 || seconds > 0)) {
            hour++;
            time = hour.toString() + "小时";
        }
        else if (hour == 0 && min >= 1 && seconds == 0) {
            time = min.toString() + "分钟";
        }
        else if (hour == 0 && min >= 1 && seconds > 0) {
            min++;
            time = min.toString() + "分钟";
        }
        else if (hour == 0 && min == 0 && seconds > 0) {
            min = 1;
            time = min.toString() + "分钟";
        }
        else if (hour == 0 && min == 0 && seconds == 0) {
            time = "0分钟";
        }
        return time;

    }

    //源局部坐标->目的局部坐标
    public static pos2pos(src: { pos: cc.Vec2, obj: fgui.GObject }, des: { obj: fgui.GObject }) {
        let temp = src.obj.localToRoot(src.pos.x, src.pos.y);
        return des.obj.rootToLocal(temp.x, temp.y);
    }

    public static isTwoArrEqual(arr1: any[], arr2: any[]) {

        let reVal = true;
        if (!arr1 || !arr2) {
            reVal = false;
        }
        else if (arr1.length != arr2.length) {
            reVal = false;
        }
        else if (arr1.length > 0 && arr2.length > 0) {
            arr1.forEach((ele) => {
                if (arr2.indexOf(ele) < 0) {
                    reVal = false;
                }
            })
        }
        return reVal;
    }

    public static getFormulaResult(str: string): number {
        let regs = /^-?\d+$/;
        if (regs.test(str)) {
            return parseInt(str);
        }
        let _str = str.replace('*', '×');
        let __str = _str.replace('/', '÷');
        let str1 = __str.split('');
        let str2 = [];
        for (let i = 0; i < str1.length; i++) {
            if (!Number(str1[i]) && str1[i] != '.' && str1[i] != '0') {
                str2.push('|', str1[i], '|');
            }
            else {
                str2.push(str1[i]);
            }
        }
        let arr = str2.join('').split('|');
        let ops = '+-#×÷'.split('');
        let result = [];
        let temp = [];
        arr.forEach(function (ele, ind) {
            if (ele == '(') {
                temp.push(ele);
            }
            else if (ele == ')') {
                let flag = true;
                while (flag) {
                    if (temp[temp.length - 1] != '(') {
                        result.push(temp.pop());
                    }
                    else {
                        temp.pop();
                        flag = false;
                    }
                }
            }
            else if (ops.indexOf(ele) != -1) {
                let cmp = function (x, t) {
                    if (t.length == 0 || t[t.length - 1] == '(' ||
                        (ops.indexOf(x) - ops.indexOf(t[t.length - 1])) > 2) {
                        t.push(x);
                    }
                    else {
                        result.push(t.pop());
                        return cmp(x, t);
                    }
                }
                cmp(ele, temp);
            }
            else {
                result.push(ele);
            }
        })
        while (temp.length > 0) {
            if (temp[temp.length - 1] != '(') {
                result.push(temp.pop());
            }
            else {
                temp.pop();
            }
        }
        let res = result;
        result = [];
        res.forEach(function (ele, ind) {
            if (ele != '')
                result.push(ele);
        })
        let s = [];
        result.forEach(function (ele, ind) {
            let reg = /^\d+(\.\d+)?$/;
            if (reg.test(ele)) {
                s.push(ele);
            }
            else {
                let ans;
                let a = parseFloat(s.pop());
                let b = parseFloat(s.pop());
                if (ele == '+')
                    ans = a + b;
                if (ele == '-')
                    ans = b - a;
                if (ele == '×')
                    ans = a * b;
                if (ele == '÷')
                    ans = b / a;
                s.push(ans);
            }
        })
        return s[0];
    }

    public static getText(num: number, ...param: any[]) {
        return Core.StringUtils.format(Core.StringUtils.TEXT(num), param[0], param[1], param[2], param[3], param[4]);
    }

    //public static getResText(num: number, type: ResType) {
    //    return `${Core.StringUtils.getResConfirmText(num, type, "660000")}`;
    //}

    //fairyGUI的坐标转变成cc.Node的坐标
    public fairyPosToNodePos(x: number, y: number) {
        return { x: x, y: -y };
    }

    //node的触摸事件的坐标转化，cocos下总是x:480下，y：960下;(转到fgui.GRoot下去)
    public static touchPointToGRoot(x: number, y: number): cc.Vec2 {
        let _x = (fgui.GRoot.inst.width / 480) * x;
        let _y = (((960 - y) * fgui.GRoot.inst.height) / 960);
        return new cc.Vec2(_x, _y);
    }

    public static analyseInputNumberText(text: string): { num: number, reason: string } {
        let reVal = { num: null, reason: "" };
        let regs = /^-?\d+$/;
        if (!regs.test(text) || parseInt(text) <= 0) {
            if (parseInt(text) == 0) {
                reVal.reason = "请输入的数目大于0!";
            }
            else {
                reVal.reason = "请输入合法的数目!";
            }
        }
        else {
            reVal.num = parseInt(text);
        }
        return reVal;
    }

    public static isStrPureChinese(str: string) {
        let pattern = new RegExp("[\u4E00-\u9FA5]+");
        if (pattern.test(str)) {
            return true
        }
        return false;
    }

    public static isStrPureEnglish(str: string) {
        let pattern2 = new RegExp("[A-Za-z]+");
        if (pattern2.test(str)) {
            return true;
        }
        return false;
    }

    //public static numOrLongToNumber(num: number | Long) {
    //    if (typeof (num) == `number`) {
    //        return num;
    //    }
    //    else {
    //        return Utils.LongToNumber(num);
    //    }
    //}

    //public static numOrLongToLong(num: number | Long) {
    //    if (typeof (num) == `number`) {
    //        return Utils.NumberToLong(num);
    //    }
    //    else {
    //        return num;
    //    }
    //}

    //JS判断输入字符串长度（汉字算两个字符，字母数字算一个）
    public static getByteLen(val: string) {
        let len = 0;
        for (let i = 0; i < val.length; i++) {
            let a = val.charAt(i);
            if (a.match(/[^\x00-\xff]/ig) != null) {
                len += 2;
            }
            else {
                len += 1;
            }
        }
        return len;
    }

    public static printStack() {
        let e = new Error();
        let lines = e.stack.split('\n');
        lines.shift();
        lines.forEach((line) => {
            cc.log('line:', line);
        });
    }

    //JS替换字符串中指定位置的字符
    public static replaceStrChar(str: string, index: number, charStr: string) {
        return str.substring(0, index) + charStr + str.substring(index + 1);
    }

    //JS替换字符串中指定位置的字符串
    public static replaceStrInStr(text: string, start: number, stop: number, replacetext: string) {
        return text.substring(0, start) + replacetext + text.substring(stop + 1);
    }

    //js高效率去除重复数字
    public static hovercUnique(arr: number[]) {
        let result = []; let hash = {};
        for (let i = 0, elem = null; (elem = arr[i]) != null; i++) {
            if (!hash[elem]) {
                result.push(elem);
                hash[elem] = true;
            }
        }
        return result;
    }

    //public static skilId2RandomSkillPoolId(_skilIdOrspId: number, isReverse: boolean = false) {
    //    if (!isReverse) {
    //        let keysLength = Data.random_skill_pool.keys.length;
    //        for (let i = 1; i <= keysLength; i++) {
    //            let item = Data.random_skill_pool.get(i);
    //            if (!item) {
    //                return 0;
    //            }
    //            let skilId = item["skillid"] ? item["skillid"][0] : 0;
    //            if (_skilIdOrspId == skilId) {
    //                return i;
    //            }
    //        }
    //    }
    //    else {
    //        let keysLength = Data.random_skill_pool.keys.length;
    //        for (let i = 1; i <= keysLength; i++) {
    //            let item = Data.random_skill_pool.get(i);
    //            if (!item) {
    //                return 0;
    //            }
    //            if (_skilIdOrspId == i) {
    //                let skilId = item["skillid"] ? item["skillid"][0] : 0;
    //                return skilId;
    //            }
    //        }

    //    }
    //}

        public static printMat(obj: cc.Mat4) {
            let tm = (<any>obj).m;
            let str;
            if (tm) {
                str = "openGL矩阵为:[\n" +
                    tm[0] + ", " + tm[4] + ", " + tm[8] + ", " + tm[12] + ",\n" +
                    tm[1] + ", " + tm[5] + ", " + tm[9] + ", " + tm[13] + ",\n" +
                    tm[2] + ", " + tm[6] + ", " + tm[10] + ", " + tm[14] + ",\n" +
                    tm[3] + ", " + tm[7] + ", " + tm[11] + ", " + tm[15] + "\n" +
                    "]";
            } else {
                str = "[\n" +
                    "1, 0, 0, 0\n" +
                    "0, 1, 0, 0\n" +
                    "0, 0, 1, 0\n" +
                    "0, 0, 0, 1\n" +
                    "]";
            }
            console.log(str);
        }
    }

