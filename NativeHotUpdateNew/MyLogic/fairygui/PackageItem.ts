//namespace fgui {
//
//    export class PackageItem {
//        public owner: UIPackage;
//
//        public type: PackageItemType;
//        public objectType?: ObjectType;
//        public id: string;
//        public name: string;
//        public width: number = 0;
//        public height: number = 0;
//        public file: string;
//        public decoded?: boolean;
//        public loading?: Array<Function>;
//        public rawData?: ByteBuffer;
//        public asset?: cc.Texture2D | cc.SpriteFrame | cc.AudioClip | cc.LabelAtlas;
//
//        public highResolution?: Array<string>;
//        public branches?: Array<string>;
//
//        //image
//        public scale9Grid?: cc.Rect;
//        public scaleByTile?: boolean;
//        public tileGridIndice?: number;
//        public smoothing?: boolean;
//        public hitTestData?: PixelHitTestData;
//
//        //movieclip
//        public interval?: number;
//        public repeatDelay?: number;
//        public swing?: boolean;
//        public frames?: Array<Frame>;
//
//        //componenet
//        public extensionType?: any;
//
//        //skeleton
//        public skeletonAnchor?: cc.Vec2;
//        public atlasAsset?: dragonBones.DragonBonesAtlasAsset;
//
//        public constructor() {
//        }
//
//        public load(): any {
//            return this.owner.getItemAsset(this);
//        }
//
//        public getBranch(): PackageItem {
//            if (this.branches && this.owner._branchIndex != -1) {
//                var itemId: string = this.branches[this.owner._branchIndex];
//                if (itemId)
//                    return this.owner.getItemById(itemId);
//            }
//
//            return this;
//        }
//
//        public getHighResolution(): PackageItem {
//            if (this.highResolution && GRoot.contentScaleLevel > 0) {
//                var itemId: string = this.highResolution[GRoot.contentScaleLevel - 1];
//                if (itemId)
//                    return this.owner.getItemById(itemId);
//            }
//
//            return this;
//        }
//
//        public toString(): string {
//            return this.name;
//        }
//    }
//}
namespace fgui {

    class PackageItemLoadListener {
        public callback: Function;
        public thisArgs: any;

        public compare(callback: Function, thisArgs: any): boolean {
            return this.callback == callback && this.thisArgs == thisArgs;
        }

        public call(args: any) {
            if (this.thisArgs) {
                this.callback.apply(this.thisArgs, [args]);
            } else {
                this.callback(args);
            }
        }
    }

    export class PackageItem {
        public owner: UIPackage;

        public type: PackageItemType;
        public objectType: ObjectType;
        public id: string;
        public name: string;
        public width: number = 0;
        public height: number = 0;
        public file: string;
        public decoded: boolean;
        public loading: boolean;
        public rawData: ByteBuffer;
        public asset: cc.Texture2D | cc.SpriteFrame | cc.AudioClip | cc.LabelAtlas;

        public highResolution: Array<string>;
        public branches: Array<string>;

        //image
        public scale9Grid: cc.Rect;
        public scaleByTile: boolean;
        public tileGridIndice: number = 0;
        public smoothing: boolean;
        public hitTestData: PixelHitTestData;

        //movieclip
        public interval: number = 0;
        public repeatDelay: number = 0;
        public swing: boolean;
        public frames: Array<Frame>;

        //componenet
        public extensionType: any;



        public constructor() {
        }

        public setup(buffer: ByteBuffer, url: string) {
        }

        private _listeners: PackageItemLoadListener[] = [];

        public onLoad(onComplete: (asset: cc.Texture2D | cc.SpriteFrame | cc.AudioClip | cc.LabelAtlas) => void, thisArgs: any) {
            let lsn = new PackageItemLoadListener();
            lsn.callback = onComplete;
            lsn.thisArgs = thisArgs;
            if (this.decoded) {
                lsn.call(this.asset);
            } else {
                this._listeners.push(lsn);
                if (!this.loading) {
                    this.loading = true;
                    this._doLoad((asset) => {
                        this.loading = false;
                        this.decoded = true;
                        this.asset = asset;
                        let listeners = this._listeners;
                        this._listeners = [];
                        listeners.forEach(lsn => {
                            lsn.call(asset);
                        });
                    })
                }
            }
        }

        protected _doLoad(callback: (asset: any) => void) {
            callback(null);
        }

        public offLoad(onComplete: Function, thisArgs: any) {
            let idx = -1;
            let cnt = this._listeners.length;
            for (let i = 0; i < cnt; ++i) {
                if (this._listeners[i].compare(onComplete, thisArgs)) {
                    idx = i;
                    break;
                }
            }
            if (idx >= 0) {
                this._listeners.splice(idx, 1);
            }
        }

        public load(): any {
            return this.owner.getItemAsset(this);
        }

        public getBranch(): PackageItem {
            if (this.branches && this.owner._branchIndex != -1) {
                var itemId: string = this.branches[this.owner._branchIndex];
                if (itemId)
                    return this.owner.getItemById(itemId);
            }

            return this;
        }

        public getHighResolution(): PackageItem {
            if (this.highResolution && GRoot.contentScaleLevel > 0) {
                var itemId: string = this.highResolution[GRoot.contentScaleLevel - 1];
                if (itemId)
                    return this.owner.getItemById(itemId);
            }

            return this;
        }

        public toString(): string {
            return this.name;
        }

        public getSizeRateInAtlas(): cc.Vec2 {
            let sprites = (<any>this.owner)._sprites;
            let atlasSprite = sprites[this.id];
            if (atlasSprite) {
                if (atlasSprite.atlas && atlasSprite.originalSize) {
                    let atlas = atlasSprite.atlas;
                    let size = atlasSprite.originalSize;
                    return new cc.Vec2(size.width / atlas.width, size.height / atlas.height);
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }
    }

    export class PackageImageItem extends PackageItem {
        public setup(buffer: ByteBuffer) {
            this.objectType = ObjectType.Image;
            var scaleOption: number = buffer.readByte();
            if (scaleOption == 1) {
                this.scale9Grid = new cc.Rect();
                this.scale9Grid.x = buffer.readInt();
                this.scale9Grid.y = buffer.readInt();
                this.scale9Grid.width = buffer.readInt();
                this.scale9Grid.height = buffer.readInt();

                this.tileGridIndice = buffer.readInt();
            }
            else if (scaleOption == 2)
                this.scaleByTile = true;

            this.smoothing = buffer.readBool();
        }

        protected _doLoad(callback: (asset: any) => void) {
            var sprite: AtlasSprite = this.owner.getAtlasSprite(this.id);
            if (sprite != null) {
                sprite.atlas.onLoad((atlas) => {
                    if (atlas) {
                        let atlasTexture: cc.Texture2D = <cc.Texture2D>atlas;
                        let sf = new cc.SpriteFrame(atlasTexture, sprite.rect, sprite.rotated,
                            new cc.Vec2(sprite.offset.x - (sprite.originalSize.width - sprite.rect.width) / 2, -(sprite.offset.y - (sprite.originalSize.height - sprite.rect.height) / 2)),
                            sprite.originalSize);
                        if (this.scale9Grid) {
                            sf.insetLeft = this.scale9Grid.x;
                            sf.insetTop = this.scale9Grid.y;
                            sf.insetRight = this.width - this.scale9Grid.xMax;
                            sf.insetBottom = this.height - this.scale9Grid.yMax;
                        }
                        callback(sf);
                    } else {
                        callback(null);
                    }
                }, null);
            } else {
                callback(null);
            }
        }
    }

    export class PackageMovieClipItem extends PackageItem {
        public setup(buffer: ByteBuffer, url: string) {
            this.smoothing = buffer.readBool();
            this.objectType = ObjectType.MovieClip;
            this.rawData = buffer.readBuffer();
        }

        private _loadFrame(i: number, buffer: ByteBuffer, callback: () => void) {
            if (i >= this.frames.length) {
                callback();
            } else {
                var nextPos: number = buffer.readShort();
                nextPos += buffer.position;

                let frame = new Frame();
                frame.rect.x = buffer.readInt();
                frame.rect.y = buffer.readInt();
                frame.rect.width = buffer.readInt();
                frame.rect.height = buffer.readInt();
                frame.addDelay = buffer.readInt() / 1000;
                let spriteId = buffer.readS();
                let sprite: AtlasSprite;

                if (spriteId != null && (sprite = this.owner.getAtlasSprite(spriteId)) != null) {
                    sprite.atlas.onLoad((asset) => {
                        if (asset != null) {
                            let atlasTexture: cc.Texture2D = <cc.Texture2D>asset;
                            let sx: number = this.width / frame.rect.width;
                            frame.texture = new cc.SpriteFrame(atlasTexture, sprite.rect, sprite.rotated,
                                new cc.Vec2(frame.rect.x - (this.width - frame.rect.width) / 2, -(frame.rect.y - (this.height - frame.rect.height) / 2)),
                                new cc.Size(this.width, this.height));
                        }
                        this.frames[i] = frame;
                        buffer.position = nextPos;
                        this._loadFrame(i + 1, buffer, callback);
                    }, null);
                } else {
                    this.frames[i] = frame;
                    buffer.position = nextPos;
                    this._loadFrame(i + 1, buffer, callback);
                }
            }
        }

        protected _doLoad(callback: (asset: any) => void) {
            var buffer: ByteBuffer = this.rawData;

            buffer.seek(0, 0);

            this.interval = buffer.readInt() / 1000;
            this.swing = buffer.readBool();
            this.repeatDelay = buffer.readInt() / 1000;

            buffer.seek(0, 1);

            var frameCount: number = buffer.readShort();
            this.frames = Array<Frame>(frameCount);

            this._loadFrame(0, buffer, () => {
                callback(null);
            });
        }
    }

    export class PackageFontItem extends PackageItem {
        public setup(buffer: ByteBuffer, url: string) {
            this.rawData = buffer.readBuffer();
        }

        private _assembleFont(mainSprite: AtlasSprite) {
            let retSprites: AtlasSprite[] = [];
            var font: any = new cc.LabelAtlas();
            this.asset = font;
            font._fntConfig = {
                commonHeight: 0,
                fontSize: 0,
                kerningDict: {},
                fontDefDictionary: {}
            };
            let dict = font._fntConfig.fontDefDictionary;

            var buffer: ByteBuffer = this.rawData;

            buffer.seek(0, 0);

            let ttf = buffer.readBool();
            let canTint = buffer.readBool();
            let resizable = buffer.readBool();
            buffer.readBool(); //has channel
            let fontSize = buffer.readInt();
            var xadvance: number = buffer.readInt();
            var lineHeight: number = buffer.readInt();

            buffer.seek(0, 1);

            var bg: any = null;
            var cnt: number = buffer.readInt();
            for (var i: number = 0; i < cnt; i++) {
                var nextPos: number = buffer.readShort();
                nextPos += buffer.position;

                bg = {};
                var ch: number = buffer.readUshort();
                dict[ch] = bg;

                let rect: cc.Rect = new cc.Rect();
                bg.rect = rect;

                var img: string = buffer.readS();
                rect.x = buffer.readInt();
                rect.y = buffer.readInt();
                bg.xOffset = buffer.readInt();
                bg.yOffset = buffer.readInt();
                rect.width = buffer.readInt();
                rect.height = buffer.readInt();
                bg.xAdvance = buffer.readInt();
                bg.channel = buffer.readByte();
                if (bg.channel == 1)
                    bg.channel = 3;
                else if (bg.channel == 2)
                    bg.channel = 2;
                else if (bg.channel == 3)
                    bg.channel = 1;

                if (ttf) {
                    rect.x += mainSprite.rect.x;
                    rect.y += mainSprite.rect.y;
                }
                else {
                    let sprite: AtlasSprite = this.owner.getAtlasSprite(img);
                    if (sprite) {
                        rect.set(sprite.rect);
                        bg.xOffset += sprite.offset.x;
                        bg.yOffset += sprite.offset.y;
                        if (fontSize == 0)
                            fontSize = sprite.originalSize.height;
                        // if (!mainTexture) {
                        //     sprite.atlas.load();
                        //     mainTexture = <cc.Texture2D>sprite.atlas.asset;
                        // }
                        retSprites.push(sprite);
                    }

                    if (bg.xAdvance == 0) {
                        if (xadvance == 0)
                            bg.xAdvance = bg.xOffset + bg.rect.width;
                        else
                            bg.xAdvance = xadvance;
                    }
                }

                buffer.position = nextPos;
            }


            font.fontSize = fontSize;
            font._fntConfig.fontSize = fontSize;
            font._fntConfig.commonHeight = lineHeight == 0 ? fontSize : lineHeight;
            font._fntConfig.resizable = resizable;
            font._fntConfig.canTint = canTint;

            return retSprites;
        }

        private _tryLoadTexture(idx: number, sprites: AtlasSprite[], callback: (atlas: cc.Texture2D) => void) {
            if (idx >= sprites.length) {
                callback(null);
            } else {
                let sprite = sprites[idx];
                if (sprite) {
                    sprite.atlas.onLoad((atlas) => {
                        if (atlas) {
                            callback(<cc.Texture2D>atlas);
                        } else {
                            this._tryLoadTexture(idx + 1, sprites, callback);
                        }
                    }, null);
                } else {
                    this._tryLoadTexture(idx + 1, sprites, callback);
                }
            }
        }

        protected _doLoad(callback: (asset: any) => void) {
            let mainSprite: AtlasSprite = this.owner.getAtlasSprite(this.id);
            let subSprites: AtlasSprite[] = this._assembleFont(mainSprite);
            if (mainSprite) {
                subSprites.unshift(mainSprite);
            }
            let self = this;
            this._tryLoadTexture(0, subSprites, (texture) => {
                if (texture) {
                    let spriteFrame = new cc.SpriteFrame();
                    spriteFrame.setTexture(texture);
                    (<any>(self.asset)).spriteFrame = spriteFrame;
                    (<any>(self.asset)).onLoad();
                    callback(self.asset);
                } else {
                    console.error("[PackageFontItem] no texture for font", this.name);
                    callback(null);
                }
            });
        }
    }

    export class PackageComponentItem extends PackageItem {
        public setup(buffer: ByteBuffer, url: string) {
            var extension: number = buffer.readByte();
            if (extension > 0)
                this.objectType = extension;
            else
                this.objectType = ObjectType.Component;
            this.rawData = buffer.readBuffer();

            UIObjectFactory.resolveExtension(this);
        }

        protected _doLoad(callback: (asset: any) => void) {
            callback(null);
        }
    }

    export class PackageAtlasItem extends PackageItem {
        public setup(buffer: ByteBuffer, url: string) {
            this.file = url + cc.path.mainFileName(this.file);
        }

        protected _doLoad(callback: (asset: any) => void) {
            cc.loader.loadRes(this.file, cc.Texture2D, (err: Error, asset: any) => {
                if (!asset || !asset.loaded) {
                    console.log("Resource '" + this.file + "' not found");
                    callback(null);
                } else {
                    callback(asset);
                }
            });
        }
    }

    export class PackageSoundItem extends PackageItem {
        public setup(buffer: ByteBuffer, url: string) {
            this.file = url + cc.path.mainFileName(this.file);
        }

        protected _doLoad(callback: (asset: any) => void) {
            cc.loader.loadRes(this.file, cc.AudioClip, (err: Error, asset: any) => {
                if (!asset || !asset.loaded) {
                    console.log("Resource '" + this.file + "' not found");
                    callback(null);
                } else {
                    callback(asset);
                }
            });
        }
    }

    export class PackageMiscItem extends PackageItem {
        public setup(buffer: ByteBuffer, url: string) {
            this.file = url + cc.path.mainFileName(this.file);
        }

        protected _doLoad(callback: (asset: any) => void) {
            if (this.file) {
                cc.loader.loadRes(this.file, cc.Asset, (err: Error, asset: any) => {
                    if (!asset || !asset.loaded) {
                        console.log("Resource '" + this.file + "' not found");
                        callback(null);
                    } else {
                        callback(asset);
                    }
                });
            } else {
                callback(null);
            }
        }
    }
}