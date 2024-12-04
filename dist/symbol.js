"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents a Symbol type for JSON healing.
 */
class Symbol {
    constructor(name) {
        this.name = name;
        this.body = "";
        this.done = false;
    }
    inspect() {
        return `<Symbol:${this.name}:${this.body}${this.done ? " (done)" : ""}>`;
    }
    toJSON() {
        return this.inspect();
    }
    is(Type) {
        return this instanceof Type;
    }
    not(Type) {
        return !this.is(Type);
    }
}
exports.default = Symbol;
