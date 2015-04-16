define([
	'goo/entities/Selection'
], function (
	Selection
) {
	'use strict';

	/**
	 * A specialised selection object for entities
	 * @extends Selection
	 */
	function EntitySelection() {
		Selection.apply(this, arguments);
	}

	EntitySelection.prototype = Object.create(Selection.prototype);
	EntitySelection.prototype.constructor = EntitySelection;

	/**
	 * Adds entities to this selection. Any resulting duplicates are removed.
	 * @param {Entity | Entity[] | Entity... | EntitySelection} entities The entities to add
	 * @returns {EntitySelection} Returns self to allow chaining
	 * @example-link http://code.gooengine.com/latest/examples/goo/entities/EntitySelection/EntitySelection-setOps-example.html Working example
	 */
	EntitySelection.prototype.and = function () {
		if (this.top === null) { return this; }

		var union;

		var entities = toArray.apply(null, arguments);

		//! AT: this long/short separation only minimizes the number of ifs performed
		// while costing more memory (which is allocated on the stack anyways since the hashTable array never leaves this function
		// would love to see a benchmark though
		var shortArray, longArray;
		if (entities.length > this.top.length) {
			shortArray = this.top;
			longArray = entities;
		} else {
			shortArray = entities;
			longArray = this.top;
		}

		var hashTable = [];
		for (var i = 0; i < longArray.length; i++) {
			var id = longArray[i].id;
			hashTable[id] = true;
		}

		union = longArray.concat([]);

		for (var i = 0; i < shortArray.length; i++) {
			if (!hashTable[shortArray[i].id]) {
				union.push(shortArray[i]);
			}
		}

		this.stack.push(union);
		this.top = union;

		return this;
	};

	/**
	 * Returns the common entities between this selection and the given parameter(s)
	 * @param {Entity | Entity[] | Entity... | EntitySelection} entities
	 * @returns {EntitySelection} Returns self to allow chaining
	 * @example-link http://code.gooengine.com/latest/examples/goo/entities/EntitySelection/EntitySelection-setOps-example.html Working example
	 */
	EntitySelection.prototype.intersects = function () {
		if (this.top === null) { return this; }

		var intersection;

		var entities = toArray.apply(null, arguments);

		//! AT: this long/short separation only minimizes the number of ifs performed
		// while costing more memory (which is allocated on the stack anyways since the hashTable array never leaves this function
		// would love to see a benchmark though
		var shortArray, longArray;
		if (entities.length > this.top.length) {
			shortArray = this.top;
			longArray = entities;
		} else {
			shortArray = entities;
			longArray = this.top;
		}

		var hashTable = [];
		for (var i = 0; i < longArray.length; i++) {
			var id = longArray[i].id;
			hashTable[id] = true;
		}

		intersection = [];
		for (var i = 0; i < shortArray.length; i++) {
			if (hashTable[shortArray[i].id]) {
				intersection.push(shortArray[i]);
			}
		}

		this.stack.push(intersection);
		this.top = intersection;

		return this;
	};

	/**
	 * Removes entities from the current selection
	 * @param {Entity | Entity[] | Entity... | EntitySelection} entities Entities to remove from the selection
	 * @returns {EntitySelection} Returns self to allow chaining
	 * @example-link http://code.gooengine.com/latest/examples/goo/entities/EntitySelection/EntitySelection-setOps-example.html Working example
	 */
	EntitySelection.prototype.without = function () {
		if (this.top === null) { return this; }

		var difference;

		var entities = toArray.apply(null, arguments);

		var hashTable = [];
		for (var i = 0; i < entities.length; i++) {
			var id = entities[i].id;
			hashTable[id] = true;
		}

		difference = [];
		for (var i = 0; i < this.top.length; i++) {
			if (!hashTable[this.top[i].id]) {
				difference.push(this.top[i]);
			}
		}

		this.stack.push(difference);
		this.top = difference;

		return this;
	};

	/**
	 * Adds the previous selection to the current selection. Resulting duplicates are removed.
	 * @returns {EntitySelection} Returns self to allow chaining
	 */
	EntitySelection.prototype.andSelf = function () {
		if (this.top === null) { return this; }

		if (this.stack.length <= 1) { return this; }

		var prev = this.stack[this.stack.length - 2];

		return this.and.apply(this, prev);
	};

	//! AT: the transform component/system should install these
	/**
	 * Returns the parents of all entities in this selection
	 * @returns {EntitySelection} Returns self to allow chaining
	 * @example-link http://code.gooengine.com/latest/examples/goo/entities/EntitySelection/EntitySelection-parent-example.html Working example
	 */
	EntitySelection.prototype.parent = function () {
		if (this.top === null) { return this; }

		var hashTable = [];

		var parents = this.top.filter(function (entity) {
			if (!entity.transformComponent.parent) {
				return false;
			} else if (hashTable[entity.transformComponent.parent.entity.id]) {
				return false;
			} else {
				hashTable[entity.transformComponent.parent.entity.id] = true;
				return true;
			}
		}).map(function (entity) {
			return entity.transformComponent.parent.entity;
		});
		this.stack.push(parents);
		this.top = parents;

		return this;
	};

	/**
	 * Returns the children of all entities in this selection
	 * @returns {EntitySelection} Returns self to allow chaining
	 * @example-link http://code.gooengine.com/latest/examples/goo/entities/EntitySelection/EntitySelection-children-example.html Working example
	 */
	EntitySelection.prototype.children = function () {
		// could use flatMap
		if (this.top === null) { return this; }

		var children = this.top.map(function (entity) {
			return entity.transformComponent.children.map(function (childTransform) {
				return childTransform.entity;
			});
		});
		var flatChildren = children.reduce(function (prev, cur) { return prev.concat(cur); }, []);
		this.stack.push(flatChildren);
		this.top = flatChildren;

		return this;
	};

	/**
	 * Installs a method that acts upon entities on the prototype of EntitySelection
	 * @hidden
	 * @param method
	 * @param name
	 * @param dependentComponent
	 */
	EntitySelection.installMethod = function (method, name, dependentComponent) {
		EntitySelection.prototype[name] = function () {
			if (this.top === null) { return this; }

			for (var i = 0; i < this.top.length; i++) {
				var entity = this.top[i];

				if (entity.hasComponent(dependentComponent)) {
					method.apply(entity, arguments);
				}
			}

			return this;
		};
	};

	/**
	 * Converts anything (nothing, an EntitySelection, an array or more arguments) to an array
	 * @memberOf EntitySelection#
	 * @private
	 * @returns {*}
	 */
	function toArray() {
		if (arguments.length === 1) {
			var argument = arguments[0];
			if (argument instanceof EntitySelection) {
				if (argument.top) {
					return argument.top;
				} else {
					return [];
				}
			} else if (Array.isArray(argument)) {
				return argument;
			} else {
				return [argument];
			}
		} else if (arguments.length > 1) {
			return Array.prototype.slice.call(arguments, 0);
		} else {
			return [];
		}
	}

	return EntitySelection;
});