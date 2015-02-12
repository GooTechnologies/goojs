define([
    'goo/scripts/Scripts',
    'goo/addons/particlepack/ParticlesAPI',
    'goo/addons/particlepack/ParticleSystem',
    'goo/addons/particlepack/render/ParticleRenderer',
    'goo/addons/particlepack/render/TrailRenderer',
    'goo/addons/particlepack/simulation/Particle',
    'goo/addons/particlepack/simulation/ParticleSimulation',
    'goo/addons/particlepack/simulation/ParticleSimulator',
    'goo/addons/particlepack/simulation/SimulationParameters'
], function (Scripts) {
    'use strict';

    var defines = [
        'goo/scripts/Scripts',
        'goo/addons/particlepack/ParticlesAPI',
        'goo/addons/particlepack/ParticleSystem',
        'goo/addons/particlepack/render/ParticleRenderer',
        'goo/addons/particlepack/render/TrailRenderer',
        'goo/addons/particlepack/simulation/Particle',
        'goo/addons/particlepack/simulation/ParticleSimulation',
        'goo/addons/particlepack/simulation/ParticleSimulator',
        'goo/addons/particlepack/simulation/SimulationParameters'
    ];

    for (var i = 1; i < defines.length; i++) {
        var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
        Scripts.addClass(name, arguments[i]);
    }
});