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

	function RibbonMesh() {
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
		this.index = 0;
		this.trailSegmentDatas = [];
		for (var i = segments - 1; i >= 0; i--) {
			var segmentData = new TrailSegmentData();
			segmentData.width = this.width;
			this.trailSegmentDatas.push(segmentData);
		}
	}

	function TrailSegmentData() {
		this.position = new Vector3();
		this.tangent = new Vector3();
		this.interpolatedPosition = new Vector3();
		this.width = 1;
		this.speed = 0;
	}

	function randomBetween(min, max) {
		return Math.random() * (max - min) + min;
	}

	RibbonMesh.prototype.init = function(goo, settings) {
		this.settings = settings;

		this.segmentCount = settings.segmentCount || 8;

		settings.poolCount = this.topSettings !== undefined ? this.topSettings.poolCount : settings.poolCount;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.TEXCOORD0]);
		var meshData = new MeshData(attributeMap,
			settings.poolCount * this.segmentCount * 2,
			settings.poolCount * (this.segmentCount - 1) * 6);
		meshData.vertexData.setDataUsage('DynamicDraw');
		this.meshData = meshData;

		// var material = new Material(ShaderLib.simpleColored);
		// material.wireframe = true;
		// material.uniforms.color = [1.0,0.0,0.0];

		var material = new Material(particleShader);
		material.uniforms.alphakill = settings.alphakill.value;
		material.blendState.blending = settings.blending.value;
		material.cullState.enabled = false;
		material.depthState.write = false;
		material.renderQueue = 3010;
		var entity = this.entity = goo.world.createEntity(meshData);
		entity.set(new MeshRendererComponent(material));
		entity.name = 'RibbonMesh';
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
		if (settings.textureUrl instanceof Texture) {
			entity.skip = false;
			material.setTexture('PARTICLE_MAP', settings.textureUrl);
		} else {
			var textureCreator = new TextureCreator();
			textureCreator.loadTexture2D(settings.textureUrl.value, {
				wrapS: 'EdgeClamp',
				wrapT: 'EdgeClamp'
			}).then(function (texture) {
				entity.skip = false;
				material.setTexture('PARTICLE_MAP', texture);
			}, function () {
				console.error('Error loading image.');
			});
		}

		var col = this.meshData.getAttributeBuffer(MeshData.COLOR);
		var texcoord = this.meshData.getAttributeBuffer(MeshData.TEXCOORD0);
		// var tile = this.meshData.getAttributeBuffer('TILE');
		var indices = this.meshData.getIndexBuffer();
		for (var i = 0; i < settings.poolCount; i++) {
			var trailData = new TrailData(this.segmentCount);
			trailData.width = this.settings.width.value;
			this.trailDatas.push(trailData);

			for (var j = 0; j < this.segmentCount; j++) {
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

	RibbonMesh.prototype.setTrailFront = function(trailData, position, tangent, tpf, l) {
		var trail = null;

		if (trailData.isReset) {
			for (var i = 0; i < this.segmentCount; i++) {
				var trailSegmentData = trailData.trailSegmentDatas[i];
				trailSegmentData.position.setv(position);
			}

			trailData.isReset = false;
		}

		var trailSegmentDatas = trailData.trailSegmentDatas;
		// Check if time to add or wrap the trail sections
		// trailData.throttle += tpf * this.settings.updateSpeed.value;
		// trailData.throttle += tpf * this.settings.updateSpeed.value;
		if (trailData.throttle > 1.0) {
			trailData.throttle %= 1.0;

			trail = trailSegmentDatas.splice(trailSegmentDatas.length - 1, 1)[0]; // removeLast();
			trailSegmentDatas.splice(0, 0, trail); // addFirst(trail);
		} else {
			trail = trailSegmentDatas[0]; // get first
		}

		// Always update the front section
		trail.width = l;
		trail.speed = 1;
		trail.position.setv(position);
		if (tangent != null) {
			trail.tangent.setv(tangent);
		}
		trailData.invalid = true;
	};

	RibbonMesh.prototype.updateTrail = function(trailData, camPos, index, tpf) {
		var trailSegmentDatas = trailData.trailSegmentDatas;

		if (trailData.invalid || this.facingMode == 'Billboard') {
			if (this.updateMode == 'Step') {
				this.updateStep(trailData, camPos, index);
			} else {
				this.updateInterpolate(trailData, camPos, index, tpf);
			}
			trailData.invalid = false;
		}
	};

	var trailDirection = new Vector3();
	var trailCamVec = new Vector3();

	RibbonMesh.prototype.updateStep = function(trailData, camPos, index) {
		var trailSegmentDatas = trailData.trailSegmentDatas;

		var pos = this.meshData.getAttributeBuffer(MeshData.POSITION);

		for (var i = 0; i < this.segmentCount; i++) {
			var trailSegmentData = trailSegmentDatas[i];
			var trailVector = trailSegmentData.position;

			if (this.facingMode == 'Billboard') {
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
				trailDirection.normalize().scale(trailSegmentData.width * 0.5);
			} else if (trailSegmentData.tangent != null) {
				trailDirection.setVector(trailSegmentData.tangent).scale(trailSegmentData.width * 0.5);
			} else {
				trailDirection.setDirect(trailSegmentData.width * 0.5, 0, 0);
			}

			pos[(index * this.segmentCount * 6) + 6 * i + 0] = trailVector.x - trailDirection.x;
			pos[(index * this.segmentCount * 6) + 6 * i + 1] = trailVector.y - trailDirection.y;
			pos[(index * this.segmentCount * 6) + 6 * i + 2] = trailVector.z - trailDirection.z;

			pos[(index * this.segmentCount * 6) + 6 * i + 3] = trailVector.x + trailDirection.x;
			pos[(index * this.segmentCount * 6) + 6 * i + 4] = trailVector.y + trailDirection.y;
			pos[(index * this.segmentCount * 6) + 6 * i + 5] = trailVector.z + trailDirection.z;
		}
	};

	RibbonMesh.prototype.updateInterpolate = function(trailData, camPos, index, tpf) {
		var trailSegmentDatas = trailData.trailSegmentDatas;

		var pos = this.meshData.getAttributeBuffer(MeshData.POSITION);

		for (var i = 0; i < this.segmentCount; i++) {
			var trailSegmentData = trailSegmentDatas[i];
			var interpolationVector = trailSegmentData.interpolatedPosition;

			interpolationVector.setVector(trailSegmentData.position);

			if (i > 0) {
				interpolationVector.lerp(trailSegmentDatas[i - 1].position, trailData.throttle);
			}
		}

		for (var i = 0; i < this.segmentCount; i++) {
			var trailSegmentData = trailSegmentDatas[i];
			var trailVector = trailSegmentData.interpolatedPosition;
			var trailWidth = trailSegmentData.width * 0.5;

			if (this.facingMode == 'Billboard') {
				if (i === 0) {
					trailDirection.setVector(trailSegmentDatas[i + 1].interpolatedPosition).subVector(trailVector);
				} else if (i === this.segmentCount - 1) {
					trailDirection.setVector(trailVector).subVector(trailSegmentDatas[i - 1].interpolatedPosition);
				} else {
					trailDirection.setVector(trailSegmentDatas[i + 1].interpolatedPosition)
						.subVector(trailSegmentDatas[i - 1].interpolatedPosition);
				}

				trailCamVec.setVector(trailVector).subVector(camPos);
				trailDirection.cross(trailCamVec);
				trailDirection.normalize().scale(trailWidth);

				// var s = trailSegmentData.speed * tpf * 500;
				// trailCamVec.normalize().muld(s, s, s);
				// trailVector.addv(trailCamVec);
				// trailSegmentData.speed *= 0.999;
			} else if (trailSegmentData.tangent !== null) {
				trailDirection.setVector(trailSegmentData.tangent).scale(trailWidth);
			} else {
				trailDirection.setDirect(trailWidth, 0, 0);
			}

			pos[(index * this.segmentCount * 6) + 6 * i + 0] = trailVector.x - trailDirection.x;
			pos[(index * this.segmentCount * 6) + 6 * i + 1] = trailVector.y - trailDirection.y;
			pos[(index * this.segmentCount * 6) + 6 * i + 2] = trailVector.z - trailDirection.z;

			pos[(index * this.segmentCount * 6) + 6 * i + 3] = trailVector.x + trailDirection.x;
			pos[(index * this.segmentCount * 6) + 6 * i + 4] = trailVector.y + trailDirection.y;
			pos[(index * this.segmentCount * 6) + 6 * i + 5] = trailVector.z + trailDirection.z;
		}
	};

	RibbonMesh.prototype.rebuild = function() {
		if (this.settings.textureUrl.valueLoaded) {
			this.entity.meshRendererComponent.materials[0].setTexture('PARTICLE_MAP', this.settings.textureUrl.valueLoaded);
		}
		for (var i = 0; i < this.trailDatas.length; i++) {
			var trailData = this.trailDatas[i];
			trailData.width = this.settings.width.value;
		}
	};

	RibbonMesh.prototype.remove = function() {
		this.entity.removeFromWorld();
	};

	RibbonMesh.prototype.setVisible = function(visible) {
		this.entity.meshRendererComponent.hidden = !visible;
		this.entity.hidden = !visible;
	};

	RibbonMesh.prototype.died = function(index, particle) {
		var trailData = this.trailDatas[index];
		trailData.isReset = true;
	};

	RibbonMesh.prototype.resetTrailFront = function(position, i) {
		var trailData = this.trailDatas[i];

		for (var i = 0; i < this.segmentCount; i++) {
			var trailSegmentData = trailData.trailSegmentDatas[i];
			trailSegmentData.position.setVector(position);
		}
	};

	// RibbonMesh.prototype.addTrailFront = function(position, i) {
		// var trailData = this.trailDatas[i];
		// this.setTrailFront(trailData, position, null, 0);
	// 	trailData.throttle = 10;
	// };

	RibbonMesh.prototype.moveTrailFront = function(position, i, throttle, speed) {
		var trailData = this.trailDatas[i];
		trailData.throttle = throttle;
		this.setTrailFront(trailData, position, null, 0, speed);
	};

	RibbonMesh.prototype.update = function(tpf, particles) {
		if (this.entity.hidden) {
			return;
		}

		var material = this.entity.meshRendererComponent.materials[0];
		material.uniforms.alphakill = this.settings.alphakill.value;
		material.blendState.blending = this.settings.blending.value;

		var lastAlive = 0;
		var j, i, l;
		for (i = 0, l = this.trailDatas.length; i < l; i++) {
			var trailData = this.trailDatas[i];
			// if (trailData.invalid) {
				// continue;
			// }
			// this.setTrailFront(trailData, particle.position, null, tpf);
			this.updateTrail(trailData, Renderer.mainCamera.translation, i, tpf);

			lastAlive = i + 1;
		}

		this.meshData.indexLengths = [lastAlive * (this.segmentCount - 1) * 6];
		this.meshData.indexCount = lastAlive * (this.segmentCount - 1) * 6;

		this.meshData.setVertexDataUpdated();
	};

	var particleShader = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexCoords: MeshData.TEXCOORD0
			// textureTile: 'TILE'
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			particleMap: 'PARTICLE_MAP',
			// cameraPosition: Shader.CAMERA,
			// time: Shader.TIME,
			alphakill: 0
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexCoords;',

			// 'uniform mat4 viewProjectionMatrix;',
			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',

			'varying vec2 coords;',

			'void main(void) {',
				'coords = vertexCoords;',
				'gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition.xyz, 1.0);',
			'}'
		].join('\n'),
		fshader: [
			'uniform sampler2D particleMap;',
			'uniform float alphakill;',

			'varying vec2 coords;',

			'void main(void)',
			'{',
				'vec4 col = texture2D(particleMap, coords);',
				'col.a *= 0.3;',
				'if (col.a <= alphakill) discard;',
				'gl_FragColor = col;',
			'}'
		].join('\n')
	};

	return RibbonMesh;
});