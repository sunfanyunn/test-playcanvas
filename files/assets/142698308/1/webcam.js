var Webcam = pc.createScript('webcam');

Webcam.attributes.add('ui_texture', { type: 'asset', assetType: 'texture', array: false });

Webcam.prototype.initialize = function () {
    var app = this.app;
    this.streaming = false;
    this.getting = false;
    this.video = document.createElement('video');
    this.webcam = document.createElement('canvas');
    this.webcam.width = 640;
    this.webcam.height = Math.floor(640 / 0.6);
    this.ctx = this.webcam.getContext('2d');
    this.material = this.entity.model.meshInstances[5].material;
    var emissiveMap = this.material.emissiveMap;
    emissiveMap.minFilter = pc.FILTER_LINEAR;
    emissiveMap.magFilter = pc.FILTER_LINEAR;
    emissiveMap.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
    emissiveMap.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
    emissiveMap.maxAnisotropy = 4;
    this.original = this.material.emissiveMap._levels[0];
    this.anim = app.root.findByName('device').script.animation;
    this.paused = true;

    this.ui = this.ui_texture.resource._levels[0];
};

Webcam.prototype.update = function (dt) {
    if (! this.streaming) {
        if (this.anim.state === 4) {
            this.getVideo();
        }
    } else {
        if (this.anim.state !== 4) {
            if (this.paused) return;
            this.material.emissiveMap.setSource(this.original);
            this.video.pause();
            this.paused = true;
            return;
        }
        if (this.paused) {
            this.paused = false;
            this.video.play();
        } else {
            var width = this.video.videoWidth;
            var height = this.video.videoHeight;
            if (width < this.webcam.width) {
                width = this.webcam.width;
                height = this.video.videoHeight * (this.webcam.width / this.video.videoWidth);
            }
            if (height < this.webcam.height) {
                width = this.video.videoWidth * (this.webcam.height / this.video.videoHeight);
                height = this.webcam.height;
            }
            this.ctx.drawImage(this.video, -Math.floor((width - this.webcam.width) / 2), -Math.floor((height - this.webcam.height) / 2), width, height);
            this.ctx.drawImage(this.ui, 0, 0, this.webcam.width, this.webcam.height);
            this.material.emissiveMap.setSource(this.webcam);
        }
    }
};

Webcam.prototype.getVideo = function() {
    var self = this;

    if (this.streaming || this.getting) return;
        this.getting = true;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        })
        .then(function(stream) {
            /* use the stream */
            self.video.srcObject  = stream;

            self.video.addEventListener('canplay', function(ev){
                if (self.streaming) return;

                self.video.setAttribute('width', self.video.videoWidth);
                self.video.setAttribute('height', self.video.videoHeight);

                self.streaming = true;
            }, false);

            this.getting = false;
        })
        .catch(function(err) {
            /* handle the error */
            document.getElementById('button_2').style.display = 'none';
            console.log(err);
        });
    }
};