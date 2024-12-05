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