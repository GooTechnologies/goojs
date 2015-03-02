// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
// The CrunchModule object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways CrunchModule can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(CrunchModule) { ..generated code.. }
// 3. pre-run appended it, var CrunchModule = {}; ..generated code..
// 4. External script tag defines var CrunchModule.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but CrunchModule was defined
// elsewhere (e.g. case 4 above). We also need to check if CrunchModule
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use CrunchModule
// after the generated code, you will need to define   var CrunchModule = {};
// before the code. Then that object will be used in the code, and you
// can continue to use CrunchModule afterwards as well.
var CrunchModule;
if (!CrunchModule) CrunchModule = eval('(function() { try { return CrunchModule || {} } catch(e) { return {} } })()');
// Sometimes an existing CrunchModule object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in CrunchModule) {
  if (CrunchModule.hasOwnProperty(key)) {
    moduleOverrides[key] = CrunchModule[key];
  }
}
// The environment setup code below is customized to use CrunchModule.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  CrunchModule['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  CrunchModule['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  CrunchModule['read'] = function(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  CrunchModule['readBinary'] = function(filename) { return CrunchModule['read'](filename, true) };
  CrunchModule['load'] = function(f) {
    globalEval(read(f));
  };
  CrunchModule['arguments'] = process['argv'].slice(2);
  module.exports = CrunchModule;
}
else if (ENVIRONMENT_IS_SHELL) {
  CrunchModule['print'] = print;
  if (typeof printErr != 'undefined') CrunchModule['printErr'] = printErr; // not present in v8 or older sm
  if (typeof read != 'undefined') {
    CrunchModule['read'] = read;
  } else {
    CrunchModule['read'] = function() { throw 'no read() available (jsc?)' };
  }
  CrunchModule['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (typeof scriptArgs != 'undefined') {
    CrunchModule['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    CrunchModule['arguments'] = arguments;
  }
  this['CrunchModule'] = CrunchModule;
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  CrunchModule['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (typeof arguments != 'undefined') {
    CrunchModule['arguments'] = arguments;
  }
  if (typeof console !== 'undefined') {
    CrunchModule['print'] = function(x) {
      console.log(x);
    };
    CrunchModule['printErr'] = function(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    CrunchModule['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }
  if (ENVIRONMENT_IS_WEB) {
    this['CrunchModule'] = CrunchModule;
  } else {
    CrunchModule['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!CrunchModule['load'] == 'undefined' && CrunchModule['read']) {
  CrunchModule['load'] = function(f) {
    globalEval(CrunchModule['read'](f));
  };
}
if (!CrunchModule['print']) {
  CrunchModule['print'] = function(){};
}
if (!CrunchModule['printErr']) {
  CrunchModule['printErr'] = CrunchModule['print'];
}
if (!CrunchModule['arguments']) {
  CrunchModule['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
CrunchModule.print = CrunchModule['print'];
CrunchModule.printErr = CrunchModule['printErr'];
// Callbacks
CrunchModule['preRun'] = [];
CrunchModule['postRun'] = [];
// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    CrunchModule[key] = moduleOverrides[key];
  }
}
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (type == 'i64' || type == 'double' || vararg) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return CrunchModule['dynCall_' + sig].apply(null, args);
    } else {
      return CrunchModule['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2 + 2*i;
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      CrunchModule.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;
      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }
      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+(((low)>>>(0))))+((+(((high)>>>(0))))*(+(4294967296)))) : ((+(((low)>>>(0))))+((+(((high)|(0))))*(+(4294967296))))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
CrunchModule["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = CrunchModule['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
CrunchModule["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math.abs(tempDouble))) >= (+(1)) ? (tempDouble > (+(0)) ? ((Math.min((+(Math.floor((tempDouble)/(+(4294967296))))), (+(4294967295))))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+(4294967296)))))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
CrunchModule['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
CrunchModule['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
CrunchModule['ALLOC_NORMAL'] = ALLOC_NORMAL;
CrunchModule['ALLOC_STACK'] = ALLOC_STACK;
CrunchModule['ALLOC_STATIC'] = ALLOC_STATIC;
CrunchModule['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
CrunchModule['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
CrunchModule['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
CrunchModule['Pointer_stringify'] = Pointer_stringify;
// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;
  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
CrunchModule['UTF16ToString'] = UTF16ToString;
// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr', 
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0
}
CrunchModule['stringToUTF16'] = stringToUTF16;
// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;
  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
CrunchModule['UTF32ToString'] = UTF32ToString;
// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr', 
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0
}
CrunchModule['stringToUTF32'] = stringToUTF32;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', or (2) set CrunchModule.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = CrunchModule['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = CrunchModule['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = CrunchModule['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
CrunchModule['HEAP'] = HEAP;
CrunchModule['HEAP8'] = HEAP8;
CrunchModule['HEAP16'] = HEAP16;
CrunchModule['HEAP32'] = HEAP32;
CrunchModule['HEAPU8'] = HEAPU8;
CrunchModule['HEAPU16'] = HEAPU16;
CrunchModule['HEAPU32'] = HEAPU32;
CrunchModule['HEAPF32'] = HEAPF32;
CrunchModule['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited
var runtimeInitialized = false;
function preRun() {
  // compatibility - merge in anything from CrunchModule['preRun'] at this time
  if (CrunchModule['preRun']) {
    if (typeof CrunchModule['preRun'] == 'function') CrunchModule['preRun'] = [CrunchModule['preRun']];
    while (CrunchModule['preRun'].length) {
      addOnPreRun(CrunchModule['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
function postRun() {
  // compatibility - merge in anything from CrunchModule['postRun'] at this time
  if (CrunchModule['postRun']) {
    if (typeof CrunchModule['postRun'] == 'function') CrunchModule['postRun'] = [CrunchModule['postRun']];
    while (CrunchModule['postRun'].length) {
      addOnPostRun(CrunchModule['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
CrunchModule['addOnPreRun'] = CrunchModule.addOnPreRun = addOnPreRun;
function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
CrunchModule['addOnInit'] = CrunchModule.addOnInit = addOnInit;
function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
CrunchModule['addOnPreMain'] = CrunchModule.addOnPreMain = addOnPreMain;
function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
CrunchModule['addOnExit'] = CrunchModule.addOnExit = addOnExit;
function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
CrunchModule['addOnPostRun'] = CrunchModule.addOnPostRun = addOnPostRun;
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
CrunchModule['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
CrunchModule['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr
    i = i + 1;
  }
}
CrunchModule['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
CrunchModule['writeArrayToMemory'] = writeArrayToMemory;
function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i)
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0
}
CrunchModule['writeAsciiToMemory'] = writeAsciiToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
function addRunDependency(id) {
  runDependencies++;
  if (CrunchModule['monitorRunDependencies']) {
    CrunchModule['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
  } else {
    CrunchModule.printErr('warning: run dependency added without ID');
  }
}
CrunchModule['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (CrunchModule['monitorRunDependencies']) {
    CrunchModule['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    CrunchModule.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
CrunchModule['removeRunDependency'] = removeRunDependency;
CrunchModule["preloadedImages"] = {}; // maps url to image data
CrunchModule["preloadedAudios"] = {}; // maps url to audio data
var memoryInitializer = null;
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 1400;
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });
/* memory initializer */ allocate([109,95,108,111,111,107,117,112,91,116,93,32,61,61,32,99,85,73,78,84,51,50,95,77,65,88,0,0,0,0,0,0,116,32,60,32,40,49,85,32,60,60,32,116,97,98,108,101,95,98,105,116,115,41,0,0,112,67,111,100,101,115,105,122,101,115,91,115,121,109,95,105,110,100,101,120,93,32,61,61,32,99,111,100,101,115,105,122,101,0,0,0,0,0,0,0,115,111,114,116,101,100,95,112,111,115,32,60,32,116,111,116,97,108,95,117,115,101,100,95,115,121,109,115,0,0,0,0,110,117,109,95,99,111,100,101,115,91,99,93,0,0,0,0,110,101,119,95,99,97,112,97,99,105,116,121,32,38,38,32,40,110,101,119,95,99,97,112,97,99,105,116,121,32,62,32,109,95,99,97,112,97,99,105,116,121,41,0,0,0,0,0,40,108,101,110,32,62,61,32,49,41,32,38,38,32,40,108,101,110,32,60,61,32,99,77,97,120,69,120,112,101,99,116,101,100,67,111,100,101,83,105,122,101,41,0,0,0,0,0,110,101,120,116,95,108,101,118,101,108,95,111,102,115,32,62,32,99,117,114,95,108,101,118,101,108,95,111,102,115,0,0,110,117,109,32,38,38,32,40,110,117,109,32,61,61,32,126,110,117,109,95,99,104,101,99,107,41,0,0,0,0,0,0,105,32,60,32,109,95,115,105,122,101,0,0,0,0,0,0,109,105,110,95,110,101,119,95,99,97,112,97,99,105,116,121,32,60,32,40,48,120,55,70,70,70,48,48,48,48,85,32,47,32,101,108,101,109,101,110,116,95,115,105,122,101,41,0,109,111,100,101,108,46,109,95,99,111,100,101,95,115,105,122,101,115,91,115,121,109,93,32,61,61,32,108,101,110,0,0,116,32,33,61,32,99,85,73,78,84,51,50,95,77,65,88,0,0,0,0,0,0,0,0,109,95,98,105,116,95,99,111,117,110,116,32,60,61,32,99,66,105,116,66,117,102,83,105,122,101,0,0,0,0,0,0,110,117,109,95,98,105,116,115,32,60,61,32,51,50,85,0,48,0,0,0,0,0,0,0,46,47,99,114,110,95,100,101,99,111,109,112,46,104,0,0,40,116,111,116,97,108,95,115,121,109,115,32,62,61,32,49,41,32,38,38,32,40,116,111,116,97,108,95,115,121,109,115,32,60,61,32,112,114,101,102,105,120,95,99,111,100,105,110,103,58,58,99,77,97,120,83,117,112,112,111,114,116,101,100,83,121,109,115,41,0,0,0,102,97,108,115,101,0,0,0,99,114,110,100,95,102,114,101,101,58,32,98,97,100,32,112,116,114,0,0,0,0,0,0,99,114,110,100,95,114,101,97,108,108,111,99,58,32,98,97,100,32,112,116,114,0,0,0,40,40,117,105,110,116,51,50,41,112,95,110,101,119,32,38,32,40,67,82,78,68,95,77,73,78,95,65,76,76,79,67,95,65,76,73,71,78,77,69,78,84,32,45,32,49,41,41,32,61,61,32,48,0,0,0,99,114,110,100,95,109,97,108,108,111,99,58,32,111,117,116,32,111,102,32,109,101,109,111,114,121,0,0,0,0,0,0,99,114,110,100,95,109,97,108,108,111,99,58,32,115,105,122,101,32,116,111,111,32,98,105,103,0,0,0,0,0,0,0,109,95,115,105,122,101,32,60,61,32,109,95,99,97,112,97,99,105,116,121,0,0,0,0,37,115,40,37,117,41,58,32,65,115,115,101,114,116,105,111,110,32,102,97,105,108,117,114,101,58,32,34,37,115,34,10,0,0,0,0,0,0,0,0,17,18,19,20,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15,16,0,0,0,1,2,2,3,3,3,3,4,0,0,0,0,0,0,1,1,0,1,0,1,0,0,1,2,1,2,0,0,0,1,0,2,1,0,2,0,0,1,2,3,2,0,0,0,0,0,0,0,0,2,3,4,5,6,7,1,0,2,3,1,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  CrunchModule["_strlen"] = _strlen;
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (flagAlwaysSigned) {
                if (currArg < 0) {
                  prefix = '-' + prefix;
                } else {
                  prefix = '+' + prefix;
                }
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (flagAlwaysSigned && currArg >= 0) {
                  argText = '+' + argText;
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var VFS=undefined;
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path, ext) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var f = PATH.splitPath(path)[2];
        if (ext && f.substr(-1 * ext.length) === ext) {
          f = f.substr(0, f.length - ext.length);
        }
        return f;
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.filter(function(p, index) {
          if (typeof p !== 'string') {
            throw new TypeError('Arguments to path.join must be strings');
          }
          return p;
        }).join('/'));
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            CrunchModule['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            CrunchModule['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  var MEMFS={CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },mount:function (mount) {
        return MEMFS.create_node(null, '/', 16384 | 0777, 0);
      },create_node:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            lookup: MEMFS.node_ops.lookup,
            mknod: MEMFS.node_ops.mknod,
            mknod: MEMFS.node_ops.mknod,
            rename: MEMFS.node_ops.rename,
            unlink: MEMFS.node_ops.unlink,
            rmdir: MEMFS.node_ops.rmdir,
            readdir: MEMFS.node_ops.readdir,
            symlink: MEMFS.node_ops.symlink
          };
          node.stream_ops = {
            llseek: MEMFS.stream_ops.llseek
          };
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr
          };
          node.stream_ops = {
            llseek: MEMFS.stream_ops.llseek,
            read: MEMFS.stream_ops.read,
            write: MEMFS.stream_ops.write,
            allocate: MEMFS.stream_ops.allocate,
            mmap: MEMFS.stream_ops.mmap
          };
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            readlink: MEMFS.node_ops.readlink
          };
          node.stream_ops = {};
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr
          };
          node.stream_ops = FS.chrdev_stream_ops;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.create_node(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.create_node(parent, newname, 0777 | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            assert(buffer.length);
            if (canOwn && buffer.buffer === HEAP8.buffer && offset === 0) {
              node.contents = buffer; // this is a subarray of the heap, and we can own it
              node.contentMode = MEMFS.CONTENT_OWNING;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,devices:[null],streams:[null],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
        },handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + new Error().stack;
        return ___setErrNo(e.errno);
      },cwd:function () {
        return FS.currentPath;
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.currentPath, path);
        opts = opts || { recurse_count: 0 };
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
        // start at the root
        var current = FS.root;
        var current_path = '/';
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join(current_path, parts[i]);
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            current = current.mount.root;
          }
          // follow symlinks
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            return path ? PATH.join(node.mount.mountpoint, path) : node.mount.mountpoint;
          }
          path = path ? PATH.join(node.name, path) : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          if (node.parent.id === parent.id && node.name === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        var node = {
          id: FS.nextInode++,
          name: name,
          mode: mode,
          node_ops: {},
          stream_ops: {},
          rdev: rdev,
          parent: null,
          mount: null
        };
        if (!parent) {
          parent = node;  // root node sets parent to itself
        }
        node.parent = parent;
        node.mount = parent.mount;
        // compatibility
        var readMode = 292 | 73;
        var writeMode = 146;
        // NOTE we must use Object.defineProperties instead of individual calls to
        // Object.defineProperty in order to make closure compiler happy
        Object.defineProperties(node, {
          read: {
            get: function() { return (node.mode & readMode) === readMode; },
            set: function(val) { val ? node.mode |= readMode : node.mode &= ~readMode; }
          },
          write: {
            get: function() { return (node.mode & writeMode) === writeMode; },
            set: function(val) { val ? node.mode |= writeMode : node.mode &= ~writeMode; }
          },
          isFolder: {
            get: function() { return FS.isDir(node.mode); },
          },
          isDevice: {
            get: function() { return FS.isChrdev(node.mode); },
          },
        });
        FS.hashAddNode(node);
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.currentPath) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 1;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        // compatibility
        Object.defineProperties(stream, {
          object: {
            get: function() { return stream.node; },
            set: function(val) { stream.node = val; }
          },
          isRead: {
            get: function() { return (stream.flags & 2097155) !== 1; }
          },
          isWrite: {
            get: function() { return (stream.flags & 2097155) !== 0; }
          },
          isAppend: {
            get: function() { return (stream.flags & 1024); }
          }
        });
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },mount:function (type, opts, mountpoint) {
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          root: null
        };
        var lookup;
        if (mountpoint) {
          lookup = FS.lookupPath(mountpoint, { follow: false });
        }
        // create a root node for the fs
        var root = type.mount(mount);
        root.mount = mount;
        mount.root = root;
        // assign the mount info to the mountpoint's node
        if (lookup) {
          lookup.node.mount = mount;
          lookup.node.mounted = true;
          // compatibility update FS.root if we mount to /
          if (mountpoint === '/') {
            FS.root = mount.root;
          }
        }
        return root;
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 0666;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 0777;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 0666;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path, { follow: false });
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        path = PATH.normalize(path);
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 0666 : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        try {
          var lookup = FS.lookupPath(path, {
            follow: !(flags & 131072)
          });
          node = lookup.node;
          path = lookup.path;
        } catch (e) {
          // ignore
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // register the stream with the filesystem
        var stream = FS.createStream({
          path: path,
          node: node,
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (CrunchModule['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            CrunchModule['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.errnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0);
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using CrunchModule['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (CrunchModule['stdin']) {
          FS.createDevice('/dev', 'stdin', CrunchModule['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (CrunchModule['stdout']) {
          FS.createDevice('/dev', 'stdout', null, CrunchModule['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (CrunchModule['stderr']) {
          FS.createDevice('/dev', 'stderr', null, CrunchModule['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=stdin.fd;
        assert(stdin.fd === 1, 'invalid handle for stdin (' + stdin.fd + ')');
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=stdout.fd;
        assert(stdout.fd === 2, 'invalid handle for stdout (' + stdout.fd + ')');
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=stderr.fd;
        assert(stderr.fd === 3, 'invalid handle for stderr (' + stderr.fd + ')');
      },staticInit:function () {
        FS.nameTable = new Array(4096);
        FS.root = FS.createNode(null, '/', 16384 | 0777, 0);
        FS.mount(MEMFS, {}, '/');
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        // Allow CrunchModule.stdin etc. to provide defaults, if none explicitly passed to us here
        CrunchModule['stdin'] = input || CrunchModule['stdin'];
        CrunchModule['stdout'] = output || CrunchModule['stdout'];
        CrunchModule['stderr'] = error || CrunchModule['stderr'];
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(path, mode | 146);
          var stream = FS.open(path, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(path, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (CrunchModule['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(CrunchModule['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          var LazyUint8Array = function() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
              if (!hasByteServing) chunkSize = datalength;
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          CrunchModule['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 0777, 0);
      },nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              var url = 'ws://' + addr + ':' + port;
              // the node ws library API is slightly different than the browser's
              var opts = ENVIRONMENT_IS_NODE ? {} : ['binary'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
          var handleMessage = function(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStream(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }
  CrunchModule["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;
  CrunchModule["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  function ___gxx_personality_v0() {
    }
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      CrunchModule.print('exit(' + status + ') called');
      CrunchModule['exit'](status);
    }function _exit(status) {
      __exit(status);
    }function __ZSt9terminatev() {
      _exit(-1234);
    }
  function _llvm_lifetime_start() {}
  function _llvm_lifetime_end() {}
  var _llvm_memset_p0i8_i64=_memset;
  function _abort() {
      CrunchModule['abort']();
    }
  function ___errno_location() {
      return ___errno_state;
    }
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (CrunchModule['setStatus']) {
            var message = CrunchModule['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                CrunchModule['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                CrunchModule['setStatus'](message);
              }
            } else {
              CrunchModule['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!CrunchModule["preloadPlugins"]) CrunchModule["preloadPlugins"] = []; // needs to exist even in workers
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!CrunchModule.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          CrunchModule.noImageDecoding = true;
        }
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to CrunchModule.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !CrunchModule.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            CrunchModule["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        CrunchModule['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !CrunchModule.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            CrunchModule["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            CrunchModule["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        CrunchModule['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = CrunchModule['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (CrunchModule['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          CrunchModule.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          CrunchModule.ctx = ctx;
          CrunchModule.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = CrunchModule['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (CrunchModule['onFullScreen']) CrunchModule['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = CrunchModule["canvas"].getBoundingClientRect();
          var x, y;
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (window.scrollX + rect.left);
              y = t.pageY - (window.scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (window.scrollX + rect.left);
            y = event.pageY - (window.scrollY + rect.top);
          }
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = CrunchModule["canvas"].width;
          var ch = CrunchModule["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = CrunchModule['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = CrunchModule['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = CrunchModule['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = CrunchModule['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!CrunchModule["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });CrunchModule["FS_createFolder"] = FS.createFolder;CrunchModule["FS_createPath"] = FS.createPath;CrunchModule["FS_createDataFile"] = FS.createDataFile;CrunchModule["FS_createPreloadedFile"] = FS.createPreloadedFile;CrunchModule["FS_createLazyFile"] = FS.createLazyFile;CrunchModule["FS_createLink"] = FS.createLink;CrunchModule["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
CrunchModule["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  CrunchModule["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  CrunchModule["setCanvasSize"] = function(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  CrunchModule["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  CrunchModule["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  CrunchModule["getUserMedia"] = function() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var Math_min = Math.min;
function invoke_ii(index,a1) {
  try {
    return CrunchModule["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vi(index,a1) {
  try {
    CrunchModule["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  try {
    return CrunchModule["dynCall_iiiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viii(index,a1,a2,a3) {
  try {
    CrunchModule["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_v(index) {
  try {
    CrunchModule["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iii(index,a1,a2) {
  try {
    return CrunchModule["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function asmPrintInt(x, y) {
  CrunchModule.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  CrunchModule.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=+env.NaN;var n=+env.Infinity;var o=0;var p=0;var q=0;var r=0;var s=0,t=0,u=0,v=0,w=0.0,x=0,y=0,z=0,A=0.0;var B=0;var C=0;var D=0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=global.Math.floor;var M=global.Math.abs;var N=global.Math.sqrt;var O=global.Math.pow;var P=global.Math.cos;var Q=global.Math.sin;var R=global.Math.tan;var S=global.Math.acos;var T=global.Math.asin;var U=global.Math.atan;var V=global.Math.atan2;var W=global.Math.exp;var X=global.Math.log;var Y=global.Math.ceil;var Z=global.Math.imul;var _=env.abort;var $=env.assert;var aa=env.asmPrintInt;var ab=env.asmPrintFloat;var ac=env.min;var ad=env.invoke_ii;var ae=env.invoke_vi;var af=env.invoke_iiiiii;var ag=env.invoke_viii;var ah=env.invoke_v;var ai=env.invoke_iii;var aj=env._llvm_lifetime_end;var ak=env._snprintf;var al=env._abort;var am=env._fprintf;var an=env._printf;var ao=env._fflush;var ap=env.__reallyNegative;var aq=env._sysconf;var ar=env.___setErrNo;var as=env._fwrite;var at=env._send;var au=env._write;var av=env._exit;var aw=env._sprintf;var ax=env.__formatString;var ay=env.__ZSt9terminatev;var az=env._pwrite;var aA=env._sbrk;var aB=env.___errno_location;var aC=env.___gxx_personality_v0;var aD=env._llvm_lifetime_start;var aE=env._time;var aF=env.__exit;
// EMSCRIPTEN_START_FUNCS
function aM(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7>>3<<3;return b|0}function aN(){return i|0}function aO(a){a=a|0;i=a}function aP(a,b){a=a|0;b=b|0;if((o|0)==0){o=a;p=b}}function aQ(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function aR(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function aS(a){a=a|0;B=a}function aT(a){a=a|0;C=a}function aU(a){a=a|0;D=a}function aV(a){a=a|0;E=a}function aW(a){a=a|0;F=a}function aX(a){a=a|0;G=a}function aY(a){a=a|0;H=a}function aZ(a){a=a|0;I=a}function a_(a){a=a|0;J=a}function a$(a){a=a|0;K=a}function a0(){}function a1(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;g=i;i=i+520|0;h=g|0;j=g+512|0;k=a+4|0;l=a+8|0;if((c[k>>2]|0)>>>0>(c[l>>2]|0)>>>0){m=h|0;aw(m|0,776|0,(n=i,i=i+24|0,c[n>>2]=488,c[n+8>>2]=2121,c[n+16>>2]=752,n)|0)|0;i=n;an(m|0,(n=i,i=i+1|0,i=i+7>>3<<3,c[n>>2]=0,n)|0)|0;i=n}if((2147418112/(e>>>0)|0)>>>0<=b>>>0){m=h|0;aw(m|0,776|0,(n=i,i=i+24|0,c[n>>2]=488,c[n+8>>2]=2122,c[n+16>>2]=328,n)|0)|0;i=n;an(m|0,(n=i,i=i+1|0,i=i+7>>3<<3,c[n>>2]=0,n)|0)|0;i=n}m=c[l>>2]|0;if(m>>>0>=b>>>0){o=1;i=g;return o|0}do{if(d){p=b-1|0;if((b|0)!=0){if((p&b|0)==0){q=b;break}}r=p>>>16|p;p=r>>>8|r;r=p>>>4|p;p=r>>>2|r;q=(p>>>1|p)+1|0}else{q=b}}while(0);if(!((q|0)!=0&q>>>0>m>>>0)){m=h|0;aw(m|0,776|0,(n=i,i=i+24|0,c[n>>2]=488,c[n+8>>2]=2131,c[n+16>>2]=152,n)|0)|0;i=n;an(m|0,(n=i,i=i+1|0,i=i+7>>3<<3,c[n>>2]=0,n)|0)|0;i=n}m=Z(q,e)|0;do{if((f|0)==0){b=a|0;d=a2(c[b>>2]|0,m,j,1)|0;if((d|0)==0){o=0;i=g;return o|0}else{c[b>>2]=d;break}}else{d=a3(m,j)|0;if((d|0)==0){o=0;i=g;return o|0}b=a|0;aJ[f&1](d,c[b>>2]|0,c[k>>2]|0);p=c[b>>2]|0;do{if((p|0)!=0){if((p&7|0)==0){r=c[220]|0;s=c[350]|0;aI[r&3](p,0,0,1,s)|0;break}else{s=h|0;aw(s|0,776|0,(n=i,i=i+24|0,c[n>>2]=488,c[n+8>>2]=2500,c[n+16>>2]=584,n)|0)|0;i=n;an(s|0,(n=i,i=i+1|0,i=i+7>>3<<3,c[n>>2]=0,n)|0)|0;i=n;break}}}while(0);c[b>>2]=d}}while(0);n=c[j>>2]|0;if(n>>>0>m>>>0){t=(n>>>0)/(e>>>0)|0}else{t=q}c[l>>2]=t;o=1;i=g;return o|0}function a2(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;i=i+520|0;g=f|0;h=f+512|0;if((a&7|0)!=0){j=g|0;aw(j|0,776,(k=i,i=i+24|0,c[k>>2]=488,c[k+8>>2]=2500,c[k+16>>2]=608,k)|0)|0;i=k;an(j|0,(k=i,i=i+1|0,i=i+7>>3<<3,c[k>>2]=0,k)|0)|0;i=k;l=0;i=f;return l|0}if(b>>>0>2147418112){j=g|0;aw(j|0,776,(k=i,i=i+24|0,c[k>>2]=488,c[k+8>>2]=2500,c[k+16>>2]=720,k)|0)|0;i=k;an(j|0,(k=i,i=i+1|0,i=i+7>>3<<3,c[k>>2]=0,k)|0)|0;i=k;l=0;i=f;return l|0}c[h>>2]=b;j=aI[c[220]&3](a,b,h,e,c[350]|0)|0;if((d|0)!=0){c[d>>2]=c[h>>2]}if((j&7|0)==0){l=j;i=f;return l|0}h=g|0;aw(h|0,776,(k=i,i=i+24|0,c[k>>2]=488,c[k+8>>2]=2552,c[k+16>>2]=632,k)|0)|0;i=k;an(h|0,(k=i,i=i+1|0,i=i+7>>3<<3,c[k>>2]=0,k)|0)|0;i=k;l=j;i=f;return l|0}function a3(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;i=i+520|0;e=d|0;f=d+512|0;g=a+3&-4;a=(g|0)==0?4:g;if(a>>>0>2147418112){g=e|0;aw(g|0,776,(h=i,i=i+24|0,c[h>>2]=488,c[h+8>>2]=2500,c[h+16>>2]=720,h)|0)|0;i=h;an(g|0,(h=i,i=i+1|0,i=i+7>>3<<3,c[h>>2]=0,h)|0)|0;i=h;j=0;i=d;return j|0}c[f>>2]=a;g=aI[c[220]&3](0,a,f,1,c[350]|0)|0;k=c[f>>2]|0;if((b|0)!=0){c[b>>2]=k}if((g|0)==0|k>>>0<a>>>0){a=e|0;aw(a|0,776,(h=i,i=i+24|0,c[h>>2]=488,c[h+8>>2]=2500,c[h+16>>2]=688,h)|0)|0;i=h;an(a|0,(h=i,i=i+1|0,i=i+7>>3<<3,c[h>>2]=0,h)|0)|0;i=h;j=0;i=d;return j|0}if((g&7|0)==0){j=g;i=d;return j|0}a=e|0;aw(a|0,776,(h=i,i=i+24|0,c[h>>2]=488,c[h+8>>2]=2527,c[h+16>>2]=632,h)|0)|0;i=h;an(a|0,(h=i,i=i+1|0,i=i+7>>3<<3,c[h>>2]=0,h)|0)|0;i=h;j=g;i=d;return j|0}function a4(f,g,h,j){f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;k=i;i=i+720|0;l=k|0;m=k+512|0;n=k+576|0;o=k+648|0;if((g|0)==0|j>>>0>11){p=0;i=k;return p|0}c[f>>2]=g;bE(n|0,0,68);q=0;while(1){r=a[h+q|0]|0;if(r<<24>>24!=0){s=n+((r&255)<<2)|0;c[s>>2]=(c[s>>2]|0)+1}s=q+1|0;if(s>>>0<g>>>0){q=s}else{t=1;u=-1;v=0;w=0;x=0;break}}while(1){q=c[n+(t<<2)>>2]|0;if((q|0)==0){c[f+28+(t-1<<2)>>2]=0;y=x;z=w;A=v;B=u}else{s=t-1|0;c[m+(s<<2)>>2]=x;r=q+x|0;C=16-t|0;c[f+28+(s<<2)>>2]=(r-1<<C|(1<<C)-1)+1;c[f+96+(s<<2)>>2]=w;c[o+(t<<2)>>2]=w;y=r;z=q+w|0;A=v>>>0>t>>>0?v:t;B=u>>>0<t>>>0?u:t}q=t+1|0;if(q>>>0<17){t=q;u=B;v=A;w=z;x=y<<1}else{break}}c[f+4>>2]=z;y=f+172|0;do{if(z>>>0>(c[y>>2]|0)>>>0){c[y>>2]=z;x=z-1|0;if((z|0)==0){D=67}else{if((x&z|0)!=0){D=67}}if((D|0)==67){w=x>>>16|x;x=w>>>8|w;w=x>>>4|x;x=w>>>2|w;w=(x>>>1|x)+1|0;c[y>>2]=w>>>0>g>>>0?g:w}w=f+176|0;x=c[w>>2]|0;do{if((x|0)!=0){v=c[x-4>>2]|0;u=x-8|0;if((v|0)==0){D=71}else{if((v|0)!=(~c[u>>2]|0)){D=71}}if((D|0)==71){v=l|0;aw(v|0,776,(E=i,i=i+24|0,c[E>>2]=488,c[E+8>>2]=645,c[E+16>>2]=280,E)|0)|0;i=E;an(v|0,(E=i,i=i+1|0,i=i+7>>3<<3,c[E>>2]=0,E)|0)|0;i=E;if((u|0)==0){break}}if((u&7|0)==0){v=u;u=c[220]|0;t=c[350]|0;aI[u&3](v,0,0,1,t)|0;break}else{t=l|0;aw(t|0,776,(E=i,i=i+24|0,c[E>>2]=488,c[E+8>>2]=2500,c[E+16>>2]=584,E)|0)|0;i=E;an(t|0,(E=i,i=i+1|0,i=i+7>>3<<3,c[E>>2]=0,E)|0)|0;i=E;break}}}while(0);x=c[y>>2]|0;t=(x|0)==0?1:x;x=a3((t<<1)+8|0,0)|0;if((x|0)==0){c[w>>2]=0;p=0;i=k;return p|0}else{v=x+8|0;c[x+4>>2]=t;c[x>>2]=~t;c[w>>2]=v;if((v|0)==0){p=0}else{break}i=k;return p|0}}}while(0);y=f+24|0;a[y]=B&255;a[f+25|0]=A&255;B=l|0;v=f+176|0;t=0;do{x=a[h+t|0]|0;u=x&255;if(x<<24>>24!=0){if((c[n+(u<<2)>>2]|0)==0){aw(B|0,776,(E=i,i=i+24|0,c[E>>2]=488,c[E+8>>2]=2274,c[E+16>>2]=136,E)|0)|0;i=E;an(B|0,(E=i,i=i+1|0,i=i+7>>3<<3,c[E>>2]=0,E)|0)|0;i=E}x=o+(u<<2)|0;u=c[x>>2]|0;c[x>>2]=u+1;if(u>>>0>=z>>>0){aw(B|0,776,(E=i,i=i+24|0,c[E>>2]=488,c[E+8>>2]=2278,c[E+16>>2]=104,E)|0)|0;i=E;an(B|0,(E=i,i=i+1|0,i=i+7>>3<<3,c[E>>2]=0,E)|0)|0;i=E}b[(c[v>>2]|0)+(u<<1)>>1]=t&65535}t=t+1|0;}while(t>>>0<g>>>0);g=a[y]|0;t=(g&255)>>>0<j>>>0?j:0;j=f+8|0;c[j>>2]=t;v=(t|0)!=0;if(v){B=1<<t;z=f+164|0;do{if(B>>>0>(c[z>>2]|0)>>>0){c[z>>2]=B;o=f+168|0;u=c[o>>2]|0;do{if((u|0)!=0){x=c[u-4>>2]|0;q=u-8|0;if((x|0)==0){D=94}else{if((x|0)!=(~c[q>>2]|0)){D=94}}if((D|0)==94){x=l|0;aw(x|0,776,(E=i,i=i+24|0,c[E>>2]=488,c[E+8>>2]=645,c[E+16>>2]=280,E)|0)|0;i=E;an(x|0,(E=i,i=i+1|0,i=i+7>>3<<3,c[E>>2]=0,E)|0)|0;i=E;if((q|0)==0){break}}if((q&7|0)==0){x=q;q=c[220]|0;r=c[350]|0;aI[q&3](x,0,0,1,r)|0;break}else{r=l|0;aw(r|0,776,(E=i,i=i+24|0,c[E>>2]=488,c[E+8>>2]=2500,c[E+16>>2]=584,E)|0)|0;i=E;an(r|0,(E=i,i=i+1|0,i=i+7>>3<<3,c[E>>2]=0,E)|0)|0;i=E;break}}}while(0);u=B<<2;w=a3(u+8|0,0)|0;if((w|0)==0){c[o>>2]=0;p=0;i=k;return p|0}else{r=w+8|0;x=r;c[w+4>>2]=B;c[w>>2]=~B;c[o>>2]=x;if((r|0)==0){p=0}else{F=x;G=u;break}i=k;return p|0}}else{F=c[f+168>>2]|0;G=B<<2}}while(0);D=f+168|0;bE(F|0,-1|0,G|0);G=f+176|0;F=l|0;l=1;do{do{if((c[n+(l<<2)>>2]|0)!=0){z=t-l|0;u=1<<z;x=l-1|0;r=c[m+(x<<2)>>2]|0;if(!((l|0)!=0&l>>>0<17)){aw(F|0,776,(E=i,i=i+24|0,c[E>>2]=488,c[E+8>>2]=1954,c[E+16>>2]=200,E)|0)|0;i=E;an(F|0,(E=i,i=i+1|0,i=i+7>>3<<3,c[E>>2]=0,E)|0)|0;i=E}w=c[f+28+(x<<2)>>2]|0;if((w|0)==0){H=-1}else{H=(w-1|0)>>>((16-l|0)>>>0)}if(r>>>0>H>>>0){break}w=(c[f+96+(x<<2)>>2]|0)-r|0;x=l<<16;q=r;do{r=e[(c[G>>2]|0)+(w+q<<1)>>1]|0;if((d[h+r|0]|0|0)!=(l|0)){aw(F|0,776,(E=i,i=i+24|0,c[E>>2]=488,c[E+8>>2]=2320,c[E+16>>2]=64,E)|0)|0;i=E;an(F|0,(E=i,i=i+1|0,i=i+7>>3<<3,c[E>>2]=0,E)|0)|0;i=E}s=q<<z;C=r|x;r=0;do{I=r+s|0;if(I>>>0>=B>>>0){aw(F|0,776,(E=i,i=i+24|0,c[E>>2]=488,c[E+8>>2]=2326,c[E+16>>2]=40,E)|0)|0;i=E;an(F|0,(E=i,i=i+1|0,i=i+7>>3<<3,c[E>>2]=0,E)|0)|0;i=E}J=c[D>>2]|0;if((c[J+(I<<2)>>2]|0)==-1){K=J}else{aw(F|0,776,(E=i,i=i+24|0,c[E>>2]=488,c[E+8>>2]=2328,c[E+16>>2]=8,E)|0)|0;i=E;an(F|0,(E=i,i=i+1|0,i=i+7>>3<<3,c[E>>2]=0,E)|0)|0;i=E;K=c[D>>2]|0}c[K+(I<<2)>>2]=C;r=r+1|0;}while(r>>>0<u>>>0);q=q+1|0;}while(q>>>0<=H>>>0)}}while(0);l=l+1|0;}while(l>>>0<=t>>>0);L=a[y]|0}else{L=g}g=f+96|0;c[g>>2]=(c[g>>2]|0)-(c[m>>2]|0);g=f+100|0;c[g>>2]=(c[g>>2]|0)-(c[m+4>>2]|0);g=f+104|0;c[g>>2]=(c[g>>2]|0)-(c[m+8>>2]|0);g=f+108|0;c[g>>2]=(c[g>>2]|0)-(c[m+12>>2]|0);g=f+112|0;c[g>>2]=(c[g>>2]|0)-(c[m+16>>2]|0);g=f+116|0;c[g>>2]=(c[g>>2]|0)-(c[m+20>>2]|0);g=f+120|0;c[g>>2]=(c[g>>2]|0)-(c[m+24>>2]|0);g=f+124|0;c[g>>2]=(c[g>>2]|0)-(c[m+28>>2]|0);g=f+128|0;c[g>>2]=(c[g>>2]|0)-(c[m+32>>2]|0);g=f+132|0;c[g>>2]=(c[g>>2]|0)-(c[m+36>>2]|0);g=f+136|0;c[g>>2]=(c[g>>2]|0)-(c[m+40>>2]|0);g=f+140|0;c[g>>2]=(c[g>>2]|0)-(c[m+44>>2]|0);g=f+144|0;c[g>>2]=(c[g>>2]|0)-(c[m+48>>2]|0);g=f+148|0;c[g>>2]=(c[g>>2]|0)-(c[m+52>>2]|0);g=f+152|0;c[g>>2]=(c[g>>2]|0)-(c[m+56>>2]|0);g=f+156|0;c[g>>2]=(c[g>>2]|0)-(c[m+60>>2]|0);m=f+16|0;c[m>>2]=0;g=f+20|0;c[g>>2]=L&255;L173:do{if(v){L=t;while(1){if((L|0)==0){break L173}M=L-1|0;if((c[n+(L<<2)>>2]|0)==0){L=M}else{break}}c[m>>2]=c[f+28+(M<<2)>>2];L=t+1|0;c[g>>2]=L;y=L;while(1){if(y>>>0>A>>>0){break L173}if((c[n+(y<<2)>>2]|0)==0){y=y+1|0}else{break}}c[g>>2]=y}}while(0);c[f+92>>2]=-1;c[f+160>>2]=1048575;c[f+12>>2]=32-(c[j>>2]|0);p=1;i=k;return p|0}function a5(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;do{if((a|0)==0){f=bx(b)|0;if((d|0)==0){g=f;break}if((f|0)==0){h=0}else{h=bB(f)|0}c[d>>2]=h;g=f}else{if((b|0)==0){by(a);if((d|0)==0){g=0;break}c[d>>2]=0;g=0;break}f=bz(a,b)|0;i=(f|0)!=0;if(i|e^1){j=i?f:a;k=f}else{f=bz(a,b)|0;j=(f|0)==0?a:f;k=f}if((d|0)==0){g=k;break}c[d>>2]=bB(j)|0;g=k}}while(0);return g|0}function a6(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0;if((b|0)==0|e>>>0<74|(f|0)==0){g=0;return g|0}if((c[f>>2]|0)!=40){g=0;return g|0}if(((d[b]|0)<<8|(d[b+1|0]|0)|0)!=18552){g=0;return g|0}if(((d[b+2|0]|0)<<8|(d[b+3|0]|0))>>>0<74){g=0;return g|0}h=((d[b+7|0]|0)<<16|(d[b+6|0]|0)<<24|(d[b+8|0]|0)<<8|(d[b+9|0]|0))>>>0>e>>>0?0:b;if((h|0)==0){g=0;return g|0}c[f+4>>2]=(d[h+12|0]|0)<<8|(d[h+13|0]|0);c[f+8>>2]=(d[h+14|0]|0)<<8|(d[h+15|0]|0);c[f+12>>2]=d[h+16|0]|0;c[f+16>>2]=d[h+17|0]|0;b=h+18|0;e=f+32|0;c[e>>2]=d[b]|0;c[e+4>>2]=0;e=a[b]|0;if(e<<24>>24==0){i=8}else{i=e<<24>>24==9?8:16}c[f+20>>2]=i;c[f+24>>2]=(d[h+26|0]|0)<<16|(d[h+25|0]|0)<<24|(d[h+27|0]|0)<<8|(d[h+28|0]|0);c[f+28>>2]=(d[h+30|0]|0)<<16|(d[h+29|0]|0)<<24|(d[h+31|0]|0)<<8|(d[h+32|0]|0);g=1;return g|0}function a7(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0;d=i;i=i+512|0;e=c[b+20>>2]|0;if((e|0)!=0){a8(e)}e=b+4|0;f=c[e>>2]|0;if((f|0)==0){g=b+16|0;a[g]=0;i=d;return}if((f&7|0)==0){h=c[220]|0;j=c[350]|0;aI[h&3](f,0,0,1,j)|0}else{j=d|0;aw(j|0,776,(f=i,i=i+24|0,c[f>>2]=488,c[f+8>>2]=2500,c[f+16>>2]=584,f)|0)|0;i=f;an(j|0,(f=i,i=i+1|0,i=i+7>>3<<3,c[f>>2]=0,f)|0)|0;i=f}c[e>>2]=0;c[b+8>>2]=0;c[b+12>>2]=0;g=b+16|0;a[g]=0;i=d;return}function a8(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;b=i;i=i+1536|0;d=b|0;e=b+512|0;f=b+1024|0;if((a|0)==0){i=b;return}g=c[a+168>>2]|0;do{if((g|0)!=0){h=c[g-4>>2]|0;j=g-8|0;if((h|0)==0){k=182}else{if((h|0)!=(~c[j>>2]|0)){k=182}}if((k|0)==182){h=d|0;aw(h|0,776,(l=i,i=i+24|0,c[l>>2]=488,c[l+8>>2]=645,c[l+16>>2]=280,l)|0)|0;i=l;an(h|0,(l=i,i=i+1|0,i=i+7>>3<<3,c[l>>2]=0,l)|0)|0;i=l;if((j|0)==0){break}}if((j&7|0)==0){h=j;j=c[220]|0;m=c[350]|0;aI[j&3](h,0,0,1,m)|0;break}else{m=d|0;aw(m|0,776,(l=i,i=i+24|0,c[l>>2]=488,c[l+8>>2]=2500,c[l+16>>2]=584,l)|0)|0;i=l;an(m|0,(l=i,i=i+1|0,i=i+7>>3<<3,c[l>>2]=0,l)|0)|0;i=l;break}}}while(0);d=c[a+176>>2]|0;do{if((d|0)!=0){g=c[d-4>>2]|0;m=d-8|0;if((g|0)==0){k=189}else{if((g|0)!=(~c[m>>2]|0)){k=189}}if((k|0)==189){g=f|0;aw(g|0,776,(l=i,i=i+24|0,c[l>>2]=488,c[l+8>>2]=645,c[l+16>>2]=280,l)|0)|0;i=l;an(g|0,(l=i,i=i+1|0,i=i+7>>3<<3,c[l>>2]=0,l)|0)|0;i=l;if((m|0)==0){break}}if((m&7|0)==0){g=m;m=c[220]|0;h=c[350]|0;aI[m&3](g,0,0,1,h)|0;break}else{h=f|0;aw(h|0,776,(l=i,i=i+24|0,c[l>>2]=488,c[l+8>>2]=2500,c[l+16>>2]=584,l)|0)|0;i=l;an(h|0,(l=i,i=i+1|0,i=i+7>>3<<3,c[l>>2]=0,l)|0)|0;i=l;break}}}while(0);if((a&7|0)==0){f=a;a=c[220]|0;k=c[350]|0;aI[a&3](f,0,0,1,k)|0;i=b;return}else{k=e|0;aw(k|0,776,(l=i,i=i+24|0,c[l>>2]=488,c[l+8>>2]=2500,c[l+16>>2]=584,l)|0)|0;i=l;an(k|0,(l=i,i=i+1|0,i=i+7>>3<<3,c[l>>2]=0,l)|0)|0;i=l;i=b;return}}function a9(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;b=i;i=i+512|0;d=b|0;e=a+8|0;f=c[e>>2]|0;if(!((f|0)!=0&f>>>0<8193)){g=d|0;aw(g|0,776,(h=i,i=i+24|0,c[h>>2]=488,c[h+8>>2]=2998,c[h+16>>2]=504,h)|0)|0;i=h;an(g|0,(h=i,i=i+1|0,i=i+7>>3<<3,c[h>>2]=0,h)|0)|0;i=h}g=a|0;c[g>>2]=f;j=a+20|0;k=c[j>>2]|0;if((k|0)==0){l=a3(180,0)|0;if((l|0)==0){m=0}else{bE(l+164|0,0,16);m=l}c[j>>2]=m;n=m;o=c[g>>2]|0}else{n=k;o=f}if((c[e>>2]|0)==0){e=d|0;aw(e|0,776,(h=i,i=i+24|0,c[h>>2]=488,c[h+8>>2]=904,c[h+16>>2]=312,h)|0)|0;i=h;an(e|0,(h=i,i=i+1|0,i=i+7>>3<<3,c[h>>2]=0,h)|0)|0;i=h;p=c[g>>2]|0}else{p=o}g=c[a+4>>2]|0;if(p>>>0>16){q=p;r=0}else{s=0;t=a4(n,o,g,s)|0;i=b;return t|0}while(1){u=r+1|0;if(q>>>0>3){q=q>>>1;r=u}else{break}}q=r+2+((u|0)!=32&1<<u>>>0<p>>>0&1)|0;s=q>>>0<11?q&255:11;t=a4(n,o,g,s)|0;i=b;return t|0}function ba(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0;f=i;i=i+3608|0;g=f|0;h=f+512|0;j=f+1024|0;k=f+1536|0;l=f+2048|0;m=f+2560|0;n=f+3072|0;o=f+3584|0;p=bb(b,14)|0;if((p|0)==0){c[e>>2]=0;q=e+4|0;r=c[q>>2]|0;if((r|0)!=0){if((r&7|0)==0){s=c[220]|0;t=c[350]|0;aI[s&3](r,0,0,1,t)|0}else{t=n|0;aw(t|0,776,(u=i,i=i+24|0,c[u>>2]=488,c[u+8>>2]=2500,c[u+16>>2]=584,u)|0)|0;i=u;an(t|0,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0)|0;i=u}c[q>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0}a[e+16|0]=0;q=e+20|0;t=c[q>>2]|0;if((t|0)==0){v=1;i=f;return v|0}a8(t);c[q>>2]=0;v=1;i=f;return v|0}q=e+4|0;t=e+8|0;r=c[t>>2]|0;if((r|0)!=(p|0)){if(r>>>0<=p>>>0){do{if((c[e+12>>2]|0)>>>0<p>>>0){if(a1(q,p,(r+1|0)==(p|0),1,0)|0){w=c[t>>2]|0;break}a[e+16|0]=1;v=0;i=f;return v|0}else{w=r}}while(0);bE((c[q>>2]|0)+w|0,0,p-w|0)}c[t>>2]=p}w=q|0;bE(c[w>>2]|0,0,p|0);q=b+20|0;r=c[q>>2]|0;if((r|0)<5){s=b+4|0;x=b+8|0;y=b+16|0;z=m|0;m=r;while(1){A=c[s>>2]|0;if((A|0)==(c[x>>2]|0)){B=0}else{c[s>>2]=A+1;B=d[A]|0}A=m+8|0;c[q>>2]=A;if((A|0)<33){C=A}else{aw(z|0,776,(u=i,i=i+24|0,c[u>>2]=488,c[u+8>>2]=3200,c[u+16>>2]=432,u)|0)|0;i=u;an(z|0,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0)|0;i=u;C=c[q>>2]|0}A=B<<32-C|c[y>>2];c[y>>2]=A;if((C|0)<5){m=C}else{D=C;E=A;break}}}else{D=r;E=c[b+16>>2]|0}r=b+16|0;C=E>>>27;c[r>>2]=E<<5;c[q>>2]=D-5;if((C|0)==0|E>>>0>2952790015){v=0;i=f;return v|0}c[o+20>>2]=0;bE(o|0,0,17);E=o+4|0;D=o+8|0;L327:do{if(a1(E,21,0,1,0)|0){m=c[D>>2]|0;y=c[E>>2]|0;bE(y+m|0,0,21-m|0);c[D>>2]=21;m=b+4|0;B=b+8|0;z=l|0;s=0;do{x=c[q>>2]|0;if((x|0)<3){A=x;while(1){F=c[m>>2]|0;if((F|0)==(c[B>>2]|0)){G=0}else{c[m>>2]=F+1;G=d[F]|0}F=A+8|0;c[q>>2]=F;if((F|0)<33){H=F}else{aw(z|0,776,(u=i,i=i+24|0,c[u>>2]=488,c[u+8>>2]=3200,c[u+16>>2]=432,u)|0)|0;i=u;an(z|0,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0)|0;i=u;H=c[q>>2]|0}F=G<<32-H|c[r>>2];c[r>>2]=F;if((H|0)<3){A=H}else{I=H;J=F;break}}}else{I=x;J=c[r>>2]|0}c[r>>2]=J<<3;c[q>>2]=I-3;a[y+(d[816+s|0]|0)|0]=J>>>29&255;s=s+1|0;}while(s>>>0<C>>>0);if(!(a9(o)|0)){K=0;break}s=n|0;y=b+4|0;z=b+8|0;m=h|0;B=g|0;A=k|0;F=j|0;L=0;L345:while(1){M=p-L|0;N=bc(b,o)|0;do{if(N>>>0<17){if((c[t>>2]|0)>>>0<=L>>>0){aw(s|0,776,(u=i,i=i+24|0,c[u>>2]=488,c[u+8>>2]=904,c[u+16>>2]=312,u)|0)|0;i=u;an(s|0,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0)|0;i=u}a[(c[w>>2]|0)+L|0]=N&255;O=L+1|0}else{if((N|0)==17){P=c[q>>2]|0;if((P|0)<3){Q=P;while(1){R=c[y>>2]|0;if((R|0)==(c[z>>2]|0)){S=0}else{c[y>>2]=R+1;S=d[R]|0}R=Q+8|0;c[q>>2]=R;if((R|0)<33){T=R}else{aw(A|0,776,(u=i,i=i+24|0,c[u>>2]=488,c[u+8>>2]=3200,c[u+16>>2]=432,u)|0)|0;i=u;an(A|0,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0)|0;i=u;T=c[q>>2]|0}R=S<<32-T|c[r>>2];c[r>>2]=R;if((T|0)<3){Q=T}else{U=T;V=R;break}}}else{U=P;V=c[r>>2]|0}c[r>>2]=V<<3;c[q>>2]=U-3;Q=(V>>>29)+3|0;if(Q>>>0>M>>>0){K=0;break L327}O=Q+L|0;break}else if((N|0)==18){Q=c[q>>2]|0;if((Q|0)<7){R=Q;while(1){W=c[y>>2]|0;if((W|0)==(c[z>>2]|0)){X=0}else{c[y>>2]=W+1;X=d[W]|0}W=R+8|0;c[q>>2]=W;if((W|0)<33){Y=W}else{aw(F|0,776,(u=i,i=i+24|0,c[u>>2]=488,c[u+8>>2]=3200,c[u+16>>2]=432,u)|0)|0;i=u;an(F|0,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0)|0;i=u;Y=c[q>>2]|0}W=X<<32-Y|c[r>>2];c[r>>2]=W;if((Y|0)<7){R=Y}else{Z=Y;_=W;break}}}else{Z=Q;_=c[r>>2]|0}c[r>>2]=_<<7;c[q>>2]=Z-7;R=(_>>>25)+11|0;if(R>>>0>M>>>0){K=0;break L327}O=R+L|0;break}else{if((N-19|0)>>>0>=2){$=305;break L345}R=c[q>>2]|0;if((N|0)==19){if((R|0)<2){P=R;while(1){W=c[y>>2]|0;if((W|0)==(c[z>>2]|0)){aa=0}else{c[y>>2]=W+1;aa=d[W]|0}W=P+8|0;c[q>>2]=W;if((W|0)<33){ab=W}else{aw(m|0,776,(u=i,i=i+24|0,c[u>>2]=488,c[u+8>>2]=3200,c[u+16>>2]=432,u)|0)|0;i=u;an(m|0,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0)|0;i=u;ab=c[q>>2]|0}W=aa<<32-ab|c[r>>2];c[r>>2]=W;if((ab|0)<2){P=ab}else{ac=ab;ad=W;break}}}else{ac=R;ad=c[r>>2]|0}c[r>>2]=ad<<2;c[q>>2]=ac-2;ae=(ad>>>30)+3|0}else{if((R|0)<6){P=R;while(1){Q=c[y>>2]|0;if((Q|0)==(c[z>>2]|0)){af=0}else{c[y>>2]=Q+1;af=d[Q]|0}Q=P+8|0;c[q>>2]=Q;if((Q|0)<33){ag=Q}else{aw(B|0,776,(u=i,i=i+24|0,c[u>>2]=488,c[u+8>>2]=3200,c[u+16>>2]=432,u)|0)|0;i=u;an(B|0,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0)|0;i=u;ag=c[q>>2]|0}Q=af<<32-ag|c[r>>2];c[r>>2]=Q;if((ag|0)<6){P=ag}else{ah=ag;ai=Q;break}}}else{ah=R;ai=c[r>>2]|0}c[r>>2]=ai<<6;c[q>>2]=ah-6;ae=(ai>>>26)+7|0}if((L|0)==0|ae>>>0>M>>>0){K=0;break L327}P=L-1|0;if((c[t>>2]|0)>>>0<=P>>>0){aw(s|0,776,(u=i,i=i+24|0,c[u>>2]=488,c[u+8>>2]=904,c[u+16>>2]=312,u)|0)|0;i=u;an(s|0,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0)|0;i=u}Q=a[(c[w>>2]|0)+P|0]|0;if(Q<<24>>24==0){K=0;break L327}P=ae+L|0;if(L>>>0<P>>>0){aj=L}else{O=L;break}while(1){if((c[t>>2]|0)>>>0<=aj>>>0){aw(s|0,776,(u=i,i=i+24|0,c[u>>2]=488,c[u+8>>2]=904,c[u+16>>2]=312,u)|0)|0;i=u;an(s|0,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0)|0;i=u}W=aj+1|0;a[(c[w>>2]|0)+aj|0]=Q;if(W>>>0<P>>>0){aj=W}else{O=P;break}}}}}while(0);if(O>>>0<p>>>0){L=O}else{break}}if(($|0)==305){aw(s|0,776,(u=i,i=i+24|0,c[u>>2]=488,c[u+8>>2]=3141,c[u+16>>2]=480,u)|0)|0;i=u;an(s|0,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0)|0;i=u;K=0;break}if((O|0)!=(p|0)){K=0;break}K=a9(e)|0}else{a[o+16|0]=1;K=0}}while(0);a7(o);v=K;i=f;return v|0}function bb(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;e=i;i=i+512|0;if((b|0)==0){f=0;i=e;return f|0}if(b>>>0<=16){f=bd(a,b)|0;i=e;return f|0}g=bd(a,b-16|0)|0;b=a+20|0;h=c[b>>2]|0;if((h|0)<16){j=a+4|0;k=a+8|0;l=a+16|0;m=e|0;n=h;while(1){o=c[j>>2]|0;if((o|0)==(c[k>>2]|0)){p=0}else{c[j>>2]=o+1;p=d[o]|0}o=n+8|0;c[b>>2]=o;if((o|0)<33){q=o}else{aw(m|0,776,(o=i,i=i+24|0,c[o>>2]=488,c[o+8>>2]=3200,c[o+16>>2]=432,o)|0)|0;i=o;an(m|0,(o=i,i=i+1|0,i=i+7>>3<<3,c[o>>2]=0,o)|0)|0;i=o;q=c[b>>2]|0}o=p<<32-q|c[l>>2];c[l>>2]=o;if((q|0)<16){n=q}else{r=q;s=o;break}}}else{r=h;s=c[a+16>>2]|0}c[a+16>>2]=s<<16;c[b>>2]=r-16;f=s>>>16|g<<16;i=e;return f|0}function bc(a,b){a=a|0;b=b|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;f=i;i=i+512|0;g=f|0;h=c[b+20>>2]|0;j=a+20|0;k=c[j>>2]|0;do{if((k|0)<24){l=a+4|0;m=c[l>>2]|0;n=c[a+8>>2]|0;o=m>>>0<n>>>0;if((k|0)>=16){if(o){c[l>>2]=m+1;p=d[m]|0}else{p=0}c[j>>2]=k+8;q=a+16|0;r=p<<24-k|c[q>>2];c[q>>2]=r;s=r;break}if(o){t=(d[m]|0)<<8;u=m+1|0}else{t=0;u=m}if(u>>>0<n>>>0){v=d[u]|0;w=u+1|0}else{v=0;w=u}c[l>>2]=w;c[j>>2]=k+16;l=a+16|0;n=(v|t)<<16-k|c[l>>2];c[l>>2]=n;s=n}else{s=c[a+16>>2]|0}}while(0);k=a+16|0;a=(s>>>16)+1|0;do{if(a>>>0>(c[h+16>>2]|0)>>>0){t=c[h+20>>2]|0;while(1){x=t-1|0;if(a>>>0>(c[h+28+(x<<2)>>2]|0)>>>0){t=t+1|0}else{break}}v=(s>>>((32-t|0)>>>0))+(c[h+96+(x<<2)>>2]|0)|0;if(v>>>0<(c[b>>2]|0)>>>0){y=t;z=e[(c[h+176>>2]|0)+(v<<1)>>1]|0;break}v=g|0;aw(v|0,776,(A=i,i=i+24|0,c[A>>2]=488,c[A+8>>2]=3267,c[A+16>>2]=480,A)|0)|0;i=A;an(v|0,(A=i,i=i+1|0,i=i+7>>3<<3,c[A>>2]=0,A)|0)|0;i=A;B=0;i=f;return B|0}else{v=c[(c[h+168>>2]|0)+(s>>>((32-(c[h+8>>2]|0)|0)>>>0)<<2)>>2]|0;if((v|0)==-1){w=g|0;aw(w|0,776,(A=i,i=i+24|0,c[A>>2]=488,c[A+8>>2]=3245,c[A+16>>2]=408,A)|0)|0;i=A;an(w|0,(A=i,i=i+1|0,i=i+7>>3<<3,c[A>>2]=0,A)|0)|0;i=A}w=v&65535;u=v>>>16;if((c[b+8>>2]|0)>>>0<=w>>>0){v=g|0;aw(v|0,776,(A=i,i=i+24|0,c[A>>2]=488,c[A+8>>2]=903,c[A+16>>2]=312,A)|0)|0;i=A;an(v|0,(A=i,i=i+1|0,i=i+7>>3<<3,c[A>>2]=0,A)|0)|0;i=A}if((d[(c[b+4>>2]|0)+w|0]|0|0)==(u|0)){y=u;z=w;break}v=g|0;aw(v|0,776,(A=i,i=i+24|0,c[A>>2]=488,c[A+8>>2]=3249,c[A+16>>2]=376,A)|0)|0;i=A;an(v|0,(A=i,i=i+1|0,i=i+7>>3<<3,c[A>>2]=0,A)|0)|0;i=A;y=u;z=w}}while(0);c[k>>2]=c[k>>2]<<y;c[j>>2]=(c[j>>2]|0)-y;B=z;i=f;return B|0}function bd(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;e=i;i=i+512|0;f=e|0;if(b>>>0>=33){g=f|0;aw(g|0,776,(h=i,i=i+24|0,c[h>>2]=488,c[h+8>>2]=3191,c[h+16>>2]=464,h)|0)|0;i=h;an(g|0,(h=i,i=i+1|0,i=i+7>>3<<3,c[h>>2]=0,h)|0)|0;i=h}g=a+20|0;j=c[g>>2]|0;if((j|0)>=(b|0)){k=j;l=c[a+16>>2]|0;m=a+16|0;n=32-b|0;o=l>>>(n>>>0);p=l<<b;c[m>>2]=p;q=k-b|0;c[g>>2]=q;i=e;return o|0}r=a+4|0;s=a+8|0;t=a+16|0;u=f|0;f=j;while(1){j=c[r>>2]|0;if((j|0)==(c[s>>2]|0)){v=0}else{c[r>>2]=j+1;v=d[j]|0}j=f+8|0;c[g>>2]=j;if((j|0)<33){w=j}else{aw(u|0,776,(h=i,i=i+24|0,c[h>>2]=488,c[h+8>>2]=3200,c[h+16>>2]=432,h)|0)|0;i=h;an(u|0,(h=i,i=i+1|0,i=i+7>>3<<3,c[h>>2]=0,h)|0)|0;i=h;w=c[g>>2]|0}j=v<<32-w|c[t>>2];c[t>>2]=j;if((w|0)<(b|0)){f=w}else{k=w;l=j;break}}m=a+16|0;n=32-b|0;o=l>>>(n>>>0);p=l<<b;c[m>>2]=p;q=k-b|0;c[g>>2]=q;i=e;return o|0}function be(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;e=i;i=i+512|0;f=e|0;if((a|0)==0|b>>>0<62){g=0;i=e;return g|0}h=a3(300,0)|0;if((h|0)==0){g=0;i=e;return g|0}j=h;c[h>>2]=519686845;k=h+4|0;c[k>>2]=0;l=h+8|0;c[l>>2]=0;m=h+88|0;bE(m|0,0,45);bE(h+252|0,0,13);bE(h+268|0,0,13);bE(h+284|0,0,13);bE(h+136|0,0,21);bE(h+160|0,0,21);bE(h+184|0,0,21);bE(h+208|0,0,21);bE(h+232|0,0,17);do{if(b>>>0<74){n=378}else{if(((d[a]|0)<<8|(d[a+1|0]|0)|0)!=18552){n=378;break}if(((d[a+2|0]|0)<<8|(d[a+3|0]|0))>>>0<74){n=378;break}o=((d[a+7|0]|0)<<16|(d[a+6|0]|0)<<24|(d[a+8|0]|0)<<8|(d[a+9|0]|0))>>>0>b>>>0?0:a;p=m;c[p>>2]=o;if((o|0)==0){break}c[k>>2]=a;c[l>>2]=b;if(!(bs(j)|0)){break}o=c[p>>2]|0;if(((d[o+39|0]|0)<<8|(d[o+40|0]|0)|0)==0){q=o}else{if(!(bt(j)|0)){break}if(!(bu(j)|0)){break}q=c[p>>2]|0}if(((d[q+55|0]|0)<<8|(d[q+56|0]|0)|0)==0){g=h;i=e;return g|0}if(!(bv(j)|0)){break}p=bw(j)|0;if(p){g=p?h:0}else{break}i=e;return g|0}}while(0);if((n|0)==378){c[m>>2]=0}bn(j);if((h&7|0)==0){j=c[220]|0;m=c[350]|0;aI[j&3](h,0,0,1,m)|0;g=0;i=e;return g|0}else{m=f|0;aw(m|0,776,(f=i,i=i+24|0,c[f>>2]=488,c[f+8>>2]=2500,c[f+16>>2]=584,f)|0)|0;i=f;an(m|0,(f=i,i=i+1|0,i=i+7>>3<<3,c[f>>2]=0,f)|0)|0;i=f;g=0;i=e;return g|0}return 0}function bf(a,b,e,f,g){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;h=i;i=i+512|0;j=c[a+88>>2]|0;k=(d[j+70+(g<<2)+1|0]|0)<<16|(d[j+70+(g<<2)|0]|0)<<24|(d[j+70+(g<<2)+2|0]|0)<<8|(d[j+70+(g<<2)+3|0]|0);l=g+1|0;if(l>>>0<(d[j+16|0]|0)>>>0){m=(d[j+70+(l<<2)+1|0]|0)<<16|(d[j+70+(l<<2)|0]|0)<<24|(d[j+70+(l<<2)+2|0]|0)<<8|(d[j+70+(l<<2)+3|0]|0)}else{m=c[a+8>>2]|0}if(m>>>0>k>>>0){n=a+4|0;o=c[n>>2]|0;p=o+k|0;q=m-k|0;r=bg(a,p,q,b,e,f,g)|0;i=h;return r|0}l=h|0;aw(l|0,776,(j=i,i=i+24|0,c[j>>2]=488,c[j+8>>2]=3705,c[j+16>>2]=248,j)|0)|0;i=j;an(l|0,(j=i,i=i+1|0,i=i+7>>3<<3,c[j>>2]=0,j)|0)|0;i=j;n=a+4|0;o=c[n>>2]|0;p=o+k|0;q=m-k|0;r=bg(a,p,q,b,e,f,g)|0;i=h;return r|0}function bg(b,e,f,g,h,i,j){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0;k=c[b+88>>2]|0;l=((d[k+12|0]|0)<<8|(d[k+13|0]|0))>>>(j>>>0);m=((d[k+14|0]|0)<<8|(d[k+15|0]|0))>>>(j>>>0);j=l>>>0>1?(l+3|0)>>>2:1;l=m>>>0>1?(m+3|0)>>>2:1;m=k+18|0;k=a[m]|0;if(k<<24>>24==0){n=8}else{n=k<<24>>24==9?8:16}k=Z(n,j)|0;do{if((i|0)==0){o=k}else{if(k>>>0<=i>>>0&(i&3|0)==0){o=i;break}else{p=0}return p|0}}while(0);if((Z(o,l)|0)>>>0>h>>>0){p=0;return p|0}h=(j+1|0)>>>1;i=(l+1|0)>>>1;if((f|0)==0){p=0;return p|0}c[b+92>>2]=e;c[b+96>>2]=e;c[b+104>>2]=f;c[b+100>>2]=e+f;c[b+108>>2]=0;c[b+112>>2]=0;switch(d[m]|0|0){case 7:case 8:{br(b,g,0,o,j,l,h,i)|0;p=1;return p|0};case 9:{bq(b,g,0,o,j,l,h,i)|0;p=1;return p|0};case 0:{bo(b,g,0,o,j,l,h,i)|0;p=1;return p|0};case 2:case 3:case 5:case 6:case 4:{bp(b,g,0,o,j,l,h,i)|0;p=1;return p|0};default:{p=0;return p|0}}return 0}function bh(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;i=i+40|0;e=d|0;c[e>>2]=40;a6(a,b,e)|0;i=d;return c[e+4>>2]|0}function bi(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;i=i+40|0;e=d|0;c[e>>2]=40;a6(a,b,e)|0;i=d;return c[e+8>>2]|0}function bj(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;i=i+40|0;e=d|0;c[e>>2]=40;a6(a,b,e)|0;i=d;return c[e+12>>2]|0}function bk(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;i=i+40|0;e=d|0;c[e>>2]=40;a6(a,b,e)|0;i=d;return c[e+32>>2]|0}function bl(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;e=i;i=i+552|0;f=e|0;g=e+512|0;c[g>>2]=40;a6(a,b,g)|0;b=(((c[g+4>>2]|0)>>>(d>>>0))+3|0)>>>2;a=(((c[g+8>>2]|0)>>>(d>>>0))+3|0)>>>2;d=g+32|0;g=c[d>>2]|0;h=c[d+4>>2]|0;d=9;j=0;k=0;l=0;if((g|0)==1&(h|0)==0|(g|0)==2&(h|0)==0|(g|0)==7&(h|0)==0|(g|0)==8&(h|0)==0|(g|0)==3&(h|0)==0|(g|0)==4&(h|0)==0|(g|0)==5&(h|0)==0|(g|0)==6&(h|0)==0){m=16;n=Z(a,b)|0;o=Z(n,m)|0;i=e;return o|0}else if((g|0)==(k|0)&(h|0)==(l|0)|(g|0)==(d|0)&(h|0)==(j|0)){m=8;n=Z(a,b)|0;o=Z(n,m)|0;i=e;return o|0}else{j=f|0;aw(j|0,776,(f=i,i=i+24|0,c[f>>2]=488,c[f+8>>2]=2664,c[f+16>>2]=576,f)|0)|0;i=f;an(j|0,(f=i,i=i+1|0,i=i+7>>3<<3,c[f>>2]=0,f)|0)|0;i=f;m=0;n=Z(a,b)|0;o=Z(n,m)|0;i=e;return o|0}return 0}function bm(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;g=i;i=i+560|0;h=g|0;j=g+512|0;k=g+552|0;c[j>>2]=40;a6(a,b,j)|0;l=(((c[j+4>>2]|0)>>>(f>>>0))+3|0)>>>2;m=j+32|0;j=c[m>>2]|0;n=c[m+4>>2]|0;m=9;o=0;p=0;q=0;if((j|0)==1&(n|0)==0|(j|0)==2&(n|0)==0|(j|0)==7&(n|0)==0|(j|0)==8&(n|0)==0|(j|0)==3&(n|0)==0|(j|0)==4&(n|0)==0|(j|0)==5&(n|0)==0|(j|0)==6&(n|0)==0){r=16}else if((j|0)==(p|0)&(n|0)==(q|0)|(j|0)==(m|0)&(n|0)==(o|0)){r=8}else{o=h|0;aw(o|0,776,(s=i,i=i+24|0,c[s>>2]=488,c[s+8>>2]=2664,c[s+16>>2]=576,s)|0)|0;i=s;an(o|0,(s=i,i=i+1|0,i=i+7>>3<<3,c[s>>2]=0,s)|0)|0;i=s;r=0}o=Z(r,l)|0;l=be(a,b)|0;b=k|0;c[b>>2]=d;d=(l|0)==0;do{if(!(d|e>>>0<8|f>>>0>15)){if((c[l>>2]|0)!=519686845){break}k=l;bf(k,b,e,o,f)|0}}while(0);if(d){i=g;return}if((c[l>>2]|0)!=519686845){i=g;return}bn(l);if((l&7|0)==0){d=c[220]|0;f=c[350]|0;aI[d&3](l,0,0,1,f)|0;i=g;return}else{f=h|0;aw(f|0,776,(s=i,i=i+24|0,c[s>>2]=488,c[s+8>>2]=2500,c[s+16>>2]=584,s)|0)|0;i=s;an(f|0,(s=i,i=i+1|0,i=i+7>>3<<3,c[s>>2]=0,s)|0)|0;i=s;i=g;return}}function bn(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;i=i+512|0;e=d|0;c[b>>2]=0;f=b+284|0;g=c[f>>2]|0;if((g|0)!=0){if((g&7|0)==0){h=g;g=c[220]|0;j=c[350]|0;aI[g&3](h,0,0,1,j)|0}else{j=e|0;aw(j|0,776,(k=i,i=i+24|0,c[k>>2]=488,c[k+8>>2]=2500,c[k+16>>2]=584,k)|0)|0;i=k;an(j|0,(k=i,i=i+1|0,i=i+7>>3<<3,c[k>>2]=0,k)|0)|0;i=k}c[f>>2]=0;c[b+288>>2]=0;c[b+292>>2]=0}a[b+296|0]=0;f=b+268|0;j=c[f>>2]|0;if((j|0)!=0){if((j&7|0)==0){h=j;j=c[220]|0;g=c[350]|0;aI[j&3](h,0,0,1,g)|0}else{g=e|0;aw(g|0,776,(k=i,i=i+24|0,c[k>>2]=488,c[k+8>>2]=2500,c[k+16>>2]=584,k)|0)|0;i=k;an(g|0,(k=i,i=i+1|0,i=i+7>>3<<3,c[k>>2]=0,k)|0)|0;i=k}c[f>>2]=0;c[b+272>>2]=0;c[b+276>>2]=0}a[b+280|0]=0;f=b+252|0;g=c[f>>2]|0;if((g|0)!=0){if((g&7|0)==0){h=g;g=c[220]|0;j=c[350]|0;aI[g&3](h,0,0,1,j)|0}else{j=e|0;aw(j|0,776,(k=i,i=i+24|0,c[k>>2]=488,c[k+8>>2]=2500,c[k+16>>2]=584,k)|0)|0;i=k;an(j|0,(k=i,i=i+1|0,i=i+7>>3<<3,c[k>>2]=0,k)|0)|0;i=k}c[f>>2]=0;c[b+256>>2]=0;c[b+260>>2]=0}a[b+264|0]=0;f=b+236|0;j=c[f>>2]|0;if((j|0)!=0){if((j&7|0)==0){h=j;j=c[220]|0;g=c[350]|0;aI[j&3](h,0,0,1,g)|0}else{g=e|0;aw(g|0,776,(k=i,i=i+24|0,c[k>>2]=488,c[k+8>>2]=2500,c[k+16>>2]=584,k)|0)|0;i=k;an(g|0,(k=i,i=i+1|0,i=i+7>>3<<3,c[k>>2]=0,k)|0)|0;i=k}c[f>>2]=0;c[b+240>>2]=0;c[b+244>>2]=0}a[b+248|0]=0;a7(b+212|0);a7(b+188|0);a7(b+164|0);a7(b+140|0);a7(b+116|0);i=d;return}function bo(b,e,f,g,h,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0;f=i;i=i+528|0;m=f+512|0;n=b+240|0;o=c[n>>2]|0;p=b+256|0;q=c[p>>2]|0;r=a[(c[b+88>>2]|0)+17|0]|0;s=r&255;t=g>>>2;if(r<<24>>24==0){i=f;return 1}r=(l|0)==0;u=l-1|0;v=(j&1|0)!=0;j=g<<1;w=b+92|0;x=b+116|0;y=b+140|0;z=b+236|0;A=f|0;B=h&1;h=b+188|0;C=b+252|0;b=t+1|0;D=t+2|0;E=t+3|0;F=k-1|0;G=F<<4;H=0;I=0;J=0;K=1;while(1){if(r){L=H;M=I;N=K}else{O=H;P=I;Q=0;R=c[e+(J<<2)>>2]|0;S=K;while(1){if((Q&1|0)==0){T=0;U=k;V=1;W=16;X=R}else{T=F;U=-1;V=-1;W=-16;X=R+G|0}Y=(Q|0)==(u|0);_=Y&v;if((T|0)==(U|0)){$=O;aa=P;ab=S}else{ac=Y&v^1;Y=O;ad=P;ae=T;af=X;ag=S;while(1){if((ag|0)==1){ah=bc(w,x)|0|512}else{ah=ag}ai=ah&7;aj=ah>>>3;ak=d[840+ai|0]|0;al=Y;am=0;do{ao=(bc(w,y)|0)+al|0;ap=ao-o|0;aq=ap>>31;al=aq&ao|ap&~aq;if((c[n>>2]|0)>>>0<=al>>>0){aw(A|0,776,(ar=i,i=i+24|0,c[ar>>2]=488,c[ar+8>>2]=904,c[ar+16>>2]=312,ar)|0)|0;i=ar;an(A|0,(ar=i,i=i+1|0,i=i+7>>3<<3,c[ar>>2]=0,ar)|0)|0;i=ar}c[m+(am<<2)>>2]=c[(c[z>>2]|0)+(al<<2)>>2];am=am+1|0;}while(am>>>0<ak>>>0);ak=(ae|0)==(F|0)&(B|0)!=0;am=af;if(_|ak){aq=ad;ap=0;while(1){ao=Z(ap,g)|0;as=af+ao|0;at=(ap|0)==0|ac;au=ap<<1;av=(bc(w,h)|0)+aq|0;ax=av-q|0;ay=ax>>31;az=ay&av|ax&~ay;do{if(ak){if(!at){ay=(bc(w,h)|0)+az|0;ax=ay-q|0;av=ax>>31;aA=av&ay|ax&~av;break}c[as>>2]=c[m+((d[848+(ai<<2)+au|0]|0)<<2)>>2];if((c[p>>2]|0)>>>0<=az>>>0){aw(A|0,776,(ar=i,i=i+24|0,c[ar>>2]=488,c[ar+8>>2]=904,c[ar+16>>2]=312,ar)|0)|0;i=ar;an(A|0,(ar=i,i=i+1|0,i=i+7>>3<<3,c[ar>>2]=0,ar)|0)|0;i=ar}c[af+(ao+4)>>2]=c[(c[C>>2]|0)+(az<<2)>>2];av=(bc(w,h)|0)+az|0;ax=av-q|0;ay=ax>>31;aA=ay&av|ax&~ay}else{if(!at){ay=(bc(w,h)|0)+az|0;ax=ay-q|0;av=ax>>31;aA=av&ay|ax&~av;break}c[as>>2]=c[m+((d[848+(ai<<2)+au|0]|0)<<2)>>2];if((c[p>>2]|0)>>>0<=az>>>0){aw(A|0,776,(ar=i,i=i+24|0,c[ar>>2]=488,c[ar+8>>2]=904,c[ar+16>>2]=312,ar)|0)|0;i=ar;an(A|0,(ar=i,i=i+1|0,i=i+7>>3<<3,c[ar>>2]=0,ar)|0)|0;i=ar}c[af+(ao+4)>>2]=c[(c[C>>2]|0)+(az<<2)>>2];av=(bc(w,h)|0)+az|0;ax=av-q|0;ay=ax>>31;aB=ay&av|ax&~ay;c[af+(ao+8)>>2]=c[m+((d[(au|1)+(848+(ai<<2))|0]|0)<<2)>>2];if((c[p>>2]|0)>>>0<=aB>>>0){aw(A|0,776,(ar=i,i=i+24|0,c[ar>>2]=488,c[ar+8>>2]=904,c[ar+16>>2]=312,ar)|0)|0;i=ar;an(A|0,(ar=i,i=i+1|0,i=i+7>>3<<3,c[ar>>2]=0,ar)|0)|0;i=ar}c[af+(ao+12)>>2]=c[(c[C>>2]|0)+(aB<<2)>>2];aA=aB}}while(0);ao=ap+1|0;if(ao>>>0<2){aq=aA;ap=ao}else{aC=aA;break}}}else{c[am>>2]=c[m+((d[848+(ai<<2)|0]|0)<<2)>>2];ap=(bc(w,h)|0)+ad|0;aq=ap-q|0;ak=aq>>31;ao=ak&ap|aq&~ak;if((c[p>>2]|0)>>>0<=ao>>>0){aw(A|0,776,(ar=i,i=i+24|0,c[ar>>2]=488,c[ar+8>>2]=904,c[ar+16>>2]=312,ar)|0)|0;i=ar;an(A|0,(ar=i,i=i+1|0,i=i+7>>3<<3,c[ar>>2]=0,ar)|0)|0;i=ar}c[af+4>>2]=c[(c[C>>2]|0)+(ao<<2)>>2];c[af+8>>2]=c[m+((d[849+(ai<<2)|0]|0)<<2)>>2];ak=(bc(w,h)|0)+ao|0;ao=ak-q|0;aq=ao>>31;ap=aq&ak|ao&~aq;if((c[p>>2]|0)>>>0<=ap>>>0){aw(A|0,776,(ar=i,i=i+24|0,c[ar>>2]=488,c[ar+8>>2]=904,c[ar+16>>2]=312,ar)|0)|0;i=ar;an(A|0,(ar=i,i=i+1|0,i=i+7>>3<<3,c[ar>>2]=0,ar)|0)|0;i=ar}c[af+12>>2]=c[(c[C>>2]|0)+(ap<<2)>>2];c[am+(t<<2)>>2]=c[m+((d[850+(ai<<2)|0]|0)<<2)>>2];aq=(bc(w,h)|0)+ap|0;ap=aq-q|0;ao=ap>>31;ak=ao&aq|ap&~ao;if((c[p>>2]|0)>>>0<=ak>>>0){aw(A|0,776,(ar=i,i=i+24|0,c[ar>>2]=488,c[ar+8>>2]=904,c[ar+16>>2]=312,ar)|0)|0;i=ar;an(A|0,(ar=i,i=i+1|0,i=i+7>>3<<3,c[ar>>2]=0,ar)|0)|0;i=ar}c[am+(b<<2)>>2]=c[(c[C>>2]|0)+(ak<<2)>>2];c[am+(D<<2)>>2]=c[m+((d[851+(ai<<2)|0]|0)<<2)>>2];ao=(bc(w,h)|0)+ak|0;ak=ao-q|0;ap=ak>>31;aq=ap&ao|ak&~ap;if((c[p>>2]|0)>>>0<=aq>>>0){aw(A|0,776,(ar=i,i=i+24|0,c[ar>>2]=488,c[ar+8>>2]=904,c[ar+16>>2]=312,ar)|0)|0;i=ar;an(A|0,(ar=i,i=i+1|0,i=i+7>>3<<3,c[ar>>2]=0,ar)|0)|0;i=ar}c[am+(E<<2)>>2]=c[(c[C>>2]|0)+(aq<<2)>>2];aC=aq}aq=ae+V|0;if((aq|0)==(U|0)){$=al;aa=aC;ab=aj;break}else{Y=al;ad=aC;ae=aq;af=af+W|0;ag=aj}}}ag=Q+1|0;if(ag>>>0<l>>>0){O=$;P=aa;Q=ag;R=R+j|0;S=ab}else{L=$;M=aa;N=ab;break}}}S=J+1|0;if(S>>>0<s>>>0){H=L;I=M;J=S;K=N}else{break}}i=f;return 1}function bp(b,f,g,h,j,k,l,m){b=b|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0;g=i;i=i+544|0;n=g+512|0;o=g+528|0;p=b+240|0;q=c[p>>2]|0;r=b+256|0;s=c[r>>2]|0;t=b+272|0;u=c[t>>2]|0;v=c[b+88>>2]|0;w=(d[v+63|0]|0)<<8|(d[v+64|0]|0);x=a[v+17|0]|0;v=x&255;if(x<<24>>24==0){i=g;return 1}x=(m|0)==0;y=m-1|0;z=(k&1|0)==0;k=h<<1;A=b+92|0;B=b+116|0;C=(j&1|0)==0;j=b+212|0;D=b+188|0;E=b+288|0;F=b+284|0;G=b+252|0;H=g|0;I=b+140|0;J=b+236|0;K=b+164|0;L=b+268|0;b=l-1|0;M=b<<5;N=0;O=0;P=0;Q=0;R=0;S=1;while(1){if(x){T=N;U=O;V=P;W=Q;X=S}else{Y=N;Z=O;_=P;$=Q;aa=0;ab=c[f+(R<<2)>>2]|0;ac=S;while(1){if((aa&1|0)==0){ad=0;ae=l;af=1;ag=32;ah=ab}else{ad=b;ae=-1;af=-1;ag=-32;ah=ab+M|0}ai=z|(aa|0)!=(y|0);if((ad|0)==(ae|0)){aj=Y;ak=Z;al=_;am=$;ao=ac}else{ap=Y;aq=Z;ar=_;as=$;at=ad;au=ah;av=ac;while(1){if((av|0)==1){ax=bc(A,B)|0|512}else{ax=av}ay=ax&7;az=ax>>>3;aA=d[840+ay|0]|0;aB=C|(at|0)!=(b|0);aC=ar;aD=0;while(1){aE=(bc(A,K)|0)+aC|0;aF=aE-u|0;aG=aF>>31;aH=aG&aE|aF&~aG;if((c[t>>2]|0)>>>0<=aH>>>0){aw(H|0,776,(aI=i,i=i+24|0,c[aI>>2]=488,c[aI+8>>2]=904,c[aI+16>>2]=312,aI)|0)|0;i=aI;an(H|0,(aI=i,i=i+1|0,i=i+7>>3<<3,c[aI>>2]=0,aI)|0)|0;i=aI}c[o+(aD<<2)>>2]=e[(c[L>>2]|0)+(aH<<1)>>1]|0;aG=aD+1|0;if(aG>>>0<aA>>>0){aC=aH;aD=aG}else{aJ=ap;aK=0;break}}while(1){aD=(bc(A,I)|0)+aJ|0;aC=aD-q|0;aG=aC>>31;aL=aG&aD|aC&~aG;if((c[p>>2]|0)>>>0<=aL>>>0){aw(H|0,776,(aI=i,i=i+24|0,c[aI>>2]=488,c[aI+8>>2]=904,c[aI+16>>2]=312,aI)|0)|0;i=aI;an(H|0,(aI=i,i=i+1|0,i=i+7>>3<<3,c[aI>>2]=0,aI)|0)|0;i=aI}c[n+(aK<<2)>>2]=c[(c[J>>2]|0)+(aL<<2)>>2];aG=aK+1|0;if(aG>>>0<aA>>>0){aJ=aL;aK=aG}else{aM=aq;aN=as;aO=au;aP=0;break}}while(1){aA=(aP|0)==0|ai;aG=aP<<1;aC=aM;aD=aN;aF=aO;aE=0;while(1){aQ=(bc(A,j)|0)+aD|0;aR=aQ-w|0;aS=aR>>31;aT=aS&aQ|aR&~aS;aS=(bc(A,D)|0)+aC|0;aR=aS-s|0;aQ=aR>>31;aU=aQ&aS|aR&~aQ;if(((aE|0)==0|aB)&aA){aQ=d[aE+aG+(848+(ay<<2))|0]|0;aR=aT*3|0;if((c[E>>2]|0)>>>0<=aR>>>0){aw(H|0,776,(aI=i,i=i+24|0,c[aI>>2]=488,c[aI+8>>2]=904,c[aI+16>>2]=312,aI)|0)|0;i=aI;an(H|0,(aI=i,i=i+1|0,i=i+7>>3<<3,c[aI>>2]=0,aI)|0)|0;i=aI}aS=c[F>>2]|0;c[aF>>2]=(e[aS+(aR<<1)>>1]|0)<<16|c[o+(aQ<<2)>>2];c[aF+4>>2]=(e[aS+(aR+2<<1)>>1]|0)<<16|(e[aS+(aR+1<<1)>>1]|0);c[aF+8>>2]=c[n+(aQ<<2)>>2];if((c[r>>2]|0)>>>0<=aU>>>0){aw(H|0,776,(aI=i,i=i+24|0,c[aI>>2]=488,c[aI+8>>2]=904,c[aI+16>>2]=312,aI)|0)|0;i=aI;an(H|0,(aI=i,i=i+1|0,i=i+7>>3<<3,c[aI>>2]=0,aI)|0)|0;i=aI}c[aF+12>>2]=c[(c[G>>2]|0)+(aU<<2)>>2]}aQ=aE+1|0;if(aQ>>>0<2){aC=aU;aD=aT;aF=aF+16|0;aE=aQ}else{break}}aE=aP+1|0;if(aE>>>0<2){aM=aU;aN=aT;aO=aO+h|0;aP=aE}else{break}}ay=at+af|0;if((ay|0)==(ae|0)){aj=aL;ak=aU;al=aH;am=aT;ao=az;break}else{ap=aL;aq=aU;ar=aH;as=aT;at=ay;au=au+ag|0;av=az}}}av=aa+1|0;if(av>>>0<m>>>0){Y=aj;Z=ak;_=al;$=am;aa=av;ab=ab+k|0;ac=ao}else{T=aj;U=ak;V=al;W=am;X=ao;break}}}ac=R+1|0;if(ac>>>0<v>>>0){N=T;O=U;P=V;Q=W;R=ac;S=X}else{break}}i=g;return 1}function bq(b,f,g,h,j,k,l,m){b=b|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,ao=0,ap=0,aq=0,ar=0,as=0;g=i;i=i+528|0;n=g+512|0;o=b+272|0;p=c[o>>2]|0;q=c[b+88>>2]|0;r=(d[q+63|0]|0)<<8|(d[q+64|0]|0);s=a[q+17|0]|0;q=s&255;if(s<<24>>24==0){i=g;return 1}s=(m|0)==0;t=m-1|0;u=(k&1|0)==0;k=h<<1;v=b+92|0;w=b+116|0;x=j&1;j=b+212|0;y=b+288|0;z=b+284|0;A=g|0;B=b+164|0;C=b+268|0;b=l-1|0;D=b<<4;E=0;F=0;G=0;H=1;while(1){if(s){I=E;J=F;K=H}else{L=E;M=F;N=0;O=c[f+(G<<2)>>2]|0;P=H;while(1){if((N&1|0)==0){Q=0;R=l;S=1;T=16;U=O}else{Q=b;R=-1;S=-1;T=-16;U=O+D|0}V=u|(N|0)!=(t|0);if((Q|0)==(R|0)){W=L;X=M;Y=P}else{Z=L;_=M;$=U;aa=Q;ab=P;while(1){if((ab|0)==1){ac=bc(v,w)|0|512}else{ac=ab}ad=ac&7;ae=ac>>>3;af=d[840+ad|0]|0;ag=Z;ah=0;while(1){ai=(bc(v,B)|0)+ag|0;aj=ai-p|0;ak=aj>>31;al=ak&ai|aj&~ak;if((c[o>>2]|0)>>>0<=al>>>0){aw(A|0,776,(am=i,i=i+24|0,c[am>>2]=488,c[am+8>>2]=904,c[am+16>>2]=312,am)|0)|0;i=am;an(A|0,(am=i,i=i+1|0,i=i+7>>3<<3,c[am>>2]=0,am)|0)|0;i=am}c[n+(ah<<2)>>2]=e[(c[C>>2]|0)+(al<<1)>>1]|0;ak=ah+1|0;if(ak>>>0<af>>>0){ag=al;ah=ak}else{ao=_;ap=$;aq=0;break}}while(1){ah=ap;ag=(aq|0)==0|V;af=aq<<1;ak=(bc(v,j)|0)+ao|0;aj=ak-r|0;ai=aj>>31;ar=ai&ak|aj&~ai;if(ag){ai=d[848+(ad<<2)+af|0]|0;aj=ar*3|0;if((c[y>>2]|0)>>>0<=aj>>>0){aw(A|0,776,(am=i,i=i+24|0,c[am>>2]=488,c[am+8>>2]=904,c[am+16>>2]=312,am)|0)|0;i=am;an(A|0,(am=i,i=i+1|0,i=i+7>>3<<3,c[am>>2]=0,am)|0)|0;i=am}ak=c[z>>2]|0;c[ah>>2]=(e[ak+(aj<<1)>>1]|0)<<16|c[n+(ai<<2)>>2];c[ap+4>>2]=(e[ak+(aj+2<<1)>>1]|0)<<16|(e[ak+(aj+1<<1)>>1]|0)}aj=ap+8|0;ak=(bc(v,j)|0)+ar|0;ar=ak-r|0;ai=ar>>31;as=ai&ak|ar&~ai;if(!((aa|0)==(b|0)&(x|0)!=0|ag^1)){ag=d[(af|1)+(848+(ad<<2))|0]|0;af=as*3|0;if((c[y>>2]|0)>>>0<=af>>>0){aw(A|0,776,(am=i,i=i+24|0,c[am>>2]=488,c[am+8>>2]=904,c[am+16>>2]=312,am)|0)|0;i=am;an(A|0,(am=i,i=i+1|0,i=i+7>>3<<3,c[am>>2]=0,am)|0)|0;i=am}ai=c[z>>2]|0;c[aj>>2]=(e[ai+(af<<1)>>1]|0)<<16|c[n+(ag<<2)>>2];c[ap+12>>2]=(e[ai+(af+2<<1)>>1]|0)<<16|(e[ai+(af+1<<1)>>1]|0)}af=aq+1|0;if(af>>>0<2){ao=as;ap=ap+h|0;aq=af}else{break}}ad=aa+S|0;if((ad|0)==(R|0)){W=al;X=as;Y=ae;break}else{Z=al;_=as;$=$+T|0;aa=ad;ab=ae}}}ab=N+1|0;if(ab>>>0<m>>>0){L=W;M=X;N=ab;O=O+k|0;P=Y}else{I=W;J=X;K=Y;break}}}P=G+1|0;if(P>>>0<q>>>0){E=I;F=J;G=P;H=K}else{break}}i=g;return 1}function br(b,f,g,h,j,k,l,m){b=b|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0;g=i;i=i+544|0;n=g+512|0;o=g+528|0;p=b+272|0;q=c[p>>2]|0;r=c[b+88>>2]|0;s=(d[r+63|0]|0)<<8|(d[r+64|0]|0);t=a[r+17|0]|0;r=t&255;if(t<<24>>24==0){i=g;return 1}t=(m|0)==0;u=m-1|0;v=(k&1|0)==0;k=h<<1;w=b+92|0;x=b+116|0;y=(j&1|0)==0;j=b+212|0;z=b+288|0;A=b+284|0;B=g|0;C=b+164|0;D=b+268|0;b=l-1|0;E=b<<5;F=0;G=0;H=0;I=0;J=0;K=1;while(1){if(t){L=F;M=G;N=H;O=I;P=K}else{Q=F;R=G;S=H;T=I;U=0;V=c[f+(J<<2)>>2]|0;W=K;while(1){if((U&1|0)==0){X=0;Y=l;Z=1;_=32;$=V}else{X=b;Y=-1;Z=-1;_=-32;$=V+E|0}aa=v|(U|0)!=(u|0);if((X|0)==(Y|0)){ab=Q;ac=R;ad=S;ae=T;af=W}else{ag=Q;ah=R;ai=S;aj=T;ak=X;al=$;am=W;while(1){if((am|0)==1){ao=bc(w,x)|0|512}else{ao=am}ap=ao&7;aq=ao>>>3;ar=d[840+ap|0]|0;as=y|(ak|0)!=(b|0);at=ag;au=0;while(1){av=(bc(w,C)|0)+at|0;ax=av-q|0;ay=ax>>31;az=ay&av|ax&~ay;if((c[p>>2]|0)>>>0<=az>>>0){aw(B|0,776,(aA=i,i=i+24|0,c[aA>>2]=488,c[aA+8>>2]=904,c[aA+16>>2]=312,aA)|0)|0;i=aA;an(B|0,(aA=i,i=i+1|0,i=i+7>>3<<3,c[aA>>2]=0,aA)|0)|0;i=aA}c[n+(au<<2)>>2]=e[(c[D>>2]|0)+(az<<1)>>1]|0;ay=au+1|0;if(ay>>>0<ar>>>0){at=az;au=ay}else{aB=ai;aC=0;break}}while(1){au=(bc(w,C)|0)+aB|0;at=au-q|0;ay=at>>31;aD=ay&au|at&~ay;if((c[p>>2]|0)>>>0<=aD>>>0){aw(B|0,776,(aA=i,i=i+24|0,c[aA>>2]=488,c[aA+8>>2]=904,c[aA+16>>2]=312,aA)|0)|0;i=aA;an(B|0,(aA=i,i=i+1|0,i=i+7>>3<<3,c[aA>>2]=0,aA)|0)|0;i=aA}c[o+(aC<<2)>>2]=e[(c[D>>2]|0)+(aD<<1)>>1]|0;ay=aC+1|0;if(ay>>>0<ar>>>0){aB=aD;aC=ay}else{aE=ah;aF=aj;aG=al;aH=0;break}}while(1){ar=(aH|0)==0|aa;ay=aH<<1;at=aE;au=aF;ax=aG;av=0;while(1){aI=(bc(w,j)|0)+at|0;aJ=aI-s|0;aK=aJ>>31;aL=aK&aI|aJ&~aK;aK=(bc(w,j)|0)+au|0;aJ=aK-s|0;aI=aJ>>31;aM=aI&aK|aJ&~aI;if(((av|0)==0|as)&ar){aI=d[av+ay+(848+(ap<<2))|0]|0;aJ=aL*3|0;aK=c[z>>2]|0;if(aK>>>0>aJ>>>0){aN=aK}else{aw(B|0,776,(aA=i,i=i+24|0,c[aA>>2]=488,c[aA+8>>2]=904,c[aA+16>>2]=312,aA)|0)|0;i=aA;an(B|0,(aA=i,i=i+1|0,i=i+7>>3<<3,c[aA>>2]=0,aA)|0)|0;i=aA;aN=c[z>>2]|0}aK=c[A>>2]|0;aO=aM*3|0;if(aN>>>0>aO>>>0){aP=aK}else{aw(B|0,776,(aA=i,i=i+24|0,c[aA>>2]=488,c[aA+8>>2]=904,c[aA+16>>2]=312,aA)|0)|0;i=aA;an(B|0,(aA=i,i=i+1|0,i=i+7>>3<<3,c[aA>>2]=0,aA)|0)|0;i=aA;aP=c[A>>2]|0}c[ax>>2]=(e[aK+(aJ<<1)>>1]|0)<<16|c[n+(aI<<2)>>2];c[ax+4>>2]=(e[aK+(aJ+2<<1)>>1]|0)<<16|(e[aK+(aJ+1<<1)>>1]|0);c[ax+8>>2]=(e[aP+(aO<<1)>>1]|0)<<16|c[o+(aI<<2)>>2];c[ax+12>>2]=(e[aP+(aO+2<<1)>>1]|0)<<16|(e[aP+(aO+1<<1)>>1]|0)}aO=av+1|0;if(aO>>>0<2){at=aL;au=aM;ax=ax+16|0;av=aO}else{break}}av=aH+1|0;if(av>>>0<2){aE=aL;aF=aM;aG=aG+h|0;aH=av}else{break}}ap=ak+Z|0;if((ap|0)==(Y|0)){ab=az;ac=aL;ad=aD;ae=aM;af=aq;break}else{ag=az;ah=aL;ai=aD;aj=aM;ak=ap;al=al+_|0;am=aq}}}am=U+1|0;if(am>>>0<m>>>0){Q=ab;R=ac;S=ad;T=ae;U=am;V=V+k|0;W=af}else{L=ab;M=ac;N=ad;O=ae;P=af;break}}}W=J+1|0;if(W>>>0<r>>>0){F=L;G=M;H=N;I=O;J=W;K=P}else{break}}i=g;return 1}function bs(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;b=a+92|0;e=c[a+4>>2]|0;f=a+88|0;g=c[f>>2]|0;h=(d[g+68|0]|0)<<8|(d[g+67|0]|0)<<16|(d[g+69|0]|0);i=e+h|0;j=(d[g+65|0]|0)<<8|(d[g+66|0]|0);if((j|0)==0){k=0;return k|0}c[b>>2]=i;c[a+96>>2]=i;c[a+104>>2]=j;c[a+100>>2]=e+(j+h);c[a+108>>2]=0;c[a+112>>2]=0;if(!(ba(b,a+116|0)|0)){k=0;return k|0}h=c[f>>2]|0;do{if(((d[h+39|0]|0)<<8|(d[h+40|0]|0)|0)==0){if(((d[h+55|0]|0)<<8|(d[h+56|0]|0)|0)==0){k=0}else{l=h;break}return k|0}else{if(!(ba(b,a+140|0)|0)){k=0;return k|0}if(ba(b,a+188|0)|0){l=c[f>>2]|0;break}else{k=0;return k|0}}}while(0);do{if(((d[l+55|0]|0)<<8|(d[l+56|0]|0)|0)!=0){if(!(ba(b,a+164|0)|0)){k=0;return k|0}if(ba(b,a+212|0)|0){break}else{k=0}return k|0}}while(0);k=1;return k|0}function bt(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;e=i;i=i+560|0;f=e|0;g=e+512|0;h=b+88|0;j=c[h>>2]|0;k=(d[j+39|0]|0)<<8|(d[j+40|0]|0);l=b+236|0;m=b+240|0;n=c[m>>2]|0;if((n|0)==(k|0)){o=j}else{if(n>>>0>k>>>0){p=j}else{do{if((c[b+244>>2]|0)>>>0<k>>>0){if(a1(l,k,(n+1|0)==(k|0),4,0)|0){q=c[m>>2]|0;break}a[b+248|0]=1;r=0;i=e;return r|0}else{q=n}}while(0);bE((c[l>>2]|0)+(q<<2)|0,0,k-q<<2|0);p=c[h>>2]|0}c[m>>2]=k;o=p}p=b+92|0;h=c[b+4>>2]|0;q=(d[o+34|0]|0)<<8|(d[o+33|0]|0)<<16|(d[o+35|0]|0);n=h+q|0;j=(d[o+37|0]|0)<<8|(d[o+36|0]|0)<<16|(d[o+38|0]|0);if((j|0)==0){r=0;i=e;return r|0}c[p>>2]=n;c[b+96>>2]=n;c[b+104>>2]=j;c[b+100>>2]=h+(j+q);c[b+108>>2]=0;c[b+112>>2]=0;b=g|0;c[g+20>>2]=0;bE(g|0,0,17);c[g+44>>2]=0;bE(g+24|0,0,17);q=0;while(1){if(q>>>0>=2){s=684;break}if(ba(p,g+(q*24|0)|0)|0){q=q+1|0}else{t=0;break}}do{if((s|0)==684){if((c[m>>2]|0)==0){q=f|0;aw(q|0,776,(j=i,i=i+24|0,c[j>>2]=488,c[j+8>>2]=904,c[j+16>>2]=312,j)|0)|0;i=j;an(q|0,(j=i,i=i+1|0,i=i+7>>3<<3,c[j>>2]=0,j)|0)|0;i=j}if((k|0)==0){t=1;break}j=g+24|0;q=0;h=0;n=0;o=0;u=0;v=c[l>>2]|0;w=0;x=0;while(1){y=(bc(p,b)|0)+x&31;z=(bc(p,j)|0)+q&63;A=(bc(p,b)|0)+h&31;B=(bc(p,b)|0)+n|0;C=(bc(p,j)|0)+o&63;D=(bc(p,b)|0)+u&31;c[v>>2]=z<<5|y<<11|A|B<<27|C<<21|D<<16;E=w+1|0;if(E>>>0<k>>>0){q=z;h=A;n=B&31;o=C;u=D;v=v+4|0;w=E;x=y}else{t=1;break}}}}while(0);a7(g+24|0);a7(g|0);r=t;i=e;return r|0}function bu(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;e=i;i=i+1e3|0;f=e|0;g=e+512|0;h=e+536|0;j=e+736|0;k=e+936|0;l=c[b+88>>2]|0;m=(d[l+47|0]|0)<<8|(d[l+48|0]|0);n=b+92|0;o=c[b+4>>2]|0;p=(d[l+42|0]|0)<<8|(d[l+41|0]|0)<<16|(d[l+43|0]|0);q=o+p|0;r=(d[l+45|0]|0)<<8|(d[l+44|0]|0)<<16|(d[l+46|0]|0);if((r|0)==0){s=0;i=e;return s|0}c[n>>2]=q;c[b+96>>2]=q;c[b+104>>2]=r;c[b+100>>2]=o+(r+p);c[b+108>>2]=0;c[b+112>>2]=0;c[g+20>>2]=0;bE(g|0,0,17);L891:do{if(ba(n,g)|0){p=-3;r=-3;o=0;while(1){c[h+(o<<2)>>2]=p;c[j+(o<<2)>>2]=r;q=p+1|0;l=(q|0)>3;t=o+1|0;if(t>>>0<49){p=l?-3:q;r=(l&1)+r|0;o=t}else{break}}bE(k|0,0,64);o=b+252|0;r=b+256|0;p=c[r>>2]|0;if((p|0)!=(m|0)){if(p>>>0<=m>>>0){do{if((c[b+260>>2]|0)>>>0<m>>>0){if(a1(o,m,(p+1|0)==(m|0),4,0)|0){u=c[r>>2]|0;break}else{a[b+264|0]=1;v=0;break L891}}else{u=p}}while(0);bE((c[o>>2]|0)+(u<<2)|0,0,m-u<<2|0)}c[r>>2]=m}if((m|0)==0){p=f|0;aw(p|0,776,(t=i,i=i+24|0,c[t>>2]=488,c[t+8>>2]=904,c[t+16>>2]=312,t)|0)|0;i=t;an(p|0,(t=i,i=i+1|0,i=i+7>>3<<3,c[t>>2]=0,t)|0)|0;i=t;v=1;break}t=k|0;p=k+4|0;l=k+8|0;q=k+12|0;w=k+16|0;x=k+20|0;y=k+24|0;z=k+28|0;A=k+32|0;B=k+36|0;C=k+40|0;D=k+44|0;E=k+48|0;F=k+52|0;G=k+56|0;H=k+60|0;I=c[o>>2]|0;J=0;while(1){K=0;do{L=bc(n,g)|0;M=K<<1;N=k+(M<<2)|0;c[N>>2]=(c[N>>2]|0)+(c[h+(L<<2)>>2]|0)&3;N=k+((M|1)<<2)|0;c[N>>2]=(c[N>>2]|0)+(c[j+(L<<2)>>2]|0)&3;K=K+1|0;}while(K>>>0<8);c[I>>2]=(d[896+(c[p>>2]|0)|0]|0)<<2|(d[896+(c[t>>2]|0)|0]|0)|(d[896+(c[l>>2]|0)|0]|0)<<4|(d[896+(c[q>>2]|0)|0]|0)<<6|(d[896+(c[w>>2]|0)|0]|0)<<8|(d[896+(c[x>>2]|0)|0]|0)<<10|(d[896+(c[y>>2]|0)|0]|0)<<12|(d[896+(c[z>>2]|0)|0]|0)<<14|(d[896+(c[A>>2]|0)|0]|0)<<16|(d[896+(c[B>>2]|0)|0]|0)<<18|(d[896+(c[C>>2]|0)|0]|0)<<20|(d[896+(c[D>>2]|0)|0]|0)<<22|(d[896+(c[E>>2]|0)|0]|0)<<24|(d[896+(c[F>>2]|0)|0]|0)<<26|(d[896+(c[G>>2]|0)|0]|0)<<28|(d[896+(c[H>>2]|0)|0]|0)<<30;K=J+1|0;if(K>>>0<m>>>0){I=I+4|0;J=K}else{v=1;break}}}else{v=0}}while(0);a7(g);s=v;i=e;return s|0}function bv(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;f=i;i=i+536|0;g=f|0;h=f+512|0;j=c[e+88>>2]|0;k=(d[j+55|0]|0)<<8|(d[j+56|0]|0);l=e+92|0;m=c[e+4>>2]|0;n=(d[j+50|0]|0)<<8|(d[j+49|0]|0)<<16|(d[j+51|0]|0);o=m+n|0;p=(d[j+53|0]|0)<<8|(d[j+52|0]|0)<<16|(d[j+54|0]|0);if((p|0)==0){q=0;i=f;return q|0}c[l>>2]=o;c[e+96>>2]=o;c[e+104>>2]=p;c[e+100>>2]=m+(p+n);c[e+108>>2]=0;c[e+112>>2]=0;c[h+20>>2]=0;bE(h|0,0,17);L923:do{if(ba(l,h)|0){n=e+268|0;p=e+272|0;m=c[p>>2]|0;if((m|0)!=(k|0)){if(m>>>0<=k>>>0){do{if((c[e+276>>2]|0)>>>0<k>>>0){if(a1(n,k,(m+1|0)==(k|0),2,0)|0){r=c[p>>2]|0;break}else{a[e+280|0]=1;s=0;break L923}}else{r=m}}while(0);bE((c[n>>2]|0)+(r<<1)|0,0,k-r<<1|0)}c[p>>2]=k}if((k|0)==0){m=g|0;aw(m|0,776,(o=i,i=i+24|0,c[o>>2]=488,c[o+8>>2]=904,c[o+16>>2]=312,o)|0)|0;i=o;an(m|0,(o=i,i=i+1|0,i=i+7>>3<<3,c[o>>2]=0,o)|0)|0;i=o;s=1;break}o=c[n>>2]|0;m=0;j=0;t=0;while(1){u=bc(l,h)|0;v=u+m&255;u=(bc(l,h)|0)+j&255;b[o>>1]=(u<<8|v)&65535;w=t+1|0;if(w>>>0<k>>>0){o=o+2|0;m=v;j=u;t=w}else{s=1;break}}}else{s=0}}while(0);a7(h);q=s;i=f;return q|0}function bw(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;f=i;i=i+2408|0;g=f|0;h=f+512|0;j=f+536|0;k=f+1440|0;l=f+2344|0;m=c[e+88>>2]|0;n=(d[m+63|0]|0)<<8|(d[m+64|0]|0);o=e+92|0;p=c[e+4>>2]|0;q=(d[m+58|0]|0)<<8|(d[m+57|0]|0)<<16|(d[m+59|0]|0);r=p+q|0;s=(d[m+61|0]|0)<<8|(d[m+60|0]|0)<<16|(d[m+62|0]|0);if((s|0)==0){t=0;i=f;return t|0}c[o>>2]=r;c[e+96>>2]=r;c[e+104>>2]=s;c[e+100>>2]=p+(s+q);c[e+108>>2]=0;c[e+112>>2]=0;c[h+20>>2]=0;bE(h|0,0,17);L950:do{if(ba(o,h)|0){q=-7;s=-7;p=0;while(1){c[j+(p<<2)>>2]=q;c[k+(p<<2)>>2]=s;r=q+1|0;m=(r|0)>7;u=p+1|0;if(u>>>0<225){q=m?-7:r;s=(m&1)+s|0;p=u}else{break}}bE(l|0,0,64);p=e+284|0;s=n*3|0;q=e+288|0;u=c[q>>2]|0;if((u|0)!=(s|0)){if(u>>>0<=s>>>0){do{if((c[e+292>>2]|0)>>>0<s>>>0){if(a1(p,s,(u+1|0)==(s|0),2,0)|0){v=c[q>>2]|0;break}else{a[e+296|0]=1;w=0;break L950}}else{v=u}}while(0);bE((c[p>>2]|0)+(v<<1)|0,0,s-v<<1|0)}c[q>>2]=s}if((s|0)==0){u=g|0;aw(u|0,776,(m=i,i=i+24|0,c[m>>2]=488,c[m+8>>2]=904,c[m+16>>2]=312,m)|0)|0;i=m;an(u|0,(m=i,i=i+1|0,i=i+7>>3<<3,c[m>>2]=0,m)|0)|0;i=m}if((n|0)==0){w=1;break}m=l|0;u=l+4|0;r=l+8|0;x=l+12|0;y=l+16|0;z=l+20|0;A=l+24|0;B=l+28|0;C=l+32|0;D=l+36|0;E=l+40|0;F=l+44|0;G=l+48|0;H=l+52|0;I=l+56|0;J=l+60|0;K=c[p>>2]|0;L=0;while(1){M=0;do{N=bc(o,h)|0;O=M<<1;P=l+(O<<2)|0;c[P>>2]=(c[P>>2]|0)+(c[j+(N<<2)>>2]|0)&7;P=l+((O|1)<<2)|0;c[P>>2]=(c[P>>2]|0)+(c[k+(N<<2)>>2]|0)&7;M=M+1|0;}while(M>>>0<8);b[K>>1]=(d[888+(c[u>>2]|0)|0]|0)<<3|(d[888+(c[m>>2]|0)|0]|0)|(d[888+(c[r>>2]|0)|0]|0)<<6|(d[888+(c[x>>2]|0)|0]|0)<<9|(d[888+(c[y>>2]|0)|0]|0)<<12|(d[888+(c[z>>2]|0)|0]|0)<<15;b[K+2>>1]=(d[888+(c[A>>2]|0)|0]|0)<<2|(a[888+(c[z>>2]|0)|0]&255)>>>1|(d[888+(c[B>>2]|0)|0]|0)<<5|(d[888+(c[C>>2]|0)|0]|0)<<8|(d[888+(c[D>>2]|0)|0]|0)<<11|(d[888+(c[E>>2]|0)|0]|0)<<14;b[K+4>>1]=(d[888+(c[F>>2]|0)|0]|0)<<1|(a[888+(c[E>>2]|0)|0]&255)>>>2|(d[888+(c[G>>2]|0)|0]|0)<<4|(d[888+(c[H>>2]|0)|0]|0)<<7|(d[888+(c[I>>2]|0)|0]|0)<<10|(d[888+(c[J>>2]|0)|0]|0)<<13;M=L+1|0;if(M>>>0<n>>>0){K=K+6|0;L=M}else{w=1;break}}}else{w=0}}while(0);a7(h);t=w;i=f;return t|0}function bx(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,am=0,an=0,ao=0,ap=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aC=0,aD=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0;do{if(a>>>0<245){if(a>>>0<11){b=16}else{b=a+11&-8}d=b>>>3;e=c[232]|0;f=e>>>(d>>>0);if((f&3|0)!=0){g=(f&1^1)+d|0;h=g<<1;i=968+(h<<2)|0;j=968+(h+2<<2)|0;h=c[j>>2]|0;k=h+8|0;l=c[k>>2]|0;do{if((i|0)==(l|0)){c[232]=e&~(1<<g)}else{if(l>>>0<(c[236]|0)>>>0){al();return 0}m=l+12|0;if((c[m>>2]|0)==(h|0)){c[m>>2]=i;c[j>>2]=l;break}else{al();return 0}}}while(0);l=g<<3;c[h+4>>2]=l|3;j=h+(l|4)|0;c[j>>2]=c[j>>2]|1;n=k;return n|0}if(b>>>0<=(c[234]|0)>>>0){o=b;break}if((f|0)!=0){j=2<<d;l=f<<d&(j|-j);j=(l&-l)-1|0;l=j>>>12&16;i=j>>>(l>>>0);j=i>>>5&8;m=i>>>(j>>>0);i=m>>>2&4;p=m>>>(i>>>0);m=p>>>1&2;q=p>>>(m>>>0);p=q>>>1&1;r=(j|l|i|m|p)+(q>>>(p>>>0))|0;p=r<<1;q=968+(p<<2)|0;m=968+(p+2<<2)|0;p=c[m>>2]|0;i=p+8|0;l=c[i>>2]|0;do{if((q|0)==(l|0)){c[232]=e&~(1<<r)}else{if(l>>>0<(c[236]|0)>>>0){al();return 0}j=l+12|0;if((c[j>>2]|0)==(p|0)){c[j>>2]=q;c[m>>2]=l;break}else{al();return 0}}}while(0);l=r<<3;m=l-b|0;c[p+4>>2]=b|3;q=p;e=q+b|0;c[q+(b|4)>>2]=m|1;c[q+l>>2]=m;l=c[234]|0;if((l|0)!=0){q=c[237]|0;d=l>>>3;l=d<<1;f=968+(l<<2)|0;k=c[232]|0;h=1<<d;do{if((k&h|0)==0){c[232]=k|h;s=f;t=968+(l+2<<2)|0}else{d=968+(l+2<<2)|0;g=c[d>>2]|0;if(g>>>0>=(c[236]|0)>>>0){s=g;t=d;break}al();return 0}}while(0);c[t>>2]=q;c[s+12>>2]=q;c[q+8>>2]=s;c[q+12>>2]=f}c[234]=m;c[237]=e;n=i;return n|0}l=c[233]|0;if((l|0)==0){o=b;break}h=(l&-l)-1|0;l=h>>>12&16;k=h>>>(l>>>0);h=k>>>5&8;p=k>>>(h>>>0);k=p>>>2&4;r=p>>>(k>>>0);p=r>>>1&2;d=r>>>(p>>>0);r=d>>>1&1;g=c[1232+((h|l|k|p|r)+(d>>>(r>>>0))<<2)>>2]|0;r=g;d=g;p=(c[g+4>>2]&-8)-b|0;while(1){g=c[r+16>>2]|0;if((g|0)==0){k=c[r+20>>2]|0;if((k|0)==0){break}else{u=k}}else{u=g}g=(c[u+4>>2]&-8)-b|0;k=g>>>0<p>>>0;r=u;d=k?u:d;p=k?g:p}r=d;i=c[236]|0;if(r>>>0<i>>>0){al();return 0}e=r+b|0;m=e;if(r>>>0>=e>>>0){al();return 0}e=c[d+24>>2]|0;f=c[d+12>>2]|0;do{if((f|0)==(d|0)){q=d+20|0;g=c[q>>2]|0;if((g|0)==0){k=d+16|0;l=c[k>>2]|0;if((l|0)==0){v=0;break}else{w=l;x=k}}else{w=g;x=q}while(1){q=w+20|0;g=c[q>>2]|0;if((g|0)!=0){w=g;x=q;continue}q=w+16|0;g=c[q>>2]|0;if((g|0)==0){break}else{w=g;x=q}}if(x>>>0<i>>>0){al();return 0}else{c[x>>2]=0;v=w;break}}else{q=c[d+8>>2]|0;if(q>>>0<i>>>0){al();return 0}g=q+12|0;if((c[g>>2]|0)!=(d|0)){al();return 0}k=f+8|0;if((c[k>>2]|0)==(d|0)){c[g>>2]=f;c[k>>2]=q;v=f;break}else{al();return 0}}}while(0);L1056:do{if((e|0)!=0){f=d+28|0;i=1232+(c[f>>2]<<2)|0;do{if((d|0)==(c[i>>2]|0)){c[i>>2]=v;if((v|0)!=0){break}c[233]=c[233]&~(1<<c[f>>2]);break L1056}else{if(e>>>0<(c[236]|0)>>>0){al();return 0}q=e+16|0;if((c[q>>2]|0)==(d|0)){c[q>>2]=v}else{c[e+20>>2]=v}if((v|0)==0){break L1056}}}while(0);if(v>>>0<(c[236]|0)>>>0){al();return 0}c[v+24>>2]=e;f=c[d+16>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[236]|0)>>>0){al();return 0}else{c[v+16>>2]=f;c[f+24>>2]=v;break}}}while(0);f=c[d+20>>2]|0;if((f|0)==0){break}if(f>>>0<(c[236]|0)>>>0){al();return 0}else{c[v+20>>2]=f;c[f+24>>2]=v;break}}}while(0);if(p>>>0<16){e=p+b|0;c[d+4>>2]=e|3;f=r+(e+4)|0;c[f>>2]=c[f>>2]|1}else{c[d+4>>2]=b|3;c[r+(b|4)>>2]=p|1;c[r+(p+b)>>2]=p;f=c[234]|0;if((f|0)!=0){e=c[237]|0;i=f>>>3;f=i<<1;q=968+(f<<2)|0;k=c[232]|0;g=1<<i;do{if((k&g|0)==0){c[232]=k|g;y=q;z=968+(f+2<<2)|0}else{i=968+(f+2<<2)|0;l=c[i>>2]|0;if(l>>>0>=(c[236]|0)>>>0){y=l;z=i;break}al();return 0}}while(0);c[z>>2]=e;c[y+12>>2]=e;c[e+8>>2]=y;c[e+12>>2]=q}c[234]=p;c[237]=m}f=d+8|0;if((f|0)==0){o=b;break}else{n=f}return n|0}else{if(a>>>0>4294967231){o=-1;break}f=a+11|0;g=f&-8;k=c[233]|0;if((k|0)==0){o=g;break}r=-g|0;i=f>>>8;do{if((i|0)==0){A=0}else{if(g>>>0>16777215){A=31;break}f=(i+1048320|0)>>>16&8;l=i<<f;h=(l+520192|0)>>>16&4;j=l<<h;l=(j+245760|0)>>>16&2;B=14-(h|f|l)+(j<<l>>>15)|0;A=g>>>((B+7|0)>>>0)&1|B<<1}}while(0);i=c[1232+(A<<2)>>2]|0;L1104:do{if((i|0)==0){C=0;D=r;E=0}else{if((A|0)==31){F=0}else{F=25-(A>>>1)|0}d=0;m=r;p=i;q=g<<F;e=0;while(1){B=c[p+4>>2]&-8;l=B-g|0;if(l>>>0<m>>>0){if((B|0)==(g|0)){C=p;D=l;E=p;break L1104}else{G=p;H=l}}else{G=d;H=m}l=c[p+20>>2]|0;B=c[p+16+(q>>>31<<2)>>2]|0;j=(l|0)==0|(l|0)==(B|0)?e:l;if((B|0)==0){C=G;D=H;E=j;break}else{d=G;m=H;p=B;q=q<<1;e=j}}}}while(0);if((E|0)==0&(C|0)==0){i=2<<A;r=k&(i|-i);if((r|0)==0){o=g;break}i=(r&-r)-1|0;r=i>>>12&16;e=i>>>(r>>>0);i=e>>>5&8;q=e>>>(i>>>0);e=q>>>2&4;p=q>>>(e>>>0);q=p>>>1&2;m=p>>>(q>>>0);p=m>>>1&1;I=c[1232+((i|r|e|q|p)+(m>>>(p>>>0))<<2)>>2]|0}else{I=E}if((I|0)==0){J=D;K=C}else{p=I;m=D;q=C;while(1){e=(c[p+4>>2]&-8)-g|0;r=e>>>0<m>>>0;i=r?e:m;e=r?p:q;r=c[p+16>>2]|0;if((r|0)!=0){p=r;m=i;q=e;continue}r=c[p+20>>2]|0;if((r|0)==0){J=i;K=e;break}else{p=r;m=i;q=e}}}if((K|0)==0){o=g;break}if(J>>>0>=((c[234]|0)-g|0)>>>0){o=g;break}q=K;m=c[236]|0;if(q>>>0<m>>>0){al();return 0}p=q+g|0;k=p;if(q>>>0>=p>>>0){al();return 0}e=c[K+24>>2]|0;i=c[K+12>>2]|0;do{if((i|0)==(K|0)){r=K+20|0;d=c[r>>2]|0;if((d|0)==0){j=K+16|0;B=c[j>>2]|0;if((B|0)==0){L=0;break}else{M=B;N=j}}else{M=d;N=r}while(1){r=M+20|0;d=c[r>>2]|0;if((d|0)!=0){M=d;N=r;continue}r=M+16|0;d=c[r>>2]|0;if((d|0)==0){break}else{M=d;N=r}}if(N>>>0<m>>>0){al();return 0}else{c[N>>2]=0;L=M;break}}else{r=c[K+8>>2]|0;if(r>>>0<m>>>0){al();return 0}d=r+12|0;if((c[d>>2]|0)!=(K|0)){al();return 0}j=i+8|0;if((c[j>>2]|0)==(K|0)){c[d>>2]=i;c[j>>2]=r;L=i;break}else{al();return 0}}}while(0);L1154:do{if((e|0)!=0){i=K+28|0;m=1232+(c[i>>2]<<2)|0;do{if((K|0)==(c[m>>2]|0)){c[m>>2]=L;if((L|0)!=0){break}c[233]=c[233]&~(1<<c[i>>2]);break L1154}else{if(e>>>0<(c[236]|0)>>>0){al();return 0}r=e+16|0;if((c[r>>2]|0)==(K|0)){c[r>>2]=L}else{c[e+20>>2]=L}if((L|0)==0){break L1154}}}while(0);if(L>>>0<(c[236]|0)>>>0){al();return 0}c[L+24>>2]=e;i=c[K+16>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[236]|0)>>>0){al();return 0}else{c[L+16>>2]=i;c[i+24>>2]=L;break}}}while(0);i=c[K+20>>2]|0;if((i|0)==0){break}if(i>>>0<(c[236]|0)>>>0){al();return 0}else{c[L+20>>2]=i;c[i+24>>2]=L;break}}}while(0);do{if(J>>>0<16){e=J+g|0;c[K+4>>2]=e|3;i=q+(e+4)|0;c[i>>2]=c[i>>2]|1}else{c[K+4>>2]=g|3;c[q+(g|4)>>2]=J|1;c[q+(J+g)>>2]=J;i=J>>>3;if(J>>>0<256){e=i<<1;m=968+(e<<2)|0;r=c[232]|0;j=1<<i;do{if((r&j|0)==0){c[232]=r|j;O=m;P=968+(e+2<<2)|0}else{i=968+(e+2<<2)|0;d=c[i>>2]|0;if(d>>>0>=(c[236]|0)>>>0){O=d;P=i;break}al();return 0}}while(0);c[P>>2]=k;c[O+12>>2]=k;c[q+(g+8)>>2]=O;c[q+(g+12)>>2]=m;break}e=p;j=J>>>8;do{if((j|0)==0){Q=0}else{if(J>>>0>16777215){Q=31;break}r=(j+1048320|0)>>>16&8;i=j<<r;d=(i+520192|0)>>>16&4;B=i<<d;i=(B+245760|0)>>>16&2;l=14-(d|r|i)+(B<<i>>>15)|0;Q=J>>>((l+7|0)>>>0)&1|l<<1}}while(0);j=1232+(Q<<2)|0;c[q+(g+28)>>2]=Q;c[q+(g+20)>>2]=0;c[q+(g+16)>>2]=0;m=c[233]|0;l=1<<Q;if((m&l|0)==0){c[233]=m|l;c[j>>2]=e;c[q+(g+24)>>2]=j;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}if((Q|0)==31){R=0}else{R=25-(Q>>>1)|0}l=J<<R;m=c[j>>2]|0;while(1){if((c[m+4>>2]&-8|0)==(J|0)){break}S=m+16+(l>>>31<<2)|0;j=c[S>>2]|0;if((j|0)==0){T=929;break}else{l=l<<1;m=j}}if((T|0)==929){if(S>>>0<(c[236]|0)>>>0){al();return 0}else{c[S>>2]=e;c[q+(g+24)>>2]=m;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}}l=m+8|0;j=c[l>>2]|0;i=c[236]|0;if(m>>>0<i>>>0){al();return 0}if(j>>>0<i>>>0){al();return 0}else{c[j+12>>2]=e;c[l>>2]=e;c[q+(g+8)>>2]=j;c[q+(g+12)>>2]=m;c[q+(g+24)>>2]=0;break}}}while(0);q=K+8|0;if((q|0)==0){o=g;break}else{n=q}return n|0}}while(0);K=c[234]|0;if(o>>>0<=K>>>0){S=K-o|0;J=c[237]|0;if(S>>>0>15){R=J;c[237]=R+o;c[234]=S;c[R+(o+4)>>2]=S|1;c[R+K>>2]=S;c[J+4>>2]=o|3}else{c[234]=0;c[237]=0;c[J+4>>2]=K|3;S=J+(K+4)|0;c[S>>2]=c[S>>2]|1}n=J+8|0;return n|0}J=c[235]|0;if(o>>>0<J>>>0){S=J-o|0;c[235]=S;J=c[238]|0;K=J;c[238]=K+o;c[K+(o+4)>>2]=S|1;c[J+4>>2]=o|3;n=J+8|0;return n|0}do{if((c[226]|0)==0){J=aq(30)|0;if((J-1&J|0)==0){c[228]=J;c[227]=J;c[229]=-1;c[230]=-1;c[231]=0;c[343]=0;c[226]=(aE(0)|0)&-16^1431655768;break}else{al();return 0}}}while(0);J=o+48|0;S=c[228]|0;K=o+47|0;R=S+K|0;Q=-S|0;S=R&Q;if(S>>>0<=o>>>0){n=0;return n|0}O=c[342]|0;do{if((O|0)!=0){P=c[340]|0;L=P+S|0;if(L>>>0<=P>>>0|L>>>0>O>>>0){n=0}else{break}return n|0}}while(0);L1246:do{if((c[343]&4|0)==0){O=c[238]|0;L1248:do{if((O|0)==0){T=959}else{L=O;P=1376;while(1){U=P|0;M=c[U>>2]|0;if(M>>>0<=L>>>0){V=P+4|0;if((M+(c[V>>2]|0)|0)>>>0>L>>>0){break}}M=c[P+8>>2]|0;if((M|0)==0){T=959;break L1248}else{P=M}}if((P|0)==0){T=959;break}L=R-(c[235]|0)&Q;if(L>>>0>=2147483647){W=0;break}m=aA(L|0)|0;e=(m|0)==((c[U>>2]|0)+(c[V>>2]|0)|0);X=e?m:-1;Y=e?L:0;Z=m;_=L;T=968}}while(0);do{if((T|0)==959){O=aA(0)|0;if((O|0)==-1){W=0;break}g=O;L=c[227]|0;m=L-1|0;if((m&g|0)==0){$=S}else{$=S-g+(m+g&-L)|0}L=c[340]|0;g=L+$|0;if(!($>>>0>o>>>0&$>>>0<2147483647)){W=0;break}m=c[342]|0;if((m|0)!=0){if(g>>>0<=L>>>0|g>>>0>m>>>0){W=0;break}}m=aA($|0)|0;g=(m|0)==(O|0);X=g?O:-1;Y=g?$:0;Z=m;_=$;T=968}}while(0);L1268:do{if((T|0)==968){m=-_|0;if((X|0)!=-1){aa=Y;ab=X;T=979;break L1246}do{if((Z|0)!=-1&_>>>0<2147483647&_>>>0<J>>>0){g=c[228]|0;O=K-_+g&-g;if(O>>>0>=2147483647){ac=_;break}if((aA(O|0)|0)==-1){aA(m|0)|0;W=Y;break L1268}else{ac=O+_|0;break}}else{ac=_}}while(0);if((Z|0)==-1){W=Y}else{aa=ac;ab=Z;T=979;break L1246}}}while(0);c[343]=c[343]|4;ad=W;T=976}else{ad=0;T=976}}while(0);do{if((T|0)==976){if(S>>>0>=2147483647){break}W=aA(S|0)|0;Z=aA(0)|0;if(!((Z|0)!=-1&(W|0)!=-1&W>>>0<Z>>>0)){break}ac=Z-W|0;Z=ac>>>0>(o+40|0)>>>0;Y=Z?W:-1;if((Y|0)!=-1){aa=Z?ac:ad;ab=Y;T=979}}}while(0);do{if((T|0)==979){ad=(c[340]|0)+aa|0;c[340]=ad;if(ad>>>0>(c[341]|0)>>>0){c[341]=ad}ad=c[238]|0;L1288:do{if((ad|0)==0){S=c[236]|0;if((S|0)==0|ab>>>0<S>>>0){c[236]=ab}c[344]=ab;c[345]=aa;c[347]=0;c[241]=c[226];c[240]=-1;S=0;do{Y=S<<1;ac=968+(Y<<2)|0;c[968+(Y+3<<2)>>2]=ac;c[968+(Y+2<<2)>>2]=ac;S=S+1|0;}while(S>>>0<32);S=ab+8|0;if((S&7|0)==0){ae=0}else{ae=-S&7}S=aa-40-ae|0;c[238]=ab+ae;c[235]=S;c[ab+(ae+4)>>2]=S|1;c[ab+(aa-36)>>2]=40;c[239]=c[230]}else{S=1376;while(1){af=c[S>>2]|0;ag=S+4|0;ah=c[ag>>2]|0;if((ab|0)==(af+ah|0)){T=991;break}ac=c[S+8>>2]|0;if((ac|0)==0){break}else{S=ac}}do{if((T|0)==991){if((c[S+12>>2]&8|0)!=0){break}ac=ad;if(!(ac>>>0>=af>>>0&ac>>>0<ab>>>0)){break}c[ag>>2]=ah+aa;ac=c[238]|0;Y=(c[235]|0)+aa|0;Z=ac;W=ac+8|0;if((W&7|0)==0){ai=0}else{ai=-W&7}W=Y-ai|0;c[238]=Z+ai;c[235]=W;c[Z+(ai+4)>>2]=W|1;c[Z+(Y+4)>>2]=40;c[239]=c[230];break L1288}}while(0);if(ab>>>0<(c[236]|0)>>>0){c[236]=ab}S=ab+aa|0;Y=1376;while(1){aj=Y|0;if((c[aj>>2]|0)==(S|0)){T=1001;break}Z=c[Y+8>>2]|0;if((Z|0)==0){break}else{Y=Z}}do{if((T|0)==1001){if((c[Y+12>>2]&8|0)!=0){break}c[aj>>2]=ab;S=Y+4|0;c[S>>2]=(c[S>>2]|0)+aa;S=ab+8|0;if((S&7|0)==0){ak=0}else{ak=-S&7}S=ab+(aa+8)|0;if((S&7|0)==0){am=0}else{am=-S&7}S=ab+(am+aa)|0;Z=S;W=ak+o|0;ac=ab+W|0;_=ac;K=S-(ab+ak)-o|0;c[ab+(ak+4)>>2]=o|3;do{if((Z|0)==(c[238]|0)){J=(c[235]|0)+K|0;c[235]=J;c[238]=_;c[ab+(W+4)>>2]=J|1}else{if((Z|0)==(c[237]|0)){J=(c[234]|0)+K|0;c[234]=J;c[237]=_;c[ab+(W+4)>>2]=J|1;c[ab+(J+W)>>2]=J;break}J=aa+4|0;X=c[ab+(J+am)>>2]|0;if((X&3|0)==1){$=X&-8;V=X>>>3;L1333:do{if(X>>>0<256){U=c[ab+((am|8)+aa)>>2]|0;Q=c[ab+(aa+12+am)>>2]|0;R=968+(V<<1<<2)|0;do{if((U|0)!=(R|0)){if(U>>>0<(c[236]|0)>>>0){al();return 0}if((c[U+12>>2]|0)==(Z|0)){break}al();return 0}}while(0);if((Q|0)==(U|0)){c[232]=c[232]&~(1<<V);break}do{if((Q|0)==(R|0)){an=Q+8|0}else{if(Q>>>0<(c[236]|0)>>>0){al();return 0}m=Q+8|0;if((c[m>>2]|0)==(Z|0)){an=m;break}al();return 0}}while(0);c[U+12>>2]=Q;c[an>>2]=U}else{R=S;m=c[ab+((am|24)+aa)>>2]|0;P=c[ab+(aa+12+am)>>2]|0;do{if((P|0)==(R|0)){O=am|16;g=ab+(J+O)|0;L=c[g>>2]|0;if((L|0)==0){e=ab+(O+aa)|0;O=c[e>>2]|0;if((O|0)==0){ao=0;break}else{ap=O;ar=e}}else{ap=L;ar=g}while(1){g=ap+20|0;L=c[g>>2]|0;if((L|0)!=0){ap=L;ar=g;continue}g=ap+16|0;L=c[g>>2]|0;if((L|0)==0){break}else{ap=L;ar=g}}if(ar>>>0<(c[236]|0)>>>0){al();return 0}else{c[ar>>2]=0;ao=ap;break}}else{g=c[ab+((am|8)+aa)>>2]|0;if(g>>>0<(c[236]|0)>>>0){al();return 0}L=g+12|0;if((c[L>>2]|0)!=(R|0)){al();return 0}e=P+8|0;if((c[e>>2]|0)==(R|0)){c[L>>2]=P;c[e>>2]=g;ao=P;break}else{al();return 0}}}while(0);if((m|0)==0){break}P=ab+(aa+28+am)|0;U=1232+(c[P>>2]<<2)|0;do{if((R|0)==(c[U>>2]|0)){c[U>>2]=ao;if((ao|0)!=0){break}c[233]=c[233]&~(1<<c[P>>2]);break L1333}else{if(m>>>0<(c[236]|0)>>>0){al();return 0}Q=m+16|0;if((c[Q>>2]|0)==(R|0)){c[Q>>2]=ao}else{c[m+20>>2]=ao}if((ao|0)==0){break L1333}}}while(0);if(ao>>>0<(c[236]|0)>>>0){al();return 0}c[ao+24>>2]=m;R=am|16;P=c[ab+(R+aa)>>2]|0;do{if((P|0)!=0){if(P>>>0<(c[236]|0)>>>0){al();return 0}else{c[ao+16>>2]=P;c[P+24>>2]=ao;break}}}while(0);P=c[ab+(J+R)>>2]|0;if((P|0)==0){break}if(P>>>0<(c[236]|0)>>>0){al();return 0}else{c[ao+20>>2]=P;c[P+24>>2]=ao;break}}}while(0);as=ab+(($|am)+aa)|0;at=$+K|0}else{as=Z;at=K}J=as+4|0;c[J>>2]=c[J>>2]&-2;c[ab+(W+4)>>2]=at|1;c[ab+(at+W)>>2]=at;J=at>>>3;if(at>>>0<256){V=J<<1;X=968+(V<<2)|0;P=c[232]|0;m=1<<J;do{if((P&m|0)==0){c[232]=P|m;au=X;av=968+(V+2<<2)|0}else{J=968+(V+2<<2)|0;U=c[J>>2]|0;if(U>>>0>=(c[236]|0)>>>0){au=U;av=J;break}al();return 0}}while(0);c[av>>2]=_;c[au+12>>2]=_;c[ab+(W+8)>>2]=au;c[ab+(W+12)>>2]=X;break}V=ac;m=at>>>8;do{if((m|0)==0){aw=0}else{if(at>>>0>16777215){aw=31;break}P=(m+1048320|0)>>>16&8;$=m<<P;J=($+520192|0)>>>16&4;U=$<<J;$=(U+245760|0)>>>16&2;Q=14-(J|P|$)+(U<<$>>>15)|0;aw=at>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=1232+(aw<<2)|0;c[ab+(W+28)>>2]=aw;c[ab+(W+20)>>2]=0;c[ab+(W+16)>>2]=0;X=c[233]|0;Q=1<<aw;if((X&Q|0)==0){c[233]=X|Q;c[m>>2]=V;c[ab+(W+24)>>2]=m;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}if((aw|0)==31){ax=0}else{ax=25-(aw>>>1)|0}Q=at<<ax;X=c[m>>2]|0;while(1){if((c[X+4>>2]&-8|0)==(at|0)){break}ay=X+16+(Q>>>31<<2)|0;m=c[ay>>2]|0;if((m|0)==0){T=1074;break}else{Q=Q<<1;X=m}}if((T|0)==1074){if(ay>>>0<(c[236]|0)>>>0){al();return 0}else{c[ay>>2]=V;c[ab+(W+24)>>2]=X;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}}Q=X+8|0;m=c[Q>>2]|0;$=c[236]|0;if(X>>>0<$>>>0){al();return 0}if(m>>>0<$>>>0){al();return 0}else{c[m+12>>2]=V;c[Q>>2]=V;c[ab+(W+8)>>2]=m;c[ab+(W+12)>>2]=X;c[ab+(W+24)>>2]=0;break}}}while(0);n=ab+(ak|8)|0;return n|0}}while(0);Y=ad;W=1376;while(1){az=c[W>>2]|0;if(az>>>0<=Y>>>0){aC=c[W+4>>2]|0;aD=az+aC|0;if(aD>>>0>Y>>>0){break}}W=c[W+8>>2]|0}W=az+(aC-39)|0;if((W&7|0)==0){aF=0}else{aF=-W&7}W=az+(aC-47+aF)|0;ac=W>>>0<(ad+16|0)>>>0?Y:W;W=ac+8|0;_=ab+8|0;if((_&7|0)==0){aG=0}else{aG=-_&7}_=aa-40-aG|0;c[238]=ab+aG;c[235]=_;c[ab+(aG+4)>>2]=_|1;c[ab+(aa-36)>>2]=40;c[239]=c[230];c[ac+4>>2]=27;c[W>>2]=c[344];c[W+4>>2]=c[1380>>2];c[W+8>>2]=c[1384>>2];c[W+12>>2]=c[1388>>2];c[344]=ab;c[345]=aa;c[347]=0;c[346]=W;W=ac+28|0;c[W>>2]=7;if((ac+32|0)>>>0<aD>>>0){_=W;while(1){W=_+4|0;c[W>>2]=7;if((_+8|0)>>>0<aD>>>0){_=W}else{break}}}if((ac|0)==(Y|0)){break}_=ac-ad|0;W=Y+(_+4)|0;c[W>>2]=c[W>>2]&-2;c[ad+4>>2]=_|1;c[Y+_>>2]=_;W=_>>>3;if(_>>>0<256){K=W<<1;Z=968+(K<<2)|0;S=c[232]|0;m=1<<W;do{if((S&m|0)==0){c[232]=S|m;aH=Z;aI=968+(K+2<<2)|0}else{W=968+(K+2<<2)|0;Q=c[W>>2]|0;if(Q>>>0>=(c[236]|0)>>>0){aH=Q;aI=W;break}al();return 0}}while(0);c[aI>>2]=ad;c[aH+12>>2]=ad;c[ad+8>>2]=aH;c[ad+12>>2]=Z;break}K=ad;m=_>>>8;do{if((m|0)==0){aJ=0}else{if(_>>>0>16777215){aJ=31;break}S=(m+1048320|0)>>>16&8;Y=m<<S;ac=(Y+520192|0)>>>16&4;W=Y<<ac;Y=(W+245760|0)>>>16&2;Q=14-(ac|S|Y)+(W<<Y>>>15)|0;aJ=_>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=1232+(aJ<<2)|0;c[ad+28>>2]=aJ;c[ad+20>>2]=0;c[ad+16>>2]=0;Z=c[233]|0;Q=1<<aJ;if((Z&Q|0)==0){c[233]=Z|Q;c[m>>2]=K;c[ad+24>>2]=m;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}if((aJ|0)==31){aK=0}else{aK=25-(aJ>>>1)|0}Q=_<<aK;Z=c[m>>2]|0;while(1){if((c[Z+4>>2]&-8|0)==(_|0)){break}aL=Z+16+(Q>>>31<<2)|0;m=c[aL>>2]|0;if((m|0)==0){T=1109;break}else{Q=Q<<1;Z=m}}if((T|0)==1109){if(aL>>>0<(c[236]|0)>>>0){al();return 0}else{c[aL>>2]=K;c[ad+24>>2]=Z;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}}Q=Z+8|0;_=c[Q>>2]|0;m=c[236]|0;if(Z>>>0<m>>>0){al();return 0}if(_>>>0<m>>>0){al();return 0}else{c[_+12>>2]=K;c[Q>>2]=K;c[ad+8>>2]=_;c[ad+12>>2]=Z;c[ad+24>>2]=0;break}}}while(0);ad=c[235]|0;if(ad>>>0<=o>>>0){break}_=ad-o|0;c[235]=_;ad=c[238]|0;Q=ad;c[238]=Q+o;c[Q+(o+4)>>2]=_|1;c[ad+4>>2]=o|3;n=ad+8|0;return n|0}}while(0);c[(aB()|0)>>2]=12;n=0;return n|0}function by(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;if((a|0)==0){return}b=a-8|0;d=b;e=c[236]|0;if(b>>>0<e>>>0){al()}f=c[a-4>>2]|0;g=f&3;if((g|0)==1){al()}h=f&-8;i=a+(h-8)|0;j=i;L1505:do{if((f&1|0)==0){k=c[b>>2]|0;if((g|0)==0){return}l=-8-k|0;m=a+l|0;n=m;o=k+h|0;if(m>>>0<e>>>0){al()}if((n|0)==(c[237]|0)){p=a+(h-4)|0;if((c[p>>2]&3|0)!=3){q=n;r=o;break}c[234]=o;c[p>>2]=c[p>>2]&-2;c[a+(l+4)>>2]=o|1;c[i>>2]=o;return}p=k>>>3;if(k>>>0<256){k=c[a+(l+8)>>2]|0;s=c[a+(l+12)>>2]|0;t=968+(p<<1<<2)|0;do{if((k|0)!=(t|0)){if(k>>>0<e>>>0){al()}if((c[k+12>>2]|0)==(n|0)){break}al()}}while(0);if((s|0)==(k|0)){c[232]=c[232]&~(1<<p);q=n;r=o;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<e>>>0){al()}v=s+8|0;if((c[v>>2]|0)==(n|0)){u=v;break}al()}}while(0);c[k+12>>2]=s;c[u>>2]=k;q=n;r=o;break}t=m;p=c[a+(l+24)>>2]|0;v=c[a+(l+12)>>2]|0;do{if((v|0)==(t|0)){w=a+(l+20)|0;x=c[w>>2]|0;if((x|0)==0){y=a+(l+16)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break}else{B=z;C=y}}else{B=x;C=w}while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){B=x;C=w;continue}w=B+16|0;x=c[w>>2]|0;if((x|0)==0){break}else{B=x;C=w}}if(C>>>0<e>>>0){al()}else{c[C>>2]=0;A=B;break}}else{w=c[a+(l+8)>>2]|0;if(w>>>0<e>>>0){al()}x=w+12|0;if((c[x>>2]|0)!=(t|0)){al()}y=v+8|0;if((c[y>>2]|0)==(t|0)){c[x>>2]=v;c[y>>2]=w;A=v;break}else{al()}}}while(0);if((p|0)==0){q=n;r=o;break}v=a+(l+28)|0;m=1232+(c[v>>2]<<2)|0;do{if((t|0)==(c[m>>2]|0)){c[m>>2]=A;if((A|0)!=0){break}c[233]=c[233]&~(1<<c[v>>2]);q=n;r=o;break L1505}else{if(p>>>0<(c[236]|0)>>>0){al()}k=p+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[p+20>>2]=A}if((A|0)==0){q=n;r=o;break L1505}}}while(0);if(A>>>0<(c[236]|0)>>>0){al()}c[A+24>>2]=p;t=c[a+(l+16)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[236]|0)>>>0){al()}else{c[A+16>>2]=t;c[t+24>>2]=A;break}}}while(0);t=c[a+(l+20)>>2]|0;if((t|0)==0){q=n;r=o;break}if(t>>>0<(c[236]|0)>>>0){al()}else{c[A+20>>2]=t;c[t+24>>2]=A;q=n;r=o;break}}else{q=d;r=h}}while(0);d=q;if(d>>>0>=i>>>0){al()}A=a+(h-4)|0;e=c[A>>2]|0;if((e&1|0)==0){al()}do{if((e&2|0)==0){if((j|0)==(c[238]|0)){B=(c[235]|0)+r|0;c[235]=B;c[238]=q;c[q+4>>2]=B|1;if((q|0)!=(c[237]|0)){return}c[237]=0;c[234]=0;return}if((j|0)==(c[237]|0)){B=(c[234]|0)+r|0;c[234]=B;c[237]=q;c[q+4>>2]=B|1;c[d+B>>2]=B;return}B=(e&-8)+r|0;C=e>>>3;L1607:do{if(e>>>0<256){u=c[a+h>>2]|0;g=c[a+(h|4)>>2]|0;b=968+(C<<1<<2)|0;do{if((u|0)!=(b|0)){if(u>>>0<(c[236]|0)>>>0){al()}if((c[u+12>>2]|0)==(j|0)){break}al()}}while(0);if((g|0)==(u|0)){c[232]=c[232]&~(1<<C);break}do{if((g|0)==(b|0)){D=g+8|0}else{if(g>>>0<(c[236]|0)>>>0){al()}f=g+8|0;if((c[f>>2]|0)==(j|0)){D=f;break}al()}}while(0);c[u+12>>2]=g;c[D>>2]=u}else{b=i;f=c[a+(h+16)>>2]|0;t=c[a+(h|4)>>2]|0;do{if((t|0)==(b|0)){p=a+(h+12)|0;v=c[p>>2]|0;if((v|0)==0){m=a+(h+8)|0;k=c[m>>2]|0;if((k|0)==0){E=0;break}else{F=k;G=m}}else{F=v;G=p}while(1){p=F+20|0;v=c[p>>2]|0;if((v|0)!=0){F=v;G=p;continue}p=F+16|0;v=c[p>>2]|0;if((v|0)==0){break}else{F=v;G=p}}if(G>>>0<(c[236]|0)>>>0){al()}else{c[G>>2]=0;E=F;break}}else{p=c[a+h>>2]|0;if(p>>>0<(c[236]|0)>>>0){al()}v=p+12|0;if((c[v>>2]|0)!=(b|0)){al()}m=t+8|0;if((c[m>>2]|0)==(b|0)){c[v>>2]=t;c[m>>2]=p;E=t;break}else{al()}}}while(0);if((f|0)==0){break}t=a+(h+20)|0;u=1232+(c[t>>2]<<2)|0;do{if((b|0)==(c[u>>2]|0)){c[u>>2]=E;if((E|0)!=0){break}c[233]=c[233]&~(1<<c[t>>2]);break L1607}else{if(f>>>0<(c[236]|0)>>>0){al()}g=f+16|0;if((c[g>>2]|0)==(b|0)){c[g>>2]=E}else{c[f+20>>2]=E}if((E|0)==0){break L1607}}}while(0);if(E>>>0<(c[236]|0)>>>0){al()}c[E+24>>2]=f;b=c[a+(h+8)>>2]|0;do{if((b|0)!=0){if(b>>>0<(c[236]|0)>>>0){al()}else{c[E+16>>2]=b;c[b+24>>2]=E;break}}}while(0);b=c[a+(h+12)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[236]|0)>>>0){al()}else{c[E+20>>2]=b;c[b+24>>2]=E;break}}}while(0);c[q+4>>2]=B|1;c[d+B>>2]=B;if((q|0)!=(c[237]|0)){H=B;break}c[234]=B;return}else{c[A>>2]=e&-2;c[q+4>>2]=r|1;c[d+r>>2]=r;H=r}}while(0);r=H>>>3;if(H>>>0<256){d=r<<1;e=968+(d<<2)|0;A=c[232]|0;E=1<<r;do{if((A&E|0)==0){c[232]=A|E;I=e;J=968+(d+2<<2)|0}else{r=968+(d+2<<2)|0;h=c[r>>2]|0;if(h>>>0>=(c[236]|0)>>>0){I=h;J=r;break}al()}}while(0);c[J>>2]=q;c[I+12>>2]=q;c[q+8>>2]=I;c[q+12>>2]=e;return}e=q;I=H>>>8;do{if((I|0)==0){K=0}else{if(H>>>0>16777215){K=31;break}J=(I+1048320|0)>>>16&8;d=I<<J;E=(d+520192|0)>>>16&4;A=d<<E;d=(A+245760|0)>>>16&2;r=14-(E|J|d)+(A<<d>>>15)|0;K=H>>>((r+7|0)>>>0)&1|r<<1}}while(0);I=1232+(K<<2)|0;c[q+28>>2]=K;c[q+20>>2]=0;c[q+16>>2]=0;r=c[233]|0;d=1<<K;do{if((r&d|0)==0){c[233]=r|d;c[I>>2]=e;c[q+24>>2]=I;c[q+12>>2]=q;c[q+8>>2]=q}else{if((K|0)==31){L=0}else{L=25-(K>>>1)|0}A=H<<L;J=c[I>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(H|0)){break}M=J+16+(A>>>31<<2)|0;E=c[M>>2]|0;if((E|0)==0){N=1286;break}else{A=A<<1;J=E}}if((N|0)==1286){if(M>>>0<(c[236]|0)>>>0){al()}else{c[M>>2]=e;c[q+24>>2]=J;c[q+12>>2]=q;c[q+8>>2]=q;break}}A=J+8|0;B=c[A>>2]|0;E=c[236]|0;if(J>>>0<E>>>0){al()}if(B>>>0<E>>>0){al()}else{c[B+12>>2]=e;c[A>>2]=e;c[q+8>>2]=B;c[q+12>>2]=J;c[q+24>>2]=0;break}}}while(0);q=(c[240]|0)-1|0;c[240]=q;if((q|0)==0){O=1384}else{return}while(1){q=c[O>>2]|0;if((q|0)==0){break}else{O=q+8|0}}c[240]=-1;return}function bz(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;if((a|0)==0){d=bx(b)|0;return d|0}if(b>>>0>4294967231){c[(aB()|0)>>2]=12;d=0;return d|0}if(b>>>0<11){e=16}else{e=b+11&-8}f=bA(a-8|0,e)|0;if((f|0)!=0){d=f+8|0;return d|0}f=bx(b)|0;if((f|0)==0){d=0;return d|0}e=c[a-4>>2]|0;g=(e&-8)-((e&3|0)==0?8:4)|0;e=g>>>0<b>>>0?g:b;bF(f|0,a|0,e)|0;by(a);d=f;return d|0}function bA(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=a+4|0;e=c[d>>2]|0;f=e&-8;g=a;h=g+f|0;i=h;j=c[236]|0;if(g>>>0<j>>>0){al();return 0}k=e&3;if(!((k|0)!=1&g>>>0<h>>>0)){al();return 0}l=g+(f|4)|0;m=c[l>>2]|0;if((m&1|0)==0){al();return 0}if((k|0)==0){if(b>>>0<256){n=0;return n|0}do{if(f>>>0>=(b+4|0)>>>0){if((f-b|0)>>>0>c[228]<<1>>>0){break}else{n=a}return n|0}}while(0);n=0;return n|0}if(f>>>0>=b>>>0){k=f-b|0;if(k>>>0<=15){n=a;return n|0}c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=k|3;c[l>>2]=c[l>>2]|1;bC(g+b|0,k);n=a;return n|0}if((i|0)==(c[238]|0)){k=(c[235]|0)+f|0;if(k>>>0<=b>>>0){n=0;return n|0}l=k-b|0;c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=l|1;c[238]=g+b;c[235]=l;n=a;return n|0}if((i|0)==(c[237]|0)){l=(c[234]|0)+f|0;if(l>>>0<b>>>0){n=0;return n|0}k=l-b|0;if(k>>>0>15){c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=k|1;c[g+l>>2]=k;o=g+(l+4)|0;c[o>>2]=c[o>>2]&-2;p=g+b|0;q=k}else{c[d>>2]=e&1|l|2;e=g+(l+4)|0;c[e>>2]=c[e>>2]|1;p=0;q=0}c[234]=q;c[237]=p;n=a;return n|0}if((m&2|0)!=0){n=0;return n|0}p=(m&-8)+f|0;if(p>>>0<b>>>0){n=0;return n|0}q=p-b|0;e=m>>>3;L1794:do{if(m>>>0<256){l=c[g+(f+8)>>2]|0;k=c[g+(f+12)>>2]|0;o=968+(e<<1<<2)|0;do{if((l|0)!=(o|0)){if(l>>>0<j>>>0){al();return 0}if((c[l+12>>2]|0)==(i|0)){break}al();return 0}}while(0);if((k|0)==(l|0)){c[232]=c[232]&~(1<<e);break}do{if((k|0)==(o|0)){r=k+8|0}else{if(k>>>0<j>>>0){al();return 0}s=k+8|0;if((c[s>>2]|0)==(i|0)){r=s;break}al();return 0}}while(0);c[l+12>>2]=k;c[r>>2]=l}else{o=h;s=c[g+(f+24)>>2]|0;t=c[g+(f+12)>>2]|0;do{if((t|0)==(o|0)){u=g+(f+20)|0;v=c[u>>2]|0;if((v|0)==0){w=g+(f+16)|0;x=c[w>>2]|0;if((x|0)==0){y=0;break}else{z=x;A=w}}else{z=v;A=u}while(1){u=z+20|0;v=c[u>>2]|0;if((v|0)!=0){z=v;A=u;continue}u=z+16|0;v=c[u>>2]|0;if((v|0)==0){break}else{z=v;A=u}}if(A>>>0<j>>>0){al();return 0}else{c[A>>2]=0;y=z;break}}else{u=c[g+(f+8)>>2]|0;if(u>>>0<j>>>0){al();return 0}v=u+12|0;if((c[v>>2]|0)!=(o|0)){al();return 0}w=t+8|0;if((c[w>>2]|0)==(o|0)){c[v>>2]=t;c[w>>2]=u;y=t;break}else{al();return 0}}}while(0);if((s|0)==0){break}t=g+(f+28)|0;l=1232+(c[t>>2]<<2)|0;do{if((o|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[233]=c[233]&~(1<<c[t>>2]);break L1794}else{if(s>>>0<(c[236]|0)>>>0){al();return 0}k=s+16|0;if((c[k>>2]|0)==(o|0)){c[k>>2]=y}else{c[s+20>>2]=y}if((y|0)==0){break L1794}}}while(0);if(y>>>0<(c[236]|0)>>>0){al();return 0}c[y+24>>2]=s;o=c[g+(f+16)>>2]|0;do{if((o|0)!=0){if(o>>>0<(c[236]|0)>>>0){al();return 0}else{c[y+16>>2]=o;c[o+24>>2]=y;break}}}while(0);o=c[g+(f+20)>>2]|0;if((o|0)==0){break}if(o>>>0<(c[236]|0)>>>0){al();return 0}else{c[y+20>>2]=o;c[o+24>>2]=y;break}}}while(0);if(q>>>0<16){c[d>>2]=p|c[d>>2]&1|2;y=g+(p|4)|0;c[y>>2]=c[y>>2]|1;n=a;return n|0}else{c[d>>2]=c[d>>2]&1|b|2;c[g+(b+4)>>2]=q|3;d=g+(p|4)|0;c[d>>2]=c[d>>2]|1;bC(g+b|0,q);n=a;return n|0}return 0}function bB(a){a=a|0;var b=0,d=0,e=0;do{if((a|0)==0){b=0}else{d=c[a-4>>2]|0;e=d&3;if((e|0)==1){b=0;break}b=(d&-8)-((e|0)==0?8:4)|0}}while(0);return b|0}function bC(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;d=a;e=d+b|0;f=e;g=c[a+4>>2]|0;L1875:do{if((g&1|0)==0){h=c[a>>2]|0;if((g&3|0)==0){return}i=d+(-h|0)|0;j=i;k=h+b|0;l=c[236]|0;if(i>>>0<l>>>0){al()}if((j|0)==(c[237]|0)){m=d+(b+4)|0;if((c[m>>2]&3|0)!=3){n=j;o=k;break}c[234]=k;c[m>>2]=c[m>>2]&-2;c[d+(4-h)>>2]=k|1;c[e>>2]=k;return}m=h>>>3;if(h>>>0<256){p=c[d+(8-h)>>2]|0;q=c[d+(12-h)>>2]|0;r=968+(m<<1<<2)|0;do{if((p|0)!=(r|0)){if(p>>>0<l>>>0){al()}if((c[p+12>>2]|0)==(j|0)){break}al()}}while(0);if((q|0)==(p|0)){c[232]=c[232]&~(1<<m);n=j;o=k;break}do{if((q|0)==(r|0)){s=q+8|0}else{if(q>>>0<l>>>0){al()}t=q+8|0;if((c[t>>2]|0)==(j|0)){s=t;break}al()}}while(0);c[p+12>>2]=q;c[s>>2]=p;n=j;o=k;break}r=i;m=c[d+(24-h)>>2]|0;t=c[d+(12-h)>>2]|0;do{if((t|0)==(r|0)){u=16-h|0;v=d+(u+4)|0;w=c[v>>2]|0;if((w|0)==0){x=d+u|0;u=c[x>>2]|0;if((u|0)==0){y=0;break}else{z=u;A=x}}else{z=w;A=v}while(1){v=z+20|0;w=c[v>>2]|0;if((w|0)!=0){z=w;A=v;continue}v=z+16|0;w=c[v>>2]|0;if((w|0)==0){break}else{z=w;A=v}}if(A>>>0<l>>>0){al()}else{c[A>>2]=0;y=z;break}}else{v=c[d+(8-h)>>2]|0;if(v>>>0<l>>>0){al()}w=v+12|0;if((c[w>>2]|0)!=(r|0)){al()}x=t+8|0;if((c[x>>2]|0)==(r|0)){c[w>>2]=t;c[x>>2]=v;y=t;break}else{al()}}}while(0);if((m|0)==0){n=j;o=k;break}t=d+(28-h)|0;l=1232+(c[t>>2]<<2)|0;do{if((r|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[233]=c[233]&~(1<<c[t>>2]);n=j;o=k;break L1875}else{if(m>>>0<(c[236]|0)>>>0){al()}i=m+16|0;if((c[i>>2]|0)==(r|0)){c[i>>2]=y}else{c[m+20>>2]=y}if((y|0)==0){n=j;o=k;break L1875}}}while(0);if(y>>>0<(c[236]|0)>>>0){al()}c[y+24>>2]=m;r=16-h|0;t=c[d+r>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[236]|0)>>>0){al()}else{c[y+16>>2]=t;c[t+24>>2]=y;break}}}while(0);t=c[d+(r+4)>>2]|0;if((t|0)==0){n=j;o=k;break}if(t>>>0<(c[236]|0)>>>0){al()}else{c[y+20>>2]=t;c[t+24>>2]=y;n=j;o=k;break}}else{n=a;o=b}}while(0);a=c[236]|0;if(e>>>0<a>>>0){al()}y=d+(b+4)|0;z=c[y>>2]|0;do{if((z&2|0)==0){if((f|0)==(c[238]|0)){A=(c[235]|0)+o|0;c[235]=A;c[238]=n;c[n+4>>2]=A|1;if((n|0)!=(c[237]|0)){return}c[237]=0;c[234]=0;return}if((f|0)==(c[237]|0)){A=(c[234]|0)+o|0;c[234]=A;c[237]=n;c[n+4>>2]=A|1;c[n+A>>2]=A;return}A=(z&-8)+o|0;s=z>>>3;L1974:do{if(z>>>0<256){g=c[d+(b+8)>>2]|0;t=c[d+(b+12)>>2]|0;h=968+(s<<1<<2)|0;do{if((g|0)!=(h|0)){if(g>>>0<a>>>0){al()}if((c[g+12>>2]|0)==(f|0)){break}al()}}while(0);if((t|0)==(g|0)){c[232]=c[232]&~(1<<s);break}do{if((t|0)==(h|0)){B=t+8|0}else{if(t>>>0<a>>>0){al()}m=t+8|0;if((c[m>>2]|0)==(f|0)){B=m;break}al()}}while(0);c[g+12>>2]=t;c[B>>2]=g}else{h=e;m=c[d+(b+24)>>2]|0;l=c[d+(b+12)>>2]|0;do{if((l|0)==(h|0)){i=d+(b+20)|0;p=c[i>>2]|0;if((p|0)==0){q=d+(b+16)|0;v=c[q>>2]|0;if((v|0)==0){C=0;break}else{D=v;E=q}}else{D=p;E=i}while(1){i=D+20|0;p=c[i>>2]|0;if((p|0)!=0){D=p;E=i;continue}i=D+16|0;p=c[i>>2]|0;if((p|0)==0){break}else{D=p;E=i}}if(E>>>0<a>>>0){al()}else{c[E>>2]=0;C=D;break}}else{i=c[d+(b+8)>>2]|0;if(i>>>0<a>>>0){al()}p=i+12|0;if((c[p>>2]|0)!=(h|0)){al()}q=l+8|0;if((c[q>>2]|0)==(h|0)){c[p>>2]=l;c[q>>2]=i;C=l;break}else{al()}}}while(0);if((m|0)==0){break}l=d+(b+28)|0;g=1232+(c[l>>2]<<2)|0;do{if((h|0)==(c[g>>2]|0)){c[g>>2]=C;if((C|0)!=0){break}c[233]=c[233]&~(1<<c[l>>2]);break L1974}else{if(m>>>0<(c[236]|0)>>>0){al()}t=m+16|0;if((c[t>>2]|0)==(h|0)){c[t>>2]=C}else{c[m+20>>2]=C}if((C|0)==0){break L1974}}}while(0);if(C>>>0<(c[236]|0)>>>0){al()}c[C+24>>2]=m;h=c[d+(b+16)>>2]|0;do{if((h|0)!=0){if(h>>>0<(c[236]|0)>>>0){al()}else{c[C+16>>2]=h;c[h+24>>2]=C;break}}}while(0);h=c[d+(b+20)>>2]|0;if((h|0)==0){break}if(h>>>0<(c[236]|0)>>>0){al()}else{c[C+20>>2]=h;c[h+24>>2]=C;break}}}while(0);c[n+4>>2]=A|1;c[n+A>>2]=A;if((n|0)!=(c[237]|0)){F=A;break}c[234]=A;return}else{c[y>>2]=z&-2;c[n+4>>2]=o|1;c[n+o>>2]=o;F=o}}while(0);o=F>>>3;if(F>>>0<256){z=o<<1;y=968+(z<<2)|0;C=c[232]|0;b=1<<o;do{if((C&b|0)==0){c[232]=C|b;G=y;H=968+(z+2<<2)|0}else{o=968+(z+2<<2)|0;d=c[o>>2]|0;if(d>>>0>=(c[236]|0)>>>0){G=d;H=o;break}al()}}while(0);c[H>>2]=n;c[G+12>>2]=n;c[n+8>>2]=G;c[n+12>>2]=y;return}y=n;G=F>>>8;do{if((G|0)==0){I=0}else{if(F>>>0>16777215){I=31;break}H=(G+1048320|0)>>>16&8;z=G<<H;b=(z+520192|0)>>>16&4;C=z<<b;z=(C+245760|0)>>>16&2;o=14-(b|H|z)+(C<<z>>>15)|0;I=F>>>((o+7|0)>>>0)&1|o<<1}}while(0);G=1232+(I<<2)|0;c[n+28>>2]=I;c[n+20>>2]=0;c[n+16>>2]=0;o=c[233]|0;z=1<<I;if((o&z|0)==0){c[233]=o|z;c[G>>2]=y;c[n+24>>2]=G;c[n+12>>2]=n;c[n+8>>2]=n;return}if((I|0)==31){J=0}else{J=25-(I>>>1)|0}I=F<<J;J=c[G>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(F|0)){break}K=J+16+(I>>>31<<2)|0;G=c[K>>2]|0;if((G|0)==0){L=1570;break}else{I=I<<1;J=G}}if((L|0)==1570){if(K>>>0<(c[236]|0)>>>0){al()}c[K>>2]=y;c[n+24>>2]=J;c[n+12>>2]=n;c[n+8>>2]=n;return}K=J+8|0;L=c[K>>2]|0;I=c[236]|0;if(J>>>0<I>>>0){al()}if(L>>>0<I>>>0){al()}c[L+12>>2]=y;c[K>>2]=y;c[n+8>>2]=L;c[n+12>>2]=J;c[n+24>>2]=0;return}function bD(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function bE(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+e|0;if((e|0)>=20){d=d&255;e=b&3;g=d|d<<8|d<<16|d<<24;h=f&~3;if(e){e=b+4-e|0;while((b|0)<(e|0)){a[b]=d;b=b+1|0}}while((b|0)<(h|0)){c[b>>2]=g;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}}function bF(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function bG(a,b){a=a|0;b=b|0;return aG[a&1](b|0)|0}function bH(a,b){a=a|0;b=b|0;aH[a&1](b|0)}function bI(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return aI[a&3](b|0,c|0,d|0,e|0,f|0)|0}function bJ(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;aJ[a&1](b|0,c|0,d|0)}function bK(a){a=a|0;aK[a&1]()}function bL(a,b,c){a=a|0;b=b|0;c=c|0;return aL[a&1](b|0,c|0)|0}function bM(a){a=a|0;_(0);return 0}function bN(a){a=a|0;_(1)}function bO(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;_(2);return 0}function bP(a,b,c){a=a|0;b=b|0;c=c|0;_(3)}function bQ(){_(4)}function bR(a,b){a=a|0;b=b|0;_(5);return 0}
// EMSCRIPTEN_END_FUNCS
var aG=[bM,bM];var aH=[bN,bN];var aI=[bO,bO,a5,bO];var aJ=[bP,bP];var aK=[bQ,bQ];var aL=[bR,bR];return{_strlen:bD,_crn_get_levels:bj,_crn_get_uncompressed_size:bl,_realloc:bz,_crn_get_width:bh,_crn_decompress:bm,_memset:bE,_malloc:bx,_memcpy:bF,_free:by,_crn_get_height:bi,_crn_get_dxt_format:bk,runPostSets:a0,stackAlloc:aM,stackSave:aN,stackRestore:aO,setThrew:aP,setTempRet0:aS,setTempRet1:aT,setTempRet2:aU,setTempRet3:aV,setTempRet4:aW,setTempRet5:aX,setTempRet6:aY,setTempRet7:aZ,setTempRet8:a_,setTempRet9:a$,dynCall_ii:bG,dynCall_vi:bH,dynCall_iiiiii:bI,dynCall_viii:bJ,dynCall_v:bK,dynCall_iii:bL}})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_ii": invoke_ii, "invoke_vi": invoke_vi, "invoke_iiiiii": invoke_iiiiii, "invoke_viii": invoke_viii, "invoke_v": invoke_v, "invoke_iii": invoke_iii, "_llvm_lifetime_end": _llvm_lifetime_end, "_snprintf": _snprintf, "_abort": _abort, "_fprintf": _fprintf, "_printf": _printf, "_fflush": _fflush, "__reallyNegative": __reallyNegative, "_sysconf": _sysconf, "___setErrNo": ___setErrNo, "_fwrite": _fwrite, "_send": _send, "_write": _write, "_exit": _exit, "_sprintf": _sprintf, "__formatString": __formatString, "__ZSt9terminatev": __ZSt9terminatev, "_pwrite": _pwrite, "_sbrk": _sbrk, "___errno_location": ___errno_location, "___gxx_personality_v0": ___gxx_personality_v0, "_llvm_lifetime_start": _llvm_lifetime_start, "_time": _time, "__exit": __exit, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity }, buffer);
var _strlen = CrunchModule["_strlen"] = asm["_strlen"];
var _crn_get_levels = CrunchModule["_crn_get_levels"] = asm["_crn_get_levels"];
var _crn_get_uncompressed_size = CrunchModule["_crn_get_uncompressed_size"] = asm["_crn_get_uncompressed_size"];
var _realloc = CrunchModule["_realloc"] = asm["_realloc"];
var _crn_get_width = CrunchModule["_crn_get_width"] = asm["_crn_get_width"];
var _crn_decompress = CrunchModule["_crn_decompress"] = asm["_crn_decompress"];
var _memset = CrunchModule["_memset"] = asm["_memset"];
var _malloc = CrunchModule["_malloc"] = asm["_malloc"];
var _memcpy = CrunchModule["_memcpy"] = asm["_memcpy"];
var _free = CrunchModule["_free"] = asm["_free"];
var _crn_get_height = CrunchModule["_crn_get_height"] = asm["_crn_get_height"];
var _crn_get_dxt_format = CrunchModule["_crn_get_dxt_format"] = asm["_crn_get_dxt_format"];
var runPostSets = CrunchModule["runPostSets"] = asm["runPostSets"];
var dynCall_ii = CrunchModule["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_vi = CrunchModule["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_iiiiii = CrunchModule["dynCall_iiiiii"] = asm["dynCall_iiiiii"];
var dynCall_viii = CrunchModule["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_v = CrunchModule["dynCall_v"] = asm["dynCall_v"];
var dynCall_iii = CrunchModule["dynCall_iii"] = asm["dynCall_iii"];
Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
if (memoryInitializer) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    applyData(CrunchModule['readBinary'](memoryInitializer));
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      applyData(data);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;
var initialStackTop;
var preloadStartTime = null;
var calledMain = false;
var calledRun = false;
dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and CrunchModule.noInitialRun is not false)
  if (!calledRun && shouldRunNow) run();
  if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}
CrunchModule['callMain'] = CrunchModule.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    CrunchModule.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  initialStackTop = STACKTOP;
  try {
    var ret = CrunchModule['_main'](argc, argv, 0);
    // if we're not running an evented main loop, it's time to exit
    if (!CrunchModule['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      CrunchModule['noExitRuntime'] = true;
      return;
    } else {
      throw e;
    }
  } finally {
    calledMain = true;
  }
}
function run(args) {
  args = args || CrunchModule['arguments'];
  if (preloadStartTime === null) preloadStartTime = Date.now();
  if (runDependencies > 0) {
    CrunchModule.printErr('run() called, but dependencies remain, so not running');
    return;
  }
  preRun();
  if (runDependencies > 0) {
    // a preRun added a dependency, run will be called later
    return;
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    calledRun = true;
    if (CrunchModule['_main'] && shouldRunNow) {
      CrunchModule['callMain'](args);
    }
    postRun();
  }
  if (CrunchModule['setStatus']) {
    CrunchModule['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        CrunchModule['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
CrunchModule['run'] = CrunchModule.run = run;
function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;
  // exit the runtime
  exitRuntime();
  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371
  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
CrunchModule['exit'] = CrunchModule.exit = exit;
function abort(text) {
  if (text) {
    CrunchModule.print(text);
    CrunchModule.printErr(text);
  }
  ABORT = true;
  EXITSTATUS = 1;
  throw 'abort() at ' + (new Error().stack);
}
CrunchModule['abort'] = CrunchModule.abort = abort;
// {{PRE_RUN_ADDITIONS}}
if (CrunchModule['preInit']) {
  if (typeof CrunchModule['preInit'] == 'function') CrunchModule['preInit'] = [CrunchModule['preInit']];
  while (CrunchModule['preInit'].length > 0) {
    CrunchModule['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (CrunchModule['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
// {{MODULE_ADDITIONS}}
