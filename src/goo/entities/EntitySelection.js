define(['goo/entities/Selection'], function (Selection) {
	'use strict';

	function EntitySelection() {
		Selection.apply(this, arguments);
	}

	EntitySelection.prototype = Object.create(Selection.prototype);
	EntitySelection.prototype.constructor = EntitySelection;



	// all of these should be optimised for entities since they have ids
	// momentarily their base class counterparts are used instead

	// set ops
	EntitySelection.prototype.and = function (that) {
		var union;

		var that = toArray.apply(null, arguments);

		//! AT: this long/short separation only minimizes the number of ifs performed
		// while costing more memory (which is allocated on the stack anyways since the hashTable array never leaves this function
		// would love to see a benchmark though
		var shortArray, longArray;
		if (that.length > this.top.length) {
			shortArray = this.top;
			longArray = that;
		} else {
			shortArray = that;
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


	EntitySelection.prototype.intersects = function (that) {
		var intersection;

		var that = toArray.apply(null, arguments);

		//! AT: this long/short separation only minimizes the number of ifs performed
		// while costing more memory (which is allocated on the stack anyways since the hashTable array never leaves this function
		// would love to see a benchmark though
		var shortArray, longArray;
		if (that.length > this.top.length) {
			shortArray = this.top;
			longArray = that;
		} else {
			shortArray = that;
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

	EntitySelection.prototype.without = function (that) {
		var difference;

		var that = toArray.apply(null, arguments);

		var hashTable = [];
		for (var i = 0; i < that.length; i++) {
			var id = that[i].id;
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


	//! AT: the transform component/system should install these
	/**
	 * Returns the parents of all entities in this selection
	 */
	EntitySelection.prototype.parent = function () {
		if (this.top === null) { return this; }

		var parents = this.top.filter(function (entity) {
			return !!entity.transformComponent.parent;
		}).map(function (entity) {
			return entity.transformComponent.parent.entity;
		});
		this.stack.push(parents);
		this.top = parents;

		return this;
	};

	/**
	 * Returns the children of all entities in this selection
	 */
	EntitySelection.prototype.children = function () {
		// could use flatMap
		if (this.top === null) { return this; }

		var children = this.top.map(function(entity) {
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
	 * Converts anything (nothing, a Selection, an array or more arguments) to an array
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