import LogicLayer from './LogicLayer';
import LogicNode from './LogicNode';
import LogicNodes from './LogicNodes';
import LogicInterface from './LogicInterface';
import Vector3 from '../../math/Vector3';
import Matrix3 from '../../math/Matrix3'

/**
 * Logic node that constructs a rotation matrix.
 * @private
 */
function LogicNodeRotationMatrix() {
	LogicNode.call(this);
	this.logicInterface = LogicNodeRotationMatrix.logicInterface;
	this.type = 'LogicNodeRotationMatrix';
	this.vec = new Vector3();
}

LogicNodeRotationMatrix.prototype = Object.create(LogicNode.prototype);
LogicNodeRotationMatrix.editorName = 'RotationMatrix';

LogicNodeRotationMatrix.prototype.onInputChanged = function (instDesc) {
	var vec = LogicLayer.readPort(instDesc, LogicNodeRotationMatrix.inportX);
	var mat = new Matrix3();
	mat.fromAngles(vec.x, vec.y, vec.z);
	LogicLayer.writeValue(instDesc, LogicNodeRotationMatrix.outportProduct, mat);
};

LogicNodeRotationMatrix.logicInterface = new LogicInterface();
LogicNodeRotationMatrix.inportX = LogicNodeRotationMatrix.logicInterface.addInputProperty('vec', 'Vector3', new Vector3());
LogicNodeRotationMatrix.outportProduct = LogicNodeRotationMatrix.logicInterface.addOutputProperty('mat', 'Matrix3', new Matrix3());

LogicNodes.registerType('LogicNodeRotationMatrix', LogicNodeRotationMatrix);

export default LogicNodeRotationMatrix;