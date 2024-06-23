class TestPromise {

    private static _inst: TestPromise = null;

    public static get inst(): TestPromise {
        if (this._inst == null) {
            this._inst = new TestPromise();
        }
        return this._inst;
    }

    public run() {
        console.log("TestPromise..");
        //this.test1();
        //this.test2();
        //this.test3();
        this.test7();
    }

    public test1() {
        console.log("--------2.1 Promise基本用法-----------");
        const resultPromise1 = new Promise((resolve, reject) => {
            resolve("成功了");
        });
        resultPromise1.then(res => console.log(res));

        const resultPromise2 = new Promise((resolve, reject) => {
            reject("失败了");
        });
        // 失败回调获取-写法1
        resultPromise2.then(null, err => console.log(err));
        // 失败回调获取-写法2
        resultPromise2.then(null, null).catch(err => console.log(err));
    }

    //阻塞线程
    public test2() {
        const resultPromise1 = new Promise((resolve, reject) => {
            while (1) {
                console.log("ff");
            }
        });
    }

    //永不resolve和reject的promise，即使执行完了之后仍然是pending状态，并且它后面的then不会执行；
    //只有它的状态变成resolve或者rejected才会触发then回调
    //pending状态的promise,没有任何引用了，会被回收
    public test3() {
        const resultPromise1 = new Promise((resolve, reject) => {
            console.log("resultPromise1 completed!");
            //resolve(null);
        });
        resultPromise1.then(res => console.log("then ourput:" + res));
        setInterval(() => {
            console.log("resultPromise1--", resultPromise1);
        }, 10);
    }

    public test4() {
        console.log("----------3. Promise的三种状态----------");
        /* const myPromise = new Promise((resolve, reject) => {
            resolve("333");
        });
        myPromise.then(res => {}).catch(err => {}); */
        // 下面代码是立即执行的，等价于上面代码
        new Promise((resolve, reject) => {
            // 状态1 该进来的时候是 pending状态, 待定状态
            console.log("------------------------");
            resolve(11); //状态2 fulfilled 成功状态
            reject(22); //状态3  rejected 失败状态 (注：不生效了，因为前面resolve已经确定状态了，就锁定了，不能再改了)
        })
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(err);
            });
    }

    public test5() {
        // 4.2 传入Promise
        console.log("-------------- 4.2 传入Promise------------------");
        const promiseResult = new Promise((resolve, reject) => {
            resolve(
                new Promise((resolve2, reject2) => {
                    reject2("ypf2");
                })
            );
        });
        promiseResult.then(null, err => console.log(err)); //ypf2
    }

    public test6() {
        console.log("------4.3 传入对象，且对象有实现then方法-----------");
        const promiseResult = new Promise((resolve, reject) => {
            resolve({
                then: function (resolve2, reject2) {
                    reject2("ypf3");
                },
            });
        });
        promiseResult.then(null, err => console.log(err)); //ypf3
    }

    //链式then
    public test7() {
        const p1 = new Promise((resolve, reject) => {
            //resolve(1);
            reject("PromiseError");
            //throw new Error("Whoops!");
        });
        p1.then((res) => {
            console.log(res);
            //throw new Error("Whoops!");
            return 2;
        })
            .then((res) => {
                console.log(res);
                //throw new Error("Whoops!");
                return 3;
            })
            .then((res) => {
                console.log(res);
                //throw new Error("Whoops!");
                return 4;
            })
            .catch((err) => { console.log("err--", err); });
    }



}