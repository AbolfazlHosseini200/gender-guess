document.addEventListener('DOMContentLoaded', function() {
    const predictionForm = document.getElementById('predictionForm');
    const nameInput = document.getElementById('nameInput');
    const errorMessage = document.getElementById('errorMessage');
    const predictionResult = document.getElementById('predictionResult');
    const savedAnswersList = document.getElementById('savedAnswers');
    const clearAllButton = document.getElementById('clearAllButton');
    const saveButton = document.getElementById('saveButton');
    let savedAnswers = [];
    let currentPrediction = null;

    // Load saved answers from localStorage
    loadSavedAnswers();
    // Handles the submission of the prediction form    
    predictionForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        clearErrorMessage(); // Clear the error message on new submission

    const name = nameInput.value.trim();
    const selectedGender = document.querySelector('input[name="gender"]:checked')?.value;

    if (!name) {
        displayError('Please enter a name.');
        return;
    }

    try {
        const response = await fetch(`https://api.genderize.io/?name=${name}`);
        const data = await response.json();

        if (data.gender === null) {
            displayError('Unable to predict gender for this name.');
            return;
        }

        currentPrediction = {
            name: name,
            gender: selectedGender === 'api' ? data.gender : selectedGender
        };
        displayPrediction(currentPrediction);
    } catch (error) {
        displayError('An error occurred while fetching the prediction.');
    }
    });
    // Clears the error message displayed on the page
    function clearErrorMessage() {
        errorMessage.textContent = '';
    }
    // Saves the current prediction to the list and localStorage when 'Save' button is clicked
    saveButton.addEventListener('click', function() {
        if (currentPrediction) {
            savePrediction(currentPrediction);
        }
    });
    // Clears all saved answers both from the list and localStorage
    
    clearAllButton.addEventListener('click', function() {
        savedAnswers = [];
        updateSavedAnswersDisplay();
        localStorage.removeItem('savedPredictions');
    });
    // Displays a provided error message to the user
    function displayError(message) {
        errorMessage.textContent = message;
    }
    // Displays the prediction result on the page
    function displayPrediction(prediction) {
        predictionResult.querySelector('p').textContent = `${prediction.name} is predicted to be ${prediction.gender}`;
    }
    // Saves the given prediction in the savedAnswers array and localStorage
    function savePrediction(prediction) {
        // Check if the 'API' radio button is selected, if not use the selected gender
    const selectedGender = document.querySelector('input[name="gender"]:checked')?.value;
    let finalPrediction = prediction;

    if (selectedGender !== 'api') {
        finalPrediction = { ...prediction, gender: selectedGender };
    }

    // Check if the prediction already exists in the saved answers
    const existingIndex = savedAnswers.findIndex(ans => ans.name.toLowerCase() === finalPrediction.name.toLowerCase());
    if (existingIndex !== -1) {
        savedAnswers[existingIndex] = finalPrediction;
    } else {
        savedAnswers.push(finalPrediction);
    }

    localStorage.setItem('savedPredictions', JSON.stringify(savedAnswers));
    updateSavedAnswersDisplay();
    }

    // Loads saved answers from localStorage and updates the display
    function loadSavedAnswers() {
        const savedData = localStorage.getItem('savedPredictions');
        if (savedData) {
            savedAnswers = JSON.parse(savedData);
            updateSavedAnswersDisplay();
        }
    }
    // Updates the saved answers displayed on the page
    function updateSavedAnswersDisplay() {
        savedAnswersList.innerHTML = '';
        savedAnswers.forEach((answer, index) => {
            const li = document.createElement('li');
            li.textContent = `${answer.name} is ${answer.gender}`;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'btn-delete';
            deleteButton.onclick = function() {
                deleteAnswer(index);
            };
            li.appendChild(deleteButton);
            savedAnswersList.appendChild(li);
        });
    }
    // Deletes a specific answer from the saved answers list
    function deleteAnswer(index) {
        savedAnswers.splice(index, 1);
        localStorage.setItem('savedPredictions', JSON.stringify(savedAnswers));
        updateSavedAnswersDisplay();
    }
});
