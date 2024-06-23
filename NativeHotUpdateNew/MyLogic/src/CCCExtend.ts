/**
 * 重写引擎方法，进行一些功能扩展
 */
class CCCExtend {
    /** 初始化扩展 */
    static init() {
        this._extendRenderFlow();
    }

    /** 扩展渲染流，新增层级渲染 */
    private static _extendRenderFlow() {
        let FlagOfset = 0;

        const DONOTHING = 1 << FlagOfset++;
        const BREAK_FLOW = 1 << FlagOfset++;
        const LOCAL_TRANSFORM = 1 << FlagOfset++;
        const WORLD_TRANSFORM = 1 << FlagOfset++;
        const TRANSFORM = LOCAL_TRANSFORM | WORLD_TRANSFORM;
        const UPDATE_RENDER_DATA = 1 << FlagOfset++;
        const OPACITY = 1 << FlagOfset++;
        const COLOR = 1 << FlagOfset++;
        const OPACITY_COLOR = OPACITY | COLOR;
        const RENDER = 1 << FlagOfset++;
        const CHILDREN = 1 << FlagOfset++;
        const POST_RENDER = 1 << FlagOfset++;
        const FINAL = 1 << FlagOfset++;

        const renderFlow = cc["RenderFlow"];
        const _batcher = renderFlow.getBachther();
        let __levelBatcher: { worldMatDirty: number, parentOpacityDirty }[] = [];
        //__renderQueue[0]表示层级0的所有孩子，而列表中同样层级的node都是同材质的；
        let __renderQueue: cc.Node[][] = [];

        Object.defineProperty(renderFlow.prototype, "_opacity", {
            value: function (node) {
                _batcher.parentOpacityDirty++;
                if (node["__levelRender"] && __levelBatcher[node["__itemIndex"]]) {
                    __levelBatcher[node["__itemIndex"]].parentOpacityDirty = 1;
                }
                this._next._func(node);

                node._renderFlag &= ~OPACITY;
                if (node["__levelRender"] && __levelBatcher[node["__itemIndex"]] && node["__lastChildren"]) {
                    __levelBatcher[node.__itemIndex].parentOpacityDirty = 0;
                }
                _batcher.parentOpacityDirty--;
            }
        })
        Object.defineProperty(renderFlow.prototype, "_worldTransform", {
            value: function (node) {
                _batcher.worldMatDirty++;
                if (node["__levelRender"] && __levelBatcher[node["__itemIndex"]]) {
                    __levelBatcher[node["__itemIndex"]].worldMatDirty = 1;
                }

                let t = node._matrix;
                let trs = node._trs;
                let tm = t.m;
                tm[12] = trs[0];
                tm[13] = trs[1];
                tm[14] = trs[2];

                node._mulMat(node._worldMatrix, node._parent._worldMatrix, t);
                node._renderFlag &= ~WORLD_TRANSFORM;
                this._next._func(node);

                if (node["__levelRender"] && __levelBatcher[node["__itemIndex"]] && node["__lastChildren"]) {
                    __levelBatcher[node.__itemIndex].worldMatDirty = 0;
                }
                _batcher.worldMatDirty--;
            }
        });

        const levelSplit = (node: cc.Node, lv: number, itemIndex) => {
            if (!__renderQueue[lv]) {
                __renderQueue[lv] = [];
            }
            __renderQueue[lv].push(node);
            lv++;
            node["__renderLv"] = lv;
            node["__levelRender"] = true;
            node["__itemIndex"] = itemIndex;
            const cs = node.children;
            for (let i = 0; i < cs.length; ++i) {
                const c = cs[i];
                if (!__renderQueue[lv]) {
                    __renderQueue[lv] = [];
                }
                lv = levelSplit(c, lv, itemIndex);
            }
            return lv;
        }

        const checkLevelRender = (levelRenderNode: cc.Node) => {
            const cs = levelRenderNode.children;
            let rootOpacityInHierarchy = levelRenderNode["opacity"] / 255;
            __levelBatcher = [];
            for (let i = 0; i < cs.length; ++i) {
                __levelBatcher.push({ worldMatDirty: 0, parentOpacityDirty: 0 });
                levelSplit(cs[i], 0, i);
            }
            while (__renderQueue.length > 0) {
                const list = __renderQueue.shift();
                if (list.length > 0) {
                    while (list.length > 0) {
                        const n = list.shift();
                        n["__lastChildren"] = __renderQueue.length == 0;
                        n["__levelRender"] = true;
                        let opacityInHierarchy = n.parent["__opacityInHierarchy"];
                        if (opacityInHierarchy === undefined) {
                            opacityInHierarchy = rootOpacityInHierarchy;
                        }

                        let opacity = (opacityInHierarchy * (n["_opacity"] / 255));
                        n["__opacityInHierarchy"] = opacity;
                        let cullingMask = n["_cullingMask"];
                        let worldMatDirty = 0;
                        if (__levelBatcher[n["__itemIndex"]]) {
                            worldMatDirty = __levelBatcher[n["__itemIndex"]].worldMatDirty || 0;
                        }
                        let parentOpacityDirty = 0;
                        if (__levelBatcher[n["__itemIndex"]]) {
                            parentOpacityDirty = __levelBatcher[n["__itemIndex"]].parentOpacityDirty || 0;
                        }

                        let worldTransformFlag = (worldMatDirty || _batcher.worldMatDirty) ? WORLD_TRANSFORM : 0;
                        let worldOpacityFlag = (parentOpacityDirty || _batcher.parentOpacityDirty) ? OPACITY_COLOR : 0;
                        let worldDirtyFlag = worldTransformFlag | worldOpacityFlag;
                        n["_renderFlag"] |= worldDirtyFlag;
                        if (!n["_activeInHierarchy"] || n["_opacity"] === 0) continue;
                        n["_cullingMask"] = n.groupIndex === 0 ? cullingMask : 1 << n.groupIndex;
                        // TODO: Maybe has better way to implement cascade opacity
                        let colorVal = n["_color"]._val;
                        n["_color"]._fastSetA(n["_opacity"] * opacity);
                        renderFlow.flows[n["_renderFlag"]]._func(n);
                        n["_color"]._val = colorVal;
                    }
                }
            }
        }

        Object.defineProperty(renderFlow.prototype, "_children", {
            value: function (node) {
                if (node.__levelRender) return;
                let cullingMask = node._cullingMask;

                let enableLevelRender = node["__enableLevelRender"];

                const parentOpacityInHierarchy = node.parent ? node.parent["__opacityInHierarchy"] : undefined;
                let parentOpacity = parentOpacityInHierarchy !== undefined ? parentOpacityInHierarchy : _batcher.parentOpacity;
                if (!enableLevelRender && !node.__levelRender) {
                    let opacity = (parentOpacity *= (node._opacity / 255));
                    node["__opacityInHierarchy"] = opacity;

                    let worldTransformFlag = _batcher.worldMatDirty ? WORLD_TRANSFORM : 0;
                    let worldOpacityFlag = _batcher.parentOpacityDirty ? OPACITY_COLOR : 0;
                    let worldDirtyFlag = worldTransformFlag | worldOpacityFlag;
                    let children = node._children;
                    for (let i = 0, l = children.length; i < l; i++) {
                        let c = children[i];
                        // Advance the modification of the flag to avoid node attribute modification is invalid when opacity === 0.
                        c._renderFlag |= worldDirtyFlag;
                        c["__opacityInHierarchy"] = c._opacity * opacity / 255;
                        if (!c._activeInHierarchy || c._opacity === 0) continue;

                        c._cullingMask = c.groupIndex === 0 ? cullingMask : 1 << c.groupIndex;

                        // TODO: Maybe has better way to implement cascade opacity
                        let colorVal = c._color._val;
                        c._color._fastSetA(c._opacity * opacity);
                        renderFlow.flows[c._renderFlag]._func(c)
                        c._color._val = colorVal;
                    }
                } else {
                    checkLevelRender(node);
                }
                _batcher.parentOpacity = parentOpacity;

                this._next._func(node);
            }
        })
    }
}