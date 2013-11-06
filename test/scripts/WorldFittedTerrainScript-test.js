define([
	'goo/scripts/WorldFittedTerrainScript'
], function(
	WorldFittedTerrainScript
	) {
	'use strict';



	describe('Tests against default dimensions', function() {
		it ('adds bad heightmap and gets exception', function() {

			var terrainScript = new WorldFittedTerrainScript();
			expect(function() {terrainScript.addHeightData();}).toThrow();

		});

		it ('looks for positions outside default dimensions', function() {

		});
	});
});
