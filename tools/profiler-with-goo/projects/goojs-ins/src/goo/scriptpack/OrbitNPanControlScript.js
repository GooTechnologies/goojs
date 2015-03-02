define([
    'goo/scripts/Scripts',
    'goo/scripts/OrbitCamControlScript',
    'goo/scriptpack/PanCamScript',
    'goo/util/ObjectUtil'
], function (Scripts, OrbitCamControlScript, PanCamControlScript, _) {
    'use strict';
    __touch(19599);
    function OrbitNPan() {
        var orbitScript = Scripts.create(OrbitCamControlScript);
        __touch(19606);
        var panScript = Scripts.create(PanCamControlScript);
        __touch(19607);
        function setup(parameters, environment, goo) {
            orbitScript.setup(parameters, environment, goo);
            __touch(19612);
            panScript.setup(parameters, environment, goo);
            __touch(19613);
        }
        __touch(19608);
        function update(parameters, environment, goo) {
            panScript.update(parameters, environment, goo);
            __touch(19614);
            orbitScript.update(parameters, environment, goo);
            __touch(19615);
        }
        __touch(19609);
        function cleanup(parameters, environment, goo) {
            panScript.cleanup(parameters, environment, goo);
            __touch(19616);
            orbitScript.cleanup(parameters, environment, goo);
            __touch(19617);
        }
        __touch(19610);
        return {
            setup: setup,
            cleanup: cleanup,
            update: update
        };
        __touch(19611);
    }
    __touch(19600);
    var orbitParams = OrbitCamControlScript.externals.parameters;
    __touch(19601);
    var panParams = PanCamControlScript.externals.parameters;
    __touch(19602);
    var params = _.deepClone(orbitParams.concat(panParams.slice(1)));
    __touch(19603);
    for (var i = 0; i < params.length; i++) {
        var param = params[i];
        __touch(19618);
        if (param.key === 'panSpeed') {
            params.splice(i, 1);
            __touch(19619);
            break;
            __touch(19620);
        }
    }
    for (var i = 0; i < params.length; i++) {
        var param = params[i];
        __touch(19621);
        switch (param.key) {
        case 'dragButton':
            param['default'] = 'Left';
            break;
        case 'panButton':
            param['default'] = 'Right';
            break;
        case 'panSpeed':
            param['default'] = 1;
            break;
        }
        __touch(19622);
    }
    OrbitNPan.externals = {
        key: 'OrbitNPanControlScript',
        name: 'Orbit and Pan Control',
        description: 'This is a combo of orbitcamcontrolscript and pancamcontrolscript',
        parameters: params
    };
    __touch(19604);
    return OrbitNPan;
    __touch(19605);
});
__touch(19598);