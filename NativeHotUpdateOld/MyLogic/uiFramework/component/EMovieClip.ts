namespace Core {

    export class EMovieClip extends fgui.GComponent {
        private _movieClip: fgui.GMovieClip;
        private _isTop: boolean;

        constructor(movieClip: fgui.GMovieClip, makeNode3d: boolean) {
            super();
            this._movieClip = movieClip;
            if (makeNode3d) {
                Utils.makeNode3DIfSupported(this._movieClip.node);
            }
            this._movieClip["$owner"] = this;
            this._movieClip.touchable = false;
            this._movieClip.setPivot(0.5, 0.5, true);
            this.width = this._movieClip.width;
            this.height = this._movieClip.height;
            this._movieClip.x = this.width / 2;
            this._movieClip.y = this.height / 2;
            this._movieClip.addRelation(this, fgui.RelationType.Size);
            this._movieClip.addRelation(this, fgui.RelationType.Center_Center);
            this._movieClip.addRelation(this, fgui.RelationType.Middle_Middle);
            //默认居中，置顶
            this.setPivot(0.5, 0.5, true);
            this._isTop = true;
            //this.movieSetData();
            this.addChild(this._movieClip);
            // this.initWidth = this.sourceWidth = this._movieClip.width;
            // this.initHeight = this.sourceHeight = this._movieClip.height;
        }

        //public movieSetData() {
        //    let weapon = this._movieClip.packageItem.name;
        //    for (let k of Data.redframe.keys) {
        //        let weaponData = Data.redframe.get(k);
        //        if (weaponData.weapon == weapon) {
        //            let offSetY = weaponData.offset_y;
        //            this.setPivot(0.5, offSetY / 100, true);
        //            this._isTop = weaponData.top === 0;
        //            break;
        //        }
        //    }

        //}

        public resetHeigh() {
            let adjustHeight = this.height;
            this.height = 0;
            this.height = adjustHeight;
        }

        public destroy() {
            if (this._movieClip) {
                this._movieClip.dispose();
                this._movieClip = null;
            }
            this.dispose();
        }

        public get totalFrames(): number {
            return this._movieClip.frameCount;
        }

        public get isTop(): boolean {
            return this._isTop;
        }

        //public get isStayTop(): boolean {
        //    let weapon = this._movieClip.packageItem.name;
        //    let isStayTops = false;
        //    for (let k of Data.redframe.keys) {
        //        let weaponData = Data.redframe.get(k);
        //        if (weaponData.weapon == weapon) {
        //            isStayTops = weaponData.top == -1 /*|| weapon.indexOf("dawu") >= 0*/;
        //        }
        //    }
        //    return isStayTops;
        //}

        public gotoAndPlay(frame: string | number, playTimes?: number): void {
            if (typeof (frame) == "string") {
                frame = parseInt(frame);
            }
            frame = Math.max(0, frame - 1);
            playTimes = Math.max(0, playTimes);
            this._movieClip.setPlaySettings(frame, -1, playTimes);
            this._movieClip.playing = true;
        }

        public gotoAndStop(frame: string | number): void {
            if (typeof (frame) == "string") {
                frame = parseInt(frame);
            }
            this._movieClip.frame = Math.max(0, frame - 1);
            this._movieClip.playing = false;
        }

        public stop(): void {
            this._movieClip.playing = false;
        }

        public once(type: string, listener: Function, thisObject: any, useCapture?: boolean, priority?: number): void {
            this._movieClip.once(type, listener, thisObject, useCapture);
            // TODO
            //this._movieClip.setPlaySettings(0, -1, 1, -1, listener, thisObject)
        }

        public addFrameEvent(frameNum: number, name: string) {
            console.log("addFrameEvent ", frameNum, name);
            this._movieClip.addFrameEvent(Math.max(0, frameNum - 1), name);
            // TODO
            // let frames:[cc.SpriteFrame] = [
            //     null
            // ];
            // frames.pop();
            // frames.push(new cc.SpriteFrame(cc.url.raw("resources/1.png")));
            // let clip = cc.AnimationClip.createWithSpriteFrames(frames, 5);
            // clip.events.push({
            //     frame: 1,
            //     func: "",
            //     params: ["1, 2"]
            // })
            // let animation = this.node.addComponent(cc.Animation);
            // animation.addClip(clip);
            // animation.play
        }
    }

}