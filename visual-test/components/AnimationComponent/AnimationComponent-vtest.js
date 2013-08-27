require.config({
	paths: {
		"goo": "../../../src/goo"
	}
});

require([
	'goo/loaders/DynamicLoader',
	'js/createWorld',
	'js/drawSkeleton',
	'goo/shapes/ShapeCreator',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/renderer/MeshData',
	'goo/renderer/Material',
	'goo/renderer/Shader'
], function(
	DynamicLoader,
	createWorld,
	drawSkeleton,
	ShapeCreator,
	MeshDataComponent,
	MeshRendererComponent,
	MeshData,
	Material,
	Shader
) {
	"use strict";

	function init() {
		var goo = createWorld();
		loadScene(goo);
	}
	// Load the character
	function loadScene(goo) {
		var loader = new DynamicLoader({
			rootPath: './zombie/',
			world: goo.world
		});

		loader.load('test.scene').then(function (configs) {
			var skinnedEntities = [];

			var func = function() {
				var state = this.options[this.selectedIndex].value;
				animComp.transitionTo(state);
				console.log(state);
			};
			for (var key in configs) {
				if (/\.entity$/.test(key)) {
					var entity = loader.getCachedObjectForRef(key);
					if (entity.meshDataComponent && entity.meshDataComponent.currentPose) {
						skinnedEntities.push(entity);
					}

					if (entity.animationComponent) {
						var animComp = entity.animationComponent;
						var choices = entity.animationComponent.getStates();
						fillOptions(choices);
						document.getElementById('animSelect').addEventListener('change', func);
					}
				}
			}
			goo.callbacks.push(function(/*tpf*/) {
				for (var i = 0; i < skinnedEntities.length; i++) {
					if(document.getElementById('drawSkeleton').checked) {
						drawSkeleton(skinnedEntities[i], goo.renderer);
					}
				}
			});

			goo.startGameLoop();
			createDebugQuad(goo);

		}).then(null, function(e) {
			console.log(e, e.message);
		});
	}

	function fillOptions(opts) {
		console.log(opts);
		var select = document.getElementById('animSelect');
		console.log(select);
		select.options.length = 0;
		for (var i = 0; i < opts.length; i++) {
			select.options[i] = new Option(opts[i], opts[i]);
		}
	}
	function createDebugQuad(goo) {
		var world = goo.world;
		var entity = world.createEntity('Quad');
		entity.transformComponent.transform.translation.set(0, 0, 0);

		var quad = ShapeCreator.createQuad(2, 2);
		var meshDataComponent = new MeshDataComponent(quad);
		entity.setComponent(meshDataComponent);

		var fsShader = {
			attributes: {
				vertexPosition: 'POSITION'
			},
			uniforms: {
				diffuseMap: 'DIFFUSE_MAP'
			},
			vshader: [ //
				'attribute vec3 vertexPosition;', //

				'const vec2 madd = vec2(0.5,0.5);',
				'varying vec2 textureCoord;',

				'void main(void) {', //
				'	textureCoord = vertexPosition.xy * madd + madd;', // scale vertex attribute to [0-1] range
				'	gl_Position = vec4(vertexPosition.xy * vec2(0.3, 0.3) - vec2(0.5, 0.5), 0.0, 1.0);',
					'}' //
			].join('\n'),
			fshader: [ //
				'precision mediump float;', //

				'uniform sampler2D diffuseMap;', //

				'varying vec2 textureCoord;',

				'void main(void)', //
				'{', //
				'	gl_FragColor = texture2D(diffuseMap,textureCoord);', //
				'}' //
			].join('\n')
		};

		var meshRendererComponent = new MeshRendererComponent();
		meshRendererComponent.cullMode = 'Never';
		var material = Material.createMaterial(fsShader, 'fsshader');
		meshRendererComponent.materials.push(material);
		entity.setComponent(meshRendererComponent);

		goo.callbacks.push(function (/*tpf*/) {
			if (goo.renderer.hardwarePicking && goo.renderer.hardwarePicking.pickingTarget) {
				material.setTexture(Shader.DIFFUSE_MAP, goo.renderer.hardwarePicking.pickingTarget);
			}
		});
		entity.addToWorld();
	}

	init();
});