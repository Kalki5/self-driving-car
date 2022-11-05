class Traffic {
    constructor(road, maxCars, frontThreshold, backThreshold) {
        this.road = road;
        this.maxCars = maxCars;
        this.frontThreshold = frontThreshold;
        this.backThreshold = backThreshold;

        this.cars = [];
    }

    #generateCars(myCar) {
        this.cars = this.cars.filter(car => car.y > (myCar.y - this.frontThreshold) && car.y < (myCar.y + this.backThreshold));

        if (!myCar.damaged && this.cars.length < this.maxCars) {
            let [aboveCarsCount, belowCarsCount] = [0, 0];
            for (let i = 0; i < this.cars.length; i++) {
                if (this.cars[i].y <= myCar.y) {
                    aboveCarsCount++;
                } else {
                    belowCarsCount++;
                }
            }
            for (let i = 0; i < this.maxCars - this.cars.length; i++) {
                const x = road.getLaneCenter(Math.floor(Math.random() * this.road.laneCount));
                let y = myCar.y;
                if (aboveCarsCount * 0.70 <= belowCarsCount) {
                    y = lerp((myCar.y - this.frontThreshold * 0.3), (myCar.y - this.frontThreshold * 0.9), Math.random());
                    aboveCarsCount++;
                } else {
                    y = lerp((myCar.y + this.backThreshold * 0.5), (myCar.y + this.backThreshold * 0.3), Math.random());
                    belowCarsCount++;
                }

                const car = new Car(x, y, 30, 50, 'DUMMY', lerp(2, 3, Math.random()), getRandomColor());
                this.cars.push(car);
            }

        }

    }

    update(roadBorders, myCar) {
        this.#generateCars(myCar);
        for (let i = 0; i < this.cars.length; i++) {
            this.cars[i].update(roadBorders, [myCar]);
        }
    }

    draw() {
        for (let i = 0; i < this.cars.length; i++) {
            this.cars[i].draw(carCtx);
        }
    }
}