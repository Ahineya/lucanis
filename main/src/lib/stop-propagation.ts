export function stopPropagation<T>(fn: (event: T) => void): (e: T) => void {
    return (e: T) => {
        e.stopPropagation();
        fn(e);
    }
}