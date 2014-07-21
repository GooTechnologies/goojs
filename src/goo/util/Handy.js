define(
	/** @lends */
	function () {
	'use strict';

	/**
	 * @class Object listener utilities
	 */
	function Handy() {
	}

	Handy.deepFreeze = function (o) {
		var prop, propKey;
		Object.freeze(o); // First freeze the object.
		for (propKey in o) {
			prop = o[propKey];
			if (!o.hasOwnProperty(propKey) || typeof prop !== 'object' || Object.isFrozen(prop)) {
				// If the object is on the prototype, not an object, or is already frozen,
				// skip it. Note that this might leave an unfrozen reference somewhere in the
				// object if there is an already frozen object containing an unfrozen object.
				continue;
			}

			Handy.deepFreeze(prop); // Recursively call deepFreeze.
		}
	};

	Handy.defineProperty = function (obj, variable, value, callback) {
		var val = value;
		Object.defineProperty(obj, variable, {
			get : function () {
				return val;
			},
			set : function (newval) {
				val = newval;
				callback(val);
			},
			configurable : true,
			enumerable : true
		});
	};

	Handy.addListener = function (obj, variable, getCallback, setCallback) {
		var val = obj[variable];
		Object.defineProperty(obj, variable, {
			get : function () {
				if (getCallback) {
					getCallback();
				}
				return val;
			},
			set : function (newval) {
				val = newval;
				if (setCallback) {
					setCallback(val);
				}
			},
			configurable : true,
			enumerable : true
		});
	};

	return Handy;
});