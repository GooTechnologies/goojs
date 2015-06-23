(function () {
	'use strict';

	function vecEncoder(length) {
		return function (data) {
			// can't just use `map`; the size of the array matters too
			var ret = [];
			for (var i = 0; i < length; i++) {
				ret.push(formats.float.encode(data[i]));
			}
			return ret;
		};
	}

	function vecDecoder(length) {
		return function (data) {
			// can't just use `map`; the size of the array matters too
			var ret = [];
			for (var i = 0; i < length; i++) {
				ret.push(formats.float.decode(data[i]));
			}
			return ret;
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
