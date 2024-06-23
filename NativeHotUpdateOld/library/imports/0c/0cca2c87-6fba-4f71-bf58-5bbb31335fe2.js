"use strict";
cc._RF.push(module, '0cca2yHb7pPcb9YW7sxM1/i', 'matrix');
// Script/matrix.ts

"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var Matrix = /** @class */ (function (_super) {
    __extends(Matrix, _super);
    function Matrix() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Matrix.prototype.onLoad = function () {
    };
    Matrix.prototype.update = function () {
    };
    Matrix.prototype.printMat = function (obj) {
        var tm = obj.m;
        var str;
        if (tm) {
            str = "openGL矩阵为:[\n" +
                tm[0] + ", " + tm[4] + ", " + tm[8] + ", " + tm[12] + ",\n" +
                tm[1] + ", " + tm[5] + ", " + tm[9] + ", " + tm[13] + ",\n" +
                tm[2] + ", " + tm[6] + ", " + tm[10] + ", " + tm[14] + ",\n" +
                tm[3] + ", " + tm[7] + ", " + tm[11] + ", " + tm[15] + "\n" +
                "]";
        }
        else {
            str = "[\n" +
                "1, 0, 0, 0\n" +
                "0, 1, 0, 0\n" +
                "0, 0, 1, 0\n" +
                "0, 0, 0, 1\n" +
                "]";
        }
        console.log(str);
    };
    Matrix.prototype.log = function (title) {
        console.log("------------------" + title + "-------------------");
        var wm = cc.mat4();
        this.node.getWorldMatrix(wm);
        console.log("---this.node._worldMatrix---");
        var shit = this.node._worldMatrix;
        console.log("---1. [世界坐标矩阵]---");
        this.printMat(wm);
        var lm = cc.mat4();
        this.node.getLocalMatrix(lm);
        console.log("---2. [本地坐标矩阵]---");
        this.printMat(lm);
        console.log("---3. [当前各属性状态]---");
        console.log("1. position: " + this.node.position.toString() + "\n2. scale: " + this.node.scale.toString() + "\n3. angle: " + this.node.angle + "\n4. skewX: " + this.node.skewX + "\n5. skewY: " + this.node.skewY + "\n6. width: " + this.node.width + "\n7. height: " + this.node.height + "\n8. parentWidth: " + this.node.parent.width + "\n9. parentHeight: " + this.node.parent.height);
        console.log("---4. [锚点角(0,0)坐标信息]---");
        var wordVec = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        var localVec = this.node.parent.convertToNodeSpaceAR(wordVec);
        var localVecX = this.node.convertToNodeSpaceAR(wordVec);
        console.log("[AR-->]\u539F\u70B9\u7684\u4E16\u754C\u5750\u6807:" + wordVec.toString() + "  \u672C\u5730\u5750\u6807: " + localVec.toString());
        console.log("[AR-->]localVecX:" + localVecX.toString());
        console.log("---5. [右上角(50,50)坐标信息]---");
        wordVec = this.node.convertToWorldSpaceAR(cc.v2(50, 50));
        localVec = this.node.parent.convertToNodeSpaceAR(wordVec);
        console.log("[AR-->]\u53F3\u4E0A\u89D2\u7684\u4E16\u754C\u5750\u6807:" + wordVec.toString() + "  \u672C\u5730\u5750\u6807: " + localVec.toString());
    };
    Matrix.prototype.start = function () {
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
    };
    Matrix = __decorate([
        ccclass
    ], Matrix);
    return Matrix;
}(cc.Component));
exports.default = Matrix;

cc._RF.pop();