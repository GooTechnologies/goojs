require([
	'shader-bits/data/ContextPair',
	'util'
], function (
	ContextPair,
	Util
) {
	'use strict';

	// there's no value in building this out of so many boxes
	// except to serve as an example
	// this would normally be a box on its own
	function getSample(typeDefinitions) {
		var contextPair = new ContextPair(typeDefinitions);
		var context = contextPair.fragmentContext;


		var time = context.createUniform('time', 'float');

		var sin = context.createSin();
		sin.min = 0;
		sin.max = 1;

		time.connect(sin);

		var one = context.createConst();
		one.const = 1;

		var vec4 = context.createVec4();

		sin.connect(vec4.x); // red
		one.connect(vec4.w); // alpha has to be 1


		vec4.connect(context.fragColor);

		return contextPair.toJson();
	}

	Util.loadTypeDefinitions('s4', function (typeDefinitions) {
		// get back a vertex and a fragment shader
		var pair = getSample(typeDefinitions);

		delete pair.vertex; // there's already a default vertex shader

		Util.replaceBox(pair);
	});
});