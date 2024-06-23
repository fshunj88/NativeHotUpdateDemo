namespace Core {

    export class EffectUtil {

        private static rotationSet:Collection.Set<string>;
        private static effectId: number;

        /**
         * 对象旋转特效
         * @param display   旋转对象
         * @param time  旋转一周用时，毫秒
         */
        public static rotationEffect(display:fgui.GObject, time:number = 1000):void{
            if(this.rotationSet == null){
                this.rotationSet = new Collection.Set<string>();
            }
            if(this.rotationSet.contains(display.id)) {
                return;
            }

            this.rotationSet.add(display.id);
            let onComplete1:Function = function(){
                if(this.rotationSet.contains(display.id)){
                    display.rotation = 0;
                    egret.Tween.get(display).to({rotation:-360},time).call(onComplete1,this);   
                }
            };
            display.rotation = 0;
            egret.Tween.get(display).to({rotation:-360},time).call(onComplete1,this);
        }

        /**
         * 取消对象旋转
         * @param display    旋转对象
         */
        public static removeRotationEffect(display:fgui.GObject):void{
            if(this.rotationSet == null){
                this.rotationSet = new Collection.Set<string>();
            }
            this.rotationSet.remove(display.id);
            egret.Tween.removeTweens(display);
        }

        public static showLeftToRight(display:fgui.GObject): Promise<void> {
            if(display.parent == null){
                LayerManager.inst.maskLayer.addChild( display );
            }

            display.alpha = 0;

            return new Promise<void>(resolve => {
                display.y = fgui.GRoot.inst.height / 2 - display.height / 2;
                display.x = - display.width;

                egret.Tween.get(display).to({x:fgui.GRoot.inst.width/2 - display.width/2 - 50,alpha:1},300,egret.Ease.sineInOut);
                
                fgui.GTimers.inst.add(580, 1, ()=>{
                    egret.Tween.get(display).to({x:display.x + 100},800).to({x:fgui.GRoot.inst.width},300,egret.Ease.sineIn).call(()=>{
                        if(display.parent != null){
                            display.parent.removeChild( display );
                        }
                        resolve();
                    }, this);
                }, this);

            }) 
        }

        public static showLeftToRightWithAngel(display: fgui.GObject, angel: number): Promise<void> {
            if (display.parent == null) {
                LayerManager.inst.maskLayer.addChild(display);
            }

            display.alpha = 0;

            return new Promise<void>(resolve => {
                let startY = fgui.GRoot.inst.height / 2 + 200;
                display.y = startY;
                display.x = - display.width;

                let totaleWidth = fgui.GRoot.inst.width + display.width;
                let midX = fgui.GRoot.inst.width / 2 - display.width / 2 - 50;
                let midY = startY - (totaleWidth / 2 - display.width / 2) * Math.cos(angel);
                let maxMidX = midX;
                let maxMidY = startY - (totaleWidth / 2 - display.width / 2) * Math.cos(angel);
                let endY = startY - (totaleWidth - display.width) * Math.cos(angel);

                egret.Tween.get(display).to({ x: midX, y: midY, alpha: 1 }, 300, egret.Ease.sineInOut);

                fgui.GTimers.inst.add(580, 1, () => {
                    egret.Tween.get(display).to({ x: maxMidX, y: maxMidY }, 800).to({ x: fgui.GRoot.inst.width, y: endY }, 300, egret.Ease.sineIn).call(() => {
                        if (display.parent != null) {
                            display.parent.removeChild(display);
                        }
                        resolve();
                    }, this);
                }, this);
            });
        }

        public static showFromCenter(display:fgui.GObject, showTime:number=350, stayTime:number=900, hideTime:number=400): Promise<void> {
            if(display.parent == null){
                LayerManager.inst.maskLayer.addChild( display );
                display.y = fgui.GRoot.inst.height / 2;
                display.x = fgui.GRoot.inst.width / 2; 
            }
            
            display.alpha = 0;
            display.setPivot(0.5, 0.5, true);
            display.setScale(0, 0);
            
            return new Promise<void>(resolve => {
                egret.Tween.get(display).to({scaleX:1,scaleY:1,alpha:1}, showTime).wait(stayTime).to({alpha:0},hideTime).call(()=>{
                    display.removeFromParent();
                    resolve();
                }, this); 
            });
        }

        public static async blink(display:fgui.GComponent, color:cc.Color=Core.TextColors.white) {
            let mask = new fgui.GGraph();
            mask.width = display.width;
            mask.height = display.height;
            mask.drawRect(0, color.setA(0), color.setA(Math.floor(0.8 * 0xFF)), [7]);
            display.addChild(mask);

            await new Promise<void>(resolve => {
                egret.Tween.get(mask).to({alpha:0.4}, 110).wait(35).call(()=>{
                    display.removeChild(mask);
                }, null).wait(263).call(()=>{
                    resolve();
                }, this);
            })
        }

    }

}