var Fullscreen = pc.createScript('fullscreen');

Fullscreen.prototype.initialize = function () {
    // might not be supported
    if (! (document.body.requestFullscreen || document.body.msRequestFullscreen || document.body.mozRequestFullScreen || document.body.webkitRequestFullscreen)) {
        return;
    }

    var icon = this.icon = document.createElement('div');
    icon.id = 'fullscreen';
    document.body.appendChild(icon);

    icon.addEventListener('click', function() {
        if (document.body.requestFullscreen) {
            document.body.requestFullscreen();
        } else if (document.body.msRequestFullscreen) {
            document.body.msRequestFullscreen();
        } else if (document.body.mozRequestFullScreen) {
            document.body.mozRequestFullScreen();
        } else if (document.body.webkitRequestFullscreen) {
            document.body.webkitRequestFullscreen();
        }
    }, false);
};