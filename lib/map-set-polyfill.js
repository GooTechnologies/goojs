/*!
 * https://github.com/paulmillr/es6-shim
 * @license es6-shim Copyright 2013-2014 by Paul Miller (http://paulmillr.com)
 *   and contributors,  MIT License
 * es6-shim: v0.21.0
 * see https://github.com/paulmillr/es6-shim/blob/master/LICENSE
 * Details and documentation:
 * https://github.com/paulmillr/es6-shim/
 */

// UMD (Universal Module Definition)
// see https://github.com/umdjs/umd/blob/master/returnExports.js
(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(factory);
	} else if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like enviroments that support module.exports,
		// like Node.
		module.exports = factory();
	} else {
		// Browser globals (root is window)
		root.returnExports = factory();
	}
}(this, function () {
	'use strict';

	var isCallableWithoutNew = function (func) {
		try { func(); }
		catch (e) { return false; }
		return true;
	};

	var supportsSubclassing = function (C, f) {
		/* jshint proto:true */
		try {
			var Sub = function () { C.apply(this, arguments); };
			if (!Sub.__proto__) { return false; /* skip test on IE < 11 */ }
			Object.setPrototypeOf(Sub, C);
			Sub.prototype = Object.create(C.prototype, {
				constructor: { value: C }
			});
			return f(Sub);
		} catch (e) {
			return false;
		}
	};

	var arePropertyDescriptorsSupported = function () {
		try {
			Object.defineProperty({}, 'x', {});
			return true;
		} catch (e) { /* this is IE 8. */
			return false;
		}
	};

	var startsWithRejectsRegex = function () {
		var rejectsRegex = false;
		if (String.prototype.startsWith) {
			try {
				'/a/'.startsWith(/a/);
			} catch (e) { /* this is spec compliant */
				rejectsRegex = true;
			}
		}
		return rejectsRegex;
	};

	/*jshint evil: true */
	var getGlobal = new Function('return this;');
	/*jshint evil: false */

	var globals = getGlobal();
	var global_isFinite = globals.isFinite;
	var supportsDescriptors = !!Object.defineProperty && arePropertyDescriptorsSupported();
	var startsWithIsCompliant = startsWithRejectsRegex();
	var _slice = Array.prototype.slice;
	var _indexOf = String.prototype.indexOf;
	var _toString = Object.prototype.toString;
	var _hasOwnProperty = Object.prototype.hasOwnProperty;
	var ArrayIterator; // make our implementation private

	var Symbol = globals.Symbol || {};
	var isSymbol = function (sym) {
		/*jshint notypeof: true */
		return typeof globals.Symbol === 'function' && typeof sym === 'symbol';
		/*jshint notypeof: false */
	};

	var defineProperty = function (object, name, value, force) {
		if (!force && name in object) { return; }
		if (supportsDescriptors) {
			Object.defineProperty(object, name, {
				configurable: true,
				enumerable: false,
				writable: true,
				value: value
			});
		} else {
			object[name] = value;
		}
	};

	// Define configurable, writable and non-enumerable props
	// if they don’t exist.
	var defineProperties = function (object, map) {
		Object.keys(map).forEach(function (name) {
			var method = map[name];
			defineProperty(object, name, method, false);
		});
	};

	// Simple shim for Object.create on ES3 browsers
	// (unlike real shim, no attempt to support `prototype === null`)
	var create = Object.create || function (prototype, properties) {
		function Type() {}
		Type.prototype = prototype;
		var object = new Type();
		if (typeof properties !== 'undefined') {
			defineProperties(object, properties);
		}
		return object;
	};

	// This is a private name in the es6 spec, equal to '[Symbol.iterator]'
	// we're going to use an arbitrary _-prefixed name to make our shims
	// work properly with each other, even though we don't have full Iterator
	// support.  That is, `Array.from(map.keys())` will work, but we don't
	// pretend to export a "real" Iterator interface.
	var $iterator$ = isSymbol(Symbol.iterator) ? Symbol.iterator : '_es6-shim iterator_';
	// Firefox ships a partial implementation using the name @@iterator.
	// https://bugzilla.mozilla.org/show_bug.cgi?id=907077#c14
	// So use that name if we detect it.
	if (globals.Set && typeof new globals.Set()['@@iterator'] === 'function') {
		$iterator$ = '@@iterator';
	}
	var addIterator = function (prototype, impl) {
		if (!impl) { impl = function iterator() { return this; }; }
		var o = {};
		o[$iterator$] = impl;
		defineProperties(prototype, o);
		if (!prototype[$iterator$] && isSymbol($iterator$)) {
			// implementations are buggy when $iterator$ is a Symbol
			prototype[$iterator$] = impl;
		}
	};

	// taken directly from https://github.com/ljharb/is-arguments/blob/master/index.js
	// can be replaced with require('is-arguments') if we ever use a build process instead
	var isArguments = function isArguments(value) {
		var str = _toString.call(value);
		var result = str === '[object Arguments]';
		if (!result) {
			result = str !== '[object Array]' &&
				value !== null &&
				typeof value === 'object' &&
				typeof value.length === 'number' &&
				value.length >= 0 &&
				_toString.call(value.callee) === '[object Function]';
		}
		return result;
	};

	var emulateES6construct = function (o) {
		if (!ES.TypeIsObject(o)) { throw new TypeError('bad object'); }
		// es5 approximation to es6 subclass semantics: in es6, 'new Foo'
		// would invoke Foo.@@create to allocation/initialize the new object.
		// In es5 we just get the plain object.  So if we detect an
		// uninitialized object, invoke o.constructor.@@create
		if (!o._es6construct) {
			if (o.constructor && ES.IsCallable(o.constructor['@@create'])) {
				o = o.constructor['@@create'](o);
			}
			defineProperties(o, { _es6construct: true });
		}
		return o;
	};

	var ES = {
		CheckObjectCoercible: function (x, optMessage) {
			/* jshint eqnull:true */
			if (x == null) {
				throw new TypeError(optMessage || 'Cannot call method on ' + x);
			}
			return x;
		},

		TypeIsObject: function (x) {
			/* jshint eqnull:true */
			// this is expensive when it returns false; use this function
			// when you expect it to return true in the common case.
			return x != null && Object(x) === x;
		},

		ToObject: function (o, optMessage) {
			return Object(ES.CheckObjectCoercible(o, optMessage));
		},

		IsCallable: function (x) {
			return typeof x === 'function' &&
				// some versions of IE say that typeof /abc/ === 'function'
				_toString.call(x) === '[object Function]';
		},

		ToInt32: function (x) {
			return x >> 0;
		},

		ToUint32: function (x) {
			return x >>> 0;
		},

		ToInteger: function (value) {
			var number = +value;
			if (Number.isNaN(number)) { return 0; }
			if (number === 0 || !Number.isFinite(number)) { return number; }
			return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
		},

		ToLength: function (value) {
			var len = ES.ToInteger(value);
			if (len <= 0) { return 0; } // includes converting -0 to +0
			if (len > Number.MAX_SAFE_INTEGER) { return Number.MAX_SAFE_INTEGER; }
			return len;
		},

		SameValue: function (a, b) {
			if (a === b) {
				// 0 === -0, but they are not identical.
				if (a === 0) { return 1 / a === 1 / b; }
				return true;
			}
			return Number.isNaN(a) && Number.isNaN(b);
		},

		SameValueZero: function (a, b) {
			// same as SameValue except for SameValueZero(+0, -0) == true
			return (a === b) || (Number.isNaN(a) && Number.isNaN(b));
		},

		IsIterable: function (o) {
			return ES.TypeIsObject(o) &&
				(typeof o[$iterator$] !== 'undefined' || isArguments(o));
		},

		GetIterator: function (o) {
			if (isArguments(o)) {
				// special case support for `arguments`
				return new ArrayIterator(o, 'value');
			}
			var itFn = o[$iterator$];
			if (!ES.IsCallable(itFn)) {
				throw new TypeError('value is not an iterable');
			}
			var it = itFn.call(o);
			if (!ES.TypeIsObject(it)) {
				throw new TypeError('bad iterator');
			}
			return it;
		},

		IteratorNext: function (it) {
			var result = arguments.length > 1 ? it.next(arguments[1]) : it.next();
			if (!ES.TypeIsObject(result)) {
				throw new TypeError('bad iterator');
			}
			return result;
		},

		Construct: function (C, args) {
			// CreateFromConstructor
			var obj;
			if (ES.IsCallable(C['@@create'])) {
				obj = C['@@create']();
			} else {
				// OrdinaryCreateFromConstructor
				obj = create(C.prototype || null);
			}
			// Mark that we've used the es6 construct path
			// (see emulateES6construct)
			defineProperties(obj, { _es6construct: true });
			// Call the constructor.
			var result = C.apply(obj, args);
			return ES.TypeIsObject(result) ? result : obj;
		}
	};



	try {
		Object.keys('foo');
	} catch (e) {
		var originalObjectKeys = Object.keys;
		Object.keys = function (obj) {
			return originalObjectKeys(ES.ToObject(obj));
		};
	}

	// -----------------------------------------------------------

	// Map and Set require a true ES5 environment
	// Their fast path also requires that the environment preserve
	// property insertion order, which is not guaranteed by the spec.
	var testOrder = function (a) {
		var b = Object.keys(a.reduce(function (o, k) {
			o[k] = true;
			return o;
		}, {}));
		return a.join(':') === b.join(':');
	};
	var preservesInsertionOrder = testOrder(['z', 'a', 'bb']);
	// some engines (eg, Chrome) only preserve insertion order for string keys
	var preservesNumericInsertionOrder = testOrder(['z', 1, 'a', '3', 2]);

	if (supportsDescriptors) {

		var fastkey = function fastkey(key) {
			if (!preservesInsertionOrder) {
				return null;
			}
			var type = typeof key;
			if (type === 'string') {
				return '$' + key;
			} else if (type === 'number') {
				// note that -0 will get coerced to "0" when used as a property key
				if (!preservesNumericInsertionOrder) {
					return 'n' + key;
				}
				return key;
			}
			return null;
		};

		var emptyObject = function emptyObject() {
			// accomodate some older not-quite-ES5 browsers
			return Object.create ? Object.create(null) : {};
		};

		var collectionShims = {
			Map: (function () {

				var empty = {};

				function MapEntry(key, value) {
					this.key = key;
					this.value = value;
					this.next = null;
					this.prev = null;
				}

				MapEntry.prototype.isRemoved = function () {
					return this.key === empty;
				};

				function MapIterator(map, kind) {
					this.head = map._head;
					this.i = this.head;
					this.kind = kind;
				}

				MapIterator.prototype = {
					next: function () {
						var i = this.i, kind = this.kind, head = this.head, result;
						if (typeof this.i === 'undefined') {
							return { value: void 0, done: true };
						}
						while (i.isRemoved() && i !== head) {
							// back up off of removed entries
							i = i.prev;
						}
						// advance to next unreturned element.
						while (i.next !== head) {
							i = i.next;
							if (!i.isRemoved()) {
								if (kind === 'key') {
									result = i.key;
								} else if (kind === 'value') {
									result = i.value;
								} else {
									result = [i.key, i.value];
								}
								this.i = i;
								return { value: result, done: false };
							}
						}
						// once the iterator is done, it is done forever.
						this.i = void 0;
						return { value: void 0, done: true };
					}
				};
				addIterator(MapIterator.prototype);

				function Map(iterable) {
					var map = this;
					if (!ES.TypeIsObject(map)) {
						throw new TypeError('Map does not accept arguments when called as a function');
					}
					map = emulateES6construct(map);
					if (!map._es6map) {
						throw new TypeError('bad map');
					}

					var head = new MapEntry(null, null);
					// circular doubly-linked list.
					head.next = head.prev = head;

					defineProperties(map, {
						_head: head,
						_storage: emptyObject(),
						_size: 0
					});

					// Optionally initialize map from iterable
					if (typeof iterable !== 'undefined' && iterable !== null) {
						var it = ES.GetIterator(iterable);
						var adder = map.set;
						if (!ES.IsCallable(adder)) { throw new TypeError('bad map'); }
						while (true) {
							var next = ES.IteratorNext(it);
							if (next.done) { break; }
							var nextItem = next.value;
							if (!ES.TypeIsObject(nextItem)) {
								throw new TypeError('expected iterable of pairs');
							}
							adder.call(map, nextItem[0], nextItem[1]);
						}
					}
					return map;
				}
				var Map$prototype = Map.prototype;
				defineProperties(Map, {
					'@@create': function (obj) {
						var constructor = this;
						var prototype = constructor.prototype || Map$prototype;
						obj = obj || create(prototype);
						defineProperties(obj, { _es6map: true });
						return obj;
					}
				});

				Object.defineProperty(Map.prototype, 'size', {
					configurable: true,
					enumerable: false,
					get: function () {
						if (typeof this._size === 'undefined') {
							throw new TypeError('size method called on incompatible Map');
						}
						return this._size;
					}
				});

				defineProperties(Map.prototype, {
					get: function (key) {
						var fkey = fastkey(key);
						if (fkey !== null) {
							// fast O(1) path
							var entry = this._storage[fkey];
							if (entry) {
								return entry.value;
							} else {
								return;
							}
						}
						var head = this._head, i = head;
						while ((i = i.next) !== head) {
							if (ES.SameValueZero(i.key, key)) {
								return i.value;
							}
						}
						return;
					},

					has: function (key) {
						var fkey = fastkey(key);
						if (fkey !== null) {
							// fast O(1) path
							return typeof this._storage[fkey] !== 'undefined';
						}
						var head = this._head, i = head;
						while ((i = i.next) !== head) {
							if (ES.SameValueZero(i.key, key)) {
								return true;
							}
						}
						return false;
					},

					set: function (key, value) {
						var head = this._head, i = head, entry;
						var fkey = fastkey(key);
						if (fkey !== null) {
							// fast O(1) path
							if (typeof this._storage[fkey] !== 'undefined') {
								this._storage[fkey].value = value;
								return this;
							} else {
								entry = this._storage[fkey] = new MapEntry(key, value);
								i = head.prev;
								// fall through
							}
						}
						while ((i = i.next) !== head) {
							if (ES.SameValueZero(i.key, key)) {
								i.value = value;
								return this;
							}
						}
						entry = entry || new MapEntry(key, value);
						if (ES.SameValue(-0, key)) {
							entry.key = +0; // coerce -0 to +0 in entry
						}
						entry.next = this._head;
						entry.prev = this._head.prev;
						entry.prev.next = entry;
						entry.next.prev = entry;
						this._size += 1;
						return this;
					},

					'delete': function (key) {
						var head = this._head, i = head;
						var fkey = fastkey(key);
						if (fkey !== null) {
							// fast O(1) path
							if (typeof this._storage[fkey] === 'undefined') {
								return false;
							}
							i = this._storage[fkey].prev;
							delete this._storage[fkey];
							// fall through
						}
						while ((i = i.next) !== head) {
							if (ES.SameValueZero(i.key, key)) {
								i.key = i.value = empty;
								i.prev.next = i.next;
								i.next.prev = i.prev;
								this._size -= 1;
								return true;
							}
						}
						return false;
					},

					clear: function () {
						this._size = 0;
						this._storage = emptyObject();
						var head = this._head, i = head, p = i.next;
						while ((i = p) !== head) {
							i.key = i.value = empty;
							p = i.next;
							i.next = i.prev = head;
						}
						head.next = head.prev = head;
					},

					keys: function () {
						return new MapIterator(this, 'key');
					},

					values: function () {
						return new MapIterator(this, 'value');
					},

					entries: function () {
						return new MapIterator(this, 'key+value');
					},

					forEach: function (callback) {
						var context = arguments.length > 1 ? arguments[1] : null;
						var it = this.entries();
						for (var entry = it.next(); !entry.done; entry = it.next()) {
							if (context) {
								callback.call(context, entry.value[1], entry.value[0], this);
							} else {
								callback(entry.value[1], entry.value[0], this);
							}
						}
					}
				});
				addIterator(Map.prototype, function () { return this.entries(); });

				return Map;
			})(),

			Set: (function () {
				// Creating a Map is expensive.  To speed up the common case of
				// Sets containing only string or numeric keys, we use an object
				// as backing storage and lazily create a full Map only when
				// required.
				var SetShim = function Set(iterable) {
					var set = this;
					if (!ES.TypeIsObject(set)) {
						throw new TypeError('Set does not accept arguments when called as a function');
					}
					set = emulateES6construct(set);
					if (!set._es6set) {
						throw new TypeError('bad set');
					}

					defineProperties(set, {
						'[[SetData]]': null,
						_storage: emptyObject()
					});

					// Optionally initialize map from iterable
					if (typeof iterable !== 'undefined' && iterable !== null) {
						var it = ES.GetIterator(iterable);
						var adder = set.add;
						if (!ES.IsCallable(adder)) { throw new TypeError('bad set'); }
						while (true) {
							var next = ES.IteratorNext(it);
							if (next.done) { break; }
							var nextItem = next.value;
							adder.call(set, nextItem);
						}
					}
					return set;
				};
				var Set$prototype = SetShim.prototype;
				defineProperties(SetShim, {
					'@@create': function (obj) {
						var constructor = this;
						var prototype = constructor.prototype || Set$prototype;
						obj = obj || create(prototype);
						defineProperties(obj, { _es6set: true });
						return obj;
					}
				});

				// Switch from the object backing storage to a full Map.
				var ensureMap = function ensureMap(set) {
					if (!set['[[SetData]]']) {
						var m = set['[[SetData]]'] = new collectionShims.Map();
						Object.keys(set._storage).forEach(function (k) {
							// fast check for leading '$'
							if (k.charCodeAt(0) === 36) {
								k = k.slice(1);
							} else if (k.charAt(0) === 'n') {
								k = +k.slice(1);
							} else {
								k = +k;
							}
							m.set(k, k);
						});
						set._storage = null; // free old backing storage
					}
				};

				Object.defineProperty(SetShim.prototype, 'size', {
					configurable: true,
					enumerable: false,
					get: function () {
						if (typeof this._storage === 'undefined') {
							// https://github.com/paulmillr/es6-shim/issues/176
							throw new TypeError('size method called on incompatible Set');
						}
						ensureMap(this);
						return this['[[SetData]]'].size;
					}
				});

				defineProperties(SetShim.prototype, {
					has: function (key) {
						var fkey;
						if (this._storage && (fkey = fastkey(key)) !== null) {
							return !!this._storage[fkey];
						}
						ensureMap(this);
						return this['[[SetData]]'].has(key);
					},

					add: function (key) {
						var fkey;
						if (this._storage && (fkey = fastkey(key)) !== null) {
							this._storage[fkey] = true;
							return this;
						}
						ensureMap(this);
						this['[[SetData]]'].set(key, key);
						return this;
					},

					'delete': function (key) {
						var fkey;
						if (this._storage && (fkey = fastkey(key)) !== null) {
							var hasFKey = _hasOwnProperty.call(this._storage, fkey);
							return (delete this._storage[fkey]) && hasFKey;
						}
						ensureMap(this);
						return this['[[SetData]]']['delete'](key);
					},

					clear: function () {
						if (this._storage) {
							this._storage = emptyObject();
							return;
						}
						return this['[[SetData]]'].clear();
					},

					values: function () {
						ensureMap(this);
						return this['[[SetData]]'].values();
					},

					entries: function () {
						ensureMap(this);
						return this['[[SetData]]'].entries();
					},

					forEach: function (callback) {
						var context = arguments.length > 1 ? arguments[1] : null;
						var entireSet = this;
						ensureMap(entireSet);
						this['[[SetData]]'].forEach(function (value, key) {
							if (context) {
								callback.call(context, key, key, entireSet);
							} else {
								callback(key, key, entireSet);
							}
						});
					}
				});
				defineProperty(SetShim, 'keys', SetShim.values, true);
				addIterator(SetShim.prototype, function () { return this.values(); });

				return SetShim;
			})()
		};
		defineProperties(globals, collectionShims);

		if (globals.Map || globals.Set) {
			/*
			 - In Firefox < 23, Map#size is a function.
			 - In all current Firefox, Set#entries/keys/values & Map#clear do not exist
			 - https://bugzilla.mozilla.org/show_bug.cgi?id=869996
			 - In Firefox 24, Map and Set do not implement forEach
			 - In Firefox 25 at least, Map and Set are callable without "new"
			 */
			if (
				typeof globals.Map.prototype.clear !== 'function' ||
				new globals.Set().size !== 0 ||
				new globals.Map().size !== 0 ||
				typeof globals.Map.prototype.keys !== 'function' ||
				typeof globals.Set.prototype.keys !== 'function' ||
				typeof globals.Map.prototype.forEach !== 'function' ||
				typeof globals.Set.prototype.forEach !== 'function' ||
				isCallableWithoutNew(globals.Map) ||
				isCallableWithoutNew(globals.Set) ||
				!supportsSubclassing(globals.Map, function (M) {
					var m = new M([]);
					// Firefox 32 is ok with the instantiating the subclass but will
					// throw when the map is used.
					m.set(42, 42);
					return m instanceof M;
				})
				) {
				globals.Map = collectionShims.Map;
				globals.Set = collectionShims.Set;
			}
		}
		if (globals.Set.prototype.keys !== globals.Set.prototype.values) {
			defineProperty(globals.Set.prototype, 'keys', globals.Set.prototype.values, true);
		}
		// Shim incomplete iterator implementations.
		addIterator(Object.getPrototypeOf((new globals.Map()).keys()));
		addIterator(Object.getPrototypeOf((new globals.Set()).keys()));
	}

	return globals;
}));
