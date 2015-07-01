define(function () {
	'use strict';

	function vecMatEncoder(type) {
		return function (value) {
			var body = value.map(formats.float.encode).join(', ');
			return type + '(' + body + ')';
		};
	}

	function vecMatDecoder(type) {
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
			encode: vecMatEncoder('vec2'),
			decode: vecMatDecoder('vec2')
		},
		vec3: {
			encode: vecMatEncoder('vec3'),
			decode: vecMatDecoder('vec3')
		},
		vec4: {
			encode: vecMatEncoder('vec4'),
			decode: vecMatDecoder('vec4')
		},
		mat2: {
			encode: vecMatEncoder('mat2'),
			decode: vecMatDecoder('mat2')
		},
		mat3: {
			encode: vecMatEncoder('mat3'),
			decode: vecMatDecoder('mat3')
		},
		mat4: {
			encode: vecMatEncoder('mat4'),
			decode: vecMatDecoder('mat4')
		}
	};

	function encode(value, format) {
		return formats[format] ? formats[format].encode(value) : value;
	}

	function decode(string, format) {
		return formats[format] ? formats[format].decode(string) : string;
	}

	return {
		encode: encode,
		decode: decode
	};
});
