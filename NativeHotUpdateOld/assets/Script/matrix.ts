const { ccclass, property } = cc._decorator;

@ccclass
export default class Matrix extends cc.Component {
    onLoad() {

    }

    update() {

    }

    printMat(obj) {
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
            str= "[\n" +
                "1, 0, 0, 0\n" +
                "0, 1, 0, 0\n" +
                "0, 0, 1, 0\n" +
                "0, 0, 0, 1\n" +
                "]";
        }
        console.log(str);
    }

    log(title) {
        console.log(`------------------${title}-------------------`);
        let wm = cc.mat4();
        this.node.getWorldMatrix(wm);
        console.log("---this.node._worldMatrix---");
        let shit = (<any>this.node)._worldMatrix;
        console.log("---1. [世界坐标矩阵]---");
        this.printMat(wm);

        let lm = cc.mat4();
        this.node.getLocalMatrix(lm);
        console.log("---2. [本地坐标矩阵]---");
        this.printMat(lm);

        console.log("---3. [当前各属性状态]---");

        console.log(`1. position: ${this.node.position.toString()}
2. scale: ${this.node.scale.toString()}
3. angle: ${this.node.angle}
4. skewX: ${this.node.skewX}
5. skewY: ${this.node.skewY}
6. width: ${this.node.width}
7. height: ${this.node.height}
8. parentWidth: ${this.node.parent.width}
9. parentHeight: ${this.node.parent.height}`)

        console.log("---4. [锚点角(0,0)坐标信息]---")
        let wordVec = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        let localVec = this.node.parent.convertToNodeSpaceAR(wordVec);
        let localVecX = this.node.convertToNodeSpaceAR(wordVec);
        console.log(`[AR-->]原点的世界坐标:${wordVec.toString()}  本地坐标: ${localVec.toString()}`);
        console.log(`[AR-->]localVecX:${localVecX.toString()}`);
        

        console.log("---5. [右上角(50,50)坐标信息]---")
        wordVec = this.node.convertToWorldSpaceAR(cc.v2(50, 50));
        localVec = this.node.parent.convertToNodeSpaceAR(wordVec);
        console.log(`[AR-->]右上角的世界坐标:${wordVec.toString()}  本地坐标: ${localVec.toString()}`);

    }

    start() {
        this.log("初始状态");
        //this.node.angle = -30;
        //this.log("After set angle = -30");
        //this.node.rotation = 30;
        //this.log("after set rotation = 30");
        //this.node.skewX = 30;
        //this.node.skewY = 30;
        //this.log("XY倾斜30°");
        //this.node.scale = 0.5;
        //this.log("缩小50%");
        //this.node.setPosition(10, 10);
        //this.log("平移(10,10)");
    }

}