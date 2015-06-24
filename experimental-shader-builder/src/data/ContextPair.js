(function () {
	'use strict';

	var VertexContext = shaderBits.VertexContext;
	var FragmentContext = shaderBits.FragmentContext;

	function ContextPair(typeDefintions) {
		this.typeDefintions = typeDefintions;

		this.vertexContext = new VertexContext(this.typeDefintions);
		this.vertexContext.contextPair = this;

		this.fragmentContext = new FragmentContext(this.typeDefintions);
		this.fragmentContext.contextPair = this;
	}

	ContextPair.prototype.structuresToJSON = function () {
		return {
			vertex: this.vertexContext.structureToJSON(),
			fragment: this.fragmentContext.structureToJSON()
		};
	};

	window.shaderBits = window.shaderBits || {};
	window.shaderBits.ContextPair = ContextPair;
})();
