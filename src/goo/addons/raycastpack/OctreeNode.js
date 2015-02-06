define([
	'goo/math/Vector3'
],

function (Vector3) {
	'use strict';

	//move to ArrayUtil?
	var removeArrayElement = function(array, element) {
		for (var i=0, j=0; i<array.length; i++) {
			if (array[i] !== element) {
				array[j++] = array[i];
			}
		}

		array.length = j;
	};

		
	//OCTREE-NODE
	function OctreeNode(octreeOwner, boundMin, boundMax, depth) {
		this.octree = octreeOwner;
		this.isLeaf = (depth >= octreeOwner.maxDepth);
		this.depth = depth;
		this.boundMin = new Vector3(boundMin);
		this.boundMax = new Vector3(boundMax);

		//octree-nodes only have children if it isnt a leaf, and it only has data if its a leaf
		if(!this.isLeaf) {
			this.children = [];
		} else {
			this.data = [];
		}

		this.numHits = 0;
		this.hitsThisFrame = 0;

		this.tmpVec1 = new Vector3();
		this.tmpVec2 = new Vector3();
		this.tmpVec3 = new Vector3();
	}

	//Converts 3d bool-vector to index for children-array
	OctreeNode.prototype.coordinateToIndex = function(x, y, z) {
		return x+y*2+z*4;
	};

	OctreeNode.prototype.generateChildren = function() {

		//we stop generating children recursively when we reach a leaf
		if(this.isLeaf) {
			return;
		}

		var halfSize = this.tmpVec1;
		halfSize.setVector(this.boundMax);
		halfSize.subVector(this.boundMin);
		halfSize.mul(0.5);

		for (var z = 0; z < 2; z++) {
			for (var y = 0; y < 2; y++) {
				for (var x = 0; x < 2; x++) {
					var childBoundMin = this.tmpVec2;
					childBoundMin.setVector(this.boundMin);
					childBoundMin.addDirect(halfSize.x * x, halfSize.y * y, halfSize.z * z);

					var childBoundMax = this.tmpVec3;
					childBoundMax.setVector(childBoundMin);
					childBoundMax.addVector(halfSize);

					var child = this.children[this.coordinateToIndex(x, y, z)] = new OctreeNode(this.octree, childBoundMin, childBoundMax, this.depth + 1);

					//Recursively create all the children in a node until reaching leaf level.
					child.generateChildren();
				}
			}
		}
	};

	OctreeNode.prototype.intersectsBoundingBox = function(boundMin, boundMax) {
		if (this.boundMax.x < boundMin.x) {
			return false;
		}
		if (this.boundMin.x > boundMax.x) {
			return false;
		}
		if (this.boundMax.y < boundMin.y) {
			return false;
		}
		if (this.boundMin.y > boundMax.y) {
			return false;
		}
		if (this.boundMax.z < boundMin.z) {
			return false;
		}
		if (this.boundMin.z > boundMax.z) {
			return false;
		}

		//intersects
		return true;
	};

	//Recursively pushes object down the octree nodes and generates new node sections if necessary
	OctreeNode.prototype.pushObject = function(object, boundMin, boundMax) {
		//if object doesnt collide the node, return
		if(this.intersectsBoundingBox(boundMin, boundMax)) {
			if(!this.isLeaf) {
				//if this node has no children, generate new ones
				if(this.children.length===0) {
					this.generateChildren();
				}

				//iterate all children and push object down until reaching a leaf
				for(var i=0; i<this.children.length; i++) {
					this.children[i].pushObject(object, boundMin, boundMax);
				}
			} else {
				//Add data object
				this.addData(object);
			}
		}
	};

	OctreeNode.prototype.intersectsRay = function(ray) {
		var distance = ray.intersectsAABox(this.boundMin, this.boundMax);
		return (distance && distance <= ray.length);
	};

	//hitcallback inside recursion? return bitflags instead of true, false
	OctreeNode.prototype.rayStep = function(ray, nodesHit, onlyLeafs){

		//if ray doesnt collide the node, return
		if(this.depth !== 0 && !this.intersectsRay(ray)) {
			return false;
		}
		this.hitsThisFrame++;

		if(!this.isLeaf) {
			this.numHits = 0;

			//iterate all children and ray step down recursively until reaching a leaf
			for(var i=0; i<this.children.length; i++) {
				if(this.children[i].rayStep(ray, nodesHit, onlyLeafs)) {
					this.numHits++;
				}

				if(this.numHits >= 4) {
					return true;
				}
			}
		}

		if(!onlyLeafs || this.isLeaf) {
			//Add to hit node array
			nodesHit.push(this);
			return true;
		}
	};

	OctreeNode.prototype.addData = function(object) {
		if(this.data.indexOf(object) === -1) {
			this.data.push(object);
		}
	};

	OctreeNode.prototype.optimize = function() {
		if(!this.isLeaf) {

			//optimize all children recursively
			for(var i=this.children.length-1; i>=0; i--) {
				var child = this.children[i];
				if(child.optimize()) {
					removeArrayElement(this.children, child);
				}
			}

			return (this.children.length === 0);
		} else {

			return (this.data.length === 0);
		}
	};

	return OctreeNode;
});