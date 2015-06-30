(function () {
	'use strict';

	var Context = shaderBits.Context;
	var BaseTypeDefinitions = shaderBits.BaseTypeDefinitions;

	function FragmentContext(_typeDefinitions) {
		// shallow clone the original type definitions
		var typeDefinitions = _.clone(_typeDefinitions);

		// and extend with predefined shader bits
		_.extend(typeDefinitions, BaseTypeDefinitions.all);
		_.extend(typeDefinitions, BaseTypeDefinitions.fragment);

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