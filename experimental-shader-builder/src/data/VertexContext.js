(function () {
	'use strict';

	var Context = shaderBits.Context;
	var BaseTypeDefinitions = shaderBits.BaseTypeDefinitions;
	var ExternalOutputNode = shaderBits.ExternalOutputNode;

	function VertexContext(_typeDefinitions) {
		// shallow clone the original type defintions
		var typeDefinitions = _.clone(_typeDefinitions);

		// and add our own (glsl specific gl_Position, gl_FragColor et al)
		typeDefinitions.position = BaseTypeDefinitions.vertex.position;
		typeDefinitions.pointSize = BaseTypeDefinitions.vertex.pointSize;

		Context.call(this, typeDefinitions);

		// create instances of special nodes
		this.position = this.createPosition();
		this.pointSize = this.createPointSize();
	}

	VertexContext.prototype = Object.create(Context.prototype);
	VertexContext.prototype.constructor = Context;

	// varyings created in the vertex context can connect to nodes in the fragment context
	// varyings created in the fragment context can receive connections from the vertex context
	// too ambitious?
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

	window.shaderBits = window.shaderBits || {};
	window.shaderBits.VertexContext = VertexContext;
})();