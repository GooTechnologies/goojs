define([
    'goo/math/Vector3',
    'goo/scripts/ScriptUtils',
    'goo/math/MathUtils'
], function (Vector3, ScriptUtils, MathUtils) {
    'use strict';
    __touch(18918);
    function AxisAlignedCamControlScript() {
        function setup(params, env) {
            env.axis = new Vector3(Vector3.UNIT_Z);
            __touch(18927);
            env.upAxis = new Vector3(Vector3.UNIT_Y);
            __touch(18928);
            setView(params, env, params.view);
            __touch(18929);
            env.currentView = params.view;
            __touch(18930);
            env.lookAtPoint = new Vector3(Vector3.ZERO);
            __touch(18931);
            env.distance = params.distance;
            __touch(18932);
            env.smoothness = Math.pow(MathUtils.clamp(params.smoothness, 0, 1), 0.3);
            __touch(18933);
            env.axisAlignedDirty = true;
            __touch(18934);
        }
        __touch(18922);
        function setView(params, env, view) {
            if (env.currentView === view) {
                return;
                __touch(18938);
            }
            env.currentView = view;
            __touch(18935);
            switch (view) {
            case 'XY':
                env.axis.setv(Vector3.UNIT_Z);
                env.upAxis.setv(Vector3.UNIT_Y);
                break;
            case 'ZY':
                env.axis.setv(Vector3.UNIT_X);
                env.upAxis.setv(Vector3.UNIT_Y);
                break;
            }
            __touch(18936);
            env.axisAlignedDirty = true;
            __touch(18937);
        }
        __touch(18923);
        function update(params, env) {
            if (params.view !== env.currentView) {
                env.axisAlignedDirty = true;
                __touch(18945);
            }
            if (!env.axisAlignedDirty) {
                return;
                __touch(18946);
            }
            var entity = env.entity;
            __touch(18939);
            var transform = entity.transformComponent.transform;
            __touch(18940);
            transform.translation.setv(env.axis).scale(env.distance).addv(env.lookAtPoint);
            __touch(18941);
            transform.lookAt(env.lookAtPoint, env.upAxis);
            __touch(18942);
            entity.transformComponent.setUpdated();
            __touch(18943);
            env.axisAlignedDirty = false;
            __touch(18944);
        }
        __touch(18924);
        function cleanup() {
        }
        __touch(18925);
        return {
            setup: setup,
            update: update,
            cleanup: cleanup
        };
        __touch(18926);
    }
    __touch(18919);
    AxisAlignedCamControlScript.externals = {
        key: 'AxisAlignedCamControlScript',
        name: 'Axis-aligned Camera Control',
        description: 'Aligns a camera along an axis, and enables switching between them.',
        parameters: [
            {
                key: 'whenUsed',
                name: 'When Camera Used',
                description: 'Script only runs when the camera to which it is added is being used.',
                'default': true,
                type: 'boolean'
            },
            {
                key: 'distance',
                name: 'Distance',
                type: 'float',
                description: 'Camera distance from lookat point',
                control: 'slider',
                'default': 1,
                min: 1,
                max: 1000
            },
            {
                key: 'view',
                type: 'string',
                'default': 'XY',
                control: 'select',
                options: [
                    'XY',
                    'ZY'
                ]
            }
        ]
    };
    __touch(18920);
    return AxisAlignedCamControlScript;
    __touch(18921);
});
__touch(18917);