(function () {
	'use strict';

	var Context = shaderBits.Context;
	var BaseTypeDefinitions = shaderBits.BaseTypeDefinitions;

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

	// varyings created in the vertex context can connect to nodes in the fragment context
	// varyings created in the fragment context can receive connections from the vertex context
	// too ambitious?
	//FragmentContext.prototype.createVarying = function (name, type) {
	//
	//};

	window.shaderBits = window.shaderBits || {};
	window.shaderBits.FragmentContext = FragmentContext;
})();