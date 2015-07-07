define([
	'shader-bits/core/ShaderBuilder',
	'shader-bits/core/DataNormalizer'
], function (
	ShaderBuilder,
	DataNormalizer
) {
	function loadTypeDefinitions(name, callback) {
		$.ajax({
			url: '../../samples/' + name + '/types.json'
		}).done(function (typeDefinitions) {
			// for convenience, writing strings on a single line is not healthy for the mind
			_(typeDefinitions).forEach(function (shaderDefinition) {
				if (shaderDefinition.body instanceof Array) {
					shaderDefinition.body = shaderDefinition.body.join('\n');
				}
			});
			// normalize them in case we have some wild stuff in there
			var normalized = DataNormalizer.normalizeNodeTypes(typeDefinitions);
			callback(normalized);
		});
	}

	// crap functions that do the same thing but take in different sort of data
	var __replaceBox = shaderBitsCommon.makeDemo();

	function _replaceBox(pair) {
		var fragmentShader = ShaderBuilder.buildShader(pair.fragment.typeDefinitions, pair.fragment.structure);
		window._fragmentShader = fragmentShader;

		if (pair.vertex) {
			var vertexShader = ShaderBuilder.buildShader(pair.vertex.typeDefinitions, pair.vertex.structure);
			window._vertexShader = vertexShader;
			__replaceBox(fragmentShader, vertexShader);
		} else {
			__replaceBox(fragmentShader);
		}
	}

	return {
		replaceBox: _replaceBox,
		loadTypeDefinitions: loadTypeDefinitions
	};
});