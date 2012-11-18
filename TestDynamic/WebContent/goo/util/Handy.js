define(function() {
	"use strict";

	function Handy() {
	}

	Handy.defineProperty = function(obj, variable, value, callback) {
		var val = value;
		Object.defineProperty(obj, variable, {
			get : function() {
				return val;
			},
			set : function(newval) {
				val = newval;
				callback(val);
			},
			configurable : true,
			enumerable : true
		});
	};

	Handy.addListener = function(obj, variable, getCallback, setCallback) {
		var val = obj.variable;
		Object.defineProperty(obj, variable, {
			get : function() {
				getCallback();
				return val;
			},
			set : function(newval) {
				val = newval;
				setCallback(val);
			},
			configurable : true,
			enumerable : true
		});
	};

	return Handy;
});