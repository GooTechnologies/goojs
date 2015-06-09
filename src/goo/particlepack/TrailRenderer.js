define([
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/renderer/Material',
	'goo/renderer/Texture',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/math/Vector4',
	'goo/math/MathUtils',
	'goo/entities/components/MeshRendererComponent',
	'goo/renderer/Renderer',
	'goo/renderer/TextureCreator'
],
/** @lends */
function(
	MeshData,
	Shader,
	Material,
	Texture,
	ShaderLib,
	Vector3,
	Vector4,
	MathUtils,
	MeshRendererComponent,
	Renderer,
	TextureCreator
) {
	"use strict";

	function TrailRenderer() {
		this.settings = null;
		this.entity = null;
		this.meshData = null;

		this.segmentCount = 0;

		this.trailDatas = [];
		this.facingMode = 'Billboard'; //'Tangent'
		// this.updateMode = 'Step'; //'Interpolate'
		this.updateMode = 'Interpolate'; //'Step'
	}

	function TrailData(segments) {
		this.isReset = true;
		this.width = 1;
		this.invalid = true;
		this.throttle = 10;
		this.trailSegmentDatas = [];
		for (var i = segments - 1; i >= 0; i--) {
			this.trailSegmentDatas.push(new TrailSegmentData());
		}
	}

	function TrailSegmentData() {
		this.position = new Vector3();
		this.tangent = new Vector3();
		this.interpolatedPosition = new Vector3();
	}

	function randomBetween(min, max) {
		return Math.random() * (max - min) + min;
	}

	TrailRenderer.prototype.init = function(goo, settings) {
		this.settings = settings;

		this.segmentCount = settings.segmentCount || 8;

		settings.poolCount = this.topSettings.poolCount;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.TEXCOORD0, MeshData.COLOR]);
		attributeMap.TILE = MeshData.createAttribute(4, 'Float');
		var meshData = new MeshData(attributeMap,
			settings.poolCount * this.segmentCount * 2,
			settings.poolCount * (this.segmentCount - 1) * 6);
		meshData.vertexData.setDataUsage('DynamicDraw');
		this.meshData = meshData;

		var material = new Material(particleShader);
		material.uniforms.alphakill = settings.alphakill.value;
		material.blendState.blending = settings.blending.value;
		material.cullState.enabled = false;
		material.depthState.write = false;
		material.renderQueue = settings.renderqueue !== undefined ? settings.renderqueue : 3010;
		var entity = this.entity = goo.world.createEntity(meshData);
		entity.set(new MeshRendererComponent(material));
		entity.name = 'TrailRenderer';
		entity.meshRendererComponent.cullMode = 'Never';
		entity.addToWorld();

		// var material2 = new Material(ShaderLib.simpleColored);
		// material2.wireframe = true;
		// material2.uniforms.color = [1.0,0.0,0.0];
		// material2.uniforms.alphakill = settings.alphakill.value;
		// material2.blendState.blending = settings.blending.value;
		// material2.cullState.enabled = false;
		// material2.depthState.enabled = false;
		// material2.renderQueue = 3010;
		// entity.meshRendererComponent.materials[1] = material2;

		entity.skip = true;
		if (settings.textureUrl.value instanceof Texture) {
			entity.skip = false;
			material.setTexture('PARTICLE_MAP', settings.textureUrl.value);
		}

		var col = this.meshData.getAttributeBuffer(MeshData.COLOR);
		var texcoord = this.meshData.getAttributeBuffer(MeshData.TEXCOORD0);
		var tile = this.meshData.getAttributeBuffer('TILE');
		var indices = this.meshData.getIndexBuffer();
		for (var i = 0; i < settings.poolCount; i++) {
			var trailData = new TrailData(this.segmentCount);
			trailData.width = this.settings.width.value;
			this.trailDatas.push(trailData);

			for (var j = 0; j < this.segmentCount; j++) {
				tile[this.segmentCount * 8 * i + j * 8 + 0] = 0; //offset u
				tile[this.segmentCount * 8 * i + j * 8 + 1] = 0; //offset w
				tile[this.segmentCount * 8 * i + j * 8 + 2] = 1; //scale u
				tile[this.segmentCount * 8 * i + j * 8 + 3] = 1; //scale w
				tile[this.segmentCount * 8 * i + j * 8 + 4] = 0; //offset u
				tile[this.segmentCount * 8 * i + j * 8 + 5] = 0; //offset w
				tile[this.segmentCount * 8 * i + j * 8 + 6] = 1; //scale u
				tile[this.segmentCount * 8 * i + j * 8 + 7] = 1; //scale w

				col[this.segmentCount * 8 * i + j * 8 + 0] = 1;
				col[this.segmentCount * 8 * i + j * 8 + 1] = 1;
				col[this.segmentCount * 8 * i + j * 8 + 2] = 1;
				col[this.segmentCount * 8 * i + j * 8 + 3] = 1;
				col[this.segmentCount * 8 * i + j * 8 + 4] = 1;
				col[this.segmentCount * 8 * i + j * 8 + 5] = 1;
				col[this.segmentCount * 8 * i + j * 8 + 6] = 1
				col[this.segmentCount * 8 * i + j * 8 + 7] = 1;

				texcoord[this.segmentCount * 4 * i + j * 4 + 0] = j / this.segmentCount;
				texcoord[this.segmentCount * 4 * i + j * 4 + 1] = 0;
				texcoord[this.segmentCount * 4 * i + j * 4 + 2] = j / this.segmentCount;
				texcoord[this.segmentCount * 4 * i + j * 4 + 3] = 1;
			}

			var segCount = this.segmentCount - 1;
			for (var j = 0; j < segCount; j++) {
				indices[segCount * 6 * i + j * 6 + 0] = this.segmentCount * 2 * i + j * 2 + 0;
				indices[segCount * 6 * i + j * 6 + 1] = this.segmentCount * 2 * i + j * 2 + 1;
				indices[segCount * 6 * i + j * 6 + 2] = this.segmentCount * 2 * i + j * 2 + 2;
				indices[segCount * 6 * i + j * 6 + 3] = this.segmentCount * 2 * i + j * 2 + 2;
				indices[segCount * 6 * i + j * 6 + 4] = this.segmentCount * 2 * i + j * 2 + 1;
				indices[segCount * 6 * i + j * 6 + 5] = this.segmentCount * 2 * i + j * 2 + 3;
			}
		}
	};

	TrailRenderer.prototype.setTrailFront = function(trailData, position, tangent, tpf) {
		var trail = null;

		if (trailData.isReset) {
			for (var i = 0; i < this.segmentCount; i++) {
				var trailSegmentData = trailData.trailSegmentDatas[i];
				trailSegmentData.position.setVector(position);
			}

			trailData.isReset = false;
		}

		var trailSegmentDatas = trailData.trailSegmentDatas;
		// Check if time to add or wrap the trail sections
		trailData.throttle += tpf * this.settings.updateSpeed.value;
		if (trailData.throttle > 1.0) {
			trailData.throttle %= 1.0;

			trail = trailSegmentDatas.splice(trailSegmentDatas.length - 1, 1)[0]; // removeLast();
			trailSegmentDatas.splice(0, 0, trail); // addFirst(trail);
		} else {
			trail = trailSegmentDatas[0]; // get first
		}

		// Always update the front section
		trail.position.setVector(position);
		if (tangent) {
			trail.tangent.setVector(tangent);
		}
		trailData.invalid = true;
	};

	TrailRenderer.prototype.updateTrail = function(trailData, particle, camPos, index) {
		if (trailData.invalid || this.facingMode === 'Billboard') {
			if (this.updateMode === 'Step') {
				this.updateStep(trailData, particle, camPos, index);
			} else {
				this.updateInterpolate(trailData, particle, camPos, index);
			}
			trailData.invalid = false;
		}
	};

	var trailDirection = new Vector3();
	var trailCamVec = new Vector3();

	TrailRenderer.prototype.updateStep = function(trailData, particle, camPos, index) {
		var trailSegmentDatas = trailData.trailSegmentDatas;

		var pos = this.meshData.getAttributeBuffer(MeshData.POSITION);
		var col = this.meshData.getAttributeBuffer(MeshData.COLOR);

		for (var i = 0; i < this.segmentCount; i++) {
			var trailSegmentData = trailSegmentDatas[i];
			var trailVector = trailSegmentData.position;

			if (this.facingMode === 'Billboard') {
				if (i === 0) {
					trailDirection.setVector(trailSegmentDatas[i + 1].position).subVector(trailVector);
				} else if (i === this.segmentCount - 1) {
					trailDirection.setVector(trailVector).subVector(trailSegmentDatas[i - 1].position);
				} else {
					trailDirection.setVector(trailSegmentDatas[i + 1].position)
						.subVector(trailSegmentDatas[i - 1].position);
				}

				trailCamVec.setVector(trailVector).subVector(camPos);
				trailDirection.cross(trailCamVec);
				trailDirection.normalize().scale(trailData.width * 0.5);
			} else if (trailSegmentData.tangent) {
				trailDirection.setVector(trailSegmentData.tangent).scale(trailData.width * 0.5);
			} else {
				trailDirection.setDirect(trailData.width * 0.5, 0, 0);
			}

			pos[(index * this.segmentCount * 6) + 6 * i + 0] = trailVector.x - trailDirection.x;
			pos[(index * this.segmentCount * 6) + 6 * i + 1] = trailVector.y - trailDirection.y;
			pos[(index * this.segmentCount * 6) + 6 * i + 2] = trailVector.z - trailDirection.z;

			pos[(index * this.segmentCount * 6) + 6 * i + 3] = trailVector.x + trailDirection.x;
			pos[(index * this.segmentCount * 6) + 6 * i + 4] = trailVector.y + trailDirection.y;
			pos[(index * this.segmentCount * 6) + 6 * i + 5] = trailVector.z + trailDirection.z;

			col[(index * this.segmentCount * 8) + 8 * i + 3] = particle.alpha;
		}
	};

	TrailRenderer.prototype.updateInterpolate = function(trailData, particle, camPos, index) {
		var trailSegmentDatas = trailData.trailSegmentDatas;

		var pos = this.meshData.getAttributeBuffer(MeshData.POSITION);
		var col = this.meshData.getAttributeBuffer(MeshData.COLOR);

		for (var i = 0; i < this.segmentCount; i++) {
			var trailSegmentData = trailSegmentDatas[i];
			var interpolationVector = trailSegmentData.interpolatedPosition;

			interpolationVector.setVector(trailSegmentData.position);

			if (i > 0) {
				interpolationVector.lerp(trailSegmentDatas[i - 1].position, trailData.throttle);
			}
		}

		var coldata = particle.color.data;
		var w = trailData.width * 0.5;
		var ind1 = (index * this.segmentCount * 6);
		var ind2 = (index * this.segmentCount * 8);
		for (var i = 0; i < this.segmentCount; i++) {
			this._updateSegment(particle, pos, col, coldata, w, trailSegmentDatas, i, ind1, ind2, camPos);
		}
	};

	TrailRenderer.prototype._updateSegment = function (particle, pos, col, coldata, w, trailSegmentDatas, i, ind1, ind2, camPos) {
			var trailSegmentData = trailSegmentDatas[i];
			var trailVector = trailSegmentData.interpolatedPosition;

			if (this.facingMode === 'Billboard') {
				if (i === 0) {
					trailDirection.setVector(trailSegmentDatas[i + 1].interpolatedPosition).subVector(trailVector);
				} else if (i === this.segmentCount - 1) {
					trailDirection.setVector(trailVector).subVector(trailSegmentDatas[i - 1].interpolatedPosition);
				} else {
					trailDirection.setVector(trailSegmentDatas[i + 1].interpolatedPosition)
						.subVector(trailSegmentDatas[i - 1].interpolatedPosition);
				}

				trailCamVec.setVector(trailVector).subVector(camPos);

				// trailDirection.cross(trailCamVec);
				var ldata = trailDirection.data;
				var rdata = trailCamVec.data;
				var x = rdata[2] * ldata[1] - rdata[1] * ldata[2];
				var y = rdata[0] * ldata[2] - rdata[2] * ldata[0];
				var z = rdata[1] * ldata[0] - rdata[0] * ldata[1];

				// trailDirection.normalize().muld(w, w, w);
				var l = Math.sqrt(x * x + y * y + z * z); //this.length();

				if (l < 0.0000001) {
					x = 0;
					y = 0;
					z = 0;
				} else {
					l = 1.0 / l;
					x *= l * w;
					y *= l * w;
					z *= l * w;
				}

				trailDirection.data[0] = x;
				trailDirection.data[1] = y;
				trailDirection.data[2] = z;
			} else if (trailSegmentData.tangent !== null) {
				trailDirection.setVector(trailSegmentData.tangent).scale(w);
			} else {
				trailDirection.setDirect(w, 0, 0);
			}

			pos[ind1 + 6 * i + 0] = trailVector.data[0] - trailDirection.data[0];
			pos[ind1 + 6 * i + 1] = trailVector.data[1] - trailDirection.data[1];
			pos[ind1 + 6 * i + 2] = trailVector.data[2] - trailDirection.data[2];

			pos[ind1 + 6 * i + 3] = trailVector.data[0] + trailDirection.data[0];
			pos[ind1 + 6 * i + 4] = trailVector.data[1] + trailDirection.data[1];
			pos[ind1 + 6 * i + 5] = trailVector.data[2] + trailDirection.data[2];

			col[ind2 + 8 * i + 0] = coldata[0];
			col[ind2 + 8 * i + 1] = coldata[1];
			col[ind2 + 8 * i + 2] = coldata[2];
			col[ind2 + 8 * i + 4] = coldata[0];
			col[ind2 + 8 * i + 5] = coldata[1];
			col[ind2 + 8 * i + 6] = coldata[2];

			var alpha = i === 0 || i === this.segmentCount - 1 ? 0 : particle.alpha;
			col[ind2 + 8 * i + 3] = alpha;
			col[ind2 + 8 * i + 7] = alpha;
	};

	TrailRenderer.prototype.rebuild = function() {
		if (this.settings.textureUrl.valueLoaded) {
			this.entity.meshRendererComponent.materials[0].setTexture('PARTICLE_MAP', this.settings.textureUrl.valueLoaded);
		}
		for (var i = 0; i < this.trailDatas.length; i++) {
			var trailData = this.trailDatas[i];
			trailData.width = this.settings.width.value;
		}
	};

	TrailRenderer.prototype.remove = function() {
		this.entity.removeFromWorld();
	};

	TrailRenderer.prototype.setVisible = function(visible) {
		this.entity.meshRendererComponent.hidden = !visible;
		this.entity.hidden = !visible;
	};

	TrailRenderer.prototype.died = function(index, particle) {
		var trailData = this.trailDatas[index];
		trailData.isReset = true;
		// for (var i = 0; i < this.segmentCount; i++) {
		// 	var trailSegmentData = trailData.trailSegmentDatas[i];
		// 	trailSegmentData.position.setd(0,0,0);
		// }

		// var pos = this.meshData.getAttributeBuffer(MeshData.POSITION);

		// for (var j = 0; j < this.segmentCount; j++) {
		// 	pos[(index * this.segmentCount * 6) + 6 * j + 0] = 0;
		// 	pos[(index * this.segmentCount * 6) + 6 * j + 1] = 0;
		// 	pos[(index * this.segmentCount * 6) + 6 * j + 2] = 0;

		// 	pos[(index * this.segmentCount * 6) + 6 * j + 3] = 0;
		// 	pos[(index * this.segmentCount * 6) + 6 * j + 4] = 0;
		// 	pos[(index * this.segmentCount * 6) + 6 * j + 5] = 0;
		// }
	};

	TrailRenderer.prototype.update = function(tpf, particles) {
		if (this.entity.hidden) {
			return;
		}

		var material = this.entity.meshRendererComponent.materials[0];
		material.uniforms.alphakill = this.settings.alphakill.value;
		material.blendState.blending = this.settings.blending.value;

		// var tile = this.meshData.getAttributeBuffer('TILE');
		// var tileInfo = this.settings.tile;
		// var isTiled = tileInfo !== undefined && tileInfo.enabled;

		// var tileCountX = 1;
		// var tileCountY = 1;
		// var loopScale = 1;
		// if (isTiled) {
		// 	tileCountX = tileInfo.tileCountX;
		// 	tileCountY = tileInfo.tileCountY;
		// 	loopScale = tileInfo.loopScale;
		// }
		// var scaleX = 1 / tileCountX;
		// var scaleY = 1 / tileCountY;
		// var totalTileCount = tileCountX * tileCountY;
		// var tileFrameCount = totalTileCount;
		// if (isTiled && tileInfo.frameCount) {
		// 	tileFrameCount = tileInfo.frameCount;
		// }

		var lastAlive = 0;
		var i, l;
		for (i = 0, l = particles.length; i < l; i++) {
			var particle = particles[i];

			if (particle.dead) {
				continue;
			}

			// if (isTiled) {
			// 	var tileTime = (((particle.lifeSpan / particle.lifeSpanTotal) * loopScale) % 1) * totalTileCount;
			// 	tileTime = Math.floor(tileTime) % tileFrameCount;
			// 	var offsetX = (tileTime % tileCountX) / tileCountX;
			// 	var offsetY = 1 - scaleY - Math.floor(tileTime / tileCountX) / tileCountY;

			// 	for (j = 0; j < 4; j++) {
			// 		tile[(4 * 4 * i + 0) + 4 * j] = offsetX;
			// 		tile[(4 * 4 * i + 1) + 4 * j] = offsetY;
			// 		tile[(4 * 4 * i + 2) + 4 * j] = scaleX;
			// 		tile[(4 * 4 * i + 3) + 4 * j] = scaleY;
			// 	}
			// }

			var trailData = this.trailDatas[i];
			this.setTrailFront(trailData, particle.position, null, tpf);
			this.updateTrail(trailData, particle, Renderer.mainCamera.translation, i);

			lastAlive = i + 1;
		}

		this.meshData.indexLengths = [lastAlive * (this.segmentCount - 1) * 6];
		this.meshData.indexCount = lastAlive * (this.segmentCount - 1) * 6;

		this.meshData.setVertexDataUpdated();
	};

	var particleShader = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexColor: MeshData.COLOR,
			vertexCoords: MeshData.TEXCOORD0,
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
			'attribute vec2 vertexCoords;',
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
			'coords = vertexCoords * textureTile.zw + textureTile.xy;',
			'gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition.xyz, 1.0);',
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

	return TrailRenderer;
});