(function () {
	'use strict';

	function vecEncoder(length) {
		return function (value) {
			var body = value.map(formats.float.encode).join(', ');
			return 'vec' + length + '(' + body + ')';
		};
	}

	function vecDecoder(length) {
		return function (string) {
			var openParen = string.indexOf('(');
			var closedParen = string.indexOf(')');

			var body = string.substring(openParen + 1, closedParen);

			return body.split(', ').map(formats.float.decode);
		};
	}

	var formats = {
		float: {
			encode: function (value) {
				if (value.toString().indexOf('.') === -1) {
					return value.toFixed(1);
				} else {
					return value.toString();
				}
			},
			decode: parseFloat
		},
		int: {
			encode: function (value) {
				return value.toFixed(0);
			},
			decode: function (string) {
				return parseInt(string, 10);
			}
		},
		vec2: {
			encode: vecEncoder(2),
			decode: vecDecoder(2)
		},
		vec3: {
			encode: vecEncoder(3),
			decode: vecDecoder(3)
		},
		vec4: {
			encode: vecEncoder(4),
			decode: vecDecoder(4)
		}
	};

	function encode(value, format) {
		return formats[format].encode(value);
	}

	function decode(string, format) {
		return formats[format].decode(string);
	}

	var DataFormatter = {
		encode: encode,
		decode: decode
	};

	window.shaderBits = window.shaderBits || {};
	window.shaderBits.DataFormatter = DataFormatter;
})();
