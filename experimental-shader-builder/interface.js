(function () {
	'use strict';

	angular.module('app', [])
		.controller('ShaderController', [
			'$scope',
			'$http',
			'$q',
		function (
			$scope,
			$http,
			$q
		) {
			// bad name is bad
			this._replaceBox = function () {
				var result = shaderBits.buildShader(this.nodeTypes, this.structure);
				replaceBox(result);
			}.bind(this);

			// firebase
			var firebaseRef = new Firebase('https://blinding-heat-7806.firebaseio.com/');
			var shaderBitRef = firebaseRef.child('shader-bit');

			shaderBitRef.on('value', function (snapshot) {
				var data = snapshot.val();

				this.nodeTypes = dataNormalizer.normalizeNodeTypes(data.nodeTypes);
				this.structure = dataNormalizer.normalizeStructure(data.structure);

				this.updateNodeTypeNames();
				this.updateIOByType();

				this.activateTypeName(Object.keys(this.nodeTypes)[0]);

				this.updateNodeNames();
				this._replaceBox();
			}.bind(this));

			this.save = function () {
				var data = {
					nodeTypes: angular.copy(this.nodeTypes),
					structure: angular.copy(this.structure)
				};

				shaderBitRef.set(data, function () {
					console.log('save ok');
				});
			};

			this.reset = function () {
				// --- fetch the samples ---
				var p1 = $http.get('samples/s2/types.json')
					.success(function (data) {
						this.nodeTypes = data;
						this.updateNodeTypeNames();
						this.updateIOByType();

						this.activateTypeName(Object.keys(this.nodeTypes)[0]);
					}.bind(this));

				var p2 = $http.get('samples/s2/structure.json')
					.success(function (data) {
						this.structure = data;
						this.updateNodeNames();
					}.bind(this));

				$q.all([p1, p2]).then(this._replaceBox);
			};

			// node types and instances ---
			this.newNodeTypeName = '';

			this.addNodeType = function () {
				this.nodeTypes[this.newNodeTypeName] = {
					inputs: [],
					outputs: [],
					body: ''
				};
				this.updateNodeTypeNames();
			};

			this.removeNodeType = function (typeName) {
				delete this.nodeTypes[typeName];
				this.updateNodeTypeNames();
				if (typeName === this.activeTypeName) {
					this.activateTypeName(Object.keys(this.nodeTypes)[0]);
				}
			};

			this.generateNewNodeName = function () {
				var maxId = this.structure.map(function (node) {
					return parseInt(node.id.match(/_(\d+)/)[1], 10);
				}).reduce(function (max, cur) {
					return Math.max(max, cur);
				});

				return 'node_' + (maxId + 1);
			};

			this.nodeTypeNames = [];

			this.updateNodeTypeNames = function () {
				this.nodeTypeNames = Object.keys(this.nodeTypes);
			};

			this.nodeNames = {};

			this.updateNodeNames = function () {
				this.nodeNames = this.structure.reduce(function (names, node) {
					names[node.id] = true;
					return names;
				}, {});
			};

			this.newNodeType = null;

			this.addNode = function () {
				this.structure.push({
					type: this.newNodeType,
					id: this.generateNewNodeName(),
					externalInputs: [],
					outputsTo: []
				});
				this.updateNodeNames();
			};

			this.removeNode = function (index) {
				this.structure.splice(index, 1);
				this.updateNodeNames();
			};

			// --- output management ---
			this.newOutput = {};

			this.ioByType = {};

			this.updateIOByType = function () {
				this.ioByType = Object.keys(this.nodeTypes).reduce(function (io, typeName) {
					io[typeName] = {
						outputs: this.nodeTypes[typeName].outputs.map(function (output) { return output.name; }),
						inputs: this.nodeTypes[typeName].inputs.map(function (input) { return input.name; })
					};
					return io;
				}.bind(this), {});
			};

			this.addNodeOutput = function (nodeIndex, nodeId) {
				this.structure[nodeIndex].outputsTo.push({
					output: this.newOutput[nodeId].output,
					input: this.newOutput[nodeId].input,
					to: this.newOutput[nodeId].to.id
				});
				this._replaceBox();
			};

			this.removeNodeOutput = function (nodeIndex, outputIndex) {
				this.structure[nodeIndex].outputsTo.splice(outputIndex, 1);
				this._replaceBox();
			};

			this.activeTypeName = null;

			this.activateTypeName = function (typeName) {
				this.activeTypeName = typeName;
				var shaderBit = shaderInputProcessor.pack(this.nodeTypes[typeName]);
				this.shaderEditor.setValue(shaderBit, -1);
			};

			// --- shader editor ---
			this.shaderEditor = null;

			this.setupEditor = function () {
				var fontSize = 16;
				this.shaderEditor = ace.edit('shader-editor');
				this.shaderEditor.setTheme('ace/theme/monokai');
				this.shaderEditor.getSession().setMode('ace/mode/glsl');
				this.shaderEditor.getSession().setUseWrapMode(true);
				this.shaderEditor.setFontSize(fontSize);
				this.shaderEditor.on('input', onInput.bind(this));
			};

			function onInput() {
				var shaderBit = this.shaderEditor.getValue();
				this.nodeTypes[this.activeTypeName] = shaderInputProcessor.unpack(shaderBit);
				$scope.$apply();
				this._replaceBox();
			}

			this.setupEditor();


			// goo related code goes here
			function demo() {
				var world = v.initGoo().world;
				v.addOrbitCamera(new goo.Vector3(5, Math.PI / 2, 0));

				var box;

				function replaceBox(shaderSource) {
					if (box) {
						box.removeFromWorld();
					}

					var material = new goo.Material({
						attributes: {
							vertexPosition: goo.MeshData.POSITION
						},
						uniforms: {
							viewProjectionMatrix: goo.Shader.VIEW_PROJECTION_MATRIX,
							worldMatrix: goo.Shader.WORLD_MATRIX,
							time: function () {
								return world.time;
							}
						},
						vshader: [
							'attribute vec3 vertexPosition;',

							'uniform mat4 viewProjectionMatrix;',
							'uniform mat4 worldMatrix;',

							'void main(void) {',
							'	gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
							'}'
						].join('\n'),
						fshader: shaderSource
					});

					box = world.createEntity(new goo.Box(), material).addToWorld();
				}

				//var result = shaderBits.buildShader(this.nodeTypes, this.structure);
				//
				//outputEditor.setValue(result);

				return replaceBox;
			}

			var replaceBox = demo();
		}
	]);
})();