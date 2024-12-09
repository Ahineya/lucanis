import {useEffect} from "react";

export function useEvent<T>(object: any, event: string, callback: (event: T) => void, deps: any[] = []) {
    useEffect(() => {
        if (!object || !object.addEventListener || !object.removeEventListener) {
            throw new Error('Invalid object passed to useEvent, it must have addEventListener and removeEventListener methods.');
        }

        object.addEventListener(event, callback);
        return () => object.removeEventListener(event, callback);
    }, [object, event, callback, ...deps]);
}

export function useWindowEvent<T>(event: string, callback: (event: T) => void, deps: any[] = []) {
    return useEvent(window, event, callback, deps);
}

export function useDocumentEvent<T>(event: string, callback: (event: T) => void, deps: any[] = []) {
    return useEvent(document, event, callback, deps);
}

function useClickOutsideString(trackedSelectors: string[] | string, callback: (e: MouseEvent) => void, deps: any[] = []) {
    const selectors = Array.isArray(trackedSelectors) ? trackedSelectors : [trackedSelectors];

    useWindowEvent('click', (e: MouseEvent) => {
        const target = e.target as HTMLElement;

        if (!target || !target.closest) {
            return;
        }

        if (selectors.some(s => target.closest(s))) {
            return;
        }

        callback(e);
    }, [trackedSelectors, callback, ...deps]);
}

function useClickOutsideRef<T extends HTMLElement>(ref: React.RefObject<T>, callback: (e: MouseEvent) => void, deps: any[] = []) {
    const handleClick = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
            callback(e);
        }
    };

    useDocumentEvent('click', handleClick, [...deps]);
}

export function useClickOutside(trackedSelectors: string[] | string | React.RefObject<HTMLElement>, callback: (e: MouseEvent) => void, deps: any[] = []) {
    if (typeof trackedSelectors === 'string' || Array.isArray(trackedSelectors)) {
        return useClickOutsideString(trackedSelectors, callback, deps);
    }

    return useClickOutsideRef(trackedSelectors, callback, deps);
}

export function useWindowResize(callback: (width: number, height: number) => void, deps: any[] = []) {
    const callbackWithSize = () => callback(window.innerWidth, window.innerHeight);

    callback(window.innerWidth, window.innerHeight);

    return useWindowEvent('resize', callbackWithSize, deps);
}