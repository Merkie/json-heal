/**
 * Represents a Symbol type for JSON healing.
 */
declare class Symbol {
    name: string;
    body: string;
    done: boolean;
    constructor(name: string);
    inspect(): string;
    toJSON(): string;
    is(Type: typeof Symbol): boolean;
    not(Type: typeof Symbol): boolean;
}
export default Symbol;
