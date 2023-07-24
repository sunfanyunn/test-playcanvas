var Powered = pc.createScript('powered');

Powered.prototype.initialize = function () {
    var el = document.createElement('a');
    el.id = 'powered';
    el.href = 'https://playcanvas.com/';
    el.target = '_blank';
    document.body.appendChild(el);
};