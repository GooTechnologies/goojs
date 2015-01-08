define([
	'goo/raycastpack/OctreeNode'
],
	/** @lends */
function (OctreeNode) {
		'use strict';
		
	//OCTREE
	function Octree(owner, boundMin, boundMax, maxDepth){
		this.owner = owner;
		this.parentNode = new OctreeNode(this, boundMin, boundMax, 0);
		this.maxDepth = maxDepth || 3;
	}

	Octree.prototype.generate = function(){
		this.parentNode.generateChildren();
	};

	Octree.prototype.pushObject = function(object, boundMin, boundMax){
		this.parentNode.pushObject(object, boundMin, boundMax);
	};

	Octree.prototype.optimize = function(){
		this.parentNode.optimize();
	};

	Octree.prototype.rayStep = function(ray, inverseDir, rayLength, nodeContainer, onlyLeafs){
		this.parentNode.rayStep(ray, inverseDir, rayLength, nodeContainer, onlyLeafs);
	};
	
	return Octree;
});