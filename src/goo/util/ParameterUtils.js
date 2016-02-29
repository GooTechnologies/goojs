define([
	'goo/util/ObjectUtils'
], function (
	_
) {
	'use strict';

	function ParameterUtils() {}

	ParameterUtils.DEFAULTS_BY_TYPE = {
		'float': 0,
		'int': 0,
		'string': '',
		'vec2': [0, 0],
		'vec3': [0, 0, 0],
		'vec4': [0, 0, 0, 0],
		'boolean': false,
		'animation': null,
		'camera': null,
		'entity': null,
		'image': null,
		'sound': null,
		'texture': null
	};

	ParameterUtils.REF_TYPES = [
		'animation',
		'camera',
		'entity',
		'image',
		'sound',
		'texture'
	];

	ParameterUtils.isRefType = function (type) {
		return _.contains(ParameterUtils.REF_TYPES, type);
	};

	ParameterUtils.TYPE_VALIDATORS = (function () {
		var isVec = function (length) {
			return function (data) {
				return Array.isArray(data) && data.length === length;
			};
		};

		var isRef = function (type) {
			function isDirectRef(data) {
				return _.isString(data) && _.getExtension(data) === type;
			}

			// Checks for references passed like:
			// {
			//     entityRef: string
			//     enabled: boolean
			// }
			function isWrappedRef(data) {
				return data && isDirectRef(data[type + 'Ref']);
			}

			return function (data) {
				return isDirectRef(data) || isWrappedRef(data);
			};
		};

		return {
			'float': _.isNumber,
			'string': _.isString,
			'boolean': _.isBoolean,
			'int': _.isInteger,
			'vec2': isVec(2),
			'vec3': isVec(3),
			'vec4': isVec(4),
			'animation': isRef('animation'),
			'camera': isRef('camera'),
			'entity': isRef('entity'),
			'image': isRef('image'),
			'sound': isRef('sound'),
			'texture': isRef('texture')
		};
	})();

	/**
	 * Fill a passed parameters object with defaults from spec
	 * @hidden
	 * @param parameters {Object} The type of object passed as parameters to a script
	 * @param specs {Array<{key, name, default, description}>}
	 */
	ParameterUtils.fillDefaultValues = function (parameters, specs) {
		if (!(specs instanceof Array)) { return; }

		var keys = [];
		specs.forEach(function (spec) {
			if (!spec || typeof spec.key !== 'string') {
				return;
			}

			if (spec.default === null || spec.default === undefined) {
				spec.default = _.deepClone(ParameterUtils.DEFAULTS_BY_TYPE[spec.type]);
			}

			keys.push(spec.key);
			if (typeof parameters[spec.key] === 'undefined') {
				parameters[spec.key] = _.clone(spec.default);
			}
		});

		//! AT: when does this ever happen?
		for (var key in parameters) {
			if (keys.indexOf(key) === -1 && key !== 'enabled') {
				delete parameters[key];
			}
		}
	};

	/**
	 * Fills specs' names with their prettyprinted keys (x -> x, maxX -> Max X, myBluePanda -> My Blue Panda)
	 * @hidden
	 * @param specs {Array<{key, name, default, description}>}
	 */
	ParameterUtils.fillDefaultNames = function (specs) {
		if (!(specs instanceof Array)) { return; }

		function getNameFromKey(key) {
			if (typeof key !== 'string' || key.length === 0) { return ''; }
			var capitalisedKey = key[0].toUpperCase() + key.slice(1);
			return capitalisedKey.replace(/(.)([A-Z])/g, '$1 $2');
		}

		specs.forEach(function (spec) {
			if (!spec) { return; }
			if (typeof spec.name === 'undefined') {
				spec.name = getNameFromKey(spec.key);
			}
		});
	};

	return ParameterUtils;
});