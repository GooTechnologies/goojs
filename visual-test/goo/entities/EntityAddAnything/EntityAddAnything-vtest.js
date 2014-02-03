require([
	'goo/entities/GooRunner',
	'goo/entities/World',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/ShapeCreator',
	'goo/entities/components/CameraComponent',
	'goo/scripts/OrbitCamControlScript',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/MeshData',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/Vector3',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/TextureCreator',
	'goo/entities/components/LightComponent',
	'../../lib/V'
], function(
	GooRunner,
	World,
	Material,
	ShaderLib,
	Camera,
	ShapeCreator,
	CameraComponent,
	OrbitCamControlScript,
	ScriptComponent,
	MeshData,
	MeshRendererComponent,
	Vector3,
	DirectionalLight,
	TextureCreator,
	LightComponent,
	V
) {
	'use strict';

	var resourcePath = "../../resources";

	var gui = new window.dat.GUI();

	var mats = [];

	function anisotropicDemo(goo) {
		var boxEntity1 = createBoxEntity(goo, 3);
		//boxEntity1.setTranslation(0, 0, 0);

		var boxEntity2 = createBoxEntity(goo, 2, [3, 0, 0]);
		//boxEntity2.setTranslation(3, 0, 0);
		boxEntity1.transformComponent.attachChild(boxEntity2.transformComponent);

		var boxEntity3 = createBoxEntity(goo, 1, [2, 0, 0]);
		//boxEntity3.setTranslation(2, 0, 0);
		boxEntity2.transformComponent.attachChild(boxEntity3.transformComponent);

		boxEntity1.addToWorld();


		var data = {
			add_remove: true
		};
		var controller = gui.add(data, 'add_remove');
		controller.onChange(function(val) {
			if (val) {
				boxEntity1.addToWorld();
			} else {
				boxEntity1.removeFromWorld();
			}
		});

		var light = new DirectionalLight();
		var lightEntity = goo.world.createEntity('light');
		lightEntity.setComponent(new LightComponent(light));
		lightEntity.setTranslation(1, 10, 1);
		lightEntity.lookAt(Vector3.ZERO, Vector3.UNIT_Y);
		lightEntity.addToWorld();

		V.addOrbitCamera(goo, new Vector3(15, Math.PI / 2, 0.3));

		do_it();
	}

	function addToMeshData(meshData) {
		meshData.attributeMap.Bump = MeshData.createAttribute(1, 'Float');
		meshData.rebuildData();

		var nVertices = meshData.vertexCount;

		var bumps = [];
		for (var i = 0; i < nVertices; i++) {
			bumps.push(i);
		}


		meshData.getAttributeBuffer('Bump').set(bumps);
	}

	function getRandomColor() {
		var k = Math.random() * Math.PI * 2;
		var col = [Math.sin(k),
			Math.sin(k + Math.PI * 2 / 3),
			Math.sin(k + Math.PI * 4 / 3)].map(function(v) { return v / 2 + 0.5; });
		return col;
	}

	var av = 0;

	function draw(buf) {
		var nv = Math.sin(buf[0] + 0.0001) * Math.sin(World.time) * 2;
		av += (nv - av) / 3;

		mats.forEach(function (material) {
			material.uniforms.power = av;
		});
	}

	var zz;

	function do_it() {
		navigator.webkitGetUserMedia({ video: false, audio: true }, function(e) {
			var audioContext = window.AudioContext || window.webkitAudioContext;
			var context = new audioContext();

			// creates a gain node
			var volume = context.createGain();

			// creates an audio node from the microphone incoming stream
			var audioInput = context.createMediaStreamSource(e);

			// connect the stream to the gain node
			audioInput.connect(volume);

			/* From the spec: This value controls how frequently the audioprocess event is
			 dispatched and how many sample-frames need to be processed each call.
			 Lower values for buffer size will result in a lower (better) latency.
			 Higher values will be necessary to avoid audio breakup and glitches */
			var bufferSize = 512; //1024; //2048;
			var recorder = context.createJavaScriptNode(bufferSize, 2, 2);

			zz = function(e){
				//console.log ('recording');
				var left = e.inputBuffer.getChannelData (0);
				//var right = e.inputBuffer.getChannelData (1);
				// we clone the samples
				var tmp1 = new Float32Array (left);
				//var tmp2 = new Float32Array (right);
				//console.log (tmp1[0]);

				draw(tmp1);
			};

			recorder.onaudioprocess = zz;

				// we connect the recorder
			volume.connect (recorder);
			recorder.connect (context.destination);
		}, function(err) {
			console.log(err);
			err.code == 1 && (alert("You can click the button again anytime to enable."))
		});
	}


	function createBoxEntity(goo, size, position) {
		//var meshData = ShapeCreator.createBox(size, size, size);
		var meshData = ShapeCreator.createSphere(32, 32, size);
		//addToMeshData(meshData);

		var material = Material.createMaterial(ShaderLib.texturedLit, 'BoxMaterial');
//		var material = Material.createMaterial(ShaderLib.simpleColored, 'BoxMaterial');

		material.uniforms.color = getRandomColor();
		material.uniforms.power = 0.0;
		mats.push(material);
//		TextureCreator.clearCache();
		var texture = new TextureCreator().loadTexture2D(resourcePath + '/check.png');
		material.setTexture('DIFFUSE_MAP', texture);

		var entity = goo.world.createEntity(meshData, material, position);

		return entity;
	}

	function init() {
		var goo = new GooRunner({
			showStats: true,
			toolMode: true,
			logo: 'bottomleft'
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		anisotropicDemo(goo);
	}

	init();
});