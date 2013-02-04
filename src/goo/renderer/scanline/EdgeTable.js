define([
	'goo/renderer/scanline/EdgeRecord',
	'goo/renderer/scanline/Triangle'
	],
/** @lends EdgeTable */
function (EdgeRecord, Triangle) {

	/*
		Stores the edges of a triangle. The table stores which scanline the edge starts at.
	*/
	function EdgeTable(triangle) {

		// create the edge records for the triangle.
		this.array = [];


	};

	return EdgeTable;
});