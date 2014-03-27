/*jshint bitwise: false */
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

	StringUtil.createUniqueId = function (type) {
		var date = Date.now();
		var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			// | 0 is a hack to floor a number, so this is a random number between 0 and 15
			var randomNumber = (date + Math.random() * 16) % 16 | 0;
			if (c === 'x') {
				return randomNumber.toString(16);
			} else {
				// Set bit 6 and 7 to 0 and 1
				return (randomNumber&0x3|0x8).toString(16);
			}
		});

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
	StringUtil.getUntil = function(string, stopString) {
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
	StringUtil.getAfterLast = function(string, stopString) {
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

	// REVIEW: idCounter is only updated on declaration, same session will always have the same seed
	// used in generating ids
	var idCounter = +new Date();

	// returns an almost unique id
	StringUtil.getUniqueId = function() {
		idCounter++;
		var stringedArguments = Array.prototype.slice.call(arguments, 0).join('');
		return StringUtil.hashCode(idCounter + '' + stringedArguments);
	};


	/* REVIEW: Quite a lot of entities you have there
	 * How about this http://shebang.brandonmintern.com/foolproof-html-escaping-in-javascript/
	 * Or just skip the entityTable, it should work with all numbers too, right?
	 */
	/**
	 * Escapes all HTML entities from a given string.
	 *
	 * @param  {string} text
	 *  The string whose HTML entities are to be encoded.
	 *
	 * @return {string}
	 *  The specified string with all its HTML entities encoded.
	 */
	StringUtil.escapeHtmlEntities = function (text) {
		if (!text) { return text; }

		return text.replace(/[\u00A0-\u2666<>\&\"\']/g, function(c) {
			var entityName = StringUtil.entityTable[c.charCodeAt(0)];
			return '&' + (entityName || '#' + c.charCodeAt(0)) + ';';
		});
	};

	/**
	 * All HTML4 entities as defined here:
	 * http://www.w3.org/TR/html4/sgml/entities.html
	 *
	 * @type {Object}
	 */
	StringUtil.entityTable = {
		34 : 'quot',
		38 : 'amp',
		39 : 'apos',
		60 : 'lt',
		62 : 'gt',
		160 : 'nbsp',
		161 : 'iexcl',
		162 : 'cent',
		163 : 'pound',
		164 : 'curren',
		165 : 'yen',
		166 : 'brvbar',
		167 : 'sect',
		168 : 'uml',
		169 : 'copy',
		170 : 'ordf',
		171 : 'laquo',
		172 : 'not',
		173 : 'shy',
		174 : 'reg',
		175 : 'macr',
		176 : 'deg',
		177 : 'plusmn',
		178 : 'sup2',
		179 : 'sup3',
		180 : 'acute',
		181 : 'micro',
		182 : 'para',
		183 : 'middot',
		184 : 'cedil',
		185 : 'sup1',
		186 : 'ordm',
		187 : 'raquo',
		188 : 'frac14',
		189 : 'frac12',
		190 : 'frac34',
		191 : 'iquest',
		192 : 'Agrave',
		193 : 'Aacute',
		194 : 'Acirc',
		195 : 'Atilde',
		196 : 'Auml',
		197 : 'Aring',
		198 : 'AElig',
		199 : 'Ccedil',
		200 : 'Egrave',
		201 : 'Eacute',
		202 : 'Ecirc',
		203 : 'Euml',
		204 : 'Igrave',
		205 : 'Iacute',
		206 : 'Icirc',
		207 : 'Iuml',
		208 : 'ETH',
		209 : 'Ntilde',
		210 : 'Ograve',
		211 : 'Oacute',
		212 : 'Ocirc',
		213 : 'Otilde',
		214 : 'Ouml',
		215 : 'times',
		216 : 'Oslash',
		217 : 'Ugrave',
		218 : 'Uacute',
		219 : 'Ucirc',
		220 : 'Uuml',
		221 : 'Yacute',
		222 : 'THORN',
		223 : 'szlig',
		224 : 'agrave',
		225 : 'aacute',
		226 : 'acirc',
		227 : 'atilde',
		228 : 'auml',
		229 : 'aring',
		230 : 'aelig',
		231 : 'ccedil',
		232 : 'egrave',
		233 : 'eacute',
		234 : 'ecirc',
		235 : 'euml',
		236 : 'igrave',
		237 : 'iacute',
		238 : 'icirc',
		239 : 'iuml',
		240 : 'eth',
		241 : 'ntilde',
		242 : 'ograve',
		243 : 'oacute',
		244 : 'ocirc',
		245 : 'otilde',
		246 : 'ouml',
		247 : 'divide',
		248 : 'oslash',
		249 : 'ugrave',
		250 : 'uacute',
		251 : 'ucirc',
		252 : 'uuml',
		253 : 'yacute',
		254 : 'thorn',
		255 : 'yuml',
		402 : 'fnof',
		913 : 'Alpha',
		914 : 'Beta',
		915 : 'Gamma',
		916 : 'Delta',
		917 : 'Epsilon',
		918 : 'Zeta',
		919 : 'Eta',
		920 : 'Theta',
		921 : 'Iota',
		922 : 'Kappa',
		923 : 'Lambda',
		924 : 'Mu',
		925 : 'Nu',
		926 : 'Xi',
		927 : 'Omicron',
		928 : 'Pi',
		929 : 'Rho',
		931 : 'Sigma',
		932 : 'Tau',
		933 : 'Upsilon',
		934 : 'Phi',
		935 : 'Chi',
		936 : 'Psi',
		937 : 'Omega',
		945 : 'alpha',
		946 : 'beta',
		947 : 'gamma',
		948 : 'delta',
		949 : 'epsilon',
		950 : 'zeta',
		951 : 'eta',
		952 : 'theta',
		953 : 'iota',
		954 : 'kappa',
		955 : 'lambda',
		956 : 'mu',
		957 : 'nu',
		958 : 'xi',
		959 : 'omicron',
		960 : 'pi',
		961 : 'rho',
		962 : 'sigmaf',
		963 : 'sigma',
		964 : 'tau',
		965 : 'upsilon',
		966 : 'phi',
		967 : 'chi',
		968 : 'psi',
		969 : 'omega',
		977 : 'thetasym',
		978 : 'upsih',
		982 : 'piv',
		8226 : 'bull',
		8230 : 'hellip',
		8242 : 'prime',
		8243 : 'Prime',
		8254 : 'oline',
		8260 : 'frasl',
		8472 : 'weierp',
		8465 : 'image',
		8476 : 'real',
		8482 : 'trade',
		8501 : 'alefsym',
		8592 : 'larr',
		8593 : 'uarr',
		8594 : 'rarr',
		8595 : 'darr',
		8596 : 'harr',
		8629 : 'crarr',
		8656 : 'lArr',
		8657 : 'uArr',
		8658 : 'rArr',
		8659 : 'dArr',
		8660 : 'hArr',
		8704 : 'forall',
		8706 : 'part',
		8707 : 'exist',
		8709 : 'empty',
		8711 : 'nabla',
		8712 : 'isin',
		8713 : 'notin',
		8715 : 'ni',
		8719 : 'prod',
		8721 : 'sum',
		8722 : 'minus',
		8727 : 'lowast',
		8730 : 'radic',
		8733 : 'prop',
		8734 : 'infin',
		8736 : 'ang',
		8743 : 'and',
		8744 : 'or',
		8745 : 'cap',
		8746 : 'cup',
		8747 : 'int',
		8756 : 'there4',
		8764 : 'sim',
		8773 : 'cong',
		8776 : 'asymp',
		8800 : 'ne',
		8801 : 'equiv',
		8804 : 'le',
		8805 : 'ge',
		8834 : 'sub',
		8835 : 'sup',
		8836 : 'nsub',
		8838 : 'sube',
		8839 : 'supe',
		8853 : 'oplus',
		8855 : 'otimes',
		8869 : 'perp',
		8901 : 'sdot',
		8968 : 'lceil',
		8969 : 'rceil',
		8970 : 'lfloor',
		8971 : 'rfloor',
		9001 : 'lang',
		9002 : 'rang',
		9674 : 'loz',
		9824 : 'spades',
		9827 : 'clubs',
		9829 : 'hearts',
		9830 : 'diams',
		338 : 'OElig',
		339 : 'oelig',
		352 : 'Scaron',
		353 : 'scaron',
		376 : 'Yuml',
		710 : 'circ',
		732 : 'tilde',
		8194 : 'ensp',
		8195 : 'emsp',
		8201 : 'thinsp',
		8204 : 'zwnj',
		8205 : 'zwj',
		8206 : 'lrm',
		8207 : 'rlm',
		8211 : 'ndash',
		8212 : 'mdash',
		8216 : 'lsquo',
		8217 : 'rsquo',
		8218 : 'sbquo',
		8220 : 'ldquo',
		8221 : 'rdquo',
		8222 : 'bdquo',
		8224 : 'dagger',
		8225 : 'Dagger',
		8240 : 'permil',
		8249 : 'lsaquo',
		8250 : 'rsaquo',
		8364 : 'euro'
	};

	return StringUtil;
});
