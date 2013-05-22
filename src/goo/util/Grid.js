define([
	'goo/entities/Entity',
	'goo/entities/EntityUtils',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/renderer/MeshData',
	'goo/renderer/Material',
	'goo/renderer/Shader',
	'goo/shapes/ShapeCreator',
	'goo/renderer/shaders/ShaderLib'
],
/** @lends */
function(
	Entity,
	EntityUtils,
	MeshDataComponent,
	MeshRendererComponent,
	MeshData,
	Material,
	Shader,
	ShapeCreator,
	ShaderLib
) {
	var _defaults = {
		width: 1,
		height: 1,
		gridX: 1,
		gridY: 1,
		name: 'Grid',
		color: [0, 0, 0, 0.2],
		floor: true,
		fineGrid: true
	};

	/**
	 * @class Creates an entity with all components needed to display a grid
	 * @param {World} world
	 * @param {object} properties
	 */
	function Grid(world, properties) {
		properties = properties || {};
		for (var key in _defaults) {
			this[key] = (properties[key] !== undefined) ? properties[key] : _defaults[key];
		}

		this.topEntity = world.createEntity(this.name);
		if(this.floor) {
			this.topEntity.transformComponent.transform.rotation.rotateX(-Math.PI/2);
		}

		// Coarse grid
		var coarseGridEntity = world.createEntity(this.name + '_coarse');
		coarseGridEntity.setComponent(
			new MeshDataComponent(
				this._buildGrid()
			)
		);

		var coarseMaterial = this._buildGridMaterial(Grid.COARSE);
		coarseGridEntity.setComponent(new MeshRendererComponent());
		coarseGridEntity.meshRendererComponent.materials.push(coarseMaterial);

		// TODO: Needs to be solved in a better way
		coarseGridEntity.transformComponent.transform.translation.z = 0.001;

		this.topEntity.transformComponent.attachChild(coarseGridEntity.transformComponent);


		// Fine grid
		if(this.fineGrid) {
			var fineGridEntity = world.createEntity(this.name + '_fine');
			fineGridEntity.setComponent(
				new MeshDataComponent(
					this._buildGrid(Grid.FINE)
				)
			);

			var fineMaterial = this._buildGridMaterial(Grid.FINE);
			fineGridEntity.setComponent(new MeshRendererComponent());
			fineGridEntity.meshRendererComponent.materials.push(fineMaterial);

			// TODO: Needs to be solved in a better way
			fineGridEntity.transformComponent.transform.translation.z = 0.001;

			this.topEntity.transformComponent.attachChild(fineGridEntity.transformComponent);
		}

		// Surface
		var quad = ShapeCreator.createQuad(this.width, this.height);
		var quadEntity = EntityUtils.createTypicalEntity(world, quad);

		var floorMaterial = Material.createMaterial(ShaderLib.simpleLit);

		floorMaterial.uniforms.materialAmbient = [1, 1, 1, 1];
		quadEntity.meshRendererComponent.materials.push(floorMaterial);
		this.topEntity.transformComponent.attachChild(quadEntity.transformComponent);

	}

	Grid.prototype.addToWorld = function() {
		EntityUtils.traverse(this.topEntity, function(entity) {
			entity.addToWorld();
		});
	};


	Grid.prototype._buildGrid = function(type) {
		var xTiles = Math.ceil(this.width/this.gridX);
		var yTiles = Math.ceil(this.height/this.gridY);
		var xVerts = 2*(xTiles-1);
		var yVerts = 2*(yTiles-1);
		var offsetX = 0, offsetY = 0;
		var xExtent = this.width / 2;
		var yExtent = this.height / 2;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION]);
		var verts, meshData;

		if(type === Grid.FINE) {
			meshData = new MeshData(attributeMap, xVerts + yVerts + 4, xVerts + yVerts + 4);
			verts = [];
			offsetX = this.gridX / 2;
			offsetY = this.gridY / 2;
		} else {
			var corners = 4;
			meshData = new MeshData(attributeMap, xVerts + yVerts + corners, xVerts + yVerts + corners * 2);


			// Corners
			verts = [
				-xExtent, -yExtent, 0,
				-xExtent, yExtent, 0,
				xExtent, yExtent, 0,
				xExtent, -yExtent, 0
			];
		}
		// Vertical line vertices
		for (var i = 1; i < xTiles; i++) {
			verts.push(
				-xExtent + this.gridX * i + offsetX, -yExtent, 0,
				-xExtent + this.gridY * i + offsetX, yExtent, 0
			);
		}
		// Horizontal line vertices
		for (var i = 1; i < yTiles; i++) {
			verts.push(
				-xExtent, -yExtent + this.gridY * i + offsetY, 0,
				+xExtent, -yExtent + this.gridY * i + offsetY, 0
			);
		}

		// Connecting the dots
		var indices = [
			0, 1,
			1, 2,
			2, 3,
			3, 0
		];
		for (var i = 4; i < verts.length / 3; i += 2) {
			indices.push(i, i + 1);
		}


		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);

		meshData.indexModes[0] = 'Lines';

		return meshData;
	};

	Grid.prototype._buildGridMaterial = function(type) {
		var material = new Material('Coarse grid material');
		material.shader = this.gridShader;
		material.uniforms.color = this.color;
		material.uniforms.lineWidth = (type === Grid.FINE) ? 1 : 2;
		material.uniforms.fogFar = 20;

		return material;
	};

	var shaderDef = {
		attributes : {
			vertexPosition : MeshData.POSITION
		},
		uniforms : {
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			color: Shader.AMBIENT,
			fogColor: [0.9, 0.9, 0.9, 1],
			fogNear: Shader.MAIN_NEAR_PLANE,
			fogFar: Shader.MAIN_FAR_PLANE
		},
		vshader : [ //
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexUV0;',

			'uniform mat4 worldMatrix;',
			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',

			'varying float depth;',

			'void main(void)',
			'{',
				'vec4 viewPosition = viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);',

				'depth = viewPosition.z;',

				'gl_Position = projectionMatrix * viewPosition;',
			'}'
		].join('\n'),
		fshader : [//
			'precision mediump float;',

			'uniform vec4 fogColor;',
			'uniform vec4 color;',
			'uniform float fogNear;',
			'uniform float fogFar;',

			'varying float depth;',

			'void main(void)',
			'{',
				'gl_FragColor = mix(color, fogColor, clamp((depth + fogNear) / (fogNear - fogFar), 0.0, 1.0));',
			'}'
		].join('\n')
	};
	Grid.prototype.gridShader = Material.createShader(shaderDef, 'Grid Shader');




	Grid.COARSE = 'coarse';
	Grid.FINE = 'fine';


	return Grid;
});