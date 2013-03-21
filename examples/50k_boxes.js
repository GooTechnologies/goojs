require.config({
	baseUrl : "./",
	paths : {
		goo : "../src/goo",
		'goo/lib': '../lib'
	}
});
require([
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/renderer/MeshData',
	'goo/renderer/Material',
	'goo/renderer/Shader',
	'goo/entities/GooRunner',
	'goo/entities/components/ScriptComponent',
	'goo/shapes/ShapeCreator',
	'goo/entities/EntityUtils',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/math/Vector3',
	'goo/util/FastBuilder',
	'goo/math/Transform',
	'goo/scripts/OrbitCamControlScript',
	'goo/renderer/light/PointLight',
	'goo/entities/components/LightComponent',
	'goo/math/Vector4'
], function (
	MeshDataComponent,
	MeshRendererComponent,
	MeshData,
	Material,
	Shader,
	GooRunner,
	ScriptComponent,
	ShapeCreator,
	EntityUtils,
	Camera,
	CameraComponent,
	Vector3,
	FastBuilder,
	Transform,
	OrbitCamControlScript,
	PointLight,
	LightComponent,
	Vector4
) {
	'use strict';

	function init() {
		// Create typical goo application
		var goo = new GooRunner({
//			showStats : true,
//			antialias : true
		});
		goo.renderer.domElement.id = 'goo';
		goo.doRender = false;
		document.body.appendChild(goo.renderer.domElement);
		goo.renderer.setClearColor(0.0,0.0,0.0,1.0);

		createShapes(goo);

		// Add camera
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 0, 10);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(170, 0, 0.8)
		}));
		cameraEntity.setComponent(scripts);

		var entity = goo.world.createEntity('light');
		var light = new PointLight();
		entity.setComponent(new LightComponent(light));
		entity.addToWorld();
	}

	// Create simple quad
	function createShapes(goo) {
//		var gui = new dat.GUI();

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.NORMAL]);
		attributeMap.movementNormal = MeshData.createAttribute(3, 'Float');
		attributeMap.movementNormal2 = MeshData.createAttribute(3, 'Float');
		attributeMap.offsets = MeshData.createAttribute(4, 'Float');

		var meshData = new MeshData(attributeMap, 8, 36);

		var vbuf = meshData.getAttributeBuffer(MeshData.POSITION);
		var realvbuf = meshData.getAttributeBuffer(MeshData.NORMAL);
		var movementNormal = meshData.getAttributeBuffer('movementNormal');
		var movementNormal2 = meshData.getAttributeBuffer('movementNormal2');
		var offsets = meshData.getAttributeBuffer('offsets');
		var indices = meshData.getIndexBuffer();

		var size = 1;
		vbuf.set([
			-size, -size, -size,
			-size, size, -size,
			size, size, -size,
			size, -size, -size,
			-size, -size, size,
			-size, size, size,
			size, size, size,
			size, -size, size
		]);
		realvbuf.set(vbuf);

		indices.set([
		             0,1,2, 2,3,0,
		             6,5,4, 4,7,6,
		             2,1,5, 5,6,2,
		             7,4,0, 0,3,7,
		             5,1,0, 0,4,5,
		             2,6,7, 7,3,2
		]);

		//var loader = document.getElementById('load');
		var count = 50000;
		var meshBuilder = new FastBuilder(meshData, count, {
			progress: function (/*percent*/) {
//				console.log(percent);
			},
			done: function () {
				//loader.classList.remove('visible');
			}
		});
		var transform = new Transform();
		var movement = new Vector3();
		var offsetvec = new Vector4();
		var spread = 20.0;
		for (var x=0;x<count;x++) {
			transform.translation.data[0] = Math.sin(x*Math.PI*2/count);
			transform.translation.data[1] = (Math.random() * 2.0 - 1.0) * 1.0;
			transform.translation.data[2] = Math.cos(x*Math.PI*2/count);
			transform.translation.normalize();
			transform.translation.mul(Math.random()*20.0+spread);
			transform.setRotationXYZ(0, Math.random() * Math.PI * 2, 0);
			transform.update();

			movement.setv(transform.translation).normalize();
			for (var n=0;n<8;n++) {
				movementNormal[n*3+0] = movement.data[0];
				movementNormal[n*3+1] = movement.data[1];
				movementNormal[n*3+2] = movement.data[2];
			}
			movement.cross(Vector3.UNIT_Y);
			for (var n=0;n<8;n++) {
				movementNormal2[n*3+0] = movement.data[0];
				movementNormal2[n*3+1] = movement.data[1];
				movementNormal2[n*3+2] = movement.data[2];
			}

			var spin = (x/count) * Math.PI * 1;
			var spin2 = (x/count) * Math.PI * 2.2 * (Math.random()*0.8+0.6);
			offsetvec.setd(
				spin,
				spin2,
				spin,
				spin2
				);
			for (var n=0;n<8;n++) {
				offsets[n*4+0] = offsetvec.data[0];
				offsets[n*4+1] = offsetvec.data[1];
				offsets[n*4+2] = offsetvec.data[2];
				offsets[n*4+3] = offsetvec.data[3];
			}

			meshBuilder.addMeshData(meshData, transform);
		}
		var meshDatas = meshBuilder.build();

		var material = Material.createMaterial(superLit, 'test');
		for (var key in meshDatas) {
			var entity = goo.world.createEntity();
			var meshDataComponent = new MeshDataComponent(meshDatas[key]);
			meshDataComponent.autoCompute = false;
			entity.setComponent(meshDataComponent);
			var meshRendererComponent = new MeshRendererComponent();
			meshRendererComponent.cullMode = 'Never';
			meshRendererComponent.materials.push(material);
			entity.setComponent(meshRendererComponent);
			entity.addToWorld();
		}

//		gui.add(material.shader.uniforms, 'move', 0.0, 100.0);
		goo.doRender = true;
	}

	var superLit = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			realVertexPosition : MeshData.NORMAL,
			movementNormal : 'movementNormal',
			movementNormal2 : 'movementNormal2',
			offsets : 'offsets'
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			lightPosition : Shader.LIGHT0,
			move : 70.0,
			time : Shader.TIME
		},
		vshader : [ //
		'attribute vec3 vertexPosition;', //
		'attribute vec3 realVertexPosition;', //
		'attribute vec3 movementNormal;', //
		'attribute vec3 movementNormal2;', //
		'attribute vec4 offsets;', //

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 worldMatrix;',//
		'uniform vec3 lightPosition;', //

		'uniform float move;',
		'uniform float time;',

		'varying vec3 normal;',//
		'varying vec3 lightDir;',//
		'varying float lightDist;',//
		'varying float vertDist;',//

		'void main(void) {', //
		'	vec3 pos = vertexPosition + ',
		'				movementNormal * sin(mix(offsets.x, offsets.y, sin(time*0.5)*0.5+0.5) + time) * sin(time*0.3) * move + ',
		'				movementNormal2 * cos(mix(offsets.z, offsets.w, sin(time*0.5)*0.5+0.5) + time) * sin(time*0.3) * move;',
		'	vertDist = 1.0 - min(length(pos)/110.0, 1.0);',
		'	vec4 worldPos = worldMatrix * vec4(pos, 1.0);', //
		'	gl_Position = viewProjectionMatrix * worldPos;', //

		'	normal = realVertexPosition.xyz;', //
		'	lightDir = lightPosition - worldPos.xyz;', //
		'	float l = length(lightDir);', //
		'	lightDist = 1.0 - min(l*l / 10000.0, 1.0);',
		'	lightDir = normalize(lightDir);', //
		'}'//
		].join('\n'),
		fshader : [//
		'precision mediump float;',//

		'varying vec3 normal;',//
		'varying vec3 lightDir;',//
		'varying float lightDist;',//
		'varying float vertDist;',//

		'void main(void)',//
		'{',//
		'	float power = dot(normalize(normal),lightDir)*0.5+0.5;',
		'	vec3 col = vec3(1.0,0.9,0.9) * power * lightDist;',
		'	vec3 col2 = vec3(1.0, 0.4,0.0) * vertDist;',
		'	gl_FragColor = vec4(col2+col, 1.0);',//
		'}'//
		].join('\n')
	};

	init();
});
