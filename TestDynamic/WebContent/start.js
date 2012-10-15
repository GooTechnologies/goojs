require([ 'goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System',
		'goo/entities/systems/TransformSystem', 'goo/entities/systems/RenderSystem',
		'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/entities/systems/PartitioningSystem',
		'goo/renderer/MeshData', 'goo/renderer/Renderer', 'goo/renderer/Material', 'goo/renderer/Shader',
		'goo/renderer/DataMap', 'goo/entities/GooRunner' ], function(World, Entity, System, TransformSystem,
		RenderSystem, TransformComponent, MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData,
		Renderer, Material, Shader, DataMap, GooRunner) {

	function init() {
		// Create typical goo application
		var goo = new GooRunner();
		document.body.appendChild(goo.renderer.domElement);

		// Add quad
		var quadEntity = createQuadEntity(goo.world);
		quadEntity.addToWorld();
	}

	function createQuadEntity(world) {
		// Create simple quad
		var dataMap = DataMap.defaultMap([ 'POSITION' ]);
		var meshData = new MeshData(dataMap, 4, 6);
		meshData.getAttributeBuffer('POSITION').set([ -0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, 0.5, 0, 0.5, -0.5, 0 ]);
		meshData.getIndexBuffer().set([ 0, 1, 3, 1, 2, 3 ]);

		// Create entity
		var entity = world.createEntity();

		// Create transform component
		var transformComponent = new TransformComponent();
		entity.setComponent(transformComponent);

		// Create meshdata component using above data
		var meshDataComponent = new MeshDataComponent(meshData);
		entity.setComponent(meshDataComponent);

		// Create meshrenderer component with material and shader
		var meshRendererComponent = new MeshRendererComponent();
		var material = new Material('TestMaterial');
		var vs = [ //
		'attribute vec3 position; //!POSITION', //
		'uniform mat4 worldMatrix; //!WORLD_MATRIX', //
		'void main() {', //
		'	gl_Position = vec4(position,1.0);', //
		'}' //
		].join('\n');
		var fs = [ //
		'void main() {', //
		'	gl_FragColor = vec4(1.0,0.0,0.0,1.0);', //
		'}' //
		].join('\n');
		material.shader = new Shader('TestShader', vs, fs);
		meshRendererComponent.materials.push(material);
		entity.setComponent(meshRendererComponent);

		return entity;
	}

	init();
});
