function sigmoid(x) {
    return  1 / (1 + (Math.E ** -x));
}

function sigmoidDerivative(outX) {
    return  outX * (1 - outX);
}

function sumOfSquaredResidual(actual, predicted) {
    const errors = [];
    for (let i = 0; i < actual.length; i++) {
        errors[i] = (1/2)* (actual[i] - predicted[i]) ** 2;
    }
    return errors;
}

class NeuralNetwork {
    constructor(neuronCounts) {
        this.activationFunction = sigmoid;
        this.activationFunctionDerivative = sigmoidDerivative;
        this.costFunction = sumOfSquaredResidual;
        this.learningRate = 0.05;

        this.levels = [];
        for (let i = 0; i < neuronCounts.length - 1; i++) {
            this.levels.push(new Level(neuronCounts[i], neuronCounts[i+1], this.activationFunction));
        }
        this.load();
    }

    static mutate(network, amount = 1) {
        network.levels.forEach(level => {
            for (let i = 0; i < level.biases.length; i++) {
                level.biases[i] = lerp(
                    level.biases[i],
                    Math.random() * 2 - 1,
                    amount
                );
            }
            for (let i = 0; i < level.weights.length; i++) {
                for (let j = 0; j < level.weights[i].length; j++) {
                    level.weights[i][j] = lerp(
                        level.weights[i][j],
                        Math.random() * 2 - 1,
                        amount
                    );
                }
            }
        });
    }
    
    load() {
        if (localStorage.getItem('bestBrain')) {
            const data = JSON.parse(localStorage.getItem('bestBrain'));
            for (let i = 0; i < data.length; i++) {
                const {weights, biases} = data[i];
                this.levels[i].biases = biases;
                this.levels[i].weights = weights;
            }
        }
    }

    save() {
        const data = [];
        for (let i = 0; i < this.levels.length; i++) {
            const {weights, biases} = this.levels[i];
            data.push({weights, biases});
        }
        localStorage.setItem('bestBrain', JSON.stringify(data));
    }

    discard() {
        localStorage.removeItem('bestBrain');
    }

    feedForward(givenInputs) {
        let outputs = this.levels[0].feedForward(givenInputs);
        for (let i = 1; i < this.levels.length; i++) {
            outputs = this.levels[i].feedForward(outputs);
        }
        return outputs;
    }

    backPropagate(data) {
        for (let d = 0; d < data.length; d++) {
            const {input, output} = data[d];
            this.feedForward(input);
            window.nnerror = this.costFunction(output, this.levels[this.levels.length - 1].outputs).reduce((a,x)=>a+x,0);

            const dE_dNet = [];
            const dNet_dW = [];
            for (let l = this.levels.length - 1; l >= 0 ; l--) {
                const level = this.levels[l];

                dE_dNet[l] = [];
                dNet_dW[l] = [];
                for (let i = 0; i < level.outputs.length; i++) {
                    let err;
                    if (l == this.levels.length - 1) {
                        err = -(output[i] - level.outputs[i]);
                    } else {
                        err = 0;
                        for (let j = 0; j < dE_dNet[l+1].length; j++) {
                            const w = this.levels[l+1].weights[i][j];
                            err += w * dE_dNet[l+1][j];
                        }
                    }
                    dE_dNet[l][i] = err * this.activationFunctionDerivative(level.outputs[i]);
                    dNet_dW[l][i] = [];
                    for (let j = 0; j < level.inputs.length; j++) {
                        dNet_dW[l][i][j] = level.inputs[j];
                    }
                }
            }

            for (let l = this.levels.length - 1; l >= 0 ; l--) {
                const level = this.levels[l];
                for (let i = 0; i < level.outputs.length; i++) {
                    level.biases[i] = level.biases[i] - (this.learningRate  * dE_dNet[l][i]);
                    for (let j = 0; j < level.inputs.length; j++) {
                        const dE_dW = dE_dNet[l][i] * dNet_dW[l][i][j];
                        level.weights[j][i] = level.weights[j][i] - (this.learningRate * dE_dW);
                    }
                }
            }
        }
    }
}

class Level {
    constructor(inputCount, outputCount, activationFunction) {
        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);
        this.biases = new Array(outputCount);
        this.activationFunction = activationFunction;

        this.weights = [];
        for (let i = 0; i < inputCount; i++) {
            this.weights[i] = new Array(outputCount);
        }

        this.#randomize();
    }

    #randomize() {
        for (let i = 0; i < this.inputs.length; i++) {
            for (let j = 0; j < this.outputs.length; j++) {
                this.weights[i][j] = 0; //Math.random() * 2 - 1;
            }
        }
        for (let i = 0; i < this.biases.length; i++) {
            this.biases[i] = 0;  //Math.random() * 2 - 1;
        }
    }

    feedForward(givenInputs) {
        for (let i = 0; i < this.inputs.length; i++) {
            this.inputs[i] = givenInputs[i];
        }

        for (let i = 0; i < this.outputs.length; i++) {
            let sum = 0;
            for (let j = 0; j < this.inputs.length; j++) {
                sum += this.inputs[j] * this.weights[j][i];
            }

            const z = sum + this.biases[i];
            this.outputs[i] = this.activationFunction(z);
        }

        return this.outputs;
    }
}