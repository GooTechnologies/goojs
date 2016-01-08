define([
	'goo/addons/particlepack/components/ParticleComponent',
	'goo/addons/particlepack/curves/LinearCurve',
	'goo/addons/particlepack/curves/Vector4Curve',
	'goo/addons/particlepack/curves/Vector3Curve',
	'goo/math/Vector3',
	'goo/entities/World',
	'goo/entities/components/TransformComponent',
	'goo/entities/systems/TransformSystem',
	'goo/renderer/Texture',
	'goo/renderer/MeshData',
	'test/CustomMatchers'
], function (
	ParticleComponent,
	LinearCurve,
	Vector4Curve,
	Vector3Curve,
	Vector3,
	World,
	TransformComponent,
	TransformSystem,
	Texture,
	MeshData,
	CustomMatchers
) {
	'use strict';

	describe('ParticleComponent', function () {
		
		var world;

		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
			world = new World();
			world.registerComponent(TransformComponent);
			world.registerComponent(ParticleComponent);
		});

		it('gets added to the entity via world.createEntity', function () {
			var component = new ParticleComponent();
			var entity = world.createEntity([0, 0, 0], component).addToWorld();
			expect(entity.particleComponent).toBe(component);
		});

		it('can clone', function () {
			var component = new ParticleComponent({
				maxParticles: 10,
				time: 1,
				gravity: new Vector3(1, 2, 3),
				seed: 123,
				shapeType: 'box',
				sphereRadius: 123,
				sphereEmitFromShell: true,
				randomDirection: true,
				coneEmitFrom: 'volume',
				boxExtents: new Vector3(1, 2, 3),
				coneRadius: 123,
				coneAngle: 123,
				coneLength: 123,
				preWarm: true,
				startColor: new LinearCurve({ k: 123, m: 123 }),
				color: new Vector4Curve({
					x: new LinearCurve({ k: 123, m: 123 }),
					y: new LinearCurve({ k: 123, m: 123 }),
					z: new LinearCurve({ k: 123, m: 123 }),
					w: new LinearCurve({ k: 123, m: 123 })
				}),
				duration: 123,
				localSpace: false,
				startSpeed: new LinearCurve({ k: 123, m: 123 }),
				localVelocity: new Vector3Curve({
					x: new LinearCurve({ k: 123, m: 123 }),
					y: new LinearCurve({ k: 123, m: 123 }),
					z: new LinearCurve({ k: 123, m: 123 })
				}),
				worldVelocity: new Vector3Curve({
					x: new LinearCurve({ k: 123, m: 123 }),
					y: new LinearCurve({ k: 123, m: 123 }),
					z: new LinearCurve({ k: 123, m: 123 })
				}),
				emissionRate: new LinearCurve({ k: 123, m: 123 }),
				startLifeTime: new LinearCurve({ k: 123, m: 123 }),
				renderQueue: 123,
				alphakill: 0.123,
				loop: true,
				blending: 'TransparencyBlending',
				depthWrite: false,
				depthTest: false,
				textureTilesX: 123,
				textureTilesY: 123,
				textureAnimationSpeed: 123,
				startSize: new LinearCurve({ k: 123, m: 123 }),
				sortMode: ParticleComponent.SORT_CAMERA_DISTANCE,
				mesh: new MeshData(),
				billboard: false,
				sizeCurve: new LinearCurve({ k: 123, m: 123 }),
				startAngle: new LinearCurve({ k: 123, m: 123 }),
				rotationSpeed: new LinearCurve({ k: 123, m: 123 }),
				texture: new Texture()
			});
			var clone = component.clone();
			expect(component.maxParticles).toEqual(clone.maxParticles);
			expect(component.time).toEqual(clone.time);
			expect(component.gravity).toEqual(clone.gravity);
			expect(component.seed).toEqual(clone.seed);
			expect(component.shapeType).toEqual(clone.shapeType);
			expect(component.sphereRadius).toEqual(clone.sphereRadius);
			expect(component.sphereEmitFromShell).toEqual(clone.sphereEmitFromShell);
			expect(component.randomDirection).toEqual(clone.randomDirection);
			expect(component.coneEmitFrom).toEqual(clone.coneEmitFrom);
			expect(component.boxExtents).toEqual(clone.boxExtents);
			expect(component.coneRadius).toEqual(clone.coneRadius);
			expect(component.coneAngle).toEqual(clone.coneAngle);
			expect(component.coneLength).toEqual(clone.coneLength);
			expect(component.preWarm).toEqual(clone.preWarm);
			expect(component.startColor).toEqual(clone.startColor);
			expect(component.color).toEqual(clone.color);
			expect(component.duration).toEqual(clone.duration);
			expect(component.localSpace).toEqual(clone.localSpace);
			expect(component.startSpeed).toEqual(clone.startSpeed);
			expect(component.localVelocity).toEqual(clone.localVelocity);
			expect(component.worldVelocity).toEqual(clone.worldVelocity);
			expect(component.maxParticles).toEqual(clone.maxParticles);
			expect(component.emissionRate).toEqual(clone.emissionRate);
			expect(component.startLifeTime).toEqual(clone.startLifeTime);
			expect(component.renderQueue).toEqual(clone.renderQueue);
			expect(component.alphakill).toEqual(clone.alphakill);
			expect(component.loop).toEqual(clone.loop);
			expect(component.blending).toEqual(clone.blending);
			expect(component.depthWrite).toEqual(clone.depthWrite);
			expect(component.depthTest).toEqual(clone.depthTest);
			expect(component.textureTilesX).toEqual(clone.textureTilesX);
			expect(component.textureTilesY).toEqual(clone.textureTilesY);
			expect(component.textureAnimationSpeed).toEqual(clone.textureAnimationSpeed);
			expect(component.startSize).toEqual(clone.startSize);
			expect(component.sortMode).toEqual(clone.sortMode);
			expect(component.mesh).toEqual(clone.mesh);
			expect(component.billboard).toEqual(clone.billboard);
			expect(component.sizeCurve).toEqual(clone.sizeCurve);
			expect(component.startAngle).toEqual(clone.startAngle);
			expect(component.rotationSpeed).toEqual(clone.rotationSpeed);
			expect(component.texture).toEqual(clone.texture);
		});

		it('can emit one', function () {
			var component = new ParticleComponent({
				localSpace: false
			});
			var entity = world.createEntity([0, 0, 0], component).addToWorld();
			var position = new Vector3();
			var direction = new Vector3(0,1,0);
			component.emitOne(position, direction);

			expect(component.particles[0].startPosition).toEqual(position);
			expect(component.particles[0].startDirection).toEqual(direction);
		});

		it('can pause/resume', function () {
			var component = new ParticleComponent();
			var entity = world.createEntity([0, 0, 0], component).addToWorld();
			expect(component.time).toBe(0);
			component.process(1);
			expect(component.time).toBe(1);
			component.pause();
			component.process(1);
			expect(component.time).toBe(1);
			component.resume();
			component.process(1);
			expect(component.time).toBe(2);
		});

		it('can stop/resume', function () {
			var component = new ParticleComponent();
			var entity = world.createEntity([0, 0, 0], component).addToWorld();
			component.process(1);
			expect(component.time).toBe(1);
			component.stop();
			expect(component.time).toBe(0);
			component.process(1);
			expect(component.time).toBe(0);
			component.resume();
			component.process(1);
			expect(component.time).toBe(1);
		});
	});
});