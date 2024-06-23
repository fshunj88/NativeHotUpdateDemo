namespace MVC {

    /**
     * NOTE: 有关装饰器的文档，参考 https://www.tslang.cn/docs/handbook/decorators.html
     */

    let g_modelId = 0;

    /**
     * 类装饰器
     * 用于Model的子类，自动给派生类命名，保存在构造函数的元类型中，以供框架内部使用。
     * 如果子类也有派生类，同样必须加此装饰器，否则将和父类共用一个内部名称。
     * @example
     * <code>
     *  @MVC.autoModelName
     *  class MyData extends Model {
     *      ...
     *  }
     * </code>
     */
    export function autoModelName<T extends {new (...args: any[]):{}}>(constructor: T) {
        g_modelId ++;
        constructor.prototype.__model_name__ = "Model" + g_modelId;
        return class extends constructor {};
    }

    /**
     * 方法装饰器
     * 用于任意类（Model子类除外）的成员方法，加了该装饰器的方法将映射表保存在自己的元类型中。映射表会被子类继承。
     * @param cls 关注的Model派生类类型
     * @param propName 关注的属性名
     * @example
     * <code>
     *  class MyView {
     *      @MVC.observe(MyData, "propertyX")
     *      public onPropertyXChange(value: any) {
     *          ...
     *      }
     *  }
     * </code>
     */
    export function observe(cls: any, propName: string) {
        return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
            if (!target.__ob_mapping__) {
                target.__ob_mapping__ = {};
            }
            let __model_name__ = (<any>cls.prototype).__model_name__;
            if (!__model_name__) {
                console.error("Please add '@autoModelName' decorator to class ", cls);
            } else {
                if (!target.__ob_mapping__[__model_name__]) {
                    target.__ob_mapping__[__model_name__] = {};
                }
                target.__ob_mapping__[__model_name__][propName] = target[propertyKey];
            }
        }
    }
}