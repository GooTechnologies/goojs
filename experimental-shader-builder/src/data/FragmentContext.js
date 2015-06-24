(function () {
	'use strict';

	var Context = shaderBits.Context;

	function FragmentContext(typeDefinitions, contextPair) {
		Context.apply(this, arguments);


	}

	FragmentContext.prototype = Object.create(Context.prototype);
	FragmentContext.prototype.constructor = Context;

	// varyings created in the vertex context can connect to nodes in the fragment context
	// varyings created in the fragment context can receive connections from the vertex context
	// too ambitious?
	FragmentContext.prototype.createVarying = function (name, type) {

	};

	window.shaderBits = window.shaderBits || {};
	window.shaderBits.FragmentContext = FragmentContext;
})();