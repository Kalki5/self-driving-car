const carCanvas = document.getElementById('carCanvas');
carCanvas.width = 200;
const networkCanvas = document.getElementById('networkCanvas');
networkCanvas.width = 600;

const carCtx = carCanvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
const traffic = new Traffic(road, 15, 1500, 1500);

const myCar = new Car(road.getLaneCenter(1), 100, 30, 50, 'KEYS', 4);

let useAI = false;
function switchControl() {
    if (useAI) {
        useAI = false;
        switchButton.innerText = '👨🏻';
        myCar.useBrain = false;
        myCar.controls.useBrain = false;
    } else {
        useAI = true;
        switchButton.innerText = '🤖';
        myCar.useBrain = true;
        myCar.controls.useBrain = true;
    }
}

let isTraining = false;
function train() {
    if (isTraining) {
        isTraining = false;
        trainButton.innerText = '▶️';
        switchButton.disabled = false;
    } else {
        isTraining = true;
        trainButton.innerText = '⏹️';
        if (useAI) switchControl();
        switchButton.disabled = true;
    }
}

function save() {
    myCar.brain.save();
}

function discard() {
    myCar.brain.discard();
}

let fps;
let requestTime;

requestAnimationFrame(animate);
function animate(time) {
    if (requestTime) fps = Math.round(1000/((performance.now() - requestTime)));

    traffic.update(road.borders, myCar);
    myCar.update(road.borders, traffic.cars);
    if (isTraining) {
        const input = myCar.sensor.readings.map(s => s === null ? 0 : (1 - s.offset));
        const output = [myCar.controls.forward, myCar.controls.left, myCar.controls.right, myCar.controls.reverse].map(x => x > 0.8 ? 1 : 0);
        myCar.brain.backPropagate([{input, output}]);
        if (myCar.damaged) train();
    }

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
