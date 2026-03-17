export var Rect;
(function (Rect) {
    function fromPoints(a, b) {
        const minX = Math.min(a[0], b[0]);
        const minY = Math.min(a[1], b[1]);
        const maxX = Math.max(a[0], b[0]);
        const maxY = Math.max(a[1], b[1]);
        return [minX, minY, maxX - minX, maxY - minY];
    }
    Rect.fromPoints = fromPoints;
    function fromCenter(center, size) {
        return [
            center[0] - size[0] / 2,
            center[1] - size[1] / 2,
            size[0],
            size[1],
        ];
    }
    Rect.fromCenter = fromCenter;
    function position(r) {
        return [r[0], r[1]];
    }
    Rect.position = position;
    function size(r) {
        return [r[2], r[3]];
    }
    Rect.size = size;
    function center(r) {
        return [r[0] + r[2] / 2, r[1] + r[3] / 2];
    }
    Rect.center = center;
    function topLeft(r) {
        return [r[0], r[1]];
    }
    Rect.topLeft = topLeft;
    function topRight(r) {
        return [r[0] + r[2], r[1]];
    }
    Rect.topRight = topRight;
    function bottomLeft(r) {
        return [r[0], r[1] + r[3]];
    }
    Rect.bottomLeft = bottomLeft;
    function bottomRight(r) {
        return [r[0] + r[2], r[1] + r[3]];
    }
    Rect.bottomRight = bottomRight;
    function area(r) {
        return r[2] * r[3];
    }
    Rect.area = area;
    function isEmpty(r) {
        return r[2] <= 0 || r[3] <= 0;
    }
    Rect.isEmpty = isEmpty;
    function containsPoint(r, point) {
        return (point[0] >= r[0] &&
            point[0] <= r[0] + r[2] &&
            point[1] >= r[1] &&
            point[1] <= r[1] + r[3]);
    }
    Rect.containsPoint = containsPoint;
    function containsRect(r, other) {
        return (other[0] >= r[0] &&
            other[0] + other[2] <= r[0] + r[2] &&
            other[1] >= r[1] &&
            other[1] + other[3] <= r[1] + r[3]);
    }
    Rect.containsRect = containsRect;
    function intersects(r, other) {
        return (r[0] < other[0] + other[2] &&
            r[0] + r[2] > other[0] &&
            r[1] < other[1] + other[3] &&
            r[1] + r[3] > other[1]);
    }
    Rect.intersects = intersects;
    function intersection(r, other) {
        const x1 = Math.max(r[0], other[0]);
        const y1 = Math.max(r[1], other[1]);
        const x2 = Math.min(r[0] + r[2], other[0] + other[2]);
        const y2 = Math.min(r[1] + r[3], other[1] + other[3]);
        const w = x2 - x1;
        const h = y2 - y1;
        if (w <= 0 || h <= 0) {
            return [0, 0, 0, 0];
        }
        return [x1, y1, w, h];
    }
    Rect.intersection = intersection;
    function union(r, other) {
        const x1 = Math.min(r[0], other[0]);
        const y1 = Math.min(r[1], other[1]);
        const x2 = Math.max(r[0] + r[2], other[0] + other[2]);
        const y2 = Math.max(r[1] + r[3], other[1] + other[3]);
        return [x1, y1, x2 - x1, y2 - y1];
    }
    Rect.union = union;
    function inflate(r, amount) {
        return [
            r[0] - amount,
            r[1] - amount,
            r[2] + amount * 2,
            r[3] + amount * 2,
        ];
    }
    Rect.inflate = inflate;
    function offset(r, delta) {
        return [r[0] + delta[0], r[1] + delta[1], r[2], r[3]];
    }
    Rect.offset = offset;
    function setPosition(r, pos) {
        return [pos[0], pos[1], r[2], r[3]];
    }
    Rect.setPosition = setPosition;
    function setSize(r, size) {
        return [r[0], r[1], size[0], size[1]];
    }
    Rect.setSize = setSize;
    function setCenter(r, center) {
        return [
            center[0] - r[2] / 2,
            center[1] - r[3] / 2,
            r[2],
            r[3],
        ];
    }
    Rect.setCenter = setCenter;
})(Rect || (Rect = {}));
