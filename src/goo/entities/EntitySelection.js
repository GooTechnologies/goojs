define(['goo/entities/Selection'], function (Selection) {
	'use strict';

	function EntitySelection() {
		Selection.apply(this, arguments);
	}

	EntitySelection.prototype = Object.create(Selection.prototype);
	EntitySelection.prototype.constructor = EntitySelection;


	/*
	// all of these should be optimised for entities since they have ids
	// momentarily their base class counterparts are used instead

	// set ops
	EntitySelection.prototype.and = function (that) {
		// optimise this for entities by using hashes
	};

	EntitySelection.prototype.intersects = function (that) {
		// optimise this for entities by using hashes
	};

	EntitySelection.prototype.without = function (that) {
		// optimise this for entities by using hashes
	};
	*/


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

	return EntitySelection;
});