import { DB } from "./src/db";
export declare type This = {
    [key: string]: unknown;
};
declare class Type {
    native: number | string;
}
declare class TypeNumber extends Type {
    native: number;
}
declare class TypeString extends Type {
    native: string;
}
declare type Native<T extends Type> = T extends TypeNumber ? number : T extends TypeString ? string : never;
export declare function fldNumber(): TypeNumber;
export declare function fldString(): TypeString;
export declare class Instance {
    save(): Promise<boolean>;
}
export declare class Sedentary {
    protected db: DB;
    constructor(filename: string | null);
    connect(done?: (err?: Error) => void): Promise<void>;
    end(done?: (err?: Error) => void): Promise<void>;
    model<FT extends Type, F extends {
        [key: string]: FT;
    }>(name: string, fields: F): {
        create: () => Instance & {
            [fld in keyof F]: Native<typeof fields[fld]>;
        };
        instance: Instance & {
            [fld in keyof F]: Native<typeof fields[fld]>;
        };
        select: (boh: boolean) => Promise<(Instance & {
            [fld in keyof F]: Native<typeof fields[fld]>;
        })[]>;
    };
    protected select(bho: boolean): void;
}
export {};
