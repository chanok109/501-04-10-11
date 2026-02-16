// The link to your model provided by Teachable Machine export panel
// IMPORTANT: Ensure your model files are in a folder named 'my_model'
// Point to the subfolder inside my_model
const URL = "./tm-my-image-model/";
let model, webcam, labelContainer, maxPredictions;

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // Load the model
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Setup Webcam
    const flip = true; 
    webcam = new tmImage.Webcam(400, 400, flip); // Increased resolution
    await webcam.setup(); 
    await webcam.play();
    window.requestAnimationFrame(loop);

    // Append Webcam to DOM
    const webcamContainer = document.getElementById("webcam-container");
    webcamContainer.innerHTML = ""; // Clear placeholder
    webcamContainer.appendChild(webcam.canvas);

    // Create label elements for the top 5 list
    labelContainer = document.getElementById("label-container");
    
    // We create 5 slots for the top 5 predictions
    const displayCount = Math.min(5, maxPredictions);
    for (let i = 0; i < displayCount; i++) {
        // Create the HTML structure for one prediction row via JS
        const div = document.createElement("div");
        div.className = "prediction-row";
        div.innerHTML = `
            <div class="label-info">
                <span class="label-name">-</span>
                <span class="label-prob">0%</span>
            </div>
            <div class="progress-bg">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
        `;
        labelContainer.appendChild(div);
    }
}

async function loop() {
    webcam.update(); 
    await predict();
    window.requestAnimationFrame(loop);
}

// Run the webcam image through the image model
async function predict() {
    const prediction = await model.predict(webcam.canvas);

    // 1. Sort predictions by probability (Highest to Lowest)
    prediction.sort((a, b) => b.probability - a.probability);

    // 2. Update the Big Top Result
    const topResult = prediction[0];
    const bigResultElement = document.getElementById("big-result");
    
    if (topResult.probability > 0.80) { // Only show big text if confident
        bigResultElement.innerText = topResult.className;
        bigResultElement.style.color = "#00cec9"; // Green/Teal for high confidence
    } else {
        bigResultElement.innerText = topResult.className + "?";
        bigResultElement.style.color = "#a29bfe"; // Purple for lower confidence
    }

    // 3. Update the Top 5 List
    const displayCount = Math.min(5, maxPredictions);
    const rows = labelContainer.getElementsByClassName("prediction-row");

    for (let i = 0; i < displayCount; i++) {
        const nameEl = rows[i].querySelector(".label-name");
        const probEl = rows[i].querySelector(".label-prob");
        const fillEl = rows[i].querySelector(".progress-fill");

        const name = prediction[i].className;
        const probability = (prediction[i].probability * 100).toFixed(1);

        nameEl.innerText = name;
        probEl.innerText = probability + "%";
        fillEl.style.width = probability + "%";
    }

}
