var Augment = pc.createScript('augment');

Augment.attributes.add('text', { type: 'string', default: '' });
Augment.attributes.add('external', { type: 'boolean', default: false });
Augment.attributes.add('length', { type: 'number', default: 16 });
Augment.attributes.add('image', {type: 'asset', assetType:'texture'});
Augment.attributes.add('img_size', { type: 'number', default: 50 });

Augment.prototype.initialize = function () {
    var app = this.app;
    this.anim = app.root.findByName('device').script.animation;
    this.ar = app.root.children[0].script.augmented;
    const fontSize = 96; // Set the desired font size in pixels
    this.ar.font = `${fontSize}px Arial`; // Use a different font family if needed
    this.camera = app.root.findByName('camera');
    this.alpha = -1.0;
};

Augment.prototype.update = function (dt) {
    switch (this.anim.state) {
        case 2:
            if (this.external) {
                this.alpha += (Math.min(1.0, this.entity.forward.dot(this.camera.forward) * 3) - this.alpha) * 0.1;
            } else {
                this.alpha += (-1 - this.alpha) * 0.1;
            }
            break;
        case 3:
            this.alpha += (1 - this.alpha) * 0.1;
            break;
        case 4:
        case 5:
            this.alpha += (-1 - this.alpha) * 0.1;
            break;
    }

    if (this.alpha > 0) {
        var point = this.camera.camera.worldToScreen(this.entity.getPosition());
        this.ar.draw(this.text, this.alpha, point.x, point.y, this.length);
        // Assume 'image' is an asset attribute of type 'texture'
        if (this.image !== null) { 
            this.image.ready(function (asset) {
                this.imgElement =  this.image.resource._levels[0];
                this.ar.draw_image(this.imgElement, this.alpha, point.x, point.y, this.img_size);
            }.bind(this));
        }
    }
};