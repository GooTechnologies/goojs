import LogicLayer from './LogicLayer';
import LogicNode from './LogicNode';
import LogicNodes from './LogicNodes';
import LogicInterface from './LogicInterface';
import Vector3 from '../../math/Vector3';
import Matrix3 from '../../math/Matrix3';

/**
 * Logic node for vector < matrix computation
 * @private
 */
function LogicNodeApplyMatrix() {
	LogicNode.call(this);
	this.logicInterface = LogicNodeApplyMatrix.logicInterface;
	this.type = 'LogicNodeApplyMatrix';
	this.vec = new Vector3();
}

LogicNodeApplyMatrix.prototype = Object.create(LogicNode.prototype);
LogicNodeApplyMatrix.editorName = 'ApplyMatrix';

LogicNodeApplyMatrix.prototype.onInputChanged = function (instDesc) {
	var vec = LogicLayer.readPort(instDesc, LogicNodeApplyMatrix.inportX);
	var mat = LogicLayer.readPort(instDesc, LogicNodeApplyMatrix.inportY);
	this.vec.copy(vec);
	mat.applyPost(this.vec);
	LogicLayer.writeValue(this.logicInstance, LogicNodeApplyMatrix.outportProduct, this.vec);
};

LogicNodeApplyMatrix.logicInterface = new LogicInterface();
LogicNodeApplyMatrix.outportProduct = LogicNodeApplyMatrix.logicInterface.addOutputProperty('product', 'Vector3');
LogicNodeApplyMatrix.inportX = LogicNodeApplyMatrix.logicInterface.addInputProperty('vec', 'Vector3', new Vector3());
LogicNodeApplyMatrix.inportY = LogicNodeApplyMatrix.logicInterface.addInputProperty('mat', 'Matrix3', new Matrix3());

LogicNodes.registerType('LogicNodeApplyMatrix', LogicNodeApplyMatrix);

export default LogicNodeApplyMatrix;
