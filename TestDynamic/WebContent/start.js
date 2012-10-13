//require.config({
//	paths : {
//		"three" : "three.min"
//	}
//});

require(
		[ 'entities/World', 'entities/Entity', 'entities/systems/System', 'entities/systems/TransformSystem',
				'entities/systems/RenderSystem', 'entities/components/TransformComponent',
				'entities/components/MeshDataComponent', 'entities/components/MeshRendererComponent',
				'entities/systems/PartitioningSystem', 'renderer/MeshData', 'renderer/Renderer', 'renderer/Material',
				'renderer/Shader' ],
		function(World, Entity, System, TransformSystem, RenderSystem, TransformComponent, MeshDataComponent,
				MeshRendererComponent, PartitioningSystem, MeshData, Renderer, Material, Shader) {

			function init() {
				var world = new World();

				// world.setManager({
				// type : 'TestManager',
				// added : function(entity) {
				// console.log('TestManager Added: ' + entity.name);
				// },
				// changed : function(entity) {
				// console.log('TestManager Changed: ' + entity.name);
				// },
				// removed : function(entity) {
				// console.log('TestManager Removed: ' + entity.name);
				// }
				// });

				var TestSystem = function() {
					System.apply(this, arguments);
				};
				TestSystem.prototype = Object.create(System.prototype);
				TestSystem.prototype.process = function(entities) {
					console.log("TestSystem entitycount: " + entities.length);
				};
				var testSystem = new TestSystem('TestSystem', null);
				world.setSystem(testSystem);

				world.setSystem(new TransformSystem());

				var renderList = [];
				var partitioningSystem = new PartitioningSystem(renderList);
				world.setSystem(partitioningSystem);
				var renderSystem = new RenderSystem(renderList);
				world.setSystem(renderSystem);

				// var entity1 = world.createEntity();
				// entity1.addToWorld();
				// var entity2 = world.createEntity();
				// entity2.addToWorld();
				//
				// world.process();
				//
				// entity2.removeFromWorld();
				//
				// world.process();
				//
				// var entity3 = world.createEntity();
				// entity3.addToWorld();
				//
				// var transformComponent = new TransformComponent();
				// entity3.setComponent(transformComponent);
				// entity3.TransformComponent.transform.translation.x = 5;

				var triangleEntity = createTriangleEntity(world);
				triangleEntity.addToWorld();

				// world.process();
				//
				// entity3.clearComponent('TransformComponent');
				//
				world.process();

				var renderer = new Renderer();
				renderSystem.render(renderer);

				world.getEntities();
			}

			function createTriangleEntity(world) {
				var dataMap = {
					vertexByteSize : 12, // count*bytes
					descriptors : [ {
						attributeName : 'POSITION',
						count : 3,
						type : 'Float',
						offset : 0,
						stride : 0,
						normalized : true,
					} ]
				};

				var meshData = new MeshData(dataMap, 3, 3);
				meshData.getAttributeBuffer('POSITION').set([ 0, 0, 0, -5, 5, 0, 5, 5, 0 ]);
				meshData.getIndexBuffer().set([ 0, 1, 2 ]);

				var entity = world.createEntity();

				var transformComponent = new TransformComponent();
				entity.setComponent(transformComponent);

				var meshDataComponent = new MeshDataComponent(meshData);
				entity.setComponent(meshDataComponent);

				var meshRendererComponent = new MeshRendererComponent();
				var material = new Material('TestMaterial');
				var vs = 'attribute vec3 position; //!POSITION\nuniform vec3 ape;\n void main() { gl_Position = vec4(position*ape,1.0); }';
				var fs = 'uniform sampler2D diffuse;\n void main() { gl_FragColor = vec4(1.0,0.0,0.0,1.0) * texture2D(diffuse, vec2(0.0,0.0)); }';
				material.shader = new Shader('TestShader', vs, fs);
				meshRendererComponent.materials.push(material);
				entity.setComponent(meshRendererComponent);

				return entity;
			}

			init();
		});
