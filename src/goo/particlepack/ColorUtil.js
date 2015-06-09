/*jshint bitwise: false*/
define([
	'goo/math/Vector4'
],
/** @lends */
function(
	Vector4
) {
	"use strict";

	/**
	 * @class Color conversion utilities
	 */

	function ColorUtil() {}

	ColorUtil.arrayToVector4 = function(array, store) {
		store = store || new Vector4();

		store.setArray(array);

		return store;
	};

	/** 
	 * Convert from hexadecimal to array with [r, g, b] in the range 0..1
	 * @param {Number} hex Color in hexadecimal format
	 * @param {Number[]} [store]
	 */
	ColorUtil.hexToArray = function(hex, store) {
		store = store || [];

		hex = Math.floor(hex);

		store[0] = ((hex >> 16) & 255) / 255;
		store[1] = ((hex >> 8) & 255) / 255;
		store[2] = (hex & 255) / 255;

		return store;
	};

	ColorUtil.arrayToHex = function(array) {
		return (array[0] * 255) << 16 ^ (array[1] * 255) << 8 ^ (array[2] * 255) << 0;
	};

	ColorUtil.arrayToHexString = function(array) {
		return ('000000' + ColorUtil.arrayToHex(array).toString(16)).slice(-6);
	};

	var testrgb1 = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i;
	var testrgb2 = /^rgb\(\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*\)$/i;
	var testhex3 = /^\#([0-9a-f])([0-9a-f])([0-9a-f])$/i;
	var testhex6 = /^\#([0-9a-f]{6})$/i;
	var testcolor = /^(\w+)$/i;

	ColorUtil.cssToArray = function(style, store) {
		store = store || [];

		// rgb(255,255,255)
		if (testrgb1.test(style)) {
			var color = testrgb1.exec(style);

			store[0] = Math.min(255, parseInt(color[1], 10)) / 255;
			store[1] = Math.min(255, parseInt(color[2], 10)) / 255;
			store[2] = Math.min(255, parseInt(color[3], 10)) / 255;

			return store;
		}

		// rgb(100%,100%,100%)
		if (testrgb2.test(style)) {
			var color = testrgb2.exec(style);

			store[0] = Math.min(100, parseInt(color[1], 10)) / 100;
			store[1] = Math.min(100, parseInt(color[2], 10)) / 100;
			store[2] = Math.min(100, parseInt(color[3], 10)) / 100;

			return store;
		}

		// #ffffff
		if (testhex6.test(style)) {
			var color = testhex6.exec(style);

			return this.hexToArray(parseInt(color[1], 16), store);
		}

		// #fff
		if (testhex3.test(style)) {
			var color = testhex3.exec(style);

			return this.hexToArray(parseInt(color[1] + color[1] + color[2] + color[2] + color[3] + color[3], 16), store);
		}

		// white
		if (testcolor.test(style)) {
			return this.hexToArray(ColorUtil.color[style], store);
		}

		console.warn('No matching style found');
		store[0] = store[1] = store[2] = 0;
		return store;
	};

	ColorUtil.HSLToArray = function(h, s, l, store) {
		store = store || [];

		if (s === 0) {
			store[0] = store[1] = store[2] = l;
		} else {
			var hue2rgb = function(p, q, t) {
				if (t < 0) {
					t += 1;
				}
				if (t > 1) {
					t -= 1;
				}
				if (t < 1 / 6) {
					return p + (q - p) * 6 * t;
				}
				if (t < 1 / 2) {
					return q;
				}
				if (t < 2 / 3) {
					return p + (q - p) * 6 * (2 / 3 - t);
				}
				return p;
			};

			var p = l <= 0.5 ? l * (1 + s) : l + s - (l * s);
			var q = (2 * l) - p;

			store[0] = hue2rgb(q, p, h + 1 / 3);
			store[1] = hue2rgb(q, p, h);
			store[2] = hue2rgb(q, p, h - 1 / 3);
		}

		return store;
	};

	ColorUtil.arrayToHSL = function(array, store) {
		store = store || [];

		var r = array[0],
			g = array[1],
			b = array[2];

		var max = Math.max(r, g, b);
		var min = Math.min(r, g, b);

		var hue, saturation;
		var lightness = (min + max) / 2.0;

		if (min === max) {
			hue = 0;
			saturation = 0;
		} else {
			var delta = max - min;
			saturation = lightness <= 0.5 ? delta / (max + min) : delta / (2 - max - min);

			switch (max) {
				case r:
					hue = (g - b) / delta + (g < b ? 6 : 0);
					break;
				case g:
					hue = (b - r) / delta + 2;
					break;
				case b:
					hue = (r - g) / delta + 4;
					break;
			}

			hue /= 6;
		}

		store[0] = hue;
		store[1] = saturation;
		store[2] = lightness;

		return store;
	};

	ColorUtil.HSBToArray = function(hue, saturation, brightness, store) {
		store = store || [];

		var r = 0,
			g = 0,
			b = 0;
		if (saturation === 0) {
			r = g = b = brightness;
		} else {
			var h = (hue - Math.floor(hue)) * 6.0;
			var f = h - Math.floor(h);
			var p = brightness * (1.0 - saturation);
			var q = brightness * (1.0 - saturation * f);
			var t = brightness * (1.0 - saturation * (1.0 - f));
			switch (h) {
				case 0:
					r = brightness;
					g = t;
					b = p;
					break;
				case 1:
					r = q;
					g = brightness;
					b = p;
					break;
				case 2:
					r = p;
					g = brightness;
					b = t;
					break;
				case 3:
					r = p;
					g = q;
					b = brightness;
					break;
				case 4:
					r = t;
					g = p;
					b = brightness;
					break;
				case 5:
					r = brightness;
					g = p;
					b = q;
					break;
			}
		}

		store[0] = r;
		store[1] = g;
		store[2] = b;

		return store;
	};

	ColorUtil.arrayToHSB = function(array, store) {
		store = store || [];

		var r = array[0],
			g = array[1],
			b = array[2];

		var hue, saturation, brightness;
		var cmax = r > g ? r : g;
		if (b > cmax) {
			cmax = b;
		}
		var cmin = r < g ? r : g;
		if (b < cmin) {
			cmin = b;
		}

		brightness = cmax / 255.0;
		if (cmax !== 0) {
			saturation = (cmax - cmin) / cmax;
		} else {
			saturation = 0;
		}
		if (saturation === 0) {
			hue = 0;
		} else {
			var redc = (cmax - r) / (cmax - cmin);
			var greenc = (cmax - g) / (cmax - cmin);
			var bluec = (cmax - b) / (cmax - cmin);
			if (r === cmax) {
				hue = bluec - greenc;
			} else if (g === cmax) {
				hue = 2.0 + redc - bluec;
			} else {
				hue = 4.0 + greenc - redc;
			}
			hue = hue / 6.0;
			if (hue < 0) {
				hue = hue + 1.0;
			}
		}

		store[0] = hue;
		store[1] = saturation;
		store[2] = brightness;

		return store;
	};

	ColorUtil.arrayToCSS = function(array) {
		return 'rgb(' + ((array[0] * 255) | 0) + ',' + ((array[1] * 255) | 0) + ',' + ((array[2] * 255) | 0) + ')';
	};

	ColorUtil.color = {
		"aliceblue": 0xF0F8FF,
		"antiquewhite": 0xFAEBD7,
		"aqua": 0x00FFFF,
		"aquamarine": 0x7FFFD4,
		"azure": 0xF0FFFF,
		"beige": 0xF5F5DC,
		"bisque": 0xFFE4C4,
		"black": 0x000000,
		"blanchedalmond": 0xFFEBCD,
		"blue": 0x0000FF,
		"blueviolet": 0x8A2BE2,
		"brown": 0xA52A2A,
		"burlywood": 0xDEB887,
		"cadetblue": 0x5F9EA0,
		"chartreuse": 0x7FFF00,
		"chocolate": 0xD2691E,
		"coral": 0xFF7F50,
		"cornflowerblue": 0x6495ED,
		"cornsilk": 0xFFF8DC,
		"crimson": 0xDC143C,
		"cyan": 0x00FFFF,
		"darkblue": 0x00008B,
		"darkcyan": 0x008B8B,
		"darkgoldenrod": 0xB8860B,
		"darkgray": 0xA9A9A9,
		"darkgreen": 0x006400,
		"darkgrey": 0xA9A9A9,
		"darkkhaki": 0xBDB76B,
		"darkmagenta": 0x8B008B,
		"darkolivegreen": 0x556B2F,
		"darkorange": 0xFF8C00,
		"darkorchid": 0x9932CC,
		"darkred": 0x8B0000,
		"darksalmon": 0xE9967A,
		"darkseagreen": 0x8FBC8F,
		"darkslateblue": 0x483D8B,
		"darkslategray": 0x2F4F4F,
		"darkslategrey": 0x2F4F4F,
		"darkturquoise": 0x00CED1,
		"darkviolet": 0x9400D3,
		"deeppink": 0xFF1493,
		"deepskyblue": 0x00BFFF,
		"dimgray": 0x696969,
		"dimgrey": 0x696969,
		"dodgerblue": 0x1E90FF,
		"firebrick": 0xB22222,
		"floralwhite": 0xFFFAF0,
		"forestgreen": 0x228B22,
		"fuchsia": 0xFF00FF,
		"gainsboro": 0xDCDCDC,
		"ghostwhite": 0xF8F8FF,
		"gold": 0xFFD700,
		"goldenrod": 0xDAA520,
		"gray": 0x808080,
		"green": 0x008000,
		"greenyellow": 0xADFF2F,
		"grey": 0x808080,
		"honeydew": 0xF0FFF0,
		"hotpink": 0xFF69B4,
		"indianred": 0xCD5C5C,
		"indigo": 0x4B0082,
		"ivory": 0xFFFFF0,
		"khaki": 0xF0E68C,
		"lavender": 0xE6E6FA,
		"lavenderblush": 0xFFF0F5,
		"lawngreen": 0x7CFC00,
		"lemonchiffon": 0xFFFACD,
		"lightblue": 0xADD8E6,
		"lightcoral": 0xF08080,
		"lightcyan": 0xE0FFFF,
		"lightgoldenrodyellow": 0xFAFAD2,
		"lightgray": 0xD3D3D3,
		"lightgreen": 0x90EE90,
		"lightgrey": 0xD3D3D3,
		"lightpink": 0xFFB6C1,
		"lightsalmon": 0xFFA07A,
		"lightseagreen": 0x20B2AA,
		"lightskyblue": 0x87CEFA,
		"lightslategray": 0x778899,
		"lightslategrey": 0x778899,
		"lightsteelblue": 0xB0C4DE,
		"lightyellow": 0xFFFFE0,
		"lime": 0x00FF00,
		"limegreen": 0x32CD32,
		"linen": 0xFAF0E6,
		"magenta": 0xFF00FF,
		"maroon": 0x800000,
		"mediumaquamarine": 0x66CDAA,
		"mediumblue": 0x0000CD,
		"mediumorchid": 0xBA55D3,
		"mediumpurple": 0x9370DB,
		"mediumseagreen": 0x3CB371,
		"mediumslateblue": 0x7B68EE,
		"mediumspringgreen": 0x00FA9A,
		"mediumturquoise": 0x48D1CC,
		"mediumvioletred": 0xC71585,
		"midnightblue": 0x191970,
		"mintcream": 0xF5FFFA,
		"mistyrose": 0xFFE4E1,
		"moccasin": 0xFFE4B5,
		"navajowhite": 0xFFDEAD,
		"navy": 0x000080,
		"oldlace": 0xFDF5E6,
		"olive": 0x808000,
		"olivedrab": 0x6B8E23,
		"orange": 0xFFA500,
		"orangered": 0xFF4500,
		"orchid": 0xDA70D6,
		"palegoldenrod": 0xEEE8AA,
		"palegreen": 0x98FB98,
		"paleturquoise": 0xAFEEEE,
		"palevioletred": 0xDB7093,
		"papayawhip": 0xFFEFD5,
		"peachpuff": 0xFFDAB9,
		"peru": 0xCD853F,
		"pink": 0xFFC0CB,
		"plum": 0xDDA0DD,
		"powderblue": 0xB0E0E6,
		"purple": 0x800080,
		"red": 0xFF0000,
		"rosybrown": 0xBC8F8F,
		"royalblue": 0x4169E1,
		"saddlebrown": 0x8B4513,
		"salmon": 0xFA8072,
		"sandybrown": 0xF4A460,
		"seagreen": 0x2E8B57,
		"seashell": 0xFFF5EE,
		"sienna": 0xA0522D,
		"silver": 0xC0C0C0,
		"skyblue": 0x87CEEB,
		"slateblue": 0x6A5ACD,
		"slategray": 0x708090,
		"slategrey": 0x708090,
		"snow": 0xFFFAFA,
		"springgreen": 0x00FF7F,
		"steelblue": 0x4682B4,
		"tan": 0xD2B48C,
		"teal": 0x008080,
		"thistle": 0xD8BFD8,
		"tomato": 0xFF6347,
		"turquoise": 0x40E0D0,
		"violet": 0xEE82EE,
		"wheat": 0xF5DEB3,
		"white": 0xFFFFFF,
		"whitesmoke": 0xF5F5F5,
		"yellow": 0xFFFF00,
		"yellowgreen": 0x9ACD32
	};

	return ColorUtil;
});