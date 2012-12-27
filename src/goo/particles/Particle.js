define([ 'goo/math/Vector3', 'goo/math/Vector4', 'goo/renderer/MeshData' ], function(Vector3, Vector4, MeshData) {
	"use strict";

	var bbX = new Vector3();
	var bbY = new Vector3();
	var calcVec = new Vector3();
	
	/**
	 * @name Particle
	 * @class Data object tracking a single particle in a particle component.
	 */
	function Particle(particleComponent, index) {
		this.alive = false;
		this.position = new Vector3();
		this.velocity = new Vector3();
		this.lifeSpan = 0;
		this.parent = particleComponent;
		this.age = 0;
		this.index = index;
		this.color = new Vector4(1, 0, 0, 1);
		this.size = 0.0;
		this.spin = 0.0;
		this.mass = 1.0;
	}

	Particle.prototype.respawnParticle = function(lifeSpan) {
		this.lifeSpan = lifeSpan;
		this.alive = true;
		this.age = 0;
	};

	Particle.prototype.update = function(tpf, transformComponent, camera) {
		if (!this.alive) return;
		
		this.age += tpf;
		
		if (this.age > this.lifeSpan) {
			this.kill();
			return;
		}
		
		this.position.add([this.velocity.x * tpf, this.velocity.y * tpf, this.velocity.z * tpf]);
		
		// set values from component timeline
		this.parent.applyTimeline(this);
		
		// apply current color to mesh
		var colorBuffer = this.parent.meshData.getAttributeBuffer(MeshData.COLOR);
		colorBuffer.set(this.color.data, this.index * 12 + 0);
		colorBuffer.set(this.color.data, this.index * 12 + 4);
		colorBuffer.set(this.color.data, this.index * 12 + 8);
		
		// determine our billboard to camera using camera and spin 
		// XXX: This could probably be done in the Shader instead?
		var camUp = camera._up;
		var camLeft = camera._left;
        if (this.spin == 0) {
            bbX.set(camLeft).mul(this.size);
            bbY.set(camUp).mul(this.size);
        } else {
            var cA = Math.cos(this.spin) * this.size;
            var sA = Math.sin(this.spin) * this.size;
            bbX.set(camLeft).mul(cA).add(camUp.x * sA, camUp.y * sA, camUp.z * sA);
            bbY.set(camLeft).mul(-sA).add(camUp.x * cA, camUp.y * cA, camUp.z * cA);
        }
        
        // if we have a transform, unwind the world rotation.
        if (transformComponent && transformComponent.worldTransform) {
        	transformComponent.worldTransform.rotation.applyPre(bbX);
        	transformComponent.worldTransform.rotation.applyPre(bbY);
        }

        // apply billboard vectors to mesh verts
		var vertexBuffer = this.parent.meshData.getAttributeBuffer(MeshData.POSITION);
        
		// right point
        Vector3.sub(this.position, [3 * bbX.x, 3 * bbX.y, 3 * bbX.z], calcVec).sub(bbY);
		vertexBuffer.set(calcVec.data, this.index * 9 + 0);

		// top point
        Vector3.add(this.position, bbX, calcVec).add([3 * bbY.x, 3 * bbY.y, 3 * bbY.z]);
		vertexBuffer.set(calcVec.data, this.index * 9 + 3);

		// bottom left corner
        Vector3.add(this.position, bbX, calcVec).sub(bbY);
		vertexBuffer.set(calcVec.data, this.index * 9 + 6);
	};
	
	Particle.prototype.kill = function() {
		this.alive = false;
		// collapse particle to a single point, effectively hiding it from view.
		var vertexBuffer = this.parent.meshData.getAttributeBuffer(MeshData.POSITION);
		var pointA = vertexBuffer.subarray(this.index * 9, this.index * 9 + 3);
		vertexBuffer.set(pointA, this.index * 9 + 3);
		vertexBuffer.set(pointA, this.index * 9 + 6);
	};

	return Particle;
});