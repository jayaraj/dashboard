export declare class MapPolyfill {
    size: number;
    private _values;
    private _keys;
    get(key: any): any;
    set(key: any, value: any): this;
    delete(key: any): boolean;
    forEach(cb: any, thisArg: any): void;
}
