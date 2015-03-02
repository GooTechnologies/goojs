define(function () {
    'use strict';
    __touch(17503);
    function ShaderCall(context, uniform, type) {
        this.context = context;
        __touch(17527);
        this.location = uniform;
        __touch(17528);
        this.location.value = undefined;
        __touch(17529);
        if (type) {
            switch (type) {
            case 'float':
                this.call = this.uniform1f;
                break;
            case 'bool':
            case 'int':
            case 'integer':
            case 'sampler2D':
            case 'sampler3D':
            case 'samplerCube':
                this.call = this.uniform1i;
                break;
            case 'floatarray':
                this.call = this.uniform1fv;
                break;
            case 'intarray':
            case 'samplerArray':
                this.call = this.uniform1iv;
                break;
            case 'vec2':
                this.call = this.uniform2fv;
                break;
            case 'vec3':
                this.call = this.uniform3fv;
                break;
            case 'vec4':
                this.call = this.uniform4fv;
                break;
            case 'mat2':
                this.call = this.uniformMatrix2fv;
                break;
            case 'mat3':
                this.call = this.uniformMatrix3fv;
                break;
            case 'mat4':
                this.call = this.uniformMatrix4fv;
                break;
            default:
                throw 'Uniform type not handled: ' + type;
            }
            __touch(17530);
        }
    }
    __touch(17504);
    ShaderCall.prototype.uniform1f = function (v0) {
        var curValue = this.location.value;
        __touch(17531);
        if (curValue === v0) {
            return;
            __touch(17534);
        }
        this.context.uniform1f(this.location, v0);
        __touch(17532);
        this.location.value = v0;
        __touch(17533);
    };
    __touch(17505);
    ShaderCall.prototype.uniform1fv = function (values) {
        var curValue = this.location.value;
        __touch(17535);
        if (curValue !== undefined) {
            if (compareArrays(values, curValue)) {
                return;
                __touch(17538);
            }
        }
        this.context.uniform1fv(this.location, values);
        __touch(17536);
        this.location.value = values.slice();
        __touch(17537);
    };
    __touch(17506);
    ShaderCall.prototype.uniform1i = function (v0) {
        var curValue = this.location.value;
        __touch(17539);
        if (curValue === v0) {
            return;
            __touch(17542);
        }
        this.context.uniform1i(this.location, v0);
        __touch(17540);
        this.location.value = v0;
        __touch(17541);
    };
    __touch(17507);
    ShaderCall.prototype.uniform1iv = function (values) {
        var curValue = this.location.value;
        __touch(17543);
        if (curValue !== undefined) {
            if (compareArrays(values, curValue)) {
                return;
                __touch(17546);
            }
        }
        this.context.uniform1iv(this.location, values);
        __touch(17544);
        this.location.value = values.slice();
        __touch(17545);
    };
    __touch(17508);
    ShaderCall.prototype.uniform2f = function (v0, v1) {
        var curValue = this.location.value;
        __touch(17547);
        if (curValue !== undefined) {
            if (curValue.length === 2 && curValue[0] === v0 && curValue[1] === v1) {
                return;
                __touch(17550);
            }
        }
        this.context.uniform2f(this.location, v0, v1);
        __touch(17548);
        this.location.value = [
            v0,
            v1
        ];
        __touch(17549);
    };
    __touch(17509);
    ShaderCall.prototype.uniform2fv = function (values) {
        var curValue = this.location.value;
        __touch(17551);
        if (curValue !== undefined) {
            if (compareArrays(values, curValue)) {
                return;
                __touch(17555);
            }
        } else {
            curValue = this.location.value = new Float64Array(values.length);
            __touch(17556);
        }
        this.context.uniform2fv(this.location, values);
        __touch(17552);
        var l = values.length;
        __touch(17553);
        while (l--) {
            curValue[l] = values[l];
            __touch(17557);
        }
        __touch(17554);
    };
    __touch(17510);
    ShaderCall.prototype.uniform2i = function (v0, v1) {
        var curValue = this.location.value;
        __touch(17558);
        if (curValue !== undefined) {
            if (curValue.length === 2 && curValue[0] === v0 && curValue[1] === v1) {
                return;
                __touch(17561);
            }
        }
        this.context.uniform2i(this.location, v0, v1);
        __touch(17559);
        this.location.value = [
            v0,
            v1
        ];
        __touch(17560);
    };
    __touch(17511);
    ShaderCall.prototype.uniform2iv = function (values) {
        var curValue = this.location.value;
        __touch(17562);
        if (curValue !== undefined) {
            if (compareArrays(values, curValue)) {
                return;
                __touch(17565);
            }
        }
        this.context.uniform2iv(this.location, values);
        __touch(17563);
        this.location.value = values.slice();
        __touch(17564);
    };
    __touch(17512);
    ShaderCall.prototype.uniform3f = function (v0, v1, v2) {
        var curValue = this.location.value;
        __touch(17566);
        if (curValue !== undefined) {
            if (curValue.length === 3 && curValue[0] === v0 && curValue[1] === v1 && curValue[2] === v2) {
                return;
                __touch(17571);
            }
        } else {
            curValue = this.location.value = [];
            __touch(17572);
        }
        this.context.uniform3f(this.location, v0, v1, v2);
        __touch(17567);
        curValue[0] = v0;
        __touch(17568);
        curValue[1] = v1;
        __touch(17569);
        curValue[2] = v2;
        __touch(17570);
    };
    __touch(17513);
    ShaderCall.prototype.uniform3fv = function (values) {
        var curValue = this.location.value;
        __touch(17573);
        if (curValue !== undefined) {
            if (compareArrays(values, curValue)) {
                return;
                __touch(17577);
            }
        } else {
            curValue = this.location.value = new Float64Array(values.length);
            __touch(17578);
        }
        this.context.uniform3fv(this.location, values);
        __touch(17574);
        var l = values.length;
        __touch(17575);
        while (l--) {
            curValue[l] = values[l];
            __touch(17579);
        }
        __touch(17576);
    };
    __touch(17514);
    ShaderCall.prototype.uniform3i = function (v0, v1, v2) {
        var curValue = this.location.value;
        __touch(17580);
        if (curValue !== undefined) {
            if (curValue.length === 3 && curValue[0] === v0 && curValue[1] === v1 && curValue[2] === v2) {
                return;
                __touch(17583);
            }
        }
        this.context.uniform3i(this.location, v0, v1, v2);
        __touch(17581);
        this.location.value = [
            v0,
            v1,
            v2
        ];
        __touch(17582);
    };
    __touch(17515);
    ShaderCall.prototype.uniform3iv = function (values) {
        var curValue = this.location.value;
        __touch(17584);
        if (curValue !== undefined) {
            if (compareArrays(values, curValue)) {
                return;
                __touch(17587);
            }
        }
        this.context.uniform3iv(this.location, values);
        __touch(17585);
        this.location.value = values.slice();
        __touch(17586);
    };
    __touch(17516);
    ShaderCall.prototype.uniform4f = function (v0, v1, v2, v3) {
        var curValue = this.location.value;
        __touch(17588);
        if (curValue !== undefined) {
            if (curValue.length === 4 && curValue[0] === v0 && curValue[1] === v1 && curValue[2] === v2 && curValue[3] === v3) {
                return;
                __touch(17591);
            }
        }
        this.context.uniform4f(this.location, v0, v1, v2, v3);
        __touch(17589);
        this.location.value = [
            v0,
            v1,
            v2,
            v3
        ];
        __touch(17590);
    };
    __touch(17517);
    ShaderCall.prototype.uniform4fv = function (values) {
        var curValue = this.location.value;
        __touch(17592);
        if (curValue !== undefined) {
            if (compareArrays(values, curValue)) {
                return;
                __touch(17596);
            }
        } else {
            curValue = this.location.value = new Float64Array(values.length);
            __touch(17597);
        }
        this.context.uniform4fv(this.location, values);
        __touch(17593);
        var l = values.length;
        __touch(17594);
        while (l--) {
            curValue[l] = values[l];
            __touch(17598);
        }
        __touch(17595);
    };
    __touch(17518);
    ShaderCall.prototype.uniform4i = function (v0, v1, v2, v3) {
        var curValue = this.location.value;
        __touch(17599);
        if (curValue !== undefined) {
            if (curValue.length === 4 && curValue[0] === v0 && curValue[1] === v1 && curValue[2] === v2 && curValue[3] === v3) {
                return;
                __touch(17602);
            }
        }
        this.context.uniform4i(this.location, v0, v1, v2, v3);
        __touch(17600);
        this.location.value = [
            v0,
            v1,
            v2,
            v3
        ];
        __touch(17601);
    };
    __touch(17519);
    ShaderCall.prototype.uniform4iv = function (values) {
        var curValue = this.location.value;
        __touch(17603);
        if (curValue !== undefined) {
            if (compareArrays(values, curValue)) {
                return;
                __touch(17606);
            }
        }
        this.context.uniform4iv(this.location, values);
        __touch(17604);
        this.location.value = values.slice();
        __touch(17605);
    };
    __touch(17520);
    function compareMatrices(e1, e2, size) {
        if (size < 0) {
            return false;
            __touch(17609);
        }
        while (size--) {
            if (e1[size] !== e2[size]) {
                return false;
                __touch(17610);
            }
        }
        __touch(17607);
        return true;
        __touch(17608);
    }
    __touch(17521);
    function compareArrays(a1, a2) {
        var l = a1.length;
        __touch(17611);
        while (l--) {
            if (a1[l] !== a2[l]) {
                return false;
                __touch(17614);
            }
        }
        __touch(17612);
        return true;
        __touch(17613);
    }
    __touch(17522);
    ShaderCall.prototype.uniformMatrix2fv = function (matrix, transpose) {
        transpose = transpose === true;
        __touch(17615);
        if (!matrix.data) {
            this.context.uniformMatrix2fv(this.location, transpose, matrix);
            __touch(17618);
            return;
            __touch(17619);
        }
        var curValue = this.location.value;
        __touch(17616);
        if (curValue !== undefined) {
            var equals = compareMatrices(curValue.data, matrix.data, 4);
            __touch(17620);
            if (equals) {
                return;
                __touch(17621);
            } else {
                curValue.copy(matrix);
                __touch(17622);
            }
        } else {
            this.location.value = matrix.clone();
            __touch(17623);
        }
        this.context.uniformMatrix2fv(this.location, transpose, matrix.data);
        __touch(17617);
    };
    __touch(17523);
    ShaderCall.prototype.uniformMatrix3fv = function (matrix, transpose) {
        transpose = transpose === true;
        __touch(17624);
        if (!matrix.data) {
            this.context.uniformMatrix3fv(this.location, transpose, matrix);
            __touch(17627);
            return;
            __touch(17628);
        }
        var curValue = this.location.value;
        __touch(17625);
        if (curValue !== undefined) {
            var equals = compareMatrices(curValue.data, matrix.data, 9);
            __touch(17629);
            if (equals) {
                return;
                __touch(17630);
            } else {
                curValue.copy(matrix);
                __touch(17631);
            }
        } else {
            this.location.value = matrix.clone();
            __touch(17632);
        }
        this.context.uniformMatrix3fv(this.location, transpose, matrix.data);
        __touch(17626);
    };
    __touch(17524);
    ShaderCall.prototype.uniformMatrix4fv = function (matrix, transpose) {
        transpose = transpose === true;
        __touch(17633);
        if (!matrix.data) {
            var values = matrix;
            __touch(17636);
            var curValue = this.location.value;
            __touch(17637);
            if (curValue !== undefined) {
                if (compareArrays(values, curValue)) {
                    return;
                    __touch(17642);
                }
            } else {
                curValue = this.location.value = new Float64Array(values.length);
                __touch(17643);
            }
            this.context.uniformMatrix4fv(this.location, transpose, values);
            __touch(17638);
            var l = values.length;
            __touch(17639);
            while (l--) {
                curValue[l] = values[l];
                __touch(17644);
            }
            __touch(17640);
            return;
            __touch(17641);
        }
        var curValue = this.location.value;
        __touch(17634);
        if (curValue !== undefined) {
            var equals = compareMatrices(curValue.data, matrix.data, 16);
            __touch(17645);
            if (equals) {
                return;
                __touch(17646);
            } else {
                curValue.copy(matrix);
                __touch(17647);
            }
        } else {
            this.location.value = matrix.clone();
            __touch(17648);
        }
        this.context.uniformMatrix4fv(this.location, transpose, matrix.data);
        __touch(17635);
    };
    __touch(17525);
    return ShaderCall;
    __touch(17526);
});
__touch(17502);