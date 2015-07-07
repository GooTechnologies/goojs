require([
	'shader-bits/data/ContextPair',
	'util'
], function (
	ContextPair,
	Util
) {
	'use strict';

	function getDiffuseTexture(context) {
		var texCoord = context.createVarying('texCoord0', 'vec2');
		var diffuse = context.createUniform('diffuseMap', 'sampler2D');

		var texture2D = context.createTexture2D();
		texCoord.connect(texture2D.coords);
		diffuse.connect(texture2D.sampler);

		return texture2D;
	}

	// again, there's no value in creating this the hard way
	// half of this is `viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);`
	// which can be a box on its own since it's standard
	// and half is handling of texture coordinates (attribute -> varying)
	function createBasicVertex(context) {
		// position
		var viewProjectionMatrix = context.createUniform('viewProjectionMatrix', 'mat4');
		var worldMatrix = context.createUniform('worldMatrix', 'mat4');
		var vertexPosition = context.createAttribute('vertexPosition', 'vec3');

		var mul1 = context.createMul();
		viewProjectionMatrix.connect(mul1.x);
		worldMatrix.connect(mul1.y);

		// type conversions; create a vec4 from a vec3 (+ a define)
		var vec43 = context.createVec43();
		vec43.w = 1;
		vertexPosition.connect(vec43);

		var mul2 = context.createMulMV();
		mul1.connect(mul2.x);
		vec43.connect(mul2.y);

		// could just as well return this without connecting it
		// and have whatever connection be made outside
		mul2.connect(context.position);

		// texture coord
		var vertexUV0 = context.createAttribute('vertexUV0', 'vec2');

		var texCoord0 = context.createVarying('texCoord0', 'vec2');

		// same here, you can sneak a lot of other transformations between these two
		vertexUV0.connect(texCoord0);
	}

	function getSample(typeDefintions) {
		var contextPair = new ContextPair(typeDefintions);

		var vertexContext = contextPair.vertexContext;
		createBasicVertex(vertexContext);

		var fragmentContext = contextPair.fragmentContext;
		var texture = getDiffuseTexture(fragmentContext);
		texture.connect(fragmentContext.fragColor);

		return contextPair.toJson();
	}

	Util.loadTypeDefinitions('s4', function (typeDefinitions) {
		// get back a vertex and a fragment shader
		var pair = getSample(typeDefinitions);

		Util.replaceBox(pair);
	});
});