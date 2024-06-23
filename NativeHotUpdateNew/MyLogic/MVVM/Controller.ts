namespace MVC {
    export class Controller {
        private static _inst: Controller;
        public static get inst(): Controller {
            if (!Controller._inst) {
                Controller._inst = new Controller();
            }
            return Controller._inst;
        }

        private __concern(model: Model, view: any, binding: boolean, immediate: boolean = true) {
            if (!model || !view) {
                return;
            }
            let __ob_mapping__ = (<any>Object.getPrototypeOf(view)).__ob_mapping__; // {modelName: {propName: handler}}
            if (!__ob_mapping__) {
                console.error("View has no observe map: ", view);
                return;
            }
            let __model_name__ = (<any>Object.getPrototypeOf(model)).__model_name__;
            if (!__model_name__) {
                console.error("Model has no name: ", model);
                return;
            }
            if (__ob_mapping__[__model_name__]) {
                let __handlers__ = __ob_mapping__[__model_name__]; // {propName: handler}
                let __prop_names__ = Object.keys(__handlers__);
                __prop_names__.forEach(__prop__name__ => {
                    let __handler__ = __handlers__[__prop__name__];
                    if (binding) {
                        if (immediate) {
                            model.watchPropImmediate(__prop__name__, __handler__, view);
                        } else {
                            model.watchProp(__prop__name__, __handler__, view);
                        }
                    } else {
                        model.unwatchProp(__prop__name__, __handler__, view);
                    }
                });
            }
        }

        public bind(model: Model, view: any, immediate: boolean = true) {
            this.__concern(model, view, true, immediate);
        }

        public unbind(model: Model, view: any) {
            this.__concern(model, view, false);
        }
    }
}
