// Validation and type checking

/**
 * Equality check
 * @param x
 * @param y
 */
export const isEquals = (x: unknown, y: unknown) => {
    if (x === y) return true;
    // 防止NaN等问题
    if (typeof x !== 'object' || typeof y !== 'object') {
        return typeof x === typeof y ? x === y : false;
    }
    if (x === null || y === null) return false;
    const xKeys = Object.keys(x),
        yKeys = Object.keys(y);
    if (xKeys.length !== yKeys.length) return false;
    for (const key of xKeys) {
        if (
            !Reflect.has(y, key) ||
            !isEquals(Reflect.get(x, key), Reflect.get(y, key))
        )
            return false;
    }
    return true;
};

/**
 * Check if value is defined
 * @param value
 */
export const isDef = <T>(value: T): value is NonNullable<T> => {
    return !(value === void 0 || value === null);
};

/**
 * Check if value is `null`
 * @param value
 */
export const isNil = (value: unknown): value is null => value === null;

/**
 * Check if value is `undefined`
 * @param value
 */
export const isUndefined = (value: unknown): value is undefined =>
    typeof value === 'undefined';

/**
 * Check if value is an object
 * @param obj
 */
export const isObject = <T extends object = object>(obj: unknown): obj is T =>
    !isNil(obj) && typeof obj === 'object' && !Array.isArray(obj);

/**
 * Check if value is a plain object
 * @param obj
 */
export const isPlainObject = (obj: unknown): obj is Record<string, unknown> =>
    isObject(obj) && Reflect.getPrototypeOf(obj) === Object.prototype;

/**
 * Check if value is a function
 * @param fn
 */
export const isFunction = <T extends (...args: never[]) => unknown>(
    fn: unknown
): fn is T => typeof fn === 'function';

/**
 * Check if value is an array
 * @param arg
 */
export const isArray = <T extends unknown[]>(arg: unknown): arg is T => {
    return Array.isArray(arg);
};

/**
 * Check if value is a string
 * @param str
 */
export const isString = (str: unknown): str is string =>
    typeof str === 'string';

/**
 * Check if value is a nonempty string
 * @param str
 */
export const isNonEmptyString = (str: string): str is string =>
    isString(str) && str.length > 0;

/**
 * Check if value is empty
 * @param v
 * @description If value is `null`, `undefined`, `''`, `[]`, `{}` then empty
 */
export const isEmpty = (v: Array<unknown> | object | string): boolean => {
    if (Array.isArray(v)) {
        return v.length === 0;
    } else if (isPlainObject(v)) {
        return Object.keys(v).length === 0;
    } else if (isString(v)) {
        return v.trim().length === 0;
    } else {
        return false;
    }
};

/**
 * Check if value is a symbol
 * @param symbol
 */
export const isSymbol = (symbol: unknown): symbol is symbol =>
    typeof symbol === 'symbol';

/**
 * Check if value is a date
 * @param date
 */
export const isDate = (date: unknown): date is Date => date instanceof Date;

/**
 * Check if value is a number
 * @param num
 */
export const isNumber = (num: unknown): num is number =>
    typeof num === 'number' && !Number.isNaN(num);

/**
 * Check if value is a URL
 * @param url
 */
export const isURL = (url: string) =>
    ['http', '//'].some((str) => url.startsWith(str));

// object manipulation

/**
 * Pick specific fields from an object
 * @param target target object
 * @param keys object fields
 * @example pick({a: 1, b: 2, c: 3}, ['a', 'b']) // {a: 1, b: 2}
 */
export const pick = <O extends object, T extends keyof O>(
    target: O,
    keys: T[]
): Pick<O, T> => {
    return keys.reduce((value, key) => {
        if (Reflect.has(target, key)) value[key] = Reflect.get(target, key, target);
        return value;
    }, {} as Pick<O, T>);
};
/**
 * Omit specific fields from an object
 * @param target target object
 * @param keys object fields
 * @example omit({ a: 1, b: 2, c: 3 }, ['b', 'c']) // { a: 1 }
 */
export const omit = <O extends object, T extends keyof O>(
    target: O,
    keys: T[]
): Omit<O, T> => {
    return pick(
        target,
        (Reflect.ownKeys(target) as Array<keyof O>).filter(
            (key) => !keys.includes(key as T)
        ) as Array<keyof O>
    );
};

/**
 * Get the type name of an object
 * @param obj
 */
export const objectType = (obj: object) => {
    return (
        Reflect.get(obj, Symbol.toStringTag) ||
        Object.prototype.toString.call(obj).slice(8, -1)
    );
};


// other utilities

/**
 * Wrap a value in an array if it's not already an array
 * @param val
 * @example wrapArray(1) // [1]
 * @example wrapArray([1, 2, 3]) // [1, 2, 3]
 */
export const wrapArray = <T>(val: T | T[]) => {
    if (!isDef(val)) return [];
    return Array.isArray(val) ? val : [val];
};

/**
 * Pad a string
 * @param v value
 * @param len length
 * @param fill fill string
 * @param pos fill position, default `start`
 * @example padString('abc', 5, '0', 'end') // 'abc00'
 * @example padString('abc', 5, '0', 'start') // '00abc'
 * @example padString('abc', 5, '0') // '00abc'
 * @example padString(undefined, 5, '0') // ''
 */
export const padString = (
    v: string | number,
    len: number,
    fill: string,
    pos: 'start' | 'end' = 'start'
): string => {
    if (!isDef(v)) return '';
    return String(v)[pos === 'start' ? 'padStart' : 'padEnd'](len, fill);
};

/**
 * Debounce a function
 * @description 在事件被触发n秒后再执行回调，如果在这n秒内又被触发，则重新计时
 * @param func
 * @param delay
 * @this null
 */
export function debounce<T extends (...args: unknown[]) => void>(
    func: T,
    delay = 500
) {
    let timeout: number | null = null;
    return (...args: Parameters<T>) => {
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = window.setTimeout(() => {
            func(...args);
        }, delay);
    };
}
/**
 * Throttle a function
 * @description 规定在一个单位时间内，只能触发一次函数。如果这个单位时间内多次触发函数，只有一次生效
 * @param func 目标函数
 * @param delay 延迟
 * @this null
 */
export function throttle<T extends (...args: unknown[]) => void>(
    func: T,
    delay = 500
) {
    let previous: number;
    let defineTimer: null | number = null;
    return (...args: Parameters<T>) => {
        const now = Date.now();
        if (previous && now < previous + delay) {
            defineTimer && window.clearTimeout(defineTimer);
            defineTimer = window.setTimeout(() => {
                func(...args);
                previous = now;
            }, delay);
        } else {
            func(...args);
            previous = now;
        }
    };
}

/**
 * Wait for a certain amount of time
 * @param ms 等待时间(ms)
 * @example await wait(100) // 等待 100 毫秒
 */
export const wait = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));
/**
 * Compose a series of transformations
 * @param initialValue
 * @example pipe(1)(prev => prev+2)(prev => prev.toString())() // '3'
 */
export const pipe = <T>(
    initialValue: T
): PipeReturn<
    unknown,
    {
        _: T;
    }
> => {
    return (<T2 = unknown>(...transformers: [T2] | []) => {
        // return
        if (transformers.length === 0) return initialValue;
        // skip
        if (!isFunction(transformers[0])) return pipe(initialValue);
        // continue
        return pipe((transformers[0] as (arg: unknown) => unknown)(initialValue));
    }) as PipeReturn<
        unknown,
        {
            _: T;
        }
    >;
};
type PipeReturn<PrevValue, NextValue> = NextValue extends {
        '!': never;
    }
    ? PrevValue
    : // 避免PipeCarrying生成联合类型（如：PipeCarrying<number> | PipeCarrying<string>），这可能导致类型推导错误。
    // 更理想的方式是将值设为联合（如：PipeCarrying<number | string>）。
    NextValue extends { _: infer Value }
        ? PipeCarrying<Value>
        : PipeCarrying<NextValue>;
type PipeTransformer<PrevValue> =
    | undefined
    | null
    | false
    | ((prevValue: PrevValue) => unknown);
type PipeCarrying<PrevValue> = <
    NextArgs extends [value: PipeTransformer<PrevValue>] | []
>(
    ...transformer: NextArgs
) => PipeReturn<
    PrevValue,
    [] extends NextArgs
        ? {
            '!': never;
        }
        : NextArgs[0] extends (prevValue: PrevValue) => unknown
            ? { _: ReturnType<NextArgs[0]> }
            : { _: PrevValue }
>;

/**
 * Clip a number to be within a certain range
 * @param min
 * @param value
 * @param max
 * @example clamp(0, 3, 7) // 3
 */
export const clamp = (min: number, value: number, max: number) =>
    Math.min(Math.max(value, min), max);


// mod tests
if (import.meta.vitest) {
    const { describe, expect, it } = import.meta.vitest;

    describe('Tests', () => {
        it('isEquals', () => {
            expect(isEquals(1, 1)).toBe(true);
            expect(isEquals(1, 2)).toBe(false);
            expect(isEquals(1, '1')).toBe(false);
            expect(isEquals(1, null)).toBe(false);
            expect(isEquals(1, undefined)).toBe(false);
            expect(isEquals(1, NaN)).toBe(false);
            expect(isEquals(1, Infinity)).toBe(false);
            expect(isEquals(1, [])).toBe(false);
            expect(isEquals(1, {})).toBe(false);
            expect(isEquals(1, null)).toBe(false);
            expect(isEquals(1, new Date())).toBe(false);
            expect(isEquals(1, new RegExp('a'))).toBe(false);
            expect(isEquals(1, new Error())).toBe(false);
            expect(isEquals(1, new Map())).toBe(false);
            expect(isEquals(1, new Set())).toBe(false);
            expect(isEquals(1, new WeakMap())).toBe(false);
            expect(isEquals(1, new WeakSet())).toBe(false);
            expect(isEquals(1, new Promise(() => void 0))).toBe(false);
            expect(isEquals({ a: 122, b: 45 }, { a: 122, b: 45 })).toBe(true);
            expect(isEquals({ v: { a: 122, b: 45 } }, { v: { a: 122, b: 45 } })).toBe(
                true
            );
            expect(isEquals({}, null)).toBe(false);
            expect(isEquals([1], [null, 2])).toBe(false);
            expect(isEquals({ a: 1 }, { a: null, b: 2 })).toBe(false);
            expect(isEquals({ a: null, b: 3 }, { a: null, b: 2 })).toBe(false);
        });
        it('isDef', () => {
            expect(isDef(2)).toBe(true);
            expect(isDef(undefined)).toBe(false);
            expect(isDef(null)).toBe(false);
        });
        it('isNil', () => {
            expect(isNil(null)).toBe(true);
            expect(isNil(undefined)).toBe(false);
        });
        it('isUndefined', () => {
            expect(isUndefined(undefined)).toBe(true);
        });
        it('isObject and isPlainObject', () => {
            expect(isObject({})).toBe(true);
            expect(isObject([])).toBe(false);
            expect(isObject(null)).toBe(false);
            expect(isObject(new Date())).toBe(true);
            expect(isObject(Function)).toBe(false);
            expect(isPlainObject({})).toBe(true);
            expect(isPlainObject(new Date())).toBe(false);
            expect(isPlainObject(null)).toBe(false);
        });
        it('isFunction', () => {
            expect(isFunction(() => void 0)).toBe(true);
            expect(isFunction(null)).toBe(false);
            expect(isFunction(undefined)).toBe(false);
        });
        it('isString', () => {
            expect(isString('string')).toBe(true);
            expect(isString(null)).toBe(false);
            expect(isString(undefined)).toBe(false);
        });
        it('isNonEmptyString', () => {
            expect(isNonEmptyString('string')).toBe(true);
            expect(isNonEmptyString('')).toBe(false);
        });
        it('isEmpty', () => {
            expect(isEmpty('')).toBe(true);
            expect(isEmpty([])).toBe(true);
            expect(isEmpty({})).toBe(true);
            expect(isEmpty('string')).toBe(false);
            expect(isEmpty(new Date())).toBe(false);
        });
        it('isSymbol', () => {
            expect(isSymbol(Symbol())).toBe(true);
            expect(isSymbol(null)).toBe(false);
            expect(isSymbol(undefined)).toBe(false);
        });
        it('isDate', () => {
            expect(isDate(new Date())).toBe(true);
            expect(isDate(null)).toBe(false);
            expect(isDate(undefined)).toBe(false);
        });
        it('isNumber', () => {
            expect(isNumber(1)).toBe(true);
            expect(isNumber(null)).toBe(false);
            expect(isNumber(undefined)).toBe(false);
            expect(isNumber(NaN)).toBe(false);
            expect(isNumber(Infinity)).toBe(true);
        });
        it('isArray', () => {
            expect(isArray([])).toBe(true);
        });
        it('isURL', () => {
            expect(isURL('https://www.google.com')).toBe(true);
            expect(isURL('http://www.google.com')).toBe(true);
            expect(isURL('https://www.google.com/466+2')).toBe(true);
            expect(isURL('//www.google.com')).toBe(true);
            expect(isURL('www.google.com')).toBe(false);
        });

        it('objectType', () => {
            expect(objectType({})).toBe('Object');

            // Testing with array
            expect(objectType([])).toBe('Array');

            // Testing with date
            const date = new Date();
            expect(objectType(date)).toBe('Date');

            // Testing with error
            const error = new Error();
            expect(objectType(error)).toBe('Error');
            // Testing with function
            expect(
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                objectType(function () {})
            ).toBe('Function');
            expect(objectType(() => void 0)).toBe('Function');
        });
        it('wrapArray', () => {
            expect(wrapArray(1)).toEqual([1]);
            expect(wrapArray([1])).toEqual([1]);
            expect(wrapArray(null)).toEqual([]);
            expect(wrapArray(undefined)).toEqual([]);
        });
        it('padString', () => {
            expect(padString('1', 2, '0')).toEqual('01');
            expect(padString('1', 2, '0', 'start')).toEqual('01');
            expect(padString('1', 2, '0', 'end')).toEqual('10');
            expect(padString(undefined as unknown as string, 2, '0')).toEqual('');
        });
        it('wait', async () => {
            const start = Date.now();
            await wait(100);
            expect(Date.now() - start).toBeGreaterThanOrEqual(100);
        });
        it('debounce', async () => {
            let count = 0;
            const fn = () => {
                count += 1;
            };
            const debounced = debounce(fn, 100);
            debounced();
            debounced();
            expect(count).toBe(0);
        });
        it('debounce1', async () => {
            let count = 0;
            const fn = () => {
                count += 1;
            };
            const debounced = debounce(fn, 100);
            debounced();
            await wait(20);
            debounced();
            debounced();
            debounced();
            await wait(50);
            debounced();
            await wait(70);
            debounced();
            await wait(80);
            debounced();
            debounced();
            await wait(120);
            expect(count).toBe(1);
        });
        it('debounce2', async () => {
            let count = 0;
            const fn = () => {
                count += 1;
            };
            const debounced = debounce(fn, 100);
            debounced();
            await wait(20);
            debounced();
            debounced();
            debounced();
            await wait(120);
            debounced();
            await wait(20);
            debounced();
            await wait(80);
            debounced();
            debounced();
            await wait(120);
            expect(count).toBe(2);
        });
        it('throttle', () => {
            let count = 0;
            const fn = () => {
                count += 1;
            };
            const throttled = throttle(fn, 100);
            throttled();
            throttled();
            throttled();
            expect(count).toBe(1);
        });
        it('throttle1', async () => {
            let count = 0;
            const fn = () => {
                count += 1;
            };
            const throttled = throttle(fn, 100);
            throttled();
            throttled();
            throttled();
            await wait(40);
            throttled();
            await wait(80);
            throttled();
            expect(count).toBe(2);
        });
        it('omit', () => {
            const obj = {
                a: 1,
                b: 2,
                c: 3,
            };
            expect(omit(obj, ['a', 'b'])).toEqual({ c: 3 });
        });
        it('pick', () => {
            const obj = {
                a: 1,
                b: 2,
                c: 3,
            };
            expect(pick(obj, ['a', 'b'])).toEqual({ a: 1, b: 2 });
        });
        it('clamp', () => {
            expect(clamp(1, 2, 3)).toBe(2);
            expect(clamp(1, 2, 1)).toBe(1);
            expect(clamp(1, 2, 2)).toBe(2);
            expect(clamp(1, 2, 3)).toBe(2);
        });
        it('pipe', () => {
            const fn1 = (x: number) => x + 1;
            const fn2 = (x: number) => x * 2;
            const fn3 = (x: number) => x * 3;
            const fn4 = (x: number) => x * 4;
            const fn5 = (x: number) => x * 5;
            const fn6 = (x: number) => x * 6;
            const fn7 = (x: number) => x * 7;
            const fn8 = (x: number) => x * 8;
            const fn9 = (x: number) => x * 9;
            expect(pipe(1)(fn1)(fn2)(fn3)(fn4)(fn5)(fn6)(fn7)(fn8)(fn9)()).toBe(
                (1 + 1) * 2 * 3 * 4 * 5 * 6 * 7 * 8 * 9
            );
            expect(
                pipe(1)(fn1)(fn2)(undefined)(fn4)(false)(fn6)(fn7)(null)(fn9)()
            ).toBe((1 + 1) * 2 * 4 * 6 * 7 * 9);
        });
    })
}