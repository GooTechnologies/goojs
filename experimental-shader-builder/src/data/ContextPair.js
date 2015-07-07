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
			vertex: {
				structure: this.vertexContext.structureToJson(),
				typeDefinitions: this.vertexContext.typeDefinitions
			},
			fragment: {
				structure: this.fragmentContext.structureToJson(),
				typeDefinitions: this.fragmentContext.typeDefinitions
			}
		};
	};

	return ContextPair;
});
