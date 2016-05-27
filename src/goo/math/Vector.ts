/**
 * Abstract vector class
 */
function Vector(size) {

	/**
	 * @hidden
	 * @deprecated
	 */
	this._size = size;
}

var COMPONENT_NAMES = ['x', 'y', 'z', 'w'];
// @ifdef DEBUG
var COMPONENT_NAMES = ['_x', '_y', '_z', '_w'];
// @endif

/**
 * Binds aliases to the different vector components.
 * @hidden
 * @param {Object} prototype The prototype to bind to.
 * @param {Array<Array<string>>} aliases Array of component aliases for each component index.
 */
Vector.setupAliases = function (prototype, aliases) {
	aliases.forEach(function (aliasesPerComponent, index) {
		var componentName = COMPONENT_NAMES[index];

		aliasesPerComponent.forEach(function (alias) {
			Object.defineProperty(prototype, alias, {
				get: function () {
					return this[componentName];
				},
				set: function (value) {
					this[componentName] = value;

					// @ifdef DEBUG
					if (isNaN(this[componentName])) {
						throw new Error('Tried setting NaN to vector component ' + alias);
					}
					// @endif
				}
			});
		});
	});
};

// @ifdef DEBUG
Vector.setupIndices = function (prototype, count) {
	var raise = function () {
		throw new Error('Vector component access through indices is not supported anymore');
	};

	for (var i = 0; i < count; i++) {
		Object.defineProperty(prototype, i, {
			get: raise,
			set: raise
		});
	}
};

/**
 * Replaces the supplied method of object and wraps it in a integrity check
 * @hidden
 * @param {Object} object The object to attach the post-check to
 * @param {string} methodName The name of the original method the check is attached to
 */
Vector.addReturnCheck = function (object, methodName) {
	var originalMethod = object[methodName];
	object[methodName] = function () {
		var ret = originalMethod.apply(this, arguments);
		if (isNaN(ret)) {
			throw new Error('Vector method ' + methodName + ' returned NaN');
		}

		return ret;
	};
};

/**
 * Adds more validators at once
 * @hidden
 * @param {Object} object
 * @param {Array<string>} methodNames
 */
Vector.addReturnChecks = function (object, methodNames) {
	methodNames.forEach(Vector.addReturnCheck.bind(null, object));
};
// @endif

export = Vector;
