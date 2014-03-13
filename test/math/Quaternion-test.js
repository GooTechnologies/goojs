define([
	"goo/math/Quaternion",
	"goo/math/Matrix3x3",
	"goo/math/Vector3"
], function(
	Quaternion,
	Matrix3x3,
	Vector3
) {

	"use strict";

	describe('Quaternion', function() {

		it('can be instantiated with or without arguments',function(){
			var p = new Quaternion();
			var q = new Quaternion(1,2,3,4);
			expect(p).toEqual(Quaternion.IDENTITY);
			expect(q.x).toEqual(1);
			expect(q.y).toEqual(2);
			expect(q.z).toEqual(3);
			expect(q.w).toEqual(4);
		});

		it('can add two quaternions',function(){
			var p = new Quaternion(1,1,1,1);
			var q = new Quaternion(2,2,2,2);
			var result = new Quaternion();
			Quaternion.add(p,q,result);
			expect(result).toEqual(new Quaternion(3,3,3,3));
		});

		it('can subtract two quaternions',function(){
			var p = new Quaternion(1,1,1,1);
			var q = new Quaternion(2,2,2,2);
			var result = new Quaternion();
			Quaternion.sub(p,q,result);
			expect(result).toEqual(new Quaternion(-1,-1,-1,-1));
		});

		it('can multiply two quaternions component-wise',function(){
			var p = new Quaternion(2,2,2,2);
			var q = new Quaternion(2,2,2,2);
			var result = new Quaternion();
			Quaternion.mul(p,q,result);
			expect(result).toEqual(new Quaternion(4,4,4,4));
		});

		it('can multiply two quaternions',function(){
			var p = new Quaternion();
			var q = new Quaternion();
			var result = new Quaternion();
			Quaternion.mul2(p,q,result);
			expect(result).toEqual(new Quaternion());
		});

		it('can divide component-wise',function(){
			var p = new Quaternion(2,2,2,2);
			var q = new Quaternion(2,2,2,2);
			var result = new Quaternion();
			Quaternion.div(p,q,result);
			expect(result).toEqual(new Quaternion(1,1,1,1));
		});

		it('can add a scalar to a quaternion',function(){
			var p = new Quaternion(1,1,1,1);
			var result = new Quaternion();
			Quaternion.scalarAdd(p,1,result);
			expect(result).toEqual(new Quaternion(2,2,2,2));
		});

		it('can subtract a scalar from a quaternion',function(){
			var p = new Quaternion(1,1,1,1);
			var result = new Quaternion();
			Quaternion.scalarSub(p,1,result);
			expect(result).toEqual(new Quaternion(0,0,0,0));
		});

		it('can multiply a scalar with a quaternion',function(){
			var p = new Quaternion(1,1,1,1);
			var result = new Quaternion();
			Quaternion.scalarMul(p,2,result);
			expect(result).toEqual(new Quaternion(2,2,2,2));
		});

		it('can divide a quaternion with a scalar',function(){
			var p = new Quaternion(2,2,2,2);
			var result = new Quaternion();
			Quaternion.scalarDiv(p,2,result);
			expect(result).toEqual(new Quaternion(1,1,1,1));
		});

		it('can slerp',function(){
			var startQuat = new Quaternion();
			var endQuat = new Quaternion();
			var result = new Quaternion();
			Quaternion.slerp(startQuat,endQuat,0.5,result);
			expect(result).toEqual(new Quaternion());
		});

		it('can slerp',function(){
			var startQuat = new Quaternion();
			var endQuat = new Quaternion();
			var result = new Quaternion();
			Quaternion.slerp(startQuat,endQuat,0.5,result);
			expect(result).toEqual(new Quaternion());
		});

		it('can negate',function(){
			var q = new Quaternion(1,1,1,1);
			q.negate();
			expect(q).toEqual(new Quaternion(-1,-1,-1,-1));
		});

		it('can dot',function(){
			var q = new Quaternion(1,1,1,1);
			expect(q.dot(q)).toEqual(4);
		});

		it('can be set from rotation matrix', function(){
			var q = new Quaternion();
			var m = new Matrix3x3();
			q.fromRotationMatrix(m);
		});

		it('can set rotation matrix', function(){
			var q = new Quaternion();
			var m = new Matrix3x3();
			q.toRotationMatrix(m);
		});

		it('can be set from vector to vector', function(){
			var q = new Quaternion();
			var u = new Vector3();
			var v = new Vector3();
			q.fromVectorToVector(u,v);
		});

		it('can be normalized', function(){
			var q = new Quaternion(0,0,0,2);
			q.normalize();
			expect(q.magnitude()).toEqual(1);
		});

		it('can get magnitude', function(){
			var q = new Quaternion(0,0,0,2);
			expect(q.magnitude()).toEqual(2);
		});

		it('can get squared magnitude', function(){
			var q = new Quaternion(0,0,0,2);
			expect(q.magnitudeSquared()).toEqual(4);
		});

		it('can be set from axis angle', function(){
			var q = new Quaternion();
			var axis = new Vector3(1,0,0);
			var angle = 0;
			q.fromAngleAxis(angle,axis);
			expect(q).toEqual(new Quaternion());
		});

		it('can be set from a normal axis and angle', function(){
			var q = new Quaternion();
			var axis = new Vector3(1,0,0);
			var angle = 0;
			q.fromAngleNormalAxis(angle,axis);
			expect(q).toEqual(new Quaternion());
		});

		it('can generate axis and angle', function(){
			var q = new Quaternion();
			var axis = new Vector3();
			var angle = q.toAngleAxis(axis);
			expect(typeof angle).toEqual('number');
		});

		it('can check for equality', function(){
			var q = new Quaternion();
			expect(q.equals(q)).toBeTruthy();
		});

		it('can set all components', function(){
			var q = new Quaternion();
			q.setd(1,2,3,4);
			expect(q).toEqual(new Quaternion(1,2,3,4));
		});

		it('can set all components via array', function(){
			var q = new Quaternion();
			q.seta([1,2,3,4]);
			expect(q).toEqual(new Quaternion(1,2,3,4));
		});

		it('can set all components via other quaternion', function(){
			var q = new Quaternion();
			var p = new Quaternion(1,2,3,4);
			q.setv(p);
			expect(q).toEqual(p);
		});

	});
});
