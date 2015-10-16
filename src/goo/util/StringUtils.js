/*jshint bitwise: false */
define(function () {
	'use strict';

	/**
	 * Provides string manipulation methods
	 */
	function StringUtils() {}

	StringUtils.endsWith = function (str, suffix) {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	};

	StringUtils.startsWith = function (str, prefix) {
		return str.indexOf(prefix) === 0;
	};

	StringUtils.capitalize = function (str) {
		return str.charAt(0).toUpperCase() + str.substring(1);
	};

	StringUtils.uncapitalize = function (str) {
		return str.charAt(0).toLowerCase() + str.substring(1);
	};

	StringUtils.createUniqueId = function (type) {
		var date = Date.now();
		var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			// | 0 is a hack to floor a number, so this is a random number between 0 and 15
			var randomNumber = (date + Math.random() * 16) % 16 | 0;
			if (c === 'x') {
				return randomNumber.toString(16);
			} else {
				// Set bit 6 and 7 to 0 and 1
				return (randomNumber & 0x3 | 0x8).toString(16);
			}
		});
		if (type === undefined) {
			return uuid;
		}
		return uuid + '.' + type;
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
	StringUtils.getUntil = function (string, stopString) {
		var stopIndex = string.indexOf(stopString);
		if (stopIndex === -1) {
			return string;
		} else {
			return string.slice(0, stopIndex);
		}
	};

	/**
	 * Returns the string from the last occurence of the stop string until the end. The stop string is not included in the result.
	 * @param {string} string
	 * @param {string} stopString
	 * @returns {string}
	 */
	StringUtils.getAfterLast = function (string, stopString) {
		var stopIndex = string.lastIndexOf(stopString);
		if (stopIndex === -1) {
			return string;
		} else {
			return string.slice(stopIndex + stopString.length, string.length);
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
	StringUtils.getFrom = function (string, startString) {
		var startIndex = string.indexOf(startString);
		if (startIndex === -1) {
			return '';
		} else {
			// Adding offset equal to the length of the start string,
			// to not include the start string in the returned string.
			return string.slice(startIndex + startString.length, string.length);
		}
	};

	StringUtils.getIndexedName = function (base, takenNames, separator) {
		if (!separator) {
			separator = '_';
		}

		var re = new RegExp(base + '(' + separator + '\\d+)?');
		var i;
		var index = 0;
		for (i in takenNames) {
			var name = takenNames[i];
			var m = re.exec(name);
			if (m) {
				if (m.length > 1 && m[1]) {
					var nidx = parseInt(m[1].substring(separator.length), 10);
					if (nidx >= index) {
						index = nidx + 1;
					}
				} else {
					index = 1;
				}
			}
		}

		return base + separator + index;
	};

	StringUtils.getUniqueName = function (desiredName, takenNames, separator) {
		if (takenNames.indexOf(desiredName) === -1) {
			return desiredName;
		}

		return StringUtils.getIndexedName(desiredName, takenNames, separator);
	};

	//! AT: toASCII, in JS everything is caps (JSON, innerHTML, etc)
	StringUtils.toAscii = function (input) {
		return input.replace(/([^\x00-\x7F])/g, 'x');
	};

	/*jshint bitwise: false */
	/**
	Js implementation of Java's hashcode (sort of). Somewhat useful for creating
	unique ideas that contain [A-Za-z0-9-_]
	*/
	StringUtils.hashCode = function (str) {
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

	// REVIEW: idCounter is only updated on declaration, same session will always have the same seed
	// used in generating ids
	var idCounter = Date.now();

	// returns an almost unique id
	StringUtils.getUniqueId = function () {
		idCounter++;
		var stringedArguments = Array.prototype.slice.call(arguments, 0).join('');
		return StringUtils.hashCode(idCounter + '' + stringedArguments);
	};

	/**
	 * Escapes all HTML entities from a given string.
	 * @param {string} text The string whose HTML entities are to be encoded.
	 * @returns {string} The specified string with all its HTML entities encoded.
	 */
	StringUtils.escapeHtmlEntities = function (text) {
		var div = document.createElement('div');
		div.appendChild(document.createTextNode(text));

		// Any edge cases that are not escaped by the browser.
		var edgeCases = { 34: 'quot' };

		return div.innerHTML.replace(/[\u00A0-\u2666\"\']/g, function (c) {
			var entityName = edgeCases[c.charCodeAt(0)];
			return '&' + (entityName || '#' + c.charCodeAt(0)) + ';';
		});
	};

	/**
	 * Parses an URL
	 * @param {string} url
	 * @example
	 *     var url = 'http://example.com:1234/images/goo.png?param=1#fragment';
	 *     var parts = Ajax.parseURL(url);
	 *     parts.scheme			// 'http'
	 *     parts.domain			// 'example.com'
	 *     parts.user_info		// undefined
	 *     parts.port			// '1234'
	 *     parts.path			// '/images/goo.png'
	 *     parts.query_data		// 'param=1'
	 *     parts.fragment		// 'fragment'
	 */

	//! AT: this does far too much and is used only to get the extension of whatever the uri is
	// write a faster one instead

	// let's save it ourselves if the browser doesn't automagically do it
	/**
	 * @private
	 */
	var splitRegExp = new RegExp(
		'^' +
		'(?:' +
		'([^:/?#.]+)' +                         // scheme - ignore special characters
		// used by other URL parts such as :,
		// ?, /, #, and .
		':)?' +
		'(?://' +
		'(?:([^/?#]*)@)?' +                     // userInfo
		'([\\w\\d\\-\\u0100-\\uffff.%]*)' +     // domain - restrict to letters,
		// digits, dashes, dots, percent
		// escapes, and unicode characters.
		'(?::([0-9]+))?' +                      // port
		')?' +
		'([^?#]+)?' +                           // path
		'(?:\\?([^#]*))?' +                     // query
		'(?:#(.*))?' +                          // fragment
		'$');

	StringUtils.parseURL = function (uri) {
		var split = uri.match(splitRegExp);
		return {
			'scheme': split[1],
			'user_info': split[2],
			'domain': split[3],
			'port': split[4],
			'path': split[5],
			'query_data': split[6],
			'fragment': split[7]
		};
	};

	return StringUtils;
});
