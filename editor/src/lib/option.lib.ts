export class Some<T> implements Option<T> {
    value: T;

    constructor(value: T) {
        this.value = value;
    }

    map<U>(fn: (value: T) => U): Option<U> {
        return new Some(fn(this.value));
    }

    unwrap(): T {
        return this.value;
    }

    unwrapOr<U>(defaultValue: U): T {
        return this.value;
    }

    isSome(): boolean {
        return true;
    }

    isNone(): boolean {
        return false;
    }

    fold<U>(onSome: (value: T) => U, onNone: () => U): U {
        return onSome(this.value);
    }
}

export class None implements Option<never> {
    map<U>(fn: (value: never) => U): Option<U> {
        return this;
    }

    unwrap(): never {
        throw new Error("Cannot unwrap None");
    }

    unwrapOr<U>(defaultValue: U): U {
        return defaultValue;
    }

    isSome(): boolean {
        return false;
    }

    isNone(): boolean {
        return true;
    }

    fold<U>(onSome: (value: never) => U, onNone: () => U): U {
        return onNone();
    }
}

export interface Option<T> {
    map<U>(fn: (value: T) => U): Option<U>;
    unwrap(): T;
    unwrapOr<U>(defaultValue: U): T | U;
    isSome(): boolean;
    isNone(): boolean;
    fold<U>(onSome: (value: T) => U, onNone: () => U): U;
}

export const some = <T>(value: T): Some<T> => new Some(value);
export const none = (): None => new None();

export const option = <T>(value: T | null | undefined): Option<T> => {
    return (value === null || value === undefined) ? none() : some<T>(value);
};

export const isSome = <T>(value: Option<T>): value is Some<T> => value instanceof Some;
export const isNone = <T>(value: Option<T>): value is None => value instanceof None;

export const identity = <T>(value: T): T => value;

export const lastOption = <T>(values: T[]): Option<T> => {
    return values.length === 0 ? none() : some(values[values.length - 1]);
}

export const combine = <T>(values: Option<T>[]): Option<T[]> => {
    const result: T[] = [];
    for (const value of values) {
        if (value.isNone()) {
            return none();
        }
        result.push(value.unwrap());
    }
    return some(result);
}

export function match<T, R>(value: T, matchObj: { [key: string]: () => R }): R {
    const key = value as unknown as string;
    const matchFn = matchObj[key];

    if (matchFn) {
        return matchFn();
    }

    if (matchObj["_"]) {
        return matchObj["_"]();
    }

    throw new Error(`No match found for ${key}`);
}

export class FMap<K, V> {
    private map: Map<K, V> = new Map();

    immutableSet(key: K, value: V): FMap<K, V> {
        const newMap = new FMap<K, V>();
        newMap.map = new Map(this.map);
        newMap.map.set(key, value);
        return newMap;
    }

    copy(mutator: (map: Map<K, V>) => void): FMap<K, V> {
        const newMap = new FMap<K, V>();
        newMap.map = new Map(this.map);
        mutator(newMap.map);
        return newMap;
    }

    public set(key: K, value: V) {
        this.map.set(key, value);
    }

    public get(key: K): Option<V> {
        const value = this.map.get(key);
        return option(value);
    }

    public has(key: K): boolean {
        return this.map.has(key);
    }

    public delete(key: K) {
        this.map.delete(key);
    }

    public clear() {
        this.map.clear();
    }

    public keys(): IterableIterator<K> {
        return this.map.keys();
    }

    public values(): IterableIterator<V> {
        return this.map.values();
    }

    public entries(): IterableIterator<[K, V]> {
        return this.map.entries();
    }

    public forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void) {
        this.map.forEach(callbackfn);
    }

    public size(): number {
        return this.map.size;
    }

    public toArray(): [K, V][] {
        return Array.from(this.map.entries());
    }
}

export class List<T> {
    private list: T[] = [];

    constructor(list?: T[]) {
        this.list = list ?? [];
    }

    public addImmutable(value: T) {
        const newList = new List<T>();
        newList.list = [...this.list, value];
        return newList;
    }

    public push(value: T) {
        this.list.push(value);
    }

    public get(index: number): Option<T> {
        return option(this.list[index]);
    }

    public set(index: number, value: T) {
        const newList = new List<T>();
        newList.list = [...this.list];
        newList.list[index] = value;
        return newList;
    }

    public delete(index: number) {
        const newList = new List<T>();
        newList.list = [...this.list];
        newList.list.splice(index, 1);
        return newList;
    }

    public map<U>(fn: (value: T) => U): List<U> {
        const newList = new List<U>();
        newList.list = this.list.map(fn);
        return newList;
    }

    public filter(fn: (value: T) => boolean): List<T> {
        const newList = new List<T>();
        newList.list = this.list.filter(fn);
        return newList;
    }

    public forEach(fn: (value: T) => void) {
        this.list.forEach(fn);
    }

    public size(): number {
        return this.list.length;
    }

    public toArray(): T[] {
        return [...this.list];
    }

    public isEmpty(): boolean {
        return this.list.length === 0;
    }

    public last(): Option<T> {
        return this.get(this.list.length - 1);
    }

    public tail(): List<T> {
        const newList = new List<T>();
        newList.list = this.list.slice(1);
        return newList;
    }

    public head(): Option<T> {
        return this.get(0);
    }

    public findRight(fn: (value: T) => boolean): Option<T> {
        for (let i = this.list.length - 1; i >= 0; i--) {
            if (fn(this.list[i])) {
                return some(this.list[i]);
            }
        }
        return none();
    }

    public findLeft(fn: (value: T) => boolean): Option<T> {
        for (let i = 0; i < this.list.length; i++) {
            if (fn(this.list[i])) {
                return some(this.list[i]);
            }
        }
        return none();
    }

    public find(fn: (value: T) => boolean): Option<T> {
        return this.findLeft(fn);
    }

    public reduce<U>(fn: (acc: U, value: T) => U, initialValue: U): U {
        return this.list.reduce(fn, initialValue);
    }

    public reverse(): List<T> {
        const newList = new List<T>();
        newList.list = this.list.slice().reverse();
        return newList;
    }

    public concat(other: List<T>): List<T> {
        const newList = new List<T>();
        newList.list = [...this.list, ...other.list];
        return newList;
    }

    public slice(start: number, end: number): List<T> {
        const newList = new List<T>();
        newList.list = this.list.slice(start, end);
        return newList;
    }

    public take(n: number): List<T> {
        return this.slice(0, n);
    }

    public foldl<U>(fn: (acc: U, value: T) => U, initialValue: U): U {
        return this.list.reduce(fn, initialValue);
    }

    public foldr<U>(fn: (acc: U, value: T) => U, initialValue: U): U {
        return this.list.reduceRight(fn, initialValue);
    }

    public pop(): Option<T> {
        if (this.list.length === 0) {
            return none();
        }
        return some(this.list.pop() as T);
    }

    public every(fn: (value: T) => boolean): boolean {
        return this.list.every(fn);
    }

    public some(fn: (value: T) => boolean): boolean {
        return this.list.some(fn);
    }

    public includes(value: T): boolean {
        return this.list.includes(value);
    }

    public unique(): List<T> {
        return new List<T>([...new Set(this.list)]);
    }
}