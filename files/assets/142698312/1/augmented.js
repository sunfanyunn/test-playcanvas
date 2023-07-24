var Augmented = pc.createScript('augmented');

Augmented.prototype.initialize = function () {
    var app = this.app;
    this.canvas = document.createElement('canvas');
    this.canvas.width = app.graphicsDevice.width;
    this.canvas.height = app.graphicsDevice.height;
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '0px';
    this.canvas.style.top = '0px';
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.camera = app.root.findByName('camera');
};

Augmented.prototype.update = function (dt) {
    var app = this.app;
    if (app.graphicsDevice.width !== this.canvas.width || app.graphicsDevice.height !== this.canvas.height) {
        this.canvas.width = app.graphicsDevice.width;
        this.canvas.height = app.graphicsDevice.height;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

Augmented.prototype.draw = function(text, opacity, x, y, length) {
    var ctx = this.ctx;
    ctx.font = "20px Arial";

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(x, y);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length, -length);
    ctx.strokeStyle = '#6cf';
    ctx.stroke();

    var width = ctx.measureText(text).width;

    ctx.beginPath();
    ctx.fillStyle = 'rgba(0, 0, 0, .3)';
    ctx.rect(length, -length - 15, width + 8, 15);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = '#6cf';
    ctx.fillText(text, length + 4, -length - 4);

    ctx.restore();
};

Augmented.prototype.draw_image = function(image, opacity, x, y, img_size) {
    console.log(typeof(image));
    var ctx = this.ctx;
    // Assuming 'image' is an HTMLImageElement or similar,
    // this will draw the image at the specified coordinates
    ctx.drawImage(image, x, y, img_size, img_size);

    ctx.restore();
};
