// OJSN
const conversions = {
    celsius: {
        toFahrenheit: (c) => (c * 9/5) + 32,
        toKelvin: (c) => c + 273.15
    },
    fahrenheit: {
        toCelsius: (f) => (f - 32) * 5/9,
        toKelvin: (f) => ((f - 32) * 5/9) + 273.15
    },
    kelvin: {
        toCelsius: (k) => k - 273.15,
        toFahrenheit: (k) => ((k - 273.15) * 9/5) + 32
    }
};

const customScales = new Map();

function createCustomScale(name, freezePoint, boilPoint) {
    const scale = {
        name: name,
        freezePoint: freezePoint,
        boilPoint: boilPoint,
        toCelsius: (value) => {
            const range = boilPoint - freezePoint;
            const celsiusRange = 100;
            return ((value - freezePoint) * celsiusRange) / range;
        },
        fromCelsius: (celsius) => {
            const range = boilPoint - freezePoint;
            const celsiusRange = 100;
            return ((celsius * range) / celsiusRange) + freezePoint;
        }
    };
    customScales.set(name, scale);
    return scale;
}

const temperatureInput = document.getElementById('temperature');
const convertBtn = document.getElementById('convert-btn');
const resultDisplay = document.getElementById('result');
const customScaleForm = document.getElementById('custom-scale-form');
const customScalesList = document.getElementById('custom-scales-list');

function getSelectedScale(name) {
    return document.querySelector(`input[name="${name}"]:checked`).value;
}

function convertTemperature(value, fromScale, toScale) {
    if (fromScale === toScale) return value;
    
    let celsius;
    if (fromScale === 'celsius') {
        celsius = value;
    } else if (fromScale === 'fahrenheit') {
        celsius = conversions.fahrenheit.toCelsius(value);
    } else if (fromScale === 'kelvin') {
        celsius = conversions.kelvin.toCelsius(value);
    } else {
        const customScale = customScales.get(fromScale);
        if (customScale) {
            celsius = customScale.toCelsius(value);
        } else {
            throw new Error(`Unknown scale: ${fromScale}`);
        }
    }
    
    if (toScale === 'celsius') {
        return celsius;
    } else if (toScale === 'fahrenheit') {
        return conversions.celsius.toFahrenheit(celsius);
    } else if (toScale === 'kelvin') {
        return conversions.celsius.toKelvin(celsius);
    } else {
        const customScale = customScales.get(toScale);
        if (customScale) {
            return customScale.fromCelsius(celsius);
        } else {
            throw new Error(`Unknown scale: ${toScale}`);
        }
    }
}

function formatResult(value, scale) {
    const symbols = {
        celsius: '°C',
        fahrenheit: '°F',
        kelvin: 'K'
    };
    const symbol = symbols[scale] || '°';
    return `${value.toFixed(2)} ${symbol}`;
}

function updateScaleOptions() {
    const fromScaleGroup = document.querySelector('input[name="from-scale"]:checked').closest('.radio-group');
    const toScaleGroup = document.querySelector('input[name="to-scale"]:checked').closest('.radio-group');
    
    const customScaleOptions = Array.from(customScales.values()).map(scale => `
        <label>
            <input type="radio" name="from-scale" value="${scale.name}">
            ${scale.name} (${scale.freezePoint}° to ${scale.boilPoint}°)
        </label>
    `).join('');
    
    const customScaleOptions2 = Array.from(customScales.values()).map(scale => `
        <label>
            <input type="radio" name="to-scale" value="${scale.name}">
            ${scale.name} (${scale.freezePoint}° to ${scale.boilPoint}°)
        </label>
    `).join('');
    
    fromScaleGroup.innerHTML += customScaleOptions;
    toScaleGroup.innerHTML += customScaleOptions2;
}

convertBtn.addEventListener('click', () => {
    const value = parseFloat(temperatureInput.value);
    
    if (isNaN(value)) {
        resultDisplay.textContent = 'Please enter a valid number';
        return;
    }
    
    try {
        const fromScale = getSelectedScale('from-scale');
        const toScale = getSelectedScale('to-scale');
        
        const convertedValue = convertTemperature(value, fromScale, toScale);
        resultDisplay.textContent = formatResult(convertedValue, toScale);
    } catch (error) {
        resultDisplay.textContent = error.message;
    }
});

temperatureInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        convertBtn.click();
    }
});

document.querySelectorAll('input[name="from-scale"], input[name="to-scale"]').forEach(radio => {
    radio.addEventListener('change', () => {
        const fromScale = getSelectedScale('from-scale');
        const toScale = getSelectedScale('to-scale');
        
        if (fromScale === toScale) {
            const otherRadios = document.querySelectorAll(`input[name="${radio.name}"]`);
            for (let other of otherRadios) {
                if (other.value !== fromScale) {
                    other.checked = true;
                    break;
                }
            }
        }
    });
});

customScaleForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('scale-name').value;
    const freezePoint = parseFloat(document.getElementById('freeze-point').value);
    const boilPoint = parseFloat(document.getElementById('boil-point').value);
    
    if (isNaN(freezePoint) || isNaN(boilPoint) || freezePoint >= boilPoint) {
        alert('Please enter valid freeze and boil points (freeze point must be less than boil point)');
        return;
    }
    
    createCustomScale(name, freezePoint, boilPoint);
    updateScaleOptions();
    
    const scaleInfo = document.createElement('div');
    scaleInfo.className = 'custom-scale-info';
    scaleInfo.textContent = `Created scale: ${name} (${freezePoint}° to ${boilPoint}°)`;
    customScalesList.appendChild(scaleInfo);
    
    customScaleForm.reset();
});
