var Vue = (function (exports) {
    'use strict';

    /**
     * 判断是否为一个数组
     */
    var isArray = Array.isArray;
    /**
     * 判断是否为一个对象
     */
    var isObject = function (val) {
        return val !== null && typeof val === 'object';
    };
    /**
     * 对比两个暑假是否发生改变
     */
    var hasChanged = function (value, oldValue) {
        return !Object.is(value, oldValue);
    };
    /**
     *  判断是否为一个函数
     */
    var isFunction = function (val) {
        return typeof val === 'function';
    };

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    var createDep = function (effects) {
        var dep = new Set(effects);
        return dep;
    };

    /**
     * 收集所有依赖的 WeakMap 实例：
     * 1. `key`：响应性对象
     * 2. `value`：`Map` 对象
     * 		1. `key`：响应性对象的指定属性
     * 		2. `value`：指定对象的指定属性的 执行函数
     */
    var targetMap = new WeakMap();
    function effect(fn) {
        var _effect = new ReactiveEffect(fn);
        _effect.run();
    }
    var activeEffect;
    var ReactiveEffect = /** @class */ (function () {
        function ReactiveEffect(fn, scheduler) {
            if (scheduler === void 0) { scheduler = null; }
            this.fn = fn;
            this.scheduler = scheduler;
        }
        ReactiveEffect.prototype.run = function () {
            activeEffect = this;
            return this.fn();
        };
        return ReactiveEffect;
    }());
    /**
     * 用于收集依赖的方法
     * @param target WeakMap 的 key
     * @param key 代理对象的 key，当依赖被触发时，需要根据该 key 获取
     */
    function track(target, key) {
        // 如果当前不存在执行函数，则直接 return
        if (!activeEffect)
            return;
        // 尝试从 targetMap 中，根据 target 获取 map
        var depsMap = targetMap.get(target);
        // 如果获取到的 map 不存在，则生成新的 map 对象，并把该对象赋值给对应的 value
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()));
        }
        var dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(key, (dep = createDep()));
        }
        trackEffects(dep);
    }
    /**
     * 利用 dep 依次跟踪指定 key 的 所有 effect
     */
    function trackEffects(dep) {
        dep.add(activeEffect);
    }
    /**
     * 触发依赖的方法
     * @param target WeakMap 的 key
     * @param key 代理对象的 key，当依赖被触发时，需要根据该 key 获取
     */
    function trigger(target, key, newValue) {
        // 依据 target 获取存储的 map 实例
        var depsMap = targetMap.get(target);
        // 如果 map 不存在，则直接 return
        if (!depsMap) {
            return;
        }
        // 依据 key，从 depsMap 中取出 value，该 value 是一个 ReactiveEffect 类型的数据
        var dep = depsMap.get(key);
        // 如果 effect 不存在，则直接 return
        if (!dep) {
            return;
        }
        // 执行 effect 中保存的 fn 函数
        triggerEffects(dep);
    }
    /**
     *
     * @param dep 依次触发 dep 中保存的依赖
     */
    function triggerEffects(dep) {
        var e_1, _a, e_2, _b;
        var effects = isArray(dep) ? dep : __spreadArray([], __read(dep), false);
        try {
            // 不在依次触发，而是先触发所有的计算属性依赖，再触发所有的非计算属性依赖
            for (var effects_1 = __values(effects), effects_1_1 = effects_1.next(); !effects_1_1.done; effects_1_1 = effects_1.next()) {
                var efftct = effects_1_1.value;
                if (efftct.computed) {
                    triggerEffect(efftct);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (effects_1_1 && !effects_1_1.done && (_a = effects_1.return)) _a.call(effects_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        try {
            for (var effects_2 = __values(effects), effects_2_1 = effects_2.next(); !effects_2_1.done; effects_2_1 = effects_2.next()) {
                var efftct = effects_2_1.value;
                if (!efftct.computed) {
                    triggerEffect(efftct);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (effects_2_1 && !effects_2_1.done && (_b = effects_2.return)) _b.call(effects_2);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
    /**
     *
     * 触发指定依赖
     */
    function triggerEffect(effect) {
        // 存在调度器就执行调度函数
        if (effect.scheduler) {
            effect.scheduler();
        }
        // 否则直接执行 run 函数即可
        else {
            effect.run();
        }
    }

    var get = createGetter();
    function createGetter() {
        return function get(target, key, reaceiver) {
            var res = Reflect.get(target, key, reaceiver);
            //收集依赖
            track(target, key);
            return res;
        };
    }
    var set = createSetter();
    function createSetter() {
        return function set(target, key, value, receiver) {
            var result = Reflect.set(target, key, value, receiver);
            //触发依赖
            trigger(target, key);
            return result;
        };
    }
    var mutableHandlers = {
        get: get,
        set: set
    };

    /**
     * 响应性 Map 缓存对象
     * key：target
     * val：proxy
     */
    var reactiveMap = new WeakMap();
    /**
     * 为复杂数据类型，创建响应性对象
     * @param target 被代理对象
     * @returns 代理对象
     */
    function reactive(target) {
        return createReactiveObject(target, mutableHandlers, reactiveMap);
    }
    /**
     * 创建响应性对象
     * @param target 被代理对象
     * @param baseHandlers handler
     */
    function createReactiveObject(target, baseHandlers, proxyMap) {
        // 如果该实例已经被代理，则直接读取即可
        var existingProxy = proxyMap.get(target);
        if (existingProxy) {
            return existingProxy;
        }
        // 未被代理则生成 proxy 实例
        var proxy = new Proxy(target, baseHandlers);
        // 缓存代理对象
        proxyMap.set(target, proxy);
        return proxy;
    }
    var toReactive = function (value) {
        return isObject(value) ? reactive(value) : value;
    };

    /**
     * ref 函数
     * @param value unknown
     */
    function ref(value) {
        return createRef(value, false);
    }
    /**
     * 创建 RefImpl 实例
     * @param rawValue 原始数据
     * @param shallow boolean 形数据，表示《浅层的响应性（即：只有 .value 是响应性的）》
     * @returns
     */
    function createRef(rawValue, shallow) {
        if (isRef(rawValue)) {
            return rawValue;
        }
        return new RefImpl(rawValue, shallow);
    }
    var RefImpl = /** @class */ (function () {
        function RefImpl(value, __v_isShallow) {
            this.__v_isShallow = __v_isShallow;
            this.dep = undefined;
            // 是否为 ref 类型数据的标记
            this.__v_isRef = true;
            // 原始数据
            this._rawValue = value;
            // 如果 __v_isShallow 为 true，则 value 不会被转化为 reactive 数据
            this._value = __v_isShallow ? value : toReactive(value);
        }
        Object.defineProperty(RefImpl.prototype, "value", {
            /**
             * get语法将对象属性绑定到查询该属性时将被调用的函数。
             * 即：xxx.value 时触发该函数
             */
            get: function () {
                trackRefValue(this);
                return this._value;
            },
            /**
             * newVal 为新数据
             * this._rawValue 为旧数据（原始数据）
             * 对比两个数据是否发生了变化
             */
            set: function (newVal) {
                if (hasChanged(newVal, this._rawValue)) {
                    this._value = newVal;
                    this._value = toReactive(newVal);
                    triggerRefValue(this);
                }
            },
            enumerable: false,
            configurable: true
        });
        return RefImpl;
    }());
    /**
     * 收集依赖
     */
    function trackRefValue(ref) {
        if (activeEffect) {
            trackEffects(ref.dep || (ref.dep = createDep()));
        }
    }
    /**
     * 触发依赖
     */
    function triggerRefValue(ref) {
        if (ref.dep) {
            triggerEffects(ref.dep);
        }
    }
    /**
     *   是否为 ref
     *
     */
    function isRef(r) {
        return !!(r && r.__v_isRef === true);
    }

    /**
     * 计算属性类
     */
    var ComputedRefImpl = /** @class */ (function () {
        function ComputedRefImpl(getter) {
            var _this = this;
            this.dep = undefined;
            this.__v_isRef = true;
            /**
             * 脏：为 false 时，表示需要触发依赖。为 true 时表示需要重新执行 run 方法，获取数据。即：数据脏了
             */
            this._dirty = true;
            this.effect = new ReactiveEffect(getter, function () {
                if (!_this._dirty) {
                    // 将脏置为 true，表示
                    _this._dirty = true;
                    triggerRefValue(_this);
                }
            });
            this.effect.computed = this;
        }
        Object.defineProperty(ComputedRefImpl.prototype, "value", {
            get: function () {
                // 触发依赖
                trackRefValue(this);
                // 判断当前脏的状态，如果为 true ，则表示需要重新执行 run，获取最新数据
                if (this._dirty) {
                    this._dirty = false;
                    // 执行 run 函数
                    this._value = this.effect.run();
                }
                // 返回计算之后的真实值
                return this._value;
            },
            enumerable: false,
            configurable: true
        });
        return ComputedRefImpl;
    }());
    /**
     * 计算属性
     */
    function computed(getterOrOptions) {
        var getter;
        // 判断传入的参数是否为一个函数
        var onlyGetter = isFunction(getterOrOptions);
        if (onlyGetter) {
            // 如果是函数，则赋值给 getter
            getter = getterOrOptions;
        }
        var cRef = new ComputedRefImpl(getter);
        return cRef;
    }

    exports.computed = computed;
    exports.effect = effect;
    exports.reactive = reactive;
    exports.ref = ref;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=vue.js.map
