const carCanvas = document.getElementById('carCanvas');
carCanvas.width = 200;
const networkCanvas = document.getElementById('networkCanvas');
networkCanvas.width = 600;

const carCtx = carCanvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
const traffic = new Traffic(road, 15, 1500, 1500);

const myCar = new Car(road.getLaneCenter(1), 100, 30, 50, 'KEYS', 4);
if (localStorage.getItem('bestBrain')) {
    myCar.brain = JSON.parse(localStorage.getItem('bestBrain'));
    NeuralNetwork.mutate(myCar.brain, 0.2);
}

function save() {
    localStorage.setItem('bestBrain', JSON.stringify(myCar.brain));
}

function discard() {
    localStorage.removeItem('bestCar')
}

let fps;
let requestTime;

requestAnimationFrame(animate);
function animate(time) {
    if (requestTime) {
        fps = Math.round(1000/((performance.now() - requestTime)));
    }

    traffic.update(road.borders, myCar);
    myCar.update(road.borders, traffic.cars);

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -myCar.y + carCanvas.height * 0.6);

    road.draw(carCtx);
    traffic.draw(carCtx);
    myCar.draw(carCtx, true);

    carCtx.restore();

    networkCtx.lineDashOffset = -time / 50;
    Visualizer.drawNetwork(networkCtx, myCar.brain);
    requestTime = time;
    requestAnimationFrame(animate);
}
