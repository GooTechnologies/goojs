var ObjectUtils = require('../util/ObjectUtils');
var Vec2 = require('../math/Vec2');
var Vec3 = require('../math/Vec3');
var Vec4 = require('../math/Vec4');

function ParameterUtils() {}

ParameterUtils.DEFAULTS_BY_TYPE = {
	'array': [],
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
	'texture': null,
	'json': null,
	'text': null
};

ParameterUtils.REF_TYPES = [
	'animation',
	'camera',
	'entity',
	'image',
	'sound',
	'texture',
	'json',
	'text'
];

ParameterUtils.isRefType = function (type) {
	return ObjectUtils.contains(ParameterUtils.REF_TYPES, type);
};

ParameterUtils.TYPE_VALIDATORS = (function () {
	var isVec = function (length) {
		return function (data) {
			return Array.isArray(data) && data.length === length;
		};
	};

	var isRef = function (type) {
		function isDirectRef(data) {
			return ObjectUtils.isString(data) && ObjectUtils.getExtension(data) === type;
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
		'array': ObjectUtils.isArray,
		'float': ObjectUtils.isNumber,
		'number': ObjectUtils.isNumber,
		'string': ObjectUtils.isString,
		'boolean': ObjectUtils.isBoolean,
		'int': ObjectUtils.isInteger,
		'vec2': isVec(2),
		'vec3': isVec(3),
		'vec4': isVec(4),
		'animation': isRef('animation'),
		'camera': isRef('camera'),
		'entity': isRef('entity'),
		'image': isRef('image'),
		'sound': isRef('sound'),
		'texture': isRef('texture'),
		'json': isRef('json'),
		'text': isRef('text')
	};
})();

// The types that are allowed for script parameters.
ParameterUtils.PARAMETER_TYPES = [
	'string',
	'int',
	'float',
	'vec2',
	'vec3',
	'vec4',
	'boolean',
	'texture',
	'sound',
	'camera',
	'entity',
	'animation',
	'json',
	'text'
];

// Specifies which controls can be used with each type.
ParameterUtils.PARAMETER_CONTROLS = (function () {
	var typeControls = {
		'string': ['key'],
		'int': ['spinner', 'slider', 'jointSelector'],
		'float': ['spinner', 'slider'],
		'vec2': [],
		'vec3': ['color'],
		'vec4': ['color'],
		'boolean': ['checkbox'],
		'texture': [],
		'sound': [],
		'camera': [],
		'entity': [],
		'animation': [],
		'json': [],
		'text': []
	};

	// Add the controls that can be used with any type to the mapping of
	// controls that ca be used for each type.
	for (var type in typeControls) {
		Array.prototype.push.apply(typeControls[type], ['dropdown', 'select']);
	}

	return typeControls;
})();

// Types used to validate the properties of a script parameter config.
ParameterUtils.PROPERTY_TYPES = [
	{
		prop: 'key',
		type: 'string',
		mustBeDefined: true,
		minLength: 1
	},
	{
		prop: 'type',
		type: 'string',
		mustBeDefined: true,
		minLength: 1,
		getAllowedValues: function () {
			return ParameterUtils.PARAMETER_TYPES;
		}
	},
	{
		prop: 'control',
		type: 'string',
		getAllowedValues: function (parameter) {
			// Allowed controls depend on the parameter type.
			return ParameterUtils.PARAMETER_CONTROLS[parameter.type];
		}
	},
	{ prop: 'name', type: 'string' },
	{ prop: 'min', type: 'number' },
	{ prop: 'max', type: 'number' },
	{ prop: 'scale', type: 'number' },
	{ prop: 'decimals', type: 'number' },
	{ prop: 'precision', type: 'number' },
	{ prop: 'exponential', type: 'boolean' }
];

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
			spec.default = ObjectUtils.deepClone(ParameterUtils.DEFAULTS_BY_TYPE[spec.type]);
		}

		keys.push(spec.key);
		if (typeof parameters[spec.key] === 'undefined') {
			parameters[spec.key] = ObjectUtils.clone(spec.default);
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

var returnFirstArgument = function (n) { return n; };

// Convert serialized parameters to engine types.
ParameterUtils.engineTypeParsers = {
	'array': function (a) {
        return a.slice(0); // TODO: recursive parsing? How to get the types of items?
    },
	'float': returnFirstArgument,
	'int': returnFirstArgument,
	'string': returnFirstArgument,
	'vec2': function (v) { return new Vec2(v); },
	'vec3': function (v) { return new Vec3(v); },
	'vec4': function (v) { return new Vec4(v); },
	'boolean': returnFirstArgument,
	'animation': returnFirstArgument,
	'camera': returnFirstArgument,
	'entity': returnFirstArgument,
	'image': returnFirstArgument,
	'sound': returnFirstArgument,
	'texture': returnFirstArgument,
	'json': returnFirstArgument,
	'text': returnFirstArgument
};

ParameterUtils.toEngineTypes = function (parameters, specs) {
    var newParams = {};
    var paramToType = {};
    specs.forEach(function (spec) {
       paramToType[spec.key] = spec.type;
    });

    for (var key in parameters) {
        var type = paramToType[key];
        if (type && ParameterUtils.engineTypeParsers[type]) {
            newParams[key] = ParameterUtils.engineTypeParsers[type](parameters[key]);
        }
    }

    return newParams;
}

module.exports = ParameterUtils;