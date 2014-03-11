require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/ShapeCreator',
	'goo/entities/components/CameraComponent',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/MeshData',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'goo/entities/components/LightComponent',
	'goo/scripts/NewWaveFPCamControlScript',
	'goo/scripts/WASDControlScript',
	'goo/scripts/ScriptUtils',
	'goo/math/Vector',
	'goo/math/MathUtils',
	'goo/math/Vector2',
	'goo/loaders/DynamicLoader',
	'../../lib/V'
], function (
	GooRunner,
	Material,
	ShaderLib,
	Camera,
	ShapeCreator,
	CameraComponent,
	ScriptComponent,
	MeshData,
	MeshRendererComponent,
	Vector3,
	PointLight,
	LightComponent,
	NewWaveFPCamControlScript,
	WASDControlScript,
	ScriptUtils,
	Vector,
	MathUtils,
	Vector2,
	DynamicLoader,
	V
	) {
	'use strict';

	var external = {
		name: 'Walk around',
		description: '',
		parameters: [{
			key: 'rm',   // reverse mapping of animation state names to ids should not be given as parameter, but computed inside
			'default': {}
		}]
	};

	var WalkAroundScript = function () {
		var entity, transformComponent, transform, gooRunner;
		var parameters;

		var keyState = {
			// it'll get filled anyways
		};

		var animForDelta = {
			'-1,-1': 'forwardleft',
			'-1,0': 'left',
			'-1,1': 'backleft',
			'0,1': 'back',

			'1,1': 'backright',
			'1,0': 'right',
			'1,-1': 'forwardright',
			'0,-1': 'forward',

			'0,0': 'idle'
		};

		var delta = {
			x: 0,
			y: 0
		};

		function setup(_parameters, env) {
			ScriptUtils.fillDefaultValues(_parameters, external.parameters);
			parameters = _parameters;

			entity = env.getEntity();
			transformComponent = entity.transformComponent;
			transform = transformComponent.transform;

			setupControls();
		}

		function deltaToString(delta) {
			return delta.x + ',' + delta.y;
		}

		function transitionTo(deltaStr) {
			var stateName = animForDelta[deltaStr];
			console.log(stateName);
			entity.animationComponent.transitionTo(parameters.rm[stateName]);
		}

		function setupKeyControls() {
			window.addEventListener('keydown', function (event) {
				var key = event.which;
				var newDelta = { x: delta.x, y: delta.y };

				if (key === 38 && !keyState.up) { keyState.up = true; newDelta.y--; }
				if (key === 37 && !keyState.left) { keyState.left = true; newDelta.x--; }
				if (key === 40 && !keyState.down) { keyState.down = true; newDelta.y++; }
				if (key === 39 && !keyState.right) { keyState.right = true; newDelta.x++; }

				var updated = newDelta.x !== delta.x || newDelta.y !== delta.y;
				if (updated) {
					delta.x = newDelta.x;
					delta.y = newDelta.y;
					transitionTo(deltaToString(delta));
				}
			}, false);

			window.addEventListener('keyup', function (event) {
				var key = event.which;
				var newDelta = { x: delta.x, y: delta.y };

				if (key === 38 && keyState.up) { keyState.up = false; newDelta.y++; }
				if (key === 37 && keyState.left) { keyState.left = false; newDelta.x++; }
				if (key === 40 && keyState.down) { keyState.down = false; newDelta.y--; }
				if (key === 39 && keyState.right) { keyState.right = false; newDelta.x--; }

				var updated = newDelta.x !== delta.x || newDelta.y !== delta.y;
				if (updated) {
					delta.x = newDelta.x;
					delta.y = newDelta.y;
					transitionTo(deltaToString(delta));
				}
			}, false);
		}

		function setupControls() {
			setupKeyControls();
			// setupMouseControls();
		}

		function update(parameters, env) {
			console.log('frame');
		}

		function cleanup() {

		}

		return {
			setup: setup,
			update: update,
			cleanup: cleanup
		};
	};

	//! AT: these should stay in object util
	function pluckObj(obj, propName) {
		var keys = Object.keys(obj);

		var ret = {};

		for (var i = 0; i < keys.length; i++) {
			ret[keys[i]] = obj[keys[i]][propName];
		}

		return ret;
	}

	function reverseMap(obj) {
		var keys = Object.keys(obj);

		var ret = {};

		for (var i = 0; i < keys.length; i++) {
			ret[obj[keys[i]]] = keys[i];
		}

		return ret;
	}

	function walkAroundScriptDemo() {
		var goo = V.initGoo({ manuallyStartGameLoop: true });

		//V.addLights();

		//V.addColoredBoxes();

		var loader = new DynamicLoader({
			world: goo.world,
			rootPath: 'res'
		});

		loader.loadFromBundle('project.project', 'root.bundle', { recursive: false, preloadBinaries: true }).then(function (configs) {
			// This code will be called when the project has finished loading.
			goo.renderer.domElement.id = 'goo';
			document.body.appendChild(goo.renderer.domElement);

			// Start the rendering loop!
			goo.startGameLoop();

			setTimeout(function () {
				var entity = goo.world.by.name('male_skin_pose_baked/entities/RootNode.entity').get(0);

				var rm = reverseMap(pluckObj(entity.animationComponent.layers[0]._steadyStates, '_name'));
				console.log(rm);

				var walkAroundScript = WalkAroundScript();
				walkAroundScript.parameters = { rm: rm };
				var scriptComponent = new ScriptComponent(walkAroundScript);
				entity.set(scriptComponent);

				/*
				 function z() {
				 entity.animationComponent.transitionTo(rm['left']);
				 setTimeout(zz, 500);
				 }

				 function zz() {
				 entity.animationComponent.transitionTo(rm['right']);
				 setTimeout(z, 500);
				 }

				 z();
				 */
			}, 500);
		}).then(null, function(e) {
			console.error('Failed to load scene: ' + e);
		});

		/*
		 // add camera
		 var camera = new Camera();
		 var cameraEntity = goo.world.createEntity(camera, 'CameraEntity', [0, 0, 20]).lookAt([0, 0, 0]).addToWorld();

		 // camera control set up
		 var scripts = new ScriptComponent();

		 var orbitCamScript = OrbitCamScript();
		 orbitCamScript.parameters = {
		 domElement: goo.renderer.domElement
		 };
		 scripts.scripts.push(orbitCamScript);

		 var key = null;
		 var x = 0, y = 0, z = 0;

		 scripts.scripts.push({
		 run: function () {
		 if (key === 38) { z -= 0.1; }
		 if (key === 37) { x -= 0.1; }
		 if (key === 40) { z += 0.1; }
		 if (key === 39) { x += 0.1; }

		 orbitCamScript.parameters.lookAtPoint.set(x, y, z);
		 //cameraEntity.lookAt(0, Math.sin(goo.world.time * 2) * 2, 0);

		 //cameraEntity.setTranslation();
		 //cameraEntity.transformComponent.setUpdated();
		 }
		 });

		 window.addEventListener('keydown', function (e) {
		 key = e.which;
		 });

		 window.addEventListener('keyup', function (e) {
		 key = null;
		 console.log('up', e.which);
		 });

		 cameraEntity.setComponent(scripts);
		 */
	}

	walkAroundScriptDemo();
});