"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.heal = heal;
const symbol_1 = __importDefault(require("./symbol"));
const Obj = new symbol_1.default("Object");
const ObjEnd = new symbol_1.default("Object End");
const Arr = new symbol_1.default("Array");
const ArrEnd = new symbol_1.default("Array End");
const Key = new symbol_1.default("Key");
const Str = new symbol_1.default("String");
const Num = new symbol_1.default("Number");
const Bool = new symbol_1.default("Boolean");
const Null = new symbol_1.default("Null");
function heal(json) {
    const stack = [];
    let output = json;
    const peek = () => stack[stack.length - 1];
    for (let i = 0; i < json.length; i++) {
        const char = json[i];
        if (char === "{" || char === "[") {
            stack.push(char === "{" ? Obj : Arr);
        }
        else if (char === "}" || char === "]") {
            stack.push(char === "}" ? ObjEnd : ArrEnd);
        }
        else if (peek()?.is(symbol_1.default) && char !== '"') {
            peek().body += char;
        }
    }
    if (stack.some((symbol) => symbol.is(symbol_1.default))) {
        stack.forEach((symbol) => {
            if (symbol.is(symbol_1.default))
                output += "}";
            else if (symbol.is(symbol_1.default))
                output += "]";
        });
    }
    return output;
}
console.log(heal('{"a": 1, "b": 2, "c": 3'));
