(function () {
	'use strict';

	function TypeDefinition(inputs, outputs, defines, body) {
		this.inputs = inputs;
		this.outputs = outputs;
		this.defines = defines;
		this.body = body;
	}

	window.shaderBits = window.shaderBits || {};
	window.shaderBits.TypeDefinition = TypeDefinition;
})();
