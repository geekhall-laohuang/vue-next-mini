import { track, trigger } from './effect'

const get = createGetter()

function createGetter() {
  return function get(target: Object, key: string | symbol, reaceiver: object) {
    const res = Reflect.get(target, key, reaceiver)

    //收集依赖
    track(target, key)

    return res
  }
}

const set = createSetter()

function createSetter() {
  return function set(
    target: Object,
    key: string | symbol,
    value: unknown,
    receiver: object
  ) {
    const result = Reflect.set(target, key, value, receiver)

    //触发依赖
    trigger(target, key, value)

    return result
  }
}

export const mutableHandlers: ProxyHandler<object> = {
  get,
  set
}
