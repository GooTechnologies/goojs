define([
	'goo/entities/Entity',
	'goo/entities/EntityUtils',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/renderer/MeshData',
	'goo/renderer/Material',
	'goo/renderer/Shader',
	'goo/shapes/ShapeCreator',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Util'
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
	ShaderLib,
	Util
) {

	var _defaultGrid = {
		stepX: 1,
		stepY: 1,
		color: [0,0,0,1],
		width: 1
	};
	/**
	 * @class Creates an entity with all components needed to display a grid
	 * @param {World} world
	 * @param {object} [properties]
	 * @param {object[]} [properties.grids] An array of grid settings
	 * @param {boolean} [properties.surface=false] Whether to have a base surface or not
	 * @param {boolean} [properties.surfaceColor=[1,1,1,1] If there is a base surface you can specify which color it should have
	 * @param {boolean} [properties.floor=false] When set to true, the surface will be rotated to be in the XZ-plane, like a floor.
	 * @param {number} [properties.width=1] Width of the grid
	 * @param {number} [properties.height=1] Height of the grid
	 * @param {boolean} [properties.fogOn=false] Set if the grid should fade in the distance, like fog
	 * @param {number[]} [properties.fogColor=[0,0,0,1] The color the grid should fade to.
	 *
	 * @example
	 * var floor = new Grid(goo.world, {
	 * 	floor: true,
	 *	width: 100,
	 * 	height: 100,
	 * 	fogOn: true,
	 * 	fogFar: 60,
	 * 	fogColor: [0.9, 0.9, 0.9, 1.0],
	 * 	surface: true,
	 * 	surfaceColor: [1.5, 1.5, 1.5, 1.0],
	 * 	grids: [
	 *   {
	 *    stepX: 1, // The length between grid lines on the X-axis
	 *    stepY: 1, // The length between grid lines on the X-axis
	 *    width: 1, // The width of the grid lines drawn
	 *    color: [0.4, 0.4, 0.4, 0.8] // The color of the grid lines
	 *   },
	 *   {
	 *    stepX: 0.5,
	 *    stepY: 0.5,
	 *    width: 1,
	 *    color: [0.7, 0.7, 0.7, 0.8]
	 *   }
	 *  ]
	 * });
	 *
	 */
	function Grid(world, properties) {
		properties = properties || {};


		// Entity for all the grids
		this.topEntity = world.createEntity(this.name);
		if(properties.floor) {
			this.topEntity.transformComponent.transform.rotation.rotateX(-Math.PI/2);
		}

		// If you want a base surface, add base surface
		if(properties.surface) {
			// Surface
			var quad = ShapeCreator.createQuad(properties.width, properties.height);
			var quadEntity = EntityUtils.createTypicalEntity(world, quad);

			var floorMaterial = Material.createMaterial(ShaderLib.simpleLit);

			floorMaterial.uniforms.materialDiffuse = properties.surfaceColor || [1,1,1,1];
			quadEntity.meshRendererComponent.materials.push(floorMaterial);
			this.topEntity.transformComponent.attachChild(quadEntity.transformComponent);
		}

		this.gridShader = this._buildGridShader(properties);

		// Make sure there's at least one grid
		if(!properties.grids) { properties.grids = []; }
		if(properties.grids.length === 0) {
			properties.grids.push(Util.clone(_defaultGrid));
		}
		this.grids = properties.grids;

		// Add the grids
		var entity, grid, meshRendererComponent;
		for(var i = 0; i < properties.grids.length; i++) {
			grid = properties.grids[i];

			this._fillDefaults(grid, _defaultGrid);
			grid._width = properties.width || 1;
			grid._height = properties.height || 1;

			entity = world.createEntity('grid_'+i);
			entity.setComponent(
				new MeshDataComponent(
					this._buildGrid(grid)
				)
			);
			meshRendererComponent = new MeshRendererComponent();
			meshRendererComponent.materials.push(
				this._buildGridMaterial(grid, i)
			);
			entity.setComponent(meshRendererComponent);

			entity.transformComponent.transform.translation.z = 0.001 * (properties.grids.length - i);

			this.topEntity.transformComponent.attachChild(entity.transformComponent);
		}
	}

	Grid.prototype.addToWorld = function() {
		EntityUtils.traverse(this.topEntity, function(entity) {
			entity.addToWorld();
		});
	};

	/*
	 * Checks if the position collides with any other grid line
	 */
	Grid.prototype._collides = function(grid, pos, direction) {
		var key = 'step' + direction;

		for (var i = 0; i < this.grids.length; i++) {
			if (grid === this.grids[i]) { return false; }
			if (pos % this.grids[i][key] === 0) { return true; }
		}
		return false;
	};

	Grid.prototype._buildGrid = function(grid) {
		var xTiles = Math.ceil(grid._width/grid.stepX);
		var yTiles = Math.ceil(grid._height/grid.stepY);

		var xExtent = grid._width / 2;
		var yExtent = grid._height / 2;

		var verts = [];
		var indices = [];

		// Adding outer lines
		if (grid === this.grids[0]) {
			verts.push(
				-xExtent, -yExtent, 0,
				-xExtent, yExtent, 0,
				xExtent, yExtent, 0,
				xExtent, -yExtent, 0
			);

			// Connecting the corners
			indices.push(
				0, 1,
				1, 2,
				2, 3,
				3, 0
			);
		}
		// Y grid lines
		var xPos;
		for (var i = 1; i < xTiles; i++) {
			xPos = grid.stepX * i;
			if (this._collides(grid, xPos, 'X')) { continue; }
			xPos -= xExtent;
			verts.push(
				xPos, -yExtent, 0,
				xPos, yExtent, 0
			);
		}

		// X grid lines
		var yPos;
		for (var i = 1; i < yTiles; i++) {
			yPos = grid.stepY * i;
			if (this._collides(grid, yPos, 'Y')) { continue; }
			yPos -= yExtent;
			verts.push(
				-xExtent, yPos, 0,
				xExtent, yPos, 0
			);
		}
		for (var i = indices.length / 2; i < verts.length / 3; i += 2) {
			indices.push(i, i + 1);
		}

		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), verts.length, indices.length);

		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);

		meshData.indexModes[0] = 'Lines';

		return meshData;
	};

	Grid.prototype._buildGridMaterial = function(grid, i) {
		var material = new Material('GridMaterial_' + i);
		if(this.gridShader) {	material.shader = this.gridShader; }
		material.uniforms.color = grid.color;
		material.lineWidth = grid.width;

		/*
		material.blendState = {
			blending: 'MultiplyBlending',
			blendEquation: 'SubtractEquation',
			blendSrc: 'SrcAlphaFactor',
			blendDst: 'OneMinusSrcAlphaFactor'
		};
		*/



		return material;
	};

	Grid.prototype._fillDefaults = function(values, defaults) {
		for (var key in defaults) {
			if (values[key] === undefined) {
				if (typeof defaults[key] === 'array' || defaults[key] instanceof Object) {
					values[key] = Util.clone(defaults[key]);
				} else {
					values[key] = defaults[key];
				}
			}
		}
	};

	Grid.prototype._buildGridShader = function(properties) {

		var shaderDef = {
			attributes : {
				vertexPosition : MeshData.POSITION
			},
			uniforms : {
				viewMatrix : Shader.VIEW_MATRIX,
				projectionMatrix : Shader.PROJECTION_MATRIX,
				worldMatrix : Shader.WORLD_MATRIX,
				color: [0,0,0,1],
				fogOn: properties.fogOn || false,
				fogColor: properties.fogColor || [0,0,0,1],
				fogNear: Shader.MAIN_NEAR_PLANE,
				fogFar: properties.fogFar || Shader.MAIN_FAR_PLANE
			},
			vshader : [ //
				'attribute vec3 vertexPosition;',

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
				'uniform bool fogOn;',

				'varying float depth;',

				'void main(void)',
				'{',
					'if (fogOn) {',
						'float lerpVal = clamp(depth / (-fogFar - fogNear), 0.0, 1.0);',
						'lerpVal = pow(lerpVal, 0.4);',
						/*'float alpha = mix(color.a, fogColor.a, lerpVal);',
						'vec3 baseColor = mix(color.rgb*color.a, fogColor.rgb*fogColor.a, pow(lerpVal,2));',
						'baseColor /= alpha;',
						'gl_FragColor = vec4(baseColor, alpha);',*/
						'gl_FragColor = mix(color, fogColor, lerpVal);',
					'} else {',
						'gl_FragColor = color;',
					'}',
				'}'
			].join('\n')
		};
		return Material.createShader(shaderDef, 'Grid Shader');
	};

	return Grid;
});