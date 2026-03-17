export var Vec2;
(function (Vec2) {
    function add(a, b) {
        return [a[0] + b[0], a[1] + b[1]];
    }
    Vec2.add = add;
    function sub(a, b) {
        return [a[0] - b[0], a[1] - b[1]];
    }
    Vec2.sub = sub;
    function mul(v, other) {
        if (typeof other === 'number') {
            return [v[0] * other, v[1] * other];
        }
        return [v[0] * other[0], v[1] * other[1]];
    }
    Vec2.mul = mul;
    function div(v, other) {
        if (typeof other === 'number') {
            return [v[0] / other, v[1] / other];
        }
        return [v[0] / other[0], v[1] / other[1]];
    }
    Vec2.div = div;
    function dot(a, b) {
        return a[0] * b[0] + a[1] * b[1];
    }
    Vec2.dot = dot;
    function cross(a, b) {
        return a[0] * b[1] - a[1] * b[0];
    }
    Vec2.cross = cross;
    function lengthSq(v) {
        return v[0] * v[0] + v[1] * v[1];
    }
    Vec2.lengthSq = lengthSq;
    function length(v) {
        return Math.sqrt(lengthSq(v));
    }
    Vec2.length = length;
    function normalize(v) {
        const len = length(v);
        if (len === 0)
            return [0, 0];
        return div(v, len);
    }
    Vec2.normalize = normalize;
    function distance(a, b) {
        return length(sub(a, b));
    }
    Vec2.distance = distance;
    function lerp(a, b, t) {
        return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    }
    Vec2.lerp = lerp;
    function angle(v) {
        return Math.atan2(v[1], v[0]);
    }
    Vec2.angle = angle;
    function rotate(v, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return [v[0] * cos - v[1] * sin, v[0] * sin + v[1] * cos];
    }
    Vec2.rotate = rotate;
    function negate(v) {
        return [-v[0], -v[1]];
    }
    Vec2.negate = negate;
    function floor(v) {
        return [Math.floor(v[0]), Math.floor(v[1])];
    }
    Vec2.floor = floor;
    function ceil(v) {
        return [Math.ceil(v[0]), Math.ceil(v[1])];
    }
    Vec2.ceil = ceil;
    function round(v) {
        return [Math.round(v[0]), Math.round(v[1])];
    }
    Vec2.round = round;
    function min(a, b) {
        return [Math.min(a[0], b[0]), Math.min(a[1], b[1])];
    }
    Vec2.min = min;
    function max(a, b) {
        return [Math.max(a[0], b[0]), Math.max(a[1], b[1])];
    }
    Vec2.max = max;
    function clamp(v, min, max) {
        return [
            Math.max(min[0], Math.min(v[0], max[0])),
            Math.max(min[1], Math.min(v[1], max[1])),
        ];
    }
    Vec2.clamp = clamp;
    function fromAngle(angle, len = 1) {
        return [Math.cos(angle) * len, Math.sin(angle) * len];
    }
    Vec2.fromAngle = fromAngle;
    function zero() {
        return [0, 0];
    }
    Vec2.zero = zero;
})(Vec2 || (Vec2 = {}));
