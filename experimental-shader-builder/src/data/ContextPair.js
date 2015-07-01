define([
	'shader-bits/data/VertexContext',
	'shader-bits/data/FragmentContext'
], function (
	VertexContext,
	FragmentContext
) {
	'use strict';

	function ContextPair(typeDefinitions) {
		this.typeDefinitions = typeDefinitions;

		this.vertexContext = new VertexContext(this.typeDefinitions);
		this.vertexContext.contextPair = this;

		this.fragmentContext = new FragmentContext(this.typeDefinitions);
		this.fragmentContext.contextPair = this;
	}

	ContextPair.prototype.toJson = function () {
		return {
			vertex: this.vertexContext.structureToJson(),
			fragment: this.fragmentContext.structureToJson()
		};
	};

	return ContextPair;
});
