define([
	'shader-bits/data/Context',
	'shader-bits/data/BaseTypeDefinitions',
	'shader-bits/data/ExternalInputNode'
], function (
	Context,
	BaseTypeDefinitions,
	ExternalInputNode
) {
	'use strict';

	/**
	 * A fragment-specific context
	 * @param _typeDefinitions
	 * @constructor
	 */
	function FragmentContext(_typeDefinitions) {
		var typeDefinitions = {};

		_.extend(
			typeDefinitions,
			BaseTypeDefinitions.all,
			BaseTypeDefinitions.fragment,
			_typeDefinitions
		);

		Context.call(this, typeDefinitions);

		// create instances of special nodes
		this.fragColor = this.createFragColor();
	}

	FragmentContext.prototype = Object.create(Context.prototype);
	FragmentContext.prototype.constructor = Context;

	/**
	 * Creates a varying node (usable only in the fragment context)
	 * @param name
	 * @param dataType
	 * @returns {ExternalInputNode}
	 */
	FragmentContext.prototype.createVarying = function (name, dataType) {
		var node = new ExternalInputNode(this.generateId(), {
			name: name,
			inputType: 'varying',
			dataType: dataType
		});
		node._context = this;

		this.structure.addNode(node);

		return node;
	};

	return FragmentContext;
});