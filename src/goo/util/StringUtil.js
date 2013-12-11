define(function() {
	"use strict";

	var StringUtil = {};

	StringUtil.endsWith = function(str, suffix) {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	};

	StringUtil.startsWith = function(str, prefix) {
		return str.indexOf(prefix) === 0;
	};

	StringUtil.capitalize = function(str) {
		return str.charAt(0).toUpperCase() + str.substring(1);
	};

	StringUtil.uncapitalize = function(str) {
		return str.charAt(0).toLowerCase() + str.substring(1);
	};

	/**
	 * Returns the string from the beginning of the string until the specified stop string. The stop string
	 * is not included in the returned string.
	 *
	 * If the specified stop string is not found, the whole string is returned.
	 *
	 * @param {string} string
	 * @param {string} stopString
	 */
	StringUtil.getUntil = function(string, stopString) {
		var stopIndex = string.indexOf(stopString);
		if (stopIndex === -1) {
			return string;
		} else {
			return string.slice(0, stopIndex);
		}
	};

	/**
	 * Returns the string from the index of the start string until the end of the string. The start character is
	 * not included in the returned string.
	 *
	 * If the specified start string is not found in the string, an empty string is returned.
	 *
	 * @param {string} string
	 * @param {string} startString
	 */
	StringUtil.getFrom = function(string, startString) {
		var startIndex = string.indexOf(startString);
		if (startIndex === -1) {
			return '';
		} else {
			// Adding offset equal to the length of the start string,
			// to not include the start string in the returned string.
			return string.slice(startIndex + startString.length, string.length);
		}
	};

	StringUtil.getIndexedName = function(base, takenNames, separator){
		if (!separator) {
			separator = '_';
		}

		var re = new RegExp(base+'(' + separator + '\\d+)?');
		var i;
		var index = 0;
		for (i in takenNames) {
			var name = takenNames[i];
			var m = re.exec(name);
			if (m) {
				if (m.length>1 && m[1]){
					var nidx = parseInt(m[1].substring(separator.length), 10);
					if (nidx>=index) {
						index = nidx+1;
					}
				}
				else {
					index = 1;
				}
			}
		}

		return base + separator + index;
	};

	StringUtil.getUniqueName = function(desiredName, takenNames, separator) {
		if (takenNames.indexOf(desiredName)===-1) {
			return desiredName;
		}

		return StringUtil.getIndexedName(desiredName, takenNames, separator);
	};

	StringUtil.toAscii = function (input) {
		return input.replace(/([^\x00-\x7F])/g, 'x');
	};

	/*jshint bitwise: false */
	/**
	Js implementation of Java's hashcode (sort of). Somewhat useful for creating
	unique ideas that contain [A-Za-z0-9-_]
	*/
	StringUtil.hashCode = function(str) {
		var hash = 0;

		if (str.length === 0) {
			return hash;
		}

		for (var i = 0; i < str.length; i++) {
			var character = str.charCodeAt(i);
			hash = ((hash << 5) - hash) + character;
			hash = hash & hash; // Convert to 32bit integer
		}

		return btoa(hash).replace('/', '_').replace('+', '-');
	};

	StringUtil.getUniqueId = function() {
		// unsure if needs 2 separate cases
		if (arguments.length === 0) {
			return StringUtil.hashCode(new Date() + '_nothing!_');
		} else {
			var stringedArguments = '';
			for (var i = 1; i < arguments.length; i++) {
				stringedArguments += arguments[i];
			}
			return StringUtil.hashCode(arguments[0] + '' + stringedArguments);
		}
	};

	return StringUtil;
});
