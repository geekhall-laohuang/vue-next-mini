/**
 * 判断是否为一个数组
 */
export const isArray = Array.isArray

/**
 * 判断是否为一个对象
 */
export const isObject = (val: unknown) =>
  val !== null && typeof val === 'object'

/**
 * 对比两个暑假是否发生改变
 */
export const hasChanged = (value: any, oldValue: any): boolean =>
  !Object.is(value, oldValue)

/**
 *  判断是否为一个函数
 */
export const isFunction = (val: unknown): val is Function => {
  return typeof val === 'function'
}
