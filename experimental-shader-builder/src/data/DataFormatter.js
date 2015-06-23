(function () {
	'use strict';

	function vecEncoder(length) {
		return function (data) {
			var body = data.map(formats.float.encode).join(', ');
			return 'vec' + length + '(' + body + ')';
		};
	}

	function vecDecoder(length) {
		return function (data) {
			var openParen = data.indexOf('(');
			var closedParen = data.indexOf(')');

			var body = data.substring(openParen + 1, closedParen);

			return body.split(', ').map(formats.float.decode);
		};
	}

	var formats = {
		float: {
			encode: function (data) {
				if (data.toString().indexOf('.') === -1) {
					return data.toFixed(1);
				} else {
					return data.toString();
				}
			},
			decode: parseFloat
		},
		int: {
			encode: function (data) {
				return data.toFixed(0);
			},
			decode: function (data) {
				return parseInt(data, 10);
			}
		},
		'vec2': {
			encode: vecEncoder(2),
			decode: vecDecoder(2)
		},
		'vec3': {
			encode: vecEncoder(3),
			decode: vecDecoder(3)
		},
		'vec4': {
			encode: vecEncoder(4),
			decode: vecDecoder(4)
		}
	};

	function encode(data, format) {
		return formats[format].encode(data);
	}

	function decode(data, format) {
		return formats[format].decode(data);
	}

	var DataFormatter = {
		encode: encode,
		decode: decode
	};

	window.shaderBits = window.shaderBits || {};
	window.shaderBits.DataFormatter = DataFormatter;
})();
