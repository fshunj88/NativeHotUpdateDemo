class TestShiPie {

    private static _inst: TestShiPie = null;

    public static get inst(): TestShiPie {
        if (this._inst == null) {
            this._inst = new TestShiPie();
        }
        return this._inst;
    }

    public run() {
        console.log("TestShiPei..");
        let buttonNode = cc.find("Canvas/btn")
        buttonNode.on(cc.Node.EventType.TOUCH_END, () => {
            cc.game.restart();
        });
    }

    public test1() {

    }

}