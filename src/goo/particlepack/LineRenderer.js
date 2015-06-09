define([
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/renderer/Material',
	'goo/renderer/Texture',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/Vector3',
	'goo/renderer/TextureCreator'
],
/** @lends */
function (
	MeshData,
	Shader,
	Material,
	Texture,
	MeshRendererComponent,
	Vector3,
	TextureCreator
) {
	"use strict";

	function LineRenderer() {
		this.settings = null;
		this.entity = null;
		this.meshData = null;

		this.pairs = [];
	}

	LineRenderer.calcVec1 = new Vector3();
	LineRenderer.calcVec2 = new Vector3();

	LineRenderer.prototype.init = function (goo, settings) {
		this.settings = settings;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.COLOR]);
		attributeMap.DATA = MeshData.createAttribute(4, 'Float');
		attributeMap.OFFSET = MeshData.createAttribute(2, 'Float');
		attributeMap.TILE = MeshData.createAttribute(4, 'Float');
		var meshData = new MeshData(attributeMap, this.settings.poolCount * 4, this.settings.poolCount * 6);
		meshData.vertexData.setDataUsage('DynamicDraw');
		this.meshData = meshData;

		var material = new Material(particleShader);
		material.uniforms.alphakill = settings.alphakill.value;
		material.blendState.blending = settings.blending.value;

		material.depthState.write = false;
		material.renderQueue = 3010;
		var entity = this.entity = goo.world.createEntity(meshData);
		entity.set(new MeshRendererComponent(material));
		entity.name = 'LineRenderer';
		entity.meshRendererComponent.cullMode = 'Never';
		entity.addToWorld();

		entity.skip = true;
		if (settings.textureUrl.value instanceof Texture) {
			entity.skip = false;
			material.setTexture('PARTICLE_MAP', settings.textureUrl.value);
		}

		var offset = this.meshData.getAttributeBuffer('OFFSET');
		var tile = this.meshData.getAttributeBuffer('TILE');
		var indices = this.meshData.getIndexBuffer();
		for (var i = 0; i < this.settings.poolCount; i++) {
			offset[8 * i + 0] = -1;
			offset[8 * i + 1] = -1;

			offset[8 * i + 2] = -1;
			offset[8 * i + 3] = 1;

			offset[8 * i + 4] = 1;
			offset[8 * i + 5] = 1;

			offset[8 * i + 6] = 1;
			offset[8 * i + 7] = -1;

			for (var j = 0; j < 4; j++) {
				tile[16 * i + j * 4 + 0] = 0; //offset u
				tile[16 * i + j * 4 + 1] = 0; //offset w
				tile[16 * i + j * 4 + 2] = 1; //scale u
				tile[16 * i + j * 4 + 3] = 1; //scale w
			}

			indices[6 * i + 0] = 4 * i + 0;
			indices[6 * i + 1] = 4 * i + 3;
			indices[6 * i + 2] = 4 * i + 1;
			indices[6 * i + 3] = 4 * i + 1;
			indices[6 * i + 4] = 4 * i + 3;
			indices[6 * i + 5] = 4 * i + 2;
		}
	};

	LineRenderer.prototype.rebuild = function () {
		if (this.settings.textureUrl.valueLoaded) {
			this.entity.meshRendererComponent.materials[0].setTexture('PARTICLE_MAP', this.settings.textureUrl.valueLoaded);
		}
	};

	LineRenderer.prototype.remove = function () {
		this.entity.removeFromWorld();
	};

	LineRenderer.prototype.setVisible = function (visible) {
		this.entity.meshRendererComponent.hidden = !visible;
		this.entity.hidden = !visible;
	};

	LineRenderer.prototype.died = function (i, particle) {
		// var data = this.meshData.getAttributeBuffer('DATA');

		// for (var j = 0; j < 4; j++) {
		// 	data[(4 * 2 * i + 0) + 2 * j] = 0;
		// }
	};

	var vec = new Vector3();
	var pairingFunction = function (pairs, particles, dist, limit) {
		var j, i, l;

		for (i = 0, l = particles.length; i < l; i++) {
			var particle1 = particles[i];
			particle1.nr = 0;

			particle1.connections = particle1.connections || [];
			particle1.connections.length = 0;
		}

		var hash = {};
		for (i = 0, l = particles.length; i < l; i++) {
			var particle1 = particles[i];

			if (particle1.dead) {
				continue;
			}
			
			var x = Math.floor(particle1.position.data[0] / dist);
			var y = Math.floor(particle1.position.data[1] / dist);
			var z = Math.floor(particle1.position.data[2] / dist);

			var hashStr = x + '_' + y + '_' + z;

			var hashObj = hash[hashStr];
			if (!hashObj) {
				hashObj = {
					list: [],
					x: x,
					y: y,
					z: z
				};
				hash[hashStr] = hashObj;
			}
			hashObj.list.push(particle1);
		}

		for (var hashStr in hash) {
			var hashObj = hash[hashStr];
			var xx = hashObj.x;
			var yy = hashObj.y;
			var zz = hashObj.z;

			for (var x = -1; x <= 1; x++) {
				for (var y = -1; y <= 1; y++) {
					for (var z = -1; z <= 1; z++) {
						var hashStr = (xx+x) + '_' + (yy+y) + '_' + (zz+z);
						var otherHashObj = hash[hashStr];
						if (otherHashObj) {
							for (var i = 0; i < hashObj.list.length; i++) {
								var particle1 = hashObj.list[i];

								if (particle1.nr >= limit) {
									continue;
								}

								for (var j = 0; j < otherHashObj.list.length; j++) {
									var particle2 = otherHashObj.list[j];

									if (particle1 === particle2) {
										continue;
									}

									if (particle1.nr >= limit || particle2.nr >= limit) {
										continue;
									}

									var length = vec.setv(particle1.position).subv(particle2.position).lengthSquared();

									if (length < dist) {
										pairs.push(particle1);
										pairs.push(particle2);

										particle1.nr++;
										particle2.nr++;

										particle1.connections.push(particle2);
										particle2.connections.push(particle1);
									}
								}
							}
						}
					}
				}
			}
		}

		return pairs;
	};

	LineRenderer.prototype.update = function (tpf, particles) {
		if (this.entity.hidden) {
			return;
		}

		var material = this.entity.meshRendererComponent.materials[0];
		material.uniforms.alphakill = this.settings.alphakill.value;
		material.blendState.blending = this.settings.blending.value;

		this.pairs.length = null;
		var pairs = pairingFunction(this.pairs, particles, this.settings.distance.value, this.settings.limit.value);
		// document.getElementById('linestats').innerHTML = 'Lines: ' + (pairs.length/2);

		var pos = this.meshData.getAttributeBuffer(MeshData.POSITION);
		var col = this.meshData.getAttributeBuffer(MeshData.COLOR);
		var data = this.meshData.getAttributeBuffer('DATA');
		var tile = this.meshData.getAttributeBuffer('TILE');

		var tileInfo = this.settings.tile;
		var isTiled = tileInfo !== undefined && tileInfo.enabled.value;
		var tileCountX = 1;
		var tileCountY = 1;
		var loopScale = 1;
		if (isTiled) {
			tileCountX = tileInfo.tileCountX.value;
			tileCountY = tileInfo.tileCountY.value;
			loopScale = tileInfo.loopScale.value;
		}
		var scaleX = 1 / tileCountX;
		var scaleY = 1 / tileCountY;
		var totalTileCount = tileCountX * tileCountY;
		var tileFrameCount = totalTileCount;
		if (isTiled && tileInfo.frameCount) {
			tileFrameCount = tileInfo.frameCount;
		}

		var lastAlive = 0;
		var j, i, l;

		var vec = LineRenderer.calcVec1;
		var vec2 = LineRenderer.calcVec2;
		var width = this.settings.width.value;

		for (i = 0, l = pairs.length/2; i < l; i++) {
			var particle1 = pairs[i*2];
			var particle2 = pairs[i*2+1];

			if (isTiled) {
				var tileTime = (((particle1.lifeSpan / particle1.lifeSpanTotal) * loopScale) % 1) * totalTileCount;
				tileTime = Math.floor(tileTime) % tileFrameCount;
				var offsetX = (tileTime % tileCountX) / tileCountX;
				var offsetY = 1 - scaleY - Math.floor(tileTime / tileCountX) / tileCountY;

				for (j = 0; j < 4; j++) {
					tile[(4 * 4 * i + 0) + 4 * j] = offsetX;
					tile[(4 * 4 * i + 1) + 4 * j] = offsetY;
					tile[(4 * 4 * i + 2) + 4 * j] = scaleX;
					tile[(4 * 4 * i + 3) + 4 * j] = scaleY;
				}
			}

			// center
			vec.setv(particle1.position).addVector(particle2.position).mulDirect(0.5, 0.5, 0.5);

			// length
			vec2.setv(particle1.position).subVector(particle2.position).mulDirect(0.5, 0.5, 0.5);

			var alpha = Math.min(particle2.alpha, particle1.alpha);

			var coldata = particle2.color.data;
			for (j = 0; j < 2; j++) {
				pos[(4 * 3 * i + 0) + 3 * j] = vec.data[0] - vec2.data[0];
				pos[(4 * 3 * i + 1) + 3 * j] = vec.data[1] - vec2.data[1];
				pos[(4 * 3 * i + 2) + 3 * j] = vec.data[2] - vec2.data[2];

				col[(4 * 4 * i + 0) + 4 * j] = coldata[0];
				col[(4 * 4 * i + 1) + 4 * j] = coldata[1];
				col[(4 * 4 * i + 2) + 4 * j] = coldata[2];
				// col[(4 * 4 * i + 3) + 4 * j] = particle2.alpha;
				col[(4 * 4 * i + 3) + 4 * j] = alpha;

				data[(4 * 4 * i + 0) + 4 * j] = vec2.data[0];
				data[(4 * 4 * i + 1) + 4 * j] = vec2.data[1];
				data[(4 * 4 * i + 2) + 4 * j] = vec2.data[2];
				// data[(4 * 4 * i + 3) + 4 * j] = particle2.size;
				data[(4 * 4 * i + 3) + 4 * j] = width;
			}

			coldata = particle1.color.data;
			for (j = 2; j < 4; j++) {
				pos[(4 * 3 * i + 0) + 3 * j] = vec.data[0] + vec2.data[0];
				pos[(4 * 3 * i + 1) + 3 * j] = vec.data[1] + vec2.data[1];
				pos[(4 * 3 * i + 2) + 3 * j] = vec.data[2] + vec2.data[2];

				col[(4 * 4 * i + 0) + 4 * j] = coldata[0];
				col[(4 * 4 * i + 1) + 4 * j] = coldata[1];
				col[(4 * 4 * i + 2) + 4 * j] = coldata[2];
				// col[(4 * 4 * i + 3) + 4 * j] = particle1.alpha;
				col[(4 * 4 * i + 3) + 4 * j] = alpha;

				data[(4 * 4 * i + 0) + 4 * j] = vec2.data[0];
				data[(4 * 4 * i + 1) + 4 * j] = vec2.data[1];
				data[(4 * 4 * i + 2) + 4 * j] = vec2.data[2];
				// data[(4 * 4 * i + 3) + 4 * j] = particle1.size;
				data[(4 * 4 * i + 3) + 4 * j] = width;
			}

			lastAlive = i + 1;
		}

		this.meshData.indexLengths = [lastAlive * 6];
		this.meshData.indexCount = lastAlive * 6;

		this.meshData.setVertexDataUpdated();
	};

	var particleShader = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexColor: MeshData.COLOR,
			vertexData: 'DATA',
			vertexOffset: 'OFFSET',
			textureTile: 'TILE'
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			particleMap: 'PARTICLE_MAP',
			cameraPosition: Shader.CAMERA,
			time: Shader.TIME,
			alphakill: 0
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec4 vertexColor;',
			'attribute vec4 vertexData;',
			'attribute vec2 vertexOffset;',
			'attribute vec4 textureTile;',
			// 'uniform mat4 viewProjectionMatrix;',
			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',
			'uniform vec3 cameraPosition;',
			'uniform float time;',

			'varying vec4 color;',
			'varying vec2 coords;',

			'void main(void) {',
				'color = vertexColor;',
				
				'coords = (vertexOffset * 0.5 + 0.5) * textureTile.zw + textureTile.xy;',

				'vec3 dir = vertexData.xyz;',
				'vec3 offset = cross(dir, cameraPosition - vertexPosition.xyz);',
				'offset = normalize(offset);',
				'vec3 pos = vertexPosition.xyz - offset * vertexOffset.y * vertexData.w * 0.1;',

				'gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(pos, 1.0);',
			'}'
		].join('\n'),
		fshader: [
			'uniform sampler2D particleMap;',
			'uniform float alphakill;',

			'varying vec4 color;',
			'varying vec2 coords;',

			'void main(void)',
			'{',
				'vec4 col = color * texture2D(particleMap, coords);',
				'if (col.a <= alphakill) discard;',
				'gl_FragColor = col;',
			'}'
		].join('\n')
	};

	return LineRenderer;
});