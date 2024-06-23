class TestFont {
    private static _inst: TestFont = null;
    public static get inst(): TestFont {
        if (this._inst == null) {
            this._inst = new TestFont();
        }
        return this._inst;
    }

    public run() {
        console.log("TestFont..");
    }

    public test1() {

    }

}