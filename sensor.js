class Sensor {
    constructor(car) {
        this.car = car;
        this.rayCount = 12;
        this.rayLength = 150;
        this.rayspread = Math.PI * (2 / 3);
        
        this.rays = [];
        this.readings = [];
    }

    update(roadBorders, traffic) {
        this.#castRays();

        this.readings = [];
        for (let i = 0; i < this.rays.length; i++) {
            this.readings.push(
                this.#getReading(this.rays[i], roadBorders, traffic)
            );
            
        }
    }

    #getReading(ray, roadBorders, traffic) {
        const touches = [];
        for (let i = 0; i < roadBorders.length; i++) {
            const touch = getIntersection(
                ray[0],
                ray[1],
                roadBorders[i][0],
                roadBorders[i][1],
            );

            if (touch) {
                touches.push(touch);
            }
        }
        for (let i = 0; i < traffic.length; i++) {
            const poly = traffic[i].polygon;
            for (let j = 0; j < poly.length; j++) {
                const value = getIntersection(
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j + 1) % poly.length],
                );
                if (value) {
                    touches.push(value);
                }
            }
        }

        if (touches.length == 0) {
            return null;
        } else {
            const offsets = touches.map(e => e.offset);
            const minOffset = Math.min(...offsets);
            return touches.find(e => e.offset == minOffset);
        }
    }

    #castRays() {
        this.rays = [];

        const forwardRayCount = Math.floor(this.rayCount * 3/4);
        for (let i = 0; i < forwardRayCount; i++) {
            const rayAngle = lerp(
                this.rayspread / 2,
                - this.rayspread / 2,
                forwardRayCount == 1 ? 0.5 : i / (forwardRayCount - 1)
            ) + this.car.angle;

            const f = (forwardRayCount - 1) / 2;
            const l = i <= f ? (i / f) : (2 - i / f);

            const start = {x: this.car.x, y: this.car.y};
            const end = {
                x: this.car.x - Math.sin(rayAngle) * this.rayLength * lerp(0.75, 1.5, l),
                y: this.car.y - Math.cos(rayAngle) * this.rayLength * lerp(0.75, 1.5, l),
            }
            this.rays.push([start, end]);
        }

        const backwardRayCount = Math.ceil(this.rayCount * 1/4);
        for (let i = 0; i < backwardRayCount; i++) {
            const rayAngle = Math.PI + lerp(
                this.rayspread / 3,
                - this.rayspread / 3,
                backwardRayCount == 1 ? 0.5 : i / (backwardRayCount - 1)
            ) + this.car.angle;

            const f = (backwardRayCount - 1) / 2;
            const l = i <= f ? (i / f) : (2 - i / f);

            const start = {x: this.car.x, y: this.car.y};
            const end = {
                x: this.car.x - Math.sin(rayAngle) * this.rayLength * lerp(0.75, 1, l),
                y: this.car.y - Math.cos(rayAngle) * this.rayLength * lerp(0.75, 1, l),
            }
            this.rays.push([start, end]);
        }
    }

    draw(ctx) {
        for (let i = 0; i < this.rayCount; i++) {
            const end = this.readings[i] ? this.readings[i] : this.rays[i][1];

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'yellow';
            ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'black';
            ctx.moveTo(this.rays[i][1].x, this.rays[i][1].y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }
    }
}