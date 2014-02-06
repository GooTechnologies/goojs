// adapted from https://github.com/rauschma/enums
define(function () {
	"use strict";

	function copyOwnFrom(target, source) {
		Object.getOwnPropertyNames(source).forEach(function (propName) {
			Object.defineProperty(target, propName, Object.getOwnPropertyDescriptor(source, propName));
		});
		return target;
	}

	function Symbol(name, props) {
		this.name = name;
		if (props) {
			copyOwnFrom(this, props);
		}
		Object.freeze(this);
	}
	/** We don't want the mutable Object.prototype in the prototype chain */
	Symbol.prototype = Object.create(null);
	Symbol.prototype.constructor = Symbol;
	/**
	 * Without Object.prototype in the prototype chain, we need toString() in order to display symbols.
	 */
	Symbol.prototype.toString = function () {
		return "|" + this.name + "|";
	};
	Object.freeze(Symbol.prototype);

	/**
	* @class
	*/
	function Enum(obj) {
		if (arguments.length === 1 && obj !== null && typeof obj === "object") {
			Object.keys(obj).forEach(function (name) {
				this[name] = new Symbol(name, obj[name]);
			}, this);
		} else {
			Array.prototype.forEach.call(arguments, function (name) {
				this[name] = new Symbol(name);
			}, this);
		}
		Object.freeze(this);
	}

	Enum.prototype.symbols = function () {
		return Object.keys(this).map(function (key) {
			return this[key];
		}, this);
	};

	Enum.prototype.contains = function (sym) {
		if (!sym instanceof Symbol) {
			return false;
		}
		return this[sym.name] === sym;
	};

	return Enum;
});