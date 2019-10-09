export function isAsync(value: any): boolean {
    return typeof value === 'function' && value.constructor.name === "AsyncFunction" || value instanceof Promise;
}
