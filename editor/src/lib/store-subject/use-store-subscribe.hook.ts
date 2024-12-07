import {useEffect, useState} from "react";
import {StoreSubject} from "./store-subject.ts";

export function useStoreSubscribe<T>(storeSubject: StoreSubject<T>) {
    const [state, setState] = useState(storeSubject.getValue());

    useEffect(() => {
        const unsubscribe = storeSubject.subscribe(setState);
        return () => unsubscribe();
    }, [storeSubject]);

    return state;
}