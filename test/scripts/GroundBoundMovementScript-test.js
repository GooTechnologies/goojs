define([
	'goo/scripts/GroundBoundMovementScript'
], function(
	GroundBoundMovementScript
	) {
	'use strict';



	describe('Movement script tests', function() {
		var groundBoundMovementScript;

		function getHeight() {
			return 0;
		}

		var mockGround = {
			getTerrainHeightAt:getHeight
		};

		var setEntityData = function(entity, data) {
			entity.transformComponent.transform.translation.data = data;
		};

		var entity = {
			transformComponent:{
				transform:{
					translation:{
						data:[]
					}
				}
			}
		};

		beforeEach(function() {
			groundBoundMovementScript = new GroundBoundMovementScript();
			setEntityData(entity, [0, 0, 0]);
		});

		it ('finds ground contact when below ground', function() {

			setEntityData(entity, [0, -1, 0]);
			groundBoundMovementScript.setTerrainSystem(mockGround);
			groundBoundMovementScript.run(entity);

			expect(entity.transformComponent.transform.translation.data[1]).toEqual(0);


		});


	});



});
