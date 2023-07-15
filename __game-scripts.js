// follow.js
var Follow = pc.createScript('follow');

Follow.attributes.add('target', {
    type: 'entity',
    title: 'Target',
    description: 'The Entity to follow'
});

Follow.attributes.add('distance', {
    type: 'number',
    default: 4,
    title: 'Distance',
    description: 'How far from the Entity should the follower be'
});

// initialize code called once per entity
Follow.prototype.initialize = function() {
    this.vec = new pc.Vec3();
};

// update code called every frame
Follow.prototype.update = function(dt) {
    if (!this.target) return;

    // get the position of the target entity
    var pos = this.target.getPosition();

    // calculate the desired position for this entity
    pos.x += 0.75 * this.distance;
    pos.y += 1.0 * this.distance;
    pos.z += 0.75 * this.distance;

    // smoothly interpolate towards the target position
    this.vec.lerp(this.vec, pos, 0.1);

    // set the position for this entity
    this.entity.setPosition(this.vec); 
};


// movement.js
var Movement = pc.createScript('movement');

Movement.attributes.add('speed', {
    type: 'number',    
    default: 0.1,
    min: 0.05,
    max: 0.5,
    precision: 2,
    description: 'Controls the movement speed'
});

// initialize code called once per entity
Movement.prototype.initialize = function() {
    this.force = new pc.Vec3();
};

// update code called every frame
Movement.prototype.update = function(dt) {
    var forceX = 0;
    var forceZ = 0;

    // calculate force based on pressed keys
    if (this.app.keyboard.isPressed(pc.KEY_LEFT)) {
        forceX = -this.speed;
    } 

    if (this.app.keyboard.isPressed(pc.KEY_RIGHT)) {
        forceX += this.speed;
    }

    if (this.app.keyboard.isPressed(pc.KEY_UP)) {
        forceZ = -this.speed;
    } 

    if (this.app.keyboard.isPressed(pc.KEY_DOWN)) {
        forceZ += this.speed;
    }

    this.force.x = forceX;
    this.force.z = forceZ;

    // if we have some non-zero force
    if (this.force.length()) {

        // calculate force vector
        var rX = Math.cos(-Math.PI * 0.25);
        var rY = Math.sin(-Math.PI * 0.25);
        this.force.set(this.force.x * rX - this.force.z * rY, 0, this.force.z * rX + this.force.x * rY);

        // clamp force to the speed
        if (this.force.length() > this.speed) {
            this.force.normalize().scale(this.speed);
        }
    }

    // apply impulse to move the entity
    this.entity.rigidbody.applyImpulse(this.force);
};


// teleportable.js
var Teleportable = pc.createScript('teleportable');

// initialize code called once per entity
Teleportable.prototype.initialize = function() {
    this.lastTeleportFrom = null;
    this.lastTeleportTo = null;
    this.lastTeleport = Date.now(); 
    this.startPosition = this.entity.getPosition().clone();       
};

// update code called every frame
Teleportable.prototype.update = function(dt) {
    // Make sure we don't fall over. If we do then
    // teleport to the last location
    var pos = this.entity.getPosition();
    if (pos.y < 0) {
        this.teleport(this.lastTeleportFrom, this.lastTeleportTo);
    }
};


Teleportable.prototype.teleport = function(from, to) {
    // can't teleport too often (500ms)
    if (from && (Date.now() - this.lastTeleport) < 500)
        return;

    // set new teleport time
    this.lastTeleport = Date.now();

    // set last teleport targets
    this.lastTeleportFrom = from;
    this.lastTeleportTo = to;

    // position to teleport to
    var position;

    if (to) {
        // from target
        position = to.getPosition();
        // move a bit higher
        position.y += 0.5;
    } else {
        // to respawn location
        position = this.startPosition;
    }

    // move ball to that point
    this.entity.rigidbody.teleport(position);
    // need to reset angular and linear forces
    this.entity.rigidbody.linearVelocity = pc.Vec3.ZERO;
    this.entity.rigidbody.angularVelocity = pc.Vec3.ZERO;            
};


// teleport.js
var Teleport = pc.createScript('teleport');

Teleport.attributes.add('target', {
    type: 'entity',
    title: 'Target Entity',
    description: 'The target entity where we are going to teleport'
});

// initialize code called once per entity
Teleport.prototype.initialize = function() {
    if (this.target) {
        // Subscribe to the triggerenter event of this entity's collision component.
        // This will be fired when a rigid body enters this collision volume.
        this.entity.collision.on('triggerenter', this.onTriggerEnter, this);
    }
};

Teleport.prototype.onTriggerEnter = function (otherEntity) {
    // it is not teleportable
    if (! otherEntity.script.teleportable)
        return;

    // teleport entity to the target entity
    otherEntity.script.teleportable.teleport(this.entity, this.target);
};


