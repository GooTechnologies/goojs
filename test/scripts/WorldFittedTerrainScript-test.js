define([
	'goo/scripts/WorldFittedTerrainScript'
], function(
	WorldFittedTerrainScript
	) {
	'use strict';



	describe('Tests against default dimensions', function() {
		var terrainScript;
		var heightAtPos;
		beforeEach(function() {
			heightAtPos = undefined;
			terrainScript = new WorldFittedTerrainScript();

		});

		var heightMatrix = [[0, 0, 0, 0], [0, 0.5, 0.5, 0], [0.5, 1, 1, 0.5], [1, 1, 1, 1]];
		it ('adds bad heightmap and gets exception', function() {
			var terrainScript = new WorldFittedTerrainScript();
			expect(function() {terrainScript.addHeightData();}).toThrow();
		});

		it ('finds the registered heightscript', function() {
			var heightData;
			terrainScript.addHeightData(heightMatrix);
			heightData = terrainScript.getHeightDataForPosition([1,1,1]);
			expect(heightData.script.getMatrixData()).toBe(heightMatrix);
		});

		it ('looks for positions on a default dimensions heightMatrix', function() {
			terrainScript.addHeightData(heightMatrix);
			heightAtPos = terrainScript.getGroundHeightAtPos([0,0,0]);
			expect(heightAtPos).toEqual(0);
			heightAtPos = terrainScript.getGroundHeightAtPos([100,50,100]);
			expect(heightAtPos).toEqual(50);
		});

		it ('looks outside default dimensions', function() {
			terrainScript.addHeightData(heightMatrix);
			heightAtPos = terrainScript.getGroundHeightAtPos([-1,0,0]);
			expect(heightAtPos).toEqual(null);
			heightAtPos = terrainScript.getGroundHeightAtPos([100,50,101]);
			expect(heightAtPos).toEqual(null);
		});

	});
});
