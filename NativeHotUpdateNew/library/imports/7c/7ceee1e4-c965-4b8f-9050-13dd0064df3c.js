"use strict";
cc._RF.push(module, '7ceeeHkyWVLj5BQE90AZN88', 'UpdatePanel');
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