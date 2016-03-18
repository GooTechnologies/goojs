import ParticleSystemComponent from './components/ParticleSystemComponent';
import ConstantCurve from './curves/ConstantCurve';
import Curve from './curves/Curve';
import LerpCurve from './curves/LerpCurve';
import LinearCurve from './curves/LinearCurve';
import PolyCurve from './curves/PolyCurve';
import Vector3Curve from './curves/Vector3Curve';
import Vector4Curve from './curves/Vector4Curve';
import ParticleSystemComponentHandler from './handlers/ParticleSystemComponentHandler';
import ParticleData from './ParticleData';
import ParticleDebugRenderSystem from './systems/ParticleDebugRenderSystem';
import ParticleSystemSystem from './systems/ParticleSystemSystem';

module.exports = {
	ParticleSystemComponent,
	ConstantCurve,
	Curve,
	LerpCurve,
	LinearCurve,
	PolyCurve,
	Vector3Curve,
	Vector4Curve,
	ParticleSystemComponentHandler,
	ParticleData,
	ParticleDebugRenderSystem,
	ParticleSystemSystem
};

import ObjectUtils from '../../util/ObjectUtils';

if (typeof(window) !== 'undefined') {
	ObjectUtils.extend(window.goo, module.exports);
}