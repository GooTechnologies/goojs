require.config({
    baseUrl : "./",
    paths : {
        goo : "../src/goo",
    }
});
require(['goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System', 'goo/entities/systems/TransformSystem',
		'goo/entities/systems/RenderSystem', 'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/entities/systems/PartitioningSystem', 'goo/renderer/MeshData', 'goo/renderer/Renderer',
		'goo/renderer/Material', 'goo/renderer/Shader', 'goo/entities/GooRunner', 'goo/renderer/TextureCreator', 'goo/renderer/Loader',
		'goo/loaders/JSONImporter', 'goo/entities/components/ScriptComponent', 'goo/util/DebugUI', 'goo/shapes/ShapeCreator',
		'goo/entities/EntityUtils', 'goo/entities/components/LightComponent', 'goo/renderer/Light', 'goo/renderer/Camera',
		'goo/entities/components/CameraComponent', 'goo/scripts/OrbitCamControlScript', 'goo/math/Vector3', 'goo/renderer/shaders/ShaderLib'], function(World, Entity, System,
	TransformSystem, RenderSystem, TransformComponent, MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData, Renderer, Material,
	Shader, GooRunner, TextureCreator, Loader, JSONImporter, ScriptComponent, DebugUI, ShapeCreator, EntityUtils, LightComponent, Light, Camera,
	CameraComponent, OrbitCamControlScript, Vector3, ShaderLib) {
	"use strict";

	var resourcePath = "../resources";
	var gui;

	function init() {
		var goo = new GooRunner({
			showStats : true,
			antialias : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);
		
		goo.renderer.setClearColor(0, 0, 0, 1);

		gui = new dat.GUI();

		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(120, Math.PI*0.6, Math.PI / 8),
			maxZoomDistance : 300,
			lookAtPoint : new Vector3(0,15,0),
			minAscent : 0
		}));
		cameraEntity.setComponent(scripts);

		// Setup light
		var light = new Light();
		light.shadowCaster = true;
		var materialBox = Material.createMaterial(ShaderLib.simple, 'mat');
		var entity = createBox(goo, materialBox, 1, 1, 1, 1, 0, 0, 0);
		entity.setComponent(new LightComponent(light));
		var script = {
			run: function (entity) {
				var transformComponent = entity.transformComponent;
				transformComponent.transform.translation.x = Math.sin(World.time * 0.3) * 80;
				transformComponent.transform.translation.y = 30;
				transformComponent.transform.translation.z = Math.cos(World.time * 0.3) * 80;
				transformComponent.setUpdated();
			}
		};
		entity.setComponent(new ScriptComponent(script));
		entity.addToWorld();
		
		gui.add(light.shadowSettings, 'type', {
			'VSM': 'Blur',
			'Hard': 'None'
		});
		script.enabled = true;
		gui.add(script, 'enabled');

		addMeshes(goo);
	}

	function addMeshes(goo) {
		var importer = new JSONImporter(goo.world);

		importer.load(resourcePath + '/girl.model', resourcePath + '/', {
			onSuccess : function(entities) {
				for ( var i in entities) {
					entities[i].addToWorld();
				}
				entities[0].transformComponent.transform.scale.set(0.15, 0.15, 0.15);
				entities[0].transformComponent.transform.translation.x = 0;
				entities[0].transformComponent.transform.translation.y = -8;
			},
			onError : function(error) {
				console.error(error);
			}
		});

		var shader = Material.createShader({
			attributes : {
				vertexPosition : MeshData.POSITION,
				vertexUV0 : MeshData.TEXCOORD0
			},
			uniforms : {
				viewMatrix : Shader.VIEW_MATRIX,
				projectionMatrix : Shader.PROJECTION_MATRIX,
				worldMatrix : Shader.WORLD_MATRIX,
				lightViewMatrix : Shader.LIGHT_VIEW_MATRIX,
				lightProjectionMatrix : Shader.LIGHT_PROJECTION_MATRIX,
				diffuseMap : Shader.TEXTURE0,
				depthMap : Shader.TEXTURE1,
				depthControl : 800.0,
				attenuationPower : 500.0
			},
			vshader : [ //
			'attribute vec3 vertexPosition;', //
			'attribute vec2 vertexUV0;', //

			'uniform mat4 viewMatrix;', //
			'uniform mat4 projectionMatrix;',//
			'uniform mat4 worldMatrix;',//

			'varying vec2 texCoord0;',//
			'varying vec4 vWorldPosition;',

			'void main(void) {', //
			'	texCoord0 = vertexUV0;',//
			'	vWorldPosition = worldMatrix * vec4(vertexPosition, 1.0);',
			'	gl_Position = projectionMatrix * viewMatrix * vWorldPosition;', //
			'}'//
			].join('\n'),
			fshader : [//
			'precision mediump float;',//

			'uniform mat4 viewMatrix;', //
			'uniform mat4 projectionMatrix;',//
			'uniform mat4 lightViewMatrix;', //
			'uniform mat4 lightProjectionMatrix;',//

			'uniform sampler2D diffuseMap;',//
			'uniform sampler2D depthMap;',//
			'uniform float depthControl;',
			'uniform float attenuationPower;',

			'varying vec2 texCoord0;',//
			'varying vec4 vWorldPosition;',
			
			'const float PI = 3.1415926535897932384626;',

	        'float linstep(float low, float high, float v){',
	        '    return clamp((v-low)/(high-low), 0.0, 1.0);',
	        '}',

	        'float VSM(sampler2D depths, vec2 uv, float compare){',
	        '    vec2 moments = texture2D(depths, uv).xy;',
	        '    float p = smoothstep(compare-0.02, compare, moments.x);',
	        '    float variance = max(moments.y - moments.x*moments.x, -0.001);',
	        '    float d = compare - moments.x;',
	        '    float p_max = linstep(0.3, 1.0, variance / (variance + d*d));',
	        '    return clamp(max(p, p_max), 0.0, 1.0);',
	        '}',

	        'float attenuation(vec3 dir){',
	        '    float dist = length(dir);',
	        '    float radiance = 1.0/(1.0+pow(dist/10.0, 2.0));',
	        '    return clamp(radiance*attenuationPower, 0.0, 1.0);',
	        '}',
	        
	        'float influence(vec3 normal, float coneAngle){',
	        '    float minConeAngle = ((360.0-coneAngle-10.0)/360.0) * PI;',
	        '    float maxConeAngle = ((360.0-coneAngle)/360.0) * PI;',
	        '    return smoothstep(minConeAngle, maxConeAngle, acos(normal.z));',
	        '}',

	        'float lambert(vec3 surfaceNormal, vec3 lightDirNormal){',
	        '    return max(0.0, dot(surfaceNormal, lightDirNormal));',
	        '}',
	        
	        'vec3 skyLight(vec3 normal){',
	        '    return vec3(smoothstep(0.0, PI, PI-acos(normal.y)))*0.4;',
	        '}',

	        'vec3 gamma(vec3 color){',
	        '    return pow(color, vec3(2.2));',
	        '}',

			'void main(void)',//
			'{',//

			'	vec3 camPos = (viewMatrix * vWorldPosition).xyz;',
			'	vec3 lightPos = (lightViewMatrix * vWorldPosition).xyz;',
            '	vec3 lightPosNormal = normalize(lightPos);',
			'	vec4 lightDevice = lightProjectionMatrix * vec4(lightPos, 1.0);',
			'	vec2 lightDeviceNormal = lightDevice.xy/lightDevice.w;',
			'	vec2 lightUV = lightDeviceNormal*0.5+0.5;',

			'	float lightDepth2 = clamp(length(lightPos) / depthControl, 0.0, 1.0);',
			'	float illuminated = VSM(depthMap, lightUV, lightDepth2) * 0.8 + 0.2;',
			
//			'	float lightDepth1 = texture2D(depthMap, lightUV).r;',
//			'	float lightDepth2 = clamp(length(lightPos) / depthControl, 0.0, 1.0);',
//			'	float bias = 0.001;',
//			'	float illuminated = step(lightDepth2, lightDepth1+bias);',

			'	vec4 tex = texture2D(diffuseMap, texCoord0);',
			'	gl_FragColor = vec4((attenuation(lightPos) * influence(lightPosNormal, 55.0)) * tex.rgb * vec3(illuminated) , 1.0);',
			'}'//
			].join('\n')
			}, 'Test');
//		gui.add(shader.uniforms, 'depthControl', 0.0, 2000.0);
		gui.add(shader.uniforms, 'attenuationPower', 0.0, 1000.0);

		var material = new Material('shadowed');
		material.shader = shader;
		var texture = new TextureCreator().loadTexture2D('../resources/fieldstone-c.jpg');
		material.textures.push(texture);
		
		createBox(goo, material, 2000, 10, 100, 100, 0, -13, 0);
	}
	
	function createBox(goo, material, w, h, tx, ty, x, y, z) {
		var meshData = ShapeCreator.createBox(w, h, w, tx, ty);
		var entity = EntityUtils.createTypicalEntity(goo.world, meshData);
		entity.meshRendererComponent.materials.push(material);
		entity.transformComponent.transform.translation.set(0, -13, 0);
		entity.addToWorld();
		return entity;
	}

	init();
});
