var Animation = pc.createScript('animation');

Animation.attributes.add('logo', { type: 'asset', assetType: 'texture', array: false });
Animation.attributes.add('css', { type: 'asset', assetType: 'css', array: false });

Animation.prototype.initialize = function () {
    var app = this.app;

    this.state = 0;
    this.stateStart = Date.now();
    this.easing = 0.2;
    this.rotation = 0;
    
    var css = this.css.resource;
    var style = document.createElement('style');
    style.type = 'text/css';
    if (style.styleSheet){
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
    (document.head || document.getElementsByTagName('head')[0]).appendChild(style);

    this.overlay = document.createElement('div');
    this.overlay.id = 'overlay';
    document.body.appendChild(this.overlay);

    var overlayLast = this.overlayLast = document.createElement('div');
    overlayLast.id = 'overlayLast';
    document.body.appendChild(overlayLast);

    var title = document.createElement('h1');
    title.textContent = 'iPhone 6';
    overlayLast.appendChild(title);

    var subtitle = document.createElement('h2');
    subtitle.textContent = 'Bigger';
    overlayLast.appendChild(subtitle);

    var from = document.createElement('div');
    from.className = 'from';
    from.innerHTML = 'From &pound;539';
    overlayLast.appendChild(from);

    var button = document.createElement('a');
    button.href = 'http://store.apple.com/uk/buy-iphone/iphone6';
    button.target = '_blank';
    button.textContent = 'Buy Now';
    button.className = 'button';
    overlayLast.appendChild(button);

    var self = this;
    this.overlay.addEventListener('click', function() {
        if (self.state !== 0) return;
        self.state = 2;
        self.stateStart = Date.now();
        self.overlay.classList.add('hidden');
        document.getElementById('button_0').classList.add('active');
    }, false);

    this.stateStart = Date.now();

    var flower = this.logo;
    this.overlay.style.backgroundImage = 'url("' + flower.resource._levels[0].src + '")';

    this.angle = new pc.Quat();
    this.angleTarget = new pc.Quat();

    this.angle.setFromEulerAngles(75, -30, 0);

    this.parts = [
        this.entity.findByName('screen'),
        this.entity.findByName('motherboard'),
        this.entity.findByName('middle'),
        this.entity.findByName('case')
    ];

    this.entity.setLocalEulerAngles(0, 0, 0);

    var buttons = this.buttons = document.createElement('div');
    buttons.id = 'buttons';

    var self = this;

    var text = [
        'Overview',
        'Specs',
        'Camera',
        'Buy Now'
    ];

    for(var i = 0; i < 4; i++) {
        var button = document.createElement('div');
        button.id = 'button_' + i;
        button.className = 'button';

        var icon = document.createElement('div');
        icon.className = 'icon';
        button.appendChild(icon);

        var label = document.createElement('span');
        label.textContent = text[i];
        button.appendChild(label);

        button.addEventListener('click', function() {
            var state = parseInt(this.getAttribute('data-state')) + 2;

            if (self.state == state) return;

            var old = document.getElementById('button_' + (self.state - 2));
            if (old) {
                old.classList.remove('active');
            }
            this.classList.add('active');

            self.state = state;
            self.stateStart = Date.now();
            self.rotation = 0;

            self.turn.x = 30;
            self.turn.y = 0;
        }, false);

        button.setAttribute('data-state', i);
        buttons.appendChild(button);

        if (i == 2 && ! (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia)) {
            button.style.display = 'none';
        }
    }

    window.addEventListener('keydown', function(evt) {
        if (evt.keyCode >= 49 && evt.keyCode <= 52)
            document.getElementById('button_' + (evt.keyCode - 49)).click();
    }, false);

    document.body.appendChild(buttons);

    this.wall = app.root.findByName('wall').model.model.meshInstances[0].material;

    this.partsPositions = [
        [ -2.5, -1.3, .25, 2.3 ],
        [ -1.25, -.8, 0, .9 ]
    ];

    this.mouse = {
        sx: 0,
        sy: 0,
        x: 0,
        y: 0,
        down: false,
        touchId: -1,
    };
    this.turn = {
        x: 0,
        y: 0,
        nx: 0,
        ny: 0,
        l: 0
    };

    window.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    window.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    window.addEventListener('mouseup', this.onMouseUp.bind(this), false);

    window.addEventListener('touchstart', this.onTouchStart.bind(this), false);
    window.addEventListener('touchmove', this.onTouchMove.bind(this), false);
    window.addEventListener('touchend', this.onTouchEnd.bind(this), false);
};

Animation.prototype.update = function (dt) {
    var app = this.app;
    var pos, i;

    switch(this.state) {
        case 0:
            // if (Date.now() - this.stateStart > 2000) {
            this.state = 2;
            this.stateStart = Date.now();
            this.overlay.classList.add('hidden');
            document.getElementById('button_0').classList.add('active');
            // }
            break;
        case 2:
            if (this.mouse.down) {
                this.turn.nx += (this.mouse.sx * 0.5 - this.turn.nx) * 0.2;
                this.turn.ny += (this.mouse.sy * 0.5 - this.turn.ny) * 0.2;
            } else {
                this.turn.nx *= 0.5;
                this.turn.ny *= 0.1;
                this.turn.x += (Date.now() - this.stateStart) / 16 - this.turn.l;
            }
            this.mouse.sx = 0;
            this.mouse.sy = 0;
            this.turn.l = (Date.now() - this.stateStart) / 16;

            if ((Math.abs(this.turn.nx) + Math.abs(this.turn.ny)) > 0.1) {
                this.turn.x += this.turn.nx;
                this.turn.y = Math.max(-50, Math.min(80, this.turn.y + this.turn.ny));
            }

            if (this.rotation < 340) {
                this.rotation = this.rotation + (360 - this.rotation) * 0.1;
            }
            this.angleTarget.setFromEulerAngles(75 + this.turn.y, this.turn.x - 30 + this.rotation, 0);
            this.angle.slerp(this.angle, this.angleTarget, this.easing);

            for (i = 0; i < this.parts.length; i++) {
                // position
                pos = this.parts[i].getPosition();
                this.parts[i].setPosition((pos.x + (0 - pos.x) * (this.easing * 2)), (pos.y + (0 - pos.y) * this.easing), 0);
                // rotation
                this.parts[i].setRotation(this.angle);
            }

            this.updateWall();
            break;
        case 3:
            // screen
            var positions = this.partsPositions[ (app.graphicsDevice.height / app.graphicsDevice.width) > 1 ? 1 : 0 ];

            pos = this.parts[0].getPosition();
            this.parts[0].setPosition((pos.x + (positions[0] - pos.x) * this.easing), (pos.y + (0 - pos.y) * this.easing), 0);

            // motherboard
            pos = this.parts[1].getPosition();
            this.parts[1].setPosition((pos.x + (positions[1] - pos.x) * this.easing), (pos.y + (0 - pos.y) * this.easing), 0);

            // middle
            pos = this.parts[2].getPosition();
            this.parts[2].setPosition((pos.x + (positions[2] - pos.x) * this.easing), (pos.y + (0 - pos.y) * this.easing), 0);

            // case
            pos = this.parts[3].getPosition();
            this.parts[3].setPosition((pos.x + (positions[3] - pos.x) * this.easing), (pos.y + (0 - pos.y) * this.easing), 0);

            // rotation
            if ((app.graphicsDevice.height / app.graphicsDevice.width) > 1) {
                this.angleTarget.setFromEulerAngles(85, -60, 0);
            } else {
                this.angleTarget.setFromEulerAngles(75, -30, 0);
            }
            this.angle.slerp(this.angle, this.angleTarget, this.easing);

            for (i = 0; i < this.parts.length; i++) {
                this.parts[i].setRotation(this.angle);
            }

            this.updateWall();
            break;
        case 4:
            this.angleTarget.setFromEulerAngles(90, 0, 0);
            this.angle.slerp(this.angle, this.angleTarget, this.easing);

            for(i = 0; i < this.parts.length; i++) {
                // position
                pos = this.parts[i].getPosition();
                this.parts[i].setPosition((pos.x + (0 - pos.x) * (this.easing * 2)), (pos.y + (0 - pos.y) * this.easing), 0);
                // rotation
                this.parts[i].setRotation(this.angle);
            }

            this.updateWall();
            break;
        case 5:
            if ((app.graphicsDevice.height / app.graphicsDevice.width) > 1) {
                this.angleTarget.setFromEulerAngles(30, -40, 0);
            } else {
                this.angleTarget.setFromEulerAngles(90, -75, -90);
            }
            this.angle.slerp(this.angle, this.angleTarget, this.easing);

            for(i = 0; i < this.parts.length; i++) {
                // position
                pos = this.parts[i].getPosition();
                if ((app.graphicsDevice.height / app.graphicsDevice.width) > 1) {
                    this.parts[i].setPosition((pos.x + (0.1 - pos.x) * (this.easing * 2)), (pos.y + (0.1 - pos.y) * this.easing), 0);
                } else {
                    this.parts[i].setPosition((pos.x + (-0.25 - pos.x) * (this.easing * 2)), (pos.y + (0.1 - pos.y) * this.easing), 0);
                }
                // rotation
                this.parts[i].setRotation(this.angle);
            }

            this.updateWall(true);
            break;
    }
};

Animation.prototype.updateWall = function(white) {
            if (white) {
                this.overlayLast.classList.add('active');
                this.buttons.classList.add('light');
            } else {
                this.overlayLast.classList.remove('active');
                this.buttons.classList.remove('light');
            }

            if (Date.now() - this.stateStart < 2000) {
                var speed = .1;
                if (white && this.wall.diffuse.r !== 1.0) {
                    this.wall.diffuse.set(this.wall.diffuse.r + (1.0 - this.wall.diffuse.r) * speed, this.wall.diffuse.g + (1.0 - this.wall.diffuse.g) * speed, this.wall.diffuse.b + (1.0 - this.wall.diffuse.b) * speed, 1);
                    this.wall.emissive.set(this.wall.emissive.r + (.7 - this.wall.emissive.r) * speed, this.wall.emissive.g + (.7 - this.wall.emissive.g) * speed, this.wall.emissive.b + (.7 - this.wall.emissive.b) * speed, 1);
                    this.wall.ambient.set(this.wall.ambient.r + (.8 - this.wall.ambient.r) * speed, this.wall.ambient.g + (.8 - this.wall.ambient.g) * speed, this.wall.ambient.b + (.8 - this.wall.ambient.b) * speed, 1);
                } else if (! white && this.wall.diffuse.r !== .3) {
                    this.wall.diffuse.set(this.wall.diffuse.r + (.3 - this.wall.diffuse.r) * speed, this.wall.diffuse.g + (.3 - this.wall.diffuse.g) * speed, this.wall.diffuse.b + (.3 - this.wall.diffuse.b) * speed, 1);
                    this.wall.emissive.set(this.wall.emissive.r + (0 - this.wall.emissive.r) * speed, this.wall.emissive.g + (0 - this.wall.emissive.g) * speed, this.wall.emissive.b + (0 - this.wall.emissive.b) * speed, 1);
                    this.wall.ambient.set(this.wall.ambient.r + (0 - this.wall.ambient.r) * speed, this.wall.ambient.g + (0 - this.wall.ambient.g) * speed, this.wall.ambient.b + (0 - this.wall.ambient.b) * speed, 1);
                }
                this.wall.update();
            } else if (white && this.wall.diffuse.r !== 1.0) {
                this.wall.diffuse.set(1, 1, 1, 1);
                this.wall.emissive.set(.7, .7, .7, 1);
                this.wall.ambient.set(.8, .8, .8, 1);
                this.wall.update();
            } else if (! white && this.wall.diffuse !== .3) {
                this.wall.diffuse.set(.3, .3, .3, 1);
                this.wall.emissive.set(0, 0, 0, 1);
                this.wall.ambient.set(0, 0, 0, 1);
                this.wall.update();
            }
};

Animation.prototype.onMouseMove = function(evt) {
    this.mouse.sx = evt.clientX - this.mouse.x;
    this.mouse.sy = evt.clientY - this.mouse.y;

    this.mouse.x = evt.clientX;
    this.mouse.y = evt.clientY;
    evt.stopPropagation();
};

Animation.prototype.onMouseDown = function(evt) {
    this.mouse.down = true;
    evt.stopPropagation();
};

Animation.prototype.onMouseUp = function(evt) {
    this.mouse.down = false;
    evt.stopPropagation();
};

Animation.prototype.onTouchStart = function(evt) {
    this.mouse.x = evt.touches[0].clientX;
    this.mouse.y = evt.touches[0].clientY;

    this.mouse.down = true;
    evt.stopPropagation();
};

Animation.prototype.onTouchMove = function(evt) {
    this.mouse.sx = (evt.changedTouches[0].clientX - this.mouse.x) * 2;
    this.mouse.sy = evt.changedTouches[0].clientY - this.mouse.y;

    this.mouse.x = evt.changedTouches[0].clientX;
    this.mouse.y = evt.changedTouches[0].clientY;

    evt.stopPropagation();
};

Animation.prototype.onTouchEnd = function(evt) {
    this.mouse.down = false;
    evt.stopPropagation();
};