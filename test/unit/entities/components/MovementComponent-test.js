define([
	'goo/entities/components/MovementComponent',
	'goo/math/Vector3'
], function (
	MovementComponent,
	Vector3
) {
	'use strict';

	describe('MovementComponent', function () {
		describe('Test velocity deltas', function() {
			var spatialMovementComponent;

			beforeEach(function () {
				spatialMovementComponent = new MovementComponent();
			});

			it('adds velocity once', function () {
				var velocity = new Vector3(0, 1, 0);
				spatialMovementComponent.addVelocity(velocity);
				expect(spatialMovementComponent.getVelocity()).toEqual(velocity);
			});

			it('adds velocity some times', function () {
				var velocity = new Vector3(0, 1, 0);
				spatialMovementComponent.addVelocity(velocity);
				spatialMovementComponent.addVelocity(velocity);
				expect(spatialMovementComponent.getVelocity()).toEqual(velocity.scale(2));
				velocity.setDirect(1, 0, 0);
				spatialMovementComponent.addVelocity(velocity);
				spatialMovementComponent.addVelocity(velocity);
				expect(spatialMovementComponent.getVelocity()).toEqual(new Vector3(2, 2, 0));
				velocity.setDirect(-1, 0, 1);
				spatialMovementComponent.addVelocity(velocity);
				spatialMovementComponent.addVelocity(velocity);
				expect(spatialMovementComponent.getVelocity()).toEqual(new Vector3(0, 2, 2));
			});

			it('sets velocity', function () {
				var velocity = new Vector3(0, 1, 0);
				spatialMovementComponent.setVelocity(velocity);
				expect(spatialMovementComponent.getVelocity()).toEqual(velocity);

				velocity = new Vector3(3, 0, 0);
				spatialMovementComponent.setVelocity(velocity);
				expect(spatialMovementComponent.getVelocity()).toEqual(velocity);
			});

			it('adds rotational  velocity once', function () {
				var velocity = new Vector3(0, 1, 0);
				spatialMovementComponent.addRotationVelocity(velocity);
				expect(spatialMovementComponent.getRotationVelocity()).toEqual(velocity);
			});

			it('adds rotational velocity some times', function () {
				var velocity = new Vector3(0, 1, 0);
				spatialMovementComponent.addRotationVelocity(velocity);
				spatialMovementComponent.addRotationVelocity(velocity);
				expect(spatialMovementComponent.getRotationVelocity()).toEqual(velocity.scale(2));
				velocity.setDirect(1, 0, 0);
				spatialMovementComponent.addRotationVelocity(velocity);
				spatialMovementComponent.addRotationVelocity(velocity);
				expect(spatialMovementComponent.getRotationVelocity()).toEqual(new Vector3(2, 2, 0));
				velocity.setDirect(-1, 0, 1);
				spatialMovementComponent.addRotationVelocity(velocity);
				spatialMovementComponent.addRotationVelocity(velocity);
				expect(spatialMovementComponent.getRotationVelocity()).toEqual(new Vector3(0, 2, 2));
			});

			it('sets velocity', function () {
				var velocity = new Vector3(0, 1, 0);
				spatialMovementComponent.setRotationVelocity(velocity);
				expect(spatialMovementComponent.getRotationVelocity()).toEqual(velocity);
				velocity = new Vector3(3, 0, 0);
				spatialMovementComponent.setRotationVelocity(velocity);
				expect(spatialMovementComponent.getRotationVelocity()).toEqual(velocity);
			});
		});
	});
});
