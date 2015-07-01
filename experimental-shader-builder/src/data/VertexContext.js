define([
	'shader-bits/data/Context',
	'shader-bits/data/BaseTypeDefinitions',
	'shader-bits/data/ExternalOutputNode'
], function (
	Context,
	BaseTypeDefinitions,
	ExternalOutputNode
) {
	'use strict';

	function VertexContext(_typeDefinitions) {
		var typeDefinitions = {};

		_.extend(
			typeDefinitions,
			BaseTypeDefinitions.all,
			BaseTypeDefinitions.vertex,
			_typeDefinitions
		);

		Context.call(this, typeDefinitions);

		// create instances of special nodes
		this.position = this.createPosition();
		this.pointSize = this.createPointSize();
	}

	VertexContext.prototype = Object.create(Context.prototype);
	VertexContext.prototype.constructor = Context;

	VertexContext.prototype.createVarying = function (name, dataType) {
		var node = new ExternalOutputNode(this.generateId(), {
			name: name,
			inputType: 'varying',
			dataType: dataType
		});
		node._context = this;

		this.structure.addNode(node);

		return node;
	};

	return VertexContext;
});