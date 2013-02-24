require.config({
	baseUrl : "./",
	paths : {
		goo : "../src/goo",
	}
});
require(['goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System', 'goo/entities/systems/TransformSystem',
		'goo/entities/systems/RenderSystem', 'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/entities/systems/PartitioningSystem', 'goo/renderer/MeshData', 'goo/renderer/Renderer',
		'goo/renderer/Material', 'goo/renderer/Shader', 'goo/entities/GooRunner', 'goo/renderer/TextureCreator', 'goo/loaders/Loader',
		'goo/loaders/JSONImporter', 'goo/entities/components/ScriptComponent', 'goo/util/DebugUI', 'goo/shapes/ShapeCreator',
		'goo/entities/EntityUtils', 'goo/renderer/Texture', 'goo/renderer/Camera', 'goo/entities/components/CameraComponent', 'goo/math/Vector3',
		'goo/scripts/BasicControlScript', 'goo/renderer/shaders/ShaderLib',
		'goo/util/FastBuilder',
		'goo/math/Transform',
		'goo/scripts/OrbitCamControlScript',
		'goo/renderer/light/PointLight',
		'goo/entities/components/LightComponent',
		'goo/math/Vector4'
		], function(World, Entity, System, TransformSystem, RenderSystem, TransformComponent, MeshDataComponent,
	MeshRendererComponent, PartitioningSystem, MeshData, Renderer, Material, Shader, GooRunner, TextureCreator, Loader, JSONImporter,
	ScriptComponent, DebugUI, ShapeCreator, EntityUtils, Texture, Camera, CameraComponent, Vector3, 
	BasicControlScript, ShaderLib,
	FastBuilder,
	Transform,
	OrbitCamControlScript,
	PointLight,
	LightComponent,
	Vector4
		) {
	"use strict";

	function init() {
		// Create typical goo application
		var goo = new GooRunner({
			showStats : true
		});
		goo.renderer.domElement.id = 'goo';
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
			spherical : new Vector3(200, Math.PI / 2, -2.1)
		}));
		cameraEntity.setComponent(scripts);

		var entity = createBox(goo, 1, 1, ShaderLib.simple, 1);
		var light = new PointLight();
		entity.setComponent(new LightComponent(light));
		entity.addToWorld();
		var script = {
			run: function (entity) {
				var t = entity._world.time * 1.0;

				var transformComponent = entity.transformComponent;
//				transformComponent.transform.translation.x = Math.sin(t * 1.0) * 100;
//				transformComponent.transform.translation.y = 200;
//				transformComponent.transform.translation.z = Math.cos(t * 1.0) * 100;
//				transformComponent.setUpdated();
			}
		};
		entity.setComponent(new ScriptComponent(script));
	}

	// Create simple quad
	function createShapes(goo) {
		var gui = new dat.GUI();

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.NORMAL]);
		attributeMap.movementNormal = {
			count : 3,
			type : 'Float',
			normalized : false
		};
		attributeMap.movementNormal2 = {
			count : 3,
			type : 'Float',
			normalized : false
		};
		attributeMap.offsets = {
			count : 4,
			type : 'Float',
			normalized : false
		};

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
		             2,6,7, 7,3,2,
		]);
		
		var count = 50000;
		var meshBuilder = new FastBuilder(meshData, count);
		var transform = new Transform();
		var movement = new Vector3();
		var offsetvec = new Vector4();
		var spread = 20.0;
		var t = performance.now();
		for (var x=0;x<count;x++) {
			transform.translation.x = Math.sin(x*Math.PI*2/count);
			transform.translation.y = (Math.random() * 2.0 - 1.0) * 2.0;
			transform.translation.z = Math.cos(x*Math.PI*2/count);
			transform.translation.normalize();
			transform.translation.mul(Math.random()*15.0+spread);
			
			transform.setRotationXYZ(0, Math.random() * Math.PI * 2, 0);
			transform.update();
			
			movement.copy(transform.translation).normalize();
			for (var n=0;n<8;n++) {
				movementNormal[n*3+0] = movement.x;
				movementNormal[n*3+1] = movement.y;
				movementNormal[n*3+2] = movement.z;
			}
			movement.cross(Vector3.UNIT_Y);
			for (var n=0;n<8;n++) {
				movementNormal2[n*3+0] = movement.x;
				movementNormal2[n*3+1] = movement.y;
				movementNormal2[n*3+2] = movement.z;
			}
			
			var spin = (x/count) * Math.PI * 1;
			var spin2 = (x/count) * Math.PI * 2 * (Math.random()*0.8+0.6);
//			var spin3 = (x/count) * Math.PI * 2 * (Math.random()*0.65+0.7);
			offsetvec.set(
				spin,
				spin2,
				spin,
				spin2
				);
			for (var n=0;n<8;n++) {
				offsets[n*4+0] = offsetvec.x;
				offsets[n*4+1] = offsetvec.y;
				offsets[n*4+2] = offsetvec.z;
				offsets[n*4+3] = offsetvec.w;
			}
			
			meshBuilder.addMeshData(meshData, transform);
		}
		console.log('total time: ', performance.now() - t);
		var meshDatas = meshBuilder.build();

		var material = Material.createMaterial(superLit, 'test');
		for (var key in meshDatas) {
			var entity = goo.world.createEntity();
			var meshDataComponent = new MeshDataComponent(meshDatas[key]);
			entity.setComponent(meshDataComponent);
			var meshRendererComponent = new MeshRendererComponent();
			meshRendererComponent.materials.push(material);
			entity.setComponent(meshRendererComponent);
			entity.addToWorld();
		}
		
		gui.add(material.shader.uniforms, 'move', 0.0, 100.0);
		gui.add(material.shader.uniforms, 'move2', 0.0, 1.0);
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
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			lightPosition : Shader.LIGHT0,
			cameraFar : Shader.MAIN_FAR_PLANE,
			move : 60.0,
			move2 : 0.0,
			time : Shader.TIME
		},
		vshader : [ //
   		'attribute vec3 vertexPosition;', //
   		'attribute vec3 realVertexPosition;', //
		'attribute vec3 movementNormal;', //
		'attribute vec3 movementNormal2;', //
		'attribute vec4 offsets;', //

		'uniform mat4 viewMatrix;', //
		'uniform mat4 projectionMatrix;',//
		'uniform mat4 worldMatrix;',//
		'uniform vec3 lightPosition;', //
		
		'uniform float move;',
		'uniform float move2;',
		'uniform float time;',

		'varying vec3 normal;',//
		'varying vec3 lightDir;',//
		'varying float lightDist;',//
		'varying float vertDist;',//

		'void main(void) {', //
		'	vec3 pos = vertexPosition + ',
		'				movementNormal * sin(mix(offsets.x, offsets.y, sin(time*0.5)*0.5+0.5) + time) * sin(time*0.3) * move + ',
		'				movementNormal2 * cos(mix(offsets.z, offsets.w, sin(time*0.5)*0.5+0.5) + time) * sin(time*0.3) * move;',
		'	vertDist = 1.0 - min(length(pos)/120.0, 1.0);',
		'	vec4 worldPos = worldMatrix * vec4(pos, 1.0);', //
		'	gl_Position = projectionMatrix * viewMatrix * worldPos;', //

		'	normal = realVertexPosition.xyz;', //
		'	lightDir = lightPosition - worldPos.xyz;', //
		'	float l = length(lightDir);', //
		'	lightDist = 1.0 - min(l*l / 10000.0, 1.0);',
		'	lightDir = normalize(lightDir);', //
		'}'//
		].join('\n'),
		fshader : [//
		'precision mediump float;',//

		'uniform float cameraFar;', //

		'varying vec3 normal;',//
		'varying vec3 lightDir;',//
		'varying float lightDist;',//
		'varying float vertDist;',//

		'void main(void)',//
		'{',//
		'	float power = dot(normalize(normal),lightDir)*0.75+0.25;',
		'	power *= lightDist;',
		'	vec3 col = vec3(power);',
		'	vec3 col2 = vec3(1.0, 0.4,0.0) * vertDist;',
		'	gl_FragColor = vec4(col2+col, 1.0);',//
//		'	float depth = gl_FragCoord.z / gl_FragCoord.w;',//
//		'	float d = 1.0 - smoothstep( 0.0, 200.0, depth );',//
//		'	gl_FragColor = vec4(vec3(d), 1.0);',//
		'}'//
		].join('\n')
	};
	
	function createBox (goo, w, h, shader, tile) {
		var meshData = ShapeCreator.createBox(w, h, w, tile, tile);
		var entity = EntityUtils.createTypicalEntity(goo.world, meshData);
		entity.name = "Floor";

		var material = new Material('TestMaterial');
		material.shader = Material.createShader(shader, 'Floorhader');

		entity.meshRendererComponent.materials.push(material);

		return entity;
	}

	init();
});
