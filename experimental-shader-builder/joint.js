(function () {
	'use strict';

	var graph = new joint.dia.Graph;

	var paper = new joint.dia.Paper({
		el: $('#container'),
		width: 1600,
		height: 400,
		model: graph,
		gridSize: 1,

		defaultLink: new joint.dia.Link({
			attrs: { '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z' } }
		}),
		validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
			// Prevent linking from input ports.
			if (magnetS && magnetS.getAttribute('type') === 'input') return false;
			// Prevent linking from output ports to input ports within one element.
			if (cellViewS === cellViewT) return false;
			// Prevent linking to input ports.
			return magnetT && magnetT.getAttribute('type') === 'input';
		},
		validateMagnet: function(cellView, magnet) {
			// Note that this is the default behaviour. Just showing it here for reference.
			// Disable linking interaction for magnets marked as passive (see below `.inPorts circle`).
			return magnet.getAttribute('magnet') !== 'passive';
		},
		snapLinks: { radius: 75 }
	});

	function createNode(typeDefinition) {
		var inPorts = typeDefinition.inputs ?
			typeDefinition.inputs.map(function (input) {
				return input.name;
			}) : [];

		var outPorts = typeDefinition.outputs ?
			typeDefinition.outputs.map(function (output) {
				return output.name;
			}) : [];

		return new joint.shapes.devs.Model({
			position: { x: 50, y: 50 },
			size: { width: 90, height: 90 },
			inPorts: inPorts,
			outPorts: outPorts,
			attrs: {
				'.label': { text: typeDefinition.id, 'ref-x': .4, 'ref-y': .2 },
				rect: { fill: '#2ECC71' },
				'.inPorts circle': { fill: '#16A085', type: 'input' },
				'.outPorts circle': { fill: '#E74C3C', type: 'output' }
			},
			nodeType: typeDefinition.id,
			defines: {}
		});
	}

	function createExternal(external) {
		return new joint.shapes.devs.Model({
			position: { x: 50, y: 50 },
			size: { width: 90, height: 90 },
			inPorts: [],
			outPorts: ['value'],
			attrs: {
				'.label': { text: 'external', 'ref-x': .4, 'ref-y': .2 },
				rect: { fill: '#2ECC71' },
				'.inPorts circle': { fill: '#16A085', type: 'input' },
				'.outPorts circle': { fill: '#E74C3C', type: 'output' }
			},
			nodeType: 'external',
			external: {
				name: external.name,
				inputType: external.inputType,
				dataType: external.dataType
			}
		});
	}

	function getSample(name, callback) {
		$.ajax({
			url: 'samples/' + name + '/types.json'
		}).done(callback);
	}

	function populateTypes(types) {
		var selectElement = $('#node-types');
		$.each(types, function () {
			selectElement.append($("<option />").val(this).text(this));
		});
	}

	function setupEditor(onInput) {
		var editor = ace.edit('node-editor');
		editor.setTheme('ace/theme/monokai');
		editor.getSession().setMode('ace/mode/glsl');
		editor.getSession().setUseWrapMode(true);
		editor.on('input', onInput);
		editor.setFontSize(16);
		editor.$blockScrolling = Infinity;
		return editor;
	}

	function onInput() {
		var str = editor.getValue();
		var partial = shaderProcessor.parseNodeInstance(str);
		var cell = graph.getCell(clickedNewId);
		if (partial.external) {
			cell.attributes.external = partial.external;
		} else {
			cell.attributes.defines = partial.defines;
		}

		refreshBox();
	}

	function refreshBox() {
		var structure = graphToStructure.toStructure(graph);

		//var normalizedTypeDefinitions = dataNormalizer.normalizeNodeTypes(data.nodeTypes);
		var _structure = dataNormalizer.normalizeStructure(structure);

		replaceBox(typeDefinitions, _structure);
	}

	graph.on('change:source change:target', function (event) {
		// this event trigger on everything (move included)
		// some filtering is necessary
		if (!event.get('source').id || !event.get('target').id) { return; }

		refreshBox();
	});

	var editor = setupEditor(onInput);

	var clickedNewId, clickedOldId;

	function setupListeners() {
		$('#add-external').click(function () {
			var name = $('#external-name').val();
			var inputType = $('#external-input-type').val();
			var dataType = $('#external-data-type').val();

			var node = createExternal({
				name: name,
				inputType: inputType,
				dataType: dataType
			});

			graph.addCell(node);
		});

		$('#add-node').click(function () {
			var type = $("#node-types").val();
			var node = createNode(typeDefinitions[type]);
			graph.addCell(node);
		});


		paper.on('cell:pointerdown', function (cellView, evt, x, y) {
			if (cellView.model.attributes.type !== 'devs.Model') { return; }

			clickedNewId = cellView.model.id;

			if (clickedOldId !== clickedNewId) {
				selectionChanged(clickedOldId, clickedNewId);
			}

			if (clickedOldId) {
				var cell = graph.getCell(clickedOldId);
				if (cell) {
					cell.attr({
						rect: { fill: '#2ECC71' }
					});
				}
			}

			clickedOldId = clickedNewId;

			var cell = graph.getCell(clickedNewId);
			cell.attr({
				rect: { fill: '#4EEC91' }
			});
		});

		function selectionChanged(oldId, newId) {
			var cell = graph.getCell(newId);

			var node = {
				type: cell.attributes.nodeType,
				defines: cell.attributes.defines,
				external: cell.attributes.external
			};

			var str = shaderProcessor.stringifyNodeInstance(node, typeDefinitions[node.type]);

			editor.setValue(str, 1);
		}
	}

	var typeDefinitions;

	getSample('s3', function (_typeDefinitions) {
		typeDefinitions = dataNormalizer.normalizeNodeTypes(_typeDefinitions);

		populateTypes(Object.keys(typeDefinitions));

		var node1 = createNode(typeDefinitions['const']);
		graph.addCell(node1);

		var node2 = createNode(typeDefinitions['out']);
		graph.addCell(node2);

		setupListeners();
	});


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

		return replaceBox;
	}

	var _replaceBox = demo();

	var replaceBox = function (nodeTypes, structure) {
		var result = shaderBits.buildShader(nodeTypes, structure);
		window._result = result;
		_replaceBox(result);
	};
})();