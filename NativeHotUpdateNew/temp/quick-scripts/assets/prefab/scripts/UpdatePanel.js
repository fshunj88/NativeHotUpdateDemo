(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/prefab/scripts/UpdatePanel.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '7ceeeHkyWVLj5BQE90AZN88', 'UpdatePanel', __filename);
// prefab/scripts/UpdatePanel.js

"use strict";

module.exports = cc.Class({
    extends: cc.Component,

    properties: {
        info: cc.Label,
        fileProgress: cc.ProgressBar,
        fileLabel: cc.Label,
        byteProgress: cc.ProgressBar,
        byteLabel: cc.Label,
        checkBtn: cc.Node,
        updateBtn: cc.Node
    },

    onLoad: function onLoad() {}
});

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=UpdatePanel.js.map
        