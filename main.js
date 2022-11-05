const carCanvas = document.getElementById('carCanvas');
carCanvas.width = 200;
const networkCanvas = document.getElementById('networkCanvas');
networkCanvas.width = 600;

const carCtx = carCanvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

const myCar = new Car(road.getLaneCenter(1), 100, 30, 50, 'KEYS');
if (localStorage.getItem('bestBrain')) {
    myCar.brain = JSON.parse(localStorage.getItem('bestBrain'));
    NeuralNetwork.mutate(myCar.brain, 0.2);
}

const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, 'DUMMY', 2, getRandomColor()),
    new Car(road.getLaneCenter(0), -300, 30, 50, 'DUMMY', 2, getRandomColor()),
    new Car(road.getLaneCenter(2), -300, 30, 50, 'DUMMY', 2, getRandomColor()),
    new Car(road.getLaneCenter(0), -500, 30, 50, 'DUMMY', 2, getRandomColor()),
    new Car(road.getLaneCenter(1), -500, 30, 50, 'DUMMY', 2, getRandomColor()),
    new Car(road.getLaneCenter(1), -700, 30, 50, 'DUMMY', 2, getRandomColor()),
    new Car(road.getLaneCenter(2), -700, 30, 50, 'DUMMY', 2, getRandomColor()),
];

function save() {
    localStorage.setItem('bestBrain', JSON.stringify(myCar.brain));
}

function discard() {
    localStorage.removeItem('bestCar')
}

animate();

function animate(time) {
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }
    myCar.update(road.borders, traffic);

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -myCar.y + carCanvas.height * 0.7);

    road.draw(carCtx);
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx);
    }
    myCar.draw(carCtx, true);

    carCtx.restore();

    networkCtx.lineDashOffset = -time / 50;
    Visualizer.drawNetwork(networkCtx, myCar.brain);
    requestAnimationFrame(animate);
}
