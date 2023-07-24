var Social = pc.createScript('social');

Social.prototype.initialize = function () {
    var block = document.createElement('div');
    block.id = 'social';
    document.body.appendChild(block);

    var url = "http://phone.playcanvas.com/";
    var tweet = "The Bigger #iPhone6 in #3D! Using #WebGL #javascript by @playcanvas";

    var fb = document.createElement('div');
    fb.className = 'facebook';
    block.appendChild(fb);

    fb.addEventListener('click', function() {
        this.share("http://facebook.com/sharer.php?u=" + encodeURIComponent(url) + "&t=" + encodeURIComponent("iPhone 6 - 3D Visualisation"));
    }.bind(this), false);

    var tw = document.createElement('div');
    tw.className = 'twitter';
    block.appendChild(tw);

    tw.addEventListener('click', function() {
         this.share("https://twitter.com/intent/tweet?text=" + encodeURIComponent(tweet) + "&url=" + encodeURIComponent(url));
    }.bind(this), false);
};

Social.prototype.share = function(shareUrl) {
    var left = (screen.width / 2) - (640 / 2);
    var top = (screen.height / 2) - (380 / 2);

    var popup = window.open(shareUrl, 'name', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + 640 + ', height=' + 380 +', top=' + top + ', left=' + left);
    if (window.focus && popup) {
        popup.focus();
    }
};