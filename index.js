
/**
 * Module dependencies.
 */

var debug = require('debug')('json-heal');
var Symbol = require('./lib/symbol');

/**
 * Expose `heal`.
 */

module.exports = heal;

/**
 * Symbols.
 */

var Obj = Symbol('Object');
var ObjEnd = Symbol('Object End');
var Arr = Symbol('Array');
var ArrEnd = Symbol('Array End');
var Key = Symbol('Key');
var Str = Symbol('String');
var Num = Symbol('Number');
var Bool = Symbol('Boolean');
var Null = Symbol('Null');

/**
 * Heal the given string of JSON.
 *
 * @param {String} json
 * @return {String}
 * @api public
 */

function heal(json){
  debug('json: %s', json);
  var stack = [];
  var c;

  function peek(){
    return stack[stack.length - 1];
  }

  function inArray(){
    var arrLevel = 0;
    var objLevel = 0;
    for (var i = stack.length - 1; i >= 0; i--) {
      var sym = stack[i];
      if (sym.is(ArrEnd)) arrLevel--;
      else if (sym.is(ObjEnd)) objLevel--;
      else if (sym.is(Arr)) arrLevel++;
      else if (sym.is(Obj)) objLevel++;
      if (objLevel > 0) return false;
      if (arrLevel > 0) return true;
    }
    return false;
  }

  for (var i = 0; i < json.length; i++) {
    c = json[i];
    debug('char: %s', c);
    
    if (peek() && (peek().is(Str) || peek().is(Key)) && !peek().done && '"' != c) {
      debug('in body: %s', c);
      peek().body += c;
      if ('\\' == c) peek().body += json[++i];
      continue;
    } else if ('{' == c) {
      debug('object');
      stack.push(Obj());
    } else if ('[' == c) {
      debug('array');
      stack.push(Arr());
    } else if (']' == c) {
      debug('array end');
      stack.push(ArrEnd());
    } else if ('}' == c) {
      debug('object end');
      stack.push(ObjEnd());
    } else if (
        ',' == c
        && (peek().done || peek().is(ArrEnd) || peek().is(ObjEnd) || peek().is(Num))
    ) {
      debug('comma (ignore)');
      continue;
    } else if (
        !peek()
        || peek().done && (peek().is(Key) || inArray())
        || peek().is(Arr)
    ) {
      if (/[\d-]/.test(c)) {
        debug('number');
        stack.push(Num());
      } else if ('t' == c || 'f' == c) {
        debug('boolean');
        stack.push(Bool());
      } else if ('n' == c) {
        debug('null');
        stack.push(Null());
      } else {
        debug('string');
        stack.push(Str());
      }
    } else if (peek().done && peek().is(Str) && !inArray()) {
      debug('key');
      stack.push(Key());
    } else if ('e' == c && peek().is(Bool)) {
      debug('finish bool');
      peek().done = true;
      peek().body += c;
      continue;
    } else if ('"' == c) {
      if (peek().is(Str)) {
        peek().done = true;
        peek().body += c;
        continue;
      }
      if (peek().is(Key)) {
        if (peek().done) {
          debug('string after key');
          stack.push(Str());
        } else {
          debug('finish key');
          peek().body += c;
          peek().done = true;
          i++;
          continue;
        }
      } else {
        if (inArray()) {
          debug('string after string in array');
          stack.push(Str());
        } else {
          debug('key');
          stack.push(Key());
        }
      }
    }
    
    peek().body += c;
  }

  
  if (stack.length) {
    debug('stack: %j', stack);
    var symbol;

    // trailing comma
    var last = stack[stack.length - 1];
    if (json[json.length - 1] == ',' && (last.not(Str) || last.done)) {
      if (inArray()) {
        json += '"..."';
        stack.push(Str());
      } else {
        json += '"...":"..."';
        stack.push(Key());
        peek().done = true;
        stack.push(Str());
      }
    }

    for (var i = stack.length - 1; i >= 0; i--) {
      symbol = stack[i];
      if ('' == symbol.body) continue;

      debug('cur: %s symbol: %j', json, symbol);

      if (symbol.is(Obj)) {
        var level = 1;
        for (var j = i + 1; j < stack.length; j++) {
          if (stack[j].is(Obj)) level++;
          else if (stack[j].is(ObjEnd)) level--;
        }
        if (level > 0) {
          json += '}';
          stack.push(ObjEnd());
        }
      }

      if (symbol.is(Arr)) {
        var level = 1;
        for (var j = i + 1; j < stack.length; j++) {
          if (stack[j].is(Arr)) level++;
          else if (stack[j].is(ArrEnd)) level--;
        }
        if (level > 0) {
          json += ']';
          stack.push(ArrEnd());
        }
      }
      
      if ((symbol.is(Key) || symbol.is(Str)) && !symbol.done) {
        if (/[^\\]\\$/.test(json)) json += '\\';
        json += '..."';
      }

      if (symbol.is(Key) && !stack[i+1]) {
        if (':' != json[json.length - 1]) json += ':';
        json += '"..."';
        stack.push(Str());
      }

      if (symbol.is(Bool)) {
        var str = 't' == symbol.body[0]
          ? 'true'
          : 'false';
        json += str.slice(symbol.body.length);
      }

      if (symbol.is(Null)) {
        json += 'null'.slice(symbol.body.length);
      }

      if (symbol.is(Num) && /(\.|\-|e)$/.test(symbol.body)) {
        json += '0';
      }

      if (symbol.not(Key) && !inArray()) {
        i--;
      }
    }
  }

  debug('ret: %s', json);
  return json;
}

