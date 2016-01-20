define([
	'goo/entities/World',
	'goo/addons/particlepack/components/ParticleSystemComponent',
	'goo/addons/particlepack/curves/ConstantCurve',
	'goo/addons/particlepack/curves/PolyCurve',
	'goo/addons/particlepack/curves/Vector3Curve',
	'goo/addons/particlepack/curves/Vector4Curve',
	'goo/math/Vector3',
	'goo/loaders/DynamicLoader',
	'test/loaders/Configs',
	'goo/util/ObjectUtil'
], function (
	World,
	ParticleSystemComponent,
	ConstantCurve,
	PolyCurve,
	Vector3Curve,
	Vector4Curve,
	Vector3,
	DynamicLoader,
	Configs,
	_
) {
	'use strict';

	describe('ParticleSystemComponentHandler', function () {
		var loader;
		
		beforeEach(function () {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: window.__karma__ ? './' : 'loaders/res'
			});
		});
		
		it('loads an entity with a ParticleSystemComponent', function (done) {
			var config = Configs.entity(['transform', 'particle']);

			function constantCurve(value){
				return [{
					type: 'constant',
					offset: 0,
					options: {
						value: value
					}
				}];
			}

			_.extend(config.components.particle, {
				seed: 123,
				shapeType: 'sphere',
				sphereRadius: 123,
				sphereEmitFromShell: true,
				randomDirection: true,
				coneEmitFrom: 'volume',
				boxExtents: [1, 2, 3],
				coneRadius: 123,
				coneAngle: 12,
				coneLength: 123,
				startColor: [
					constantCurve(0),
					constantCurve(1),
					constantCurve(0),
					constantCurve(1)
				],
				color: [
					constantCurve(1),
					constantCurve(0),
					constantCurve(0),
					constantCurve(1)
				],
				duration: 123,
				localSpace: true,
				startSpeed: constantCurve(123),
				localVelocity: [constantCurve(0),constantCurve(0),constantCurve(0)],
				worldVelocity: [constantCurve(0),constantCurve(0),constantCurve(0)],
				maxParticles: 123,
				emissionRate: constantCurve(123),
				startLifeTime: constantCurve(123),
				renderQueue: 3123,
				alphakill: 0.6,
				loop: true,
				blending: 'TransparencyBlending',
				depthWrite: false,
				depthTest: false,
				textureTilesX: 12,
				textureTilesY: 34,
				textureAnimationSpeed: 123,
				startSize: constantCurve(123),
				sortMode: 'camera_distance',
				billboard: false,
				size: constantCurve(1),
				startAngle: constantCurve(0),
				rotationSpeed: constantCurve(0)
				//textureRef: null
			});

			loader.preload(Configs.get());
			loader.load(config.id).then(function (entity) {
				expect(entity.particleSystemComponent).toEqual(jasmine.any(ParticleSystemComponent));
				
				function newConstantPolyCurve(value){
					return new PolyCurve({ segments: [new ConstantCurve({ value: value })] });
				}
				function newVector4Curve(x,y,z,w){
					return new Vector4Curve({
						x: newConstantPolyCurve(x),
						y: newConstantPolyCurve(y),
						z: newConstantPolyCurve(z),
						w: newConstantPolyCurve(w),
					});
				}
				function newVector3Curve(x,y,z){
					return new Vector3Curve({
						x: newConstantPolyCurve(x),
						y: newConstantPolyCurve(y),
						z: newConstantPolyCurve(z)
					});
				}
				var c = entity.particleSystemComponent;
				expect(c.seed).toEqual(123);
				expect(c.shapeType).toEqual('sphere');
				expect(c.sphereRadius).toEqual(123);
				expect(c.sphereEmitFromShell).toEqual(true);
				expect(c.randomDirection).toEqual(true);
				expect(c.coneEmitFrom).toEqual('volume');
				expect(c.boxExtents).toEqual(new Vector3(1, 2, 3));
				expect(c.coneRadius).toEqual(123);
				expect(c.coneAngle.toFixed(4)).toEqual((12 * Math.PI / 180).toFixed(4));
				expect(c.coneLength).toEqual(123);
				expect(c.startColor).toEqual(newVector4Curve(0,1,0,1));
				expect(c.color).toEqual(newVector4Curve(1,0,0,1));
				expect(c.duration).toEqual(123);
				expect(c.localSpace).toEqual(true);
				expect(c.startSpeed).toEqual(newConstantPolyCurve(123));
				expect(c.localVelocity).toEqual(newVector3Curve(0,0,0));
				expect(c.worldVelocity).toEqual(newVector3Curve(0,0,0));
				expect(c.maxParticles).toEqual(123);
				expect(c.emissionRate).toEqual(newConstantPolyCurve(123));
				expect(c.startLifeTime).toEqual(newConstantPolyCurve(123));
				expect(c.renderQueue).toEqual(3123);
				expect(c.alphakill).toEqual(0.6);
				expect(c.loop).toEqual(true);
				expect(c.blending).toEqual('TransparencyBlending');
				expect(c.depthWrite).toEqual(false);
				expect(c.depthTest).toEqual(false);
				expect(c.textureTilesX).toEqual(12);
				expect(c.textureTilesY).toEqual(34);
				expect(c.textureAnimationSpeed).toEqual(123);
				expect(c.startSize).toEqual(newConstantPolyCurve(123));
				expect(c.sortMode).toEqual(ParticleSystemComponent.SORT_CAMERA_DISTANCE);
				expect(c.billboard).toEqual(false);
				expect(c.size).toEqual(newConstantPolyCurve(1));
				expect(c.startAngle).toEqual(newConstantPolyCurve(0));
				expect(c.rotationSpeed).toEqual(newConstantPolyCurve(0));

				done();
			});
		});
	});
});