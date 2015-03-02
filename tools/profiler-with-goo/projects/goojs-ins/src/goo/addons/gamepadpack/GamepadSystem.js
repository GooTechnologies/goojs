define([
    'goo/entities/systems/System',
    'goo/addons/gamepadpack/GamepadData'
], function (System, GamepadData) {
    'use strict';
    __touch(566);
    function GamepadSystem() {
        System.call(this, 'GamepadSystem', ['GamepadComponent']);
        __touch(576);
        this.gamepads = [];
        __touch(577);
        this.gamepadData = [];
        __touch(578);
        var BUFFER_COUNT = 4;
        __touch(579);
        for (var i = 0; i < BUFFER_COUNT; i++) {
            this.gamepadData[i] = new GamepadData();
            __touch(580);
        }
        if (navigator.webkitGetGamepads) {
            this.updateGamepads = this.chromeGamepadUpdate;
            __touch(581);
        } else {
            this.updateGamepads = function () {
            };
            __touch(582);
            var that = this;
            __touch(583);
            window.addEventListener('gamepadconnected', function (e) {
                that.mozGamepadHandler(e, true);
                __touch(586);
            }, false);
            __touch(584);
            window.addEventListener('gamepaddisconnected', function (e) {
                that.mozGamepadHandler(e, false);
                __touch(587);
            }, false);
            __touch(585);
        }
    }
    __touch(567);
    GamepadSystem.prototype.checkGamepadMapping = function (gamepad) {
        if (!gamepad.mapping) {
            console.warn('No mapping set on gamepad #' + gamepad.index);
            __touch(588);
        } else if (gamepad.mapping !== 'standard') {
            console.warn('Non-standard mapping set on gamepad #' + gamepad.index);
            __touch(589);
        }
    };
    __touch(568);
    GamepadSystem.prototype = Object.create(System.prototype);
    __touch(569);
    GamepadSystem.prototype.mozGamepadHandler = function (event, connecting) {
        var gamepad = event.gamepad;
        __touch(590);
        if (connecting) {
            this.gamepads[gamepad.index] = gamepad;
            __touch(591);
            this.checkGamepadMapping(gamepad);
            __touch(592);
        } else {
            delete this.gamepads[gamepad.index];
            __touch(593);
        }
    };
    __touch(570);
    GamepadSystem.prototype.chromeGamepadUpdate = function () {
        var updatedGamepads = navigator.webkitGetGamepads();
        __touch(594);
        var numOfGamePads = updatedGamepads.length;
        __touch(595);
        for (var i = 0; i < numOfGamePads; i++) {
            var gamepad = updatedGamepads[i];
            __touch(596);
            if (gamepad) {
                this.gamepads[gamepad.index] = gamepad;
                __touch(597);
            }
        }
    };
    __touch(571);
    GamepadSystem.prototype.updateGamepadData = function () {
        this.updateGamepads();
        __touch(598);
        var numOfGamePads = this.gamepads.length;
        __touch(599);
        for (var i = 0; i < numOfGamePads; i++) {
            var gamepad = this.gamepads[i];
            __touch(600);
            if (gamepad) {
                this.gamepadData[gamepad.index].recalculateData(gamepad);
                __touch(601);
            }
        }
    };
    __touch(572);
    GamepadSystem.prototype.resetGamepadData = function () {
        var numOfGamePads = this.gamepads.length;
        __touch(602);
        for (var i = 0; i < numOfGamePads; i++) {
            var gamepad = this.gamepads[i];
            __touch(603);
            if (gamepad) {
                this.gamepadData[gamepad.index].resetData(gamepad);
                __touch(604);
            }
        }
    };
    __touch(573);
    GamepadSystem.prototype.process = function (entities) {
        this.updateGamepadData();
        __touch(605);
        var numOfEntities = entities.length;
        __touch(606);
        for (var i = 0; i < numOfEntities; i++) {
            var entity = entities[i];
            __touch(608);
            var gamepadComponent = entity.gamepadComponent;
            __touch(609);
            var gamepadIndex = gamepadComponent.gamepadIndex;
            __touch(610);
            var data = this.gamepadData[gamepadIndex];
            __touch(611);
            var gamepad = this.gamepads[gamepadIndex];
            __touch(612);
            if (!gamepad) {
                return;
                __touch(618);
            }
            var rawX, rawY, rawData;
            __touch(613);
            if (gamepadComponent.leftStickFunction) {
                rawX = gamepad.axes[0];
                __touch(619);
                rawY = gamepad.axes[1];
                __touch(620);
                rawData = [
                    rawX,
                    rawY
                ];
                __touch(621);
                gamepadComponent.leftStickFunction(entity, data.leftStickDirection, data.leftAmount, rawData);
                __touch(622);
            }
            if (gamepadComponent.rightStickFunction) {
                rawX = gamepad.axes[2];
                __touch(623);
                rawY = gamepad.axes[3];
                __touch(624);
                rawData = [
                    rawX,
                    rawY
                ];
                __touch(625);
                gamepadComponent.rightStickFunction(entity, data.rightStickDirection, data.rightAmount, rawData);
                __touch(626);
            }
            var buttonIndex, buttonData;
            __touch(614);
            for (buttonIndex in gamepadComponent.buttonDownFunctions) {
                buttonData = data.buttonData[buttonIndex];
                __touch(627);
                if (buttonData.down === true) {
                    gamepadComponent.buttonDownFunctions[buttonIndex](entity, buttonData.value);
                    __touch(628);
                }
            }
            __touch(615);
            for (buttonIndex in gamepadComponent.buttonUpFunctions) {
                buttonData = data.buttonData[buttonIndex];
                __touch(629);
                if (buttonData.down === false) {
                    gamepadComponent.buttonUpFunctions[buttonIndex](entity, buttonData.value);
                    __touch(630);
                }
            }
            __touch(616);
            for (buttonIndex in gamepadComponent.buttonPressedFunctions) {
                buttonData = data.buttonData[buttonIndex];
                __touch(631);
                if (buttonData.pressed === true) {
                    gamepadComponent.buttonPressedFunctions[buttonIndex](entity, buttonData.value);
                    __touch(632);
                }
            }
            __touch(617);
        }
        this.resetGamepadData();
        __touch(607);
    };
    __touch(574);
    return GamepadSystem;
    __touch(575);
});
__touch(565);