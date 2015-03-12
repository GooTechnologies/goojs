define(function () {
	'use strict';

	function Vector() {}

	var COMPONENT_NAMES = ['_x', '_y', '_z', '_w'];

	/**
	 * Binds aliases to the different vector components.
	 * @hidden
	 * @param {Object} prototype The prototype to bind to.
	 * @param {string[][]} aliases Array of component aliases for each component index.
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

						// #ifdef DEBUG
						if (isNaN(this[componentName])) {
							throw new Error('Tried setting NaN to vector component ' + alias);
						}
						// #endif
					}
				});
			});

			Object.defineProperty(prototype, index, {
				get: function () {
					throw ''; // not allowed anymore
					return this[componentName];
				},
				set: function (value) {
					throw ''; // not allowed anymore
					this[componentName] = value;

					// #ifdef DEBUG
					if (isNaN(this[componentName])) {
						throw new Error('Tried setting NaN to vector component ' + index);
					}
					// #endif
				}
			});
		});
	};

	// #ifdef DEBUG
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
	 * @param {string[]} methodNames
	 */
	Vector.addReturnChecks = function (object, methodNames) {
		methodNames.forEach(Vector.addReturnCheck.bind(null, object));
	};
	// #endif

	return Vector;
});
