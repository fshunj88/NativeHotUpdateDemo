namespace Core {
    //从对象池中存取的ui对象最好继承这个接口,方便review
    export interface IObjPoolComponent {
        resetUI(): void;
        resetEvent(): void
        clearData(): void;
        reset(): void;
        registerEvent(): void;
    }
}
