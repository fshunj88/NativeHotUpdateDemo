///<reference path="egret.ts"/>
namespace egret {

    export interface IEventDispatcher {
        
        addEventListener(type:string, listener:Function, thisObject:any, useCapture?:boolean, priority?:number):void;
        
        once(type:string, listener:Function, thisObject:any, useCapture?:boolean, priority?:number):void;
        
        removeEventListener(type:string, listener:Function, thisObject:any, useCapture?:boolean):void;

        hasEventListener(type:string):boolean;

        dispatchEvent(event:Event):boolean;

        willTrigger(type:string):boolean;
    }

    // export class EventDispatcher extends cc.EventTarget implements IEventDispatcher {
    //     public dispatchEventWith(type: string, bubble: boolean = false, data: any = null) {
    //         let event = new cc.Event.EventCustom(type, bubble);
    //         event.setUserData(data);
    //         super.dispatchEvent(event);
    //     }

    //     public willTrigger(type:string):boolean {
    //         return this.hasEventListener(type);
    //     }

    //     public dispatchEvent(event:Event):boolean {
    //         super.dispatchEvent(event);
    //         return true;
    //     }

    //     public hasEventListener(type:string):boolean {
    //         return super.hasEventListener(type);
    //     }

    //     public removeEventListener(type:string, listener:Function, thisObject:any, useCapture?:boolean):void {
    //         this.off(type, listener, thisObject);
    //     }

    //     public once(type:string, callback: (arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any) => void, thisObject:any, useCapture?:boolean, priority?:number):void {
    //         super.once(type, callback, thisObject);
    //     }

    //     public addEventListener(type:string, listener:Function, thisObject:any, useCapture?:boolean, priority?:number):void {
    //         this.on(type, listener, thisObject, useCapture);
    //     }
    // }

        /**
     * @private
     */
    const enum Keys{
        eventTarget,
        eventsMap,
        captureEventsMap,
        notifyLevel
    }


    let ONCE_EVENT_LIST:egret.sys.EventBin[] = [];

    /**
     * The EventDispatcher class is the base class for all classes that dispatchEvent events. The EventDispatcher class implements
     * the IEventDispatcher interface and is the base class for the DisplayObject class. The EventDispatcher class allows
     * any object on the display list to be an event target and as such, to use the methods of the IEventDispatcher interface.
     * Event targets are an important part of the Egret event model. The event target serves as the focal point for how events
     * flow through the display list hierarchy. When an event such as a touch tap, Egret dispatches an event object into the
     * event flow from the root of the display list. The event object then makes its way through the display list until it
     * reaches the event target, at which point it begins its return trip through the display list. This round-trip journey
     * to the event target is conceptually divided into three phases: <br/>
     * the capture phase comprises the journey from the root to the last node before the event target's node, the target
     * phase comprises only the event target node, and the bubbling phase comprises any subsequent nodes encountered on
     * the return trip to the root of the display list. In general, the easiest way for a user-defined class to gain event
     * dispatching capabilities is to extend EventDispatcher. If this is impossible (that is, if the class is already extending
     * another class), you can instead implement the IEventDispatcher interface, create an EventDispatcher member, and write simple
     * hooks to route calls into the aggregated EventDispatcher.
     * @see egret.IEventDispatcher
     * @version Egret 2.4
     * @platform Web,Native
     * @includeExample egret/events/EventDispatcher.ts
     * @language en_US
     */
    /**
     * EventDispatcher 是 Egret 的事件派发器类，负责进行事件的发送和侦听。
     * 事件目标是事件如何通过显示列表层次结构这一问题的焦点。当发生鼠标单击、触摸或按键等事件时，
     * 框架会将事件对象调度到从显示列表根开始的事件流中。然后该事件对象在显示列表中前进，直到到达事件目标，
     * 然后从这一点开始其在显示列表中的回程。在概念上，到事件目标的此往返行程被划分为三个阶段：
     * 捕获阶段包括从根到事件目标节点之前的最后一个节点的行程，目标阶段仅包括事件目标节点，冒泡阶段包括回程上遇到的任何后续节点到显示列表的根。
     * 通常，使用户定义的类能够调度事件的最简单方法是扩展 EventDispatcher。如果无法扩展（即，如果该类已经扩展了另一个类），则可以实现
     * IEventDispatcher 接口，创建 EventDispatcher 成员，并编写一些简单的映射，将调用连接到聚合的 EventDispatcher 中。
     * @see egret.IEventDispatcher
     * @version Egret 2.4
     * @platform Web,Native
     * @includeExample egret/events/EventDispatcher.ts
     * @language zh_CN
     */
    export class EventDispatcher extends HashObject implements IEventDispatcher {

        /**
         * create an instance of the EventDispatcher class.
         * @param target The target object for events dispatched to the EventDispatcher object. This parameter is used when
         * the EventDispatcher instance is aggregated by a class that implements IEventDispatcher; it is necessary so that the
         * containing object can be the target for events. Do not use this parameter in simple cases in which a class extends EventDispatcher.
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 创建一个 EventDispatcher 类的实例
         * @param target 此 EventDispatcher 所抛出事件对象的 target 指向。此参数主要用于一个实现了 IEventDispatcher 接口的自定义类，
         * 以便抛出的事件对象的 target 属性可以指向自定义类自身。请勿在直接继承 EventDispatcher 的情况下使用此参数。
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public constructor(target:IEventDispatcher = null) {
            super();
            this.$EventDispatcher = {
                0: target ? target : this,
                1: {},
                2: {},
                3: 0
            };
        }

        /**
         * @private
         */
        $EventDispatcher:Object;

        /**
         * @private
         *
         * @param useCapture
         */
        $getEventMap(useCapture?:boolean) {
            let values = this.$EventDispatcher;
            let eventMap:any = useCapture ? values[Keys.captureEventsMap] : values[Keys.eventsMap];
            return eventMap;
        }

        /**
         * @inheritDoc
         * @version Egret 2.4
         * @platform Web,Native
         */
        public addEventListener(type:string, listener:Function, thisObject:any, useCapture?:boolean, priority?:number):void {
            this.$addListener(type, listener, thisObject, useCapture, priority);
        }

        /**
         * @inheritDoc
         * @version Egret 2.4
         * @platform Web,Native
         */
        public once(type:string, listener:Function, thisObject:any, useCapture?:boolean, priority?:number):void {
            this.$addListener(type, listener, thisObject, useCapture, priority, true);
        }

        /**
         * @private
         */
        $addListener(type:string, listener:Function, thisObject:any, useCapture?:boolean, priority?:number, dispatchOnce?:boolean):void {
            if (DEBUG && !listener) {
                $error(1003, "listener");
            }
            let values = this.$EventDispatcher;
            let eventMap:any = useCapture ? values[Keys.captureEventsMap] : values[Keys.eventsMap];
            let list:egret.sys.EventBin[] = eventMap[type];
            if (!list) {
                list = eventMap[type] = [];
            }
            else if (values[Keys.notifyLevel] !== 0) {
                eventMap[type] = list = list.concat();
            }

            this.$insertEventBin(list, type, listener, thisObject, useCapture, priority, dispatchOnce);
        }

        $insertEventBin(list:any[], type:string, listener:Function, thisObject:any, useCapture?:boolean, priority?:number, dispatchOnce?:boolean):boolean {
            priority = +priority | 0;
            let insertIndex = -1;
            let length = list.length;
            for (let i = 0; i < length; i++) {
                let bin = list[i];
                if (bin.listener == listener && bin.thisObject == thisObject && bin.target == this) {
                    return false;
                }
                if (insertIndex == -1 && bin.priority < priority) {
                    insertIndex = i;
                }
            }
            let eventBin:sys.EventBin = {
                type: type, listener: listener, thisObject: thisObject, priority: priority,
                target: this, useCapture: useCapture, dispatchOnce: !!dispatchOnce
            };
            if (insertIndex !== -1) {
                list.splice(insertIndex, 0, eventBin);
            }
            else {
                list.push(eventBin);
            }
            return true;
        }

        /**
         * @inheritDoc
         * @version Egret 2.4
         * @platform Web,Native
         */
        public removeEventListener(type:string, listener:Function, thisObject:any, useCapture?:boolean):void {

            let values = this.$EventDispatcher;
            let eventMap:Object = useCapture ? values[Keys.captureEventsMap] : values[Keys.eventsMap];
            let list:egret.sys.EventBin[] = eventMap[type];
            if (!list) {
                return;
            }
            if (values[Keys.notifyLevel] !== 0) {
                eventMap[type] = list = list.concat();
            }

            this.$removeEventBin(list, listener, thisObject);

            if (list.length == 0) {
                eventMap[type] = null;
            }
        }

        $removeEventBin(list:any[], listener:Function, thisObject:any):boolean {
            let length = list.length;
            for (let i = 0; i < length; i++) {
                let bin = list[i];
                if (bin.listener == listener && bin.thisObject == thisObject && bin.target == this) {
                    list.splice(i, 1);
                    return true;
                }
            }

            return false;
        }

        /**
         * @inheritDoc
         * @version Egret 2.4
         * @platform Web,Native
         */
        public hasEventListener(type:string):boolean {
            let values = this.$EventDispatcher;
            return !!(values[Keys.eventsMap][type] || values[Keys.captureEventsMap][type]);
        }

        /**
         * @inheritDoc
         * @version Egret 2.4
         * @platform Web,Native
         */
        public willTrigger(type:string):boolean {
            return this.hasEventListener(type);
        }


        /**
         * @inheritDoc
         * @version Egret 2.4
         * @platform Web,Native
         */
        public dispatchEvent(event:Event):boolean {
            event.$currentTarget = this.$EventDispatcher[Keys.eventTarget];
            event.$setTarget(event.$currentTarget);
            return this.$notifyListener(event, false);
        }

        /**
         * @private
         */
        $notifyListener(event:Event, capturePhase:boolean):boolean {
            let values = this.$EventDispatcher;
            let eventMap:Object = capturePhase ? values[Keys.captureEventsMap] : values[Keys.eventsMap];
            let list:egret.sys.EventBin[] = eventMap[event.$type];
            if (!list) {
                event.hasHandled = false;
                return true;
            }
            let length = list.length;
            if (length == 0) {
                event.hasHandled = false;
                return true;
            }
            let onceList = ONCE_EVENT_LIST;
            //做个标记，防止外部修改原始数组导致遍历错误。这里不直接调用list.concat()因为dispatch()方法调用通常比on()等方法频繁。
            values[Keys.notifyLevel]++;
            for (let i = 0; i < length; i++) {
                let eventBin = list[i];
                eventBin.listener.call(eventBin.thisObject, event);
                if (eventBin.dispatchOnce) {
                    onceList.push(eventBin);
                }
            }
            event.hasHandled = true;
            values[Keys.notifyLevel]--;
            while (onceList.length) {
                let eventBin = onceList.pop();
                eventBin.target.removeEventListener(eventBin.type, eventBin.listener, eventBin.thisObject, eventBin.useCapture);
            }
            return !event.$isDefaultPrevented;
        }

        /**
         * Distribute a specified event parameters.
         * @param type The type of the event. Event listeners can access this information through the inherited type property.
         * @param bubbles Determines whether the Event object bubbles. Event listeners can access this information through
         * the inherited bubbles property.
         * @param data {any} data
         * @param cancelable Determines whether the Event object can be canceled. The default values is false.
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 派发一个指定参数的事件。
         * @param type {string} 事件类型
         * @param bubbles {boolean} 确定 Event 对象是否参与事件流的冒泡阶段。默认值为 false。
         * @param data {any} 事件data
         * @param cancelable {boolean} 确定是否可以取消 Event 对象。默认值为 false。
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public dispatchEventWith(type:string, bubbles?:boolean, data?:any, cancelable?: boolean):boolean {
            if (bubbles || this.hasEventListener(type)) {
                let event: Event = new Event(type, bubbles);
                event.data = data;
                return this.dispatchEvent(event);
            }
            return true;
        }
    }
}

namespace egret.sys {
    /**
     * @private
     * 事件信息对象
     */
    export interface EventBin {

        type:string;
        /**
         * @private
         */
        listener: Function;
        /**
         * @private
         */
        thisObject:any;
        /**
         * @private
         */
        priority:number;
        /**
         * @private
         */
        target:IEventDispatcher;
        /**
         * @private
         */
        useCapture:boolean;
        /**
         * @private
         */
        dispatchOnce:boolean;
    }
}