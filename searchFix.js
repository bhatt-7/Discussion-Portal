let questionDiv = null;
let questions = JSON.parse(localStorage.getItem('questions')) || {};
let isFavoritesVisible = false;
let originalIndex = null;
function showForm() {
    document.querySelector('.right-parent').style.display = "flex";
    document.querySelector('.right-parent-2').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    refreshWindow();
    updateTimestamps();
});


function generateRandomID() {
    const keys = Object.keys(questions).map(Number);
    return keys.length ? Math.max(...keys) + 1 : 1;
}
function formatText(text) {
    return text.replace(/\s+/g, ' ').trim();
}
function submitQuestion() {
    const subject = document.querySelector("#subject").value.trim();
    const questionText = formatText(document.querySelector("textarea").value);

    if (!subject || !questionText) {
        return;
    }

    const id = generateRandomID();
    const timestamp = Date.now();
    const newQuestion = {
        id,
        subject,
        question: questionText,
        responses: [],
        starred: false,
        timestamp
    };

    const container = document.querySelector('.window');
    const hasStarredQuestions = Array.from(container.children).some(div =>
        div.querySelector('.star-icon').src.includes('filled_star.png')
    );

    const prepend = !hasStarredQuestions;

    questions[id] = newQuestion;
    localStorage.setItem('questions', JSON.stringify(questions));

    addQuestionToWindow(newQuestion);

    document.querySelector('input[placeholder="Subject"]').value = '';
    document.querySelector('textarea').value = '';
}



function addQuestionToWindow(question) {
    const { id, subject, question: questionText, starred, timestamp } = question;
    const newQuestionDiv = document.createElement('div');
    newQuestionDiv.dataset.id = id;
    newQuestionDiv.dataset.subject = subject;
    newQuestionDiv.dataset.question = questionText;

    newQuestionDiv.style.cursor = "pointer";
    newQuestionDiv.style.backgroundColor = "lightblue";
    newQuestionDiv.style.padding = "10px";
    newQuestionDiv.style.marginBottom = "5px";

    const starImage = starred ? 'filled_star.png' : 'hollow_star.png';
    const timeElapsed = calculateElapsedTime(timestamp);
    newQuestionDiv.innerHTML =
        `<div style="display: flex; justify-content: space-between;">
            <div>
                <h3>${subject}</h3>
                <p style="white-space: pre-wrap;">${questionText}</p>
                <span class="timestamp" data-timestamp="${timestamp}">${timeElapsed}</span>
            </div>
            <img src="${starImage}" alt="Star" class="star-icon" style="cursor: pointer; width: 50px; height: 50px" onclick="toggleStar('${id}', this, event)">
        </div>`;
    newQuestionDiv.className = 'question-item';

    const container = document.querySelector('.window');

    container.insertBefore(newQuestionDiv, container.firstChild);

}

function calculateElapsedTime(timestamp) {
    const now = Date.now();
    const differenceInSeconds = Math.floor((now - timestamp) / 1000);

    if (differenceInSeconds <= 10) {
        return "Just now";
    } else if (differenceInSeconds >= 11 && differenceInSeconds < 60) {
        return `${differenceInSeconds} sec ago`;
    } else if (differenceInSeconds < 3600 && differenceInSeconds > 60) {
        const differenceInMinutes = Math.floor(differenceInSeconds / 60);
        return `${differenceInMinutes} min ago`;
    } else if (differenceInSeconds > 3600 && differenceInSeconds < 86400) {
        const differneceInHours = Math.floor(differenceInSeconds / 3600);
        return `${differneceInHours} hr${differneceInHours > 1 ? 's' : ''} ago`;
    }
}
function updateTimestamps() {
    const timestampElements = document.querySelectorAll('.timestamp');

    timestampElements.forEach(element => {
        const timestamp = parseInt(element.dataset.timestamp, 10);
        element.textContent = calculateElapsedTime(timestamp);
    });
}

setInterval(updateTimestamps, 1000);


function refreshWindow() {
    const container = document.querySelector('.window');
    container.innerHTML = '';

    Object.values(questions).forEach(q => addQuestionToWindow(q));

}

function toggleStar(questionId, starElement, event) {
    event.stopPropagation();
    const isStarred = questions[questionId].starred;
    questions[questionId].starred = !isStarred;

    if (questions[questionId].starred) {
        starElement.src = 'filled_star.png';
        // moveQuestionToTop(questionId);
    } else {
        starElement.src = 'hollow_star.png';
        // refreshWindow();
    }

    localStorage.setItem('questions', JSON.stringify(questions));
}


function moveQuestionToTop(questionId) {
    const container = document.querySelector('.window');
    const questionDiv = container.querySelector(`div[data-id="${questionId}"]`);

    if (questionDiv) {
        const nonStarredQuestions = Array.from(container.children).filter(div =>
            !div.querySelector('.star-icon').src.includes('filled_star.png')
        );

        questions[questionId].originalIndex = nonStarredQuestions.indexOf(questionDiv);
        container.insertBefore(questionDiv, container.firstChild);
    }
}



document.getElementById("fav").addEventListener("click", function () {
    const questionDivs = document.querySelectorAll('.question-item');
    isFavoritesVisible = !isFavoritesVisible;

    questionDivs.forEach(questionDiv => {
        const questionId = questionDiv.dataset.id;
        if (isFavoritesVisible) {
            questionDiv.style.display = questions[questionId].starred ? '' : 'none';
        } else {
            questionDiv.style.display = '';
        }
    });
});



// Handle clicking on a question to display its details
document.querySelector('.window').addEventListener('click', function (event) {
    const questionDivEl = event.target.closest('div[data-id]');
    if (questionDivEl) {
        const id = questionDivEl.dataset.id;
        const subject = questionDivEl.dataset.subject;
        const questionText = questionDivEl.dataset.question;

        questionDiv = questionDivEl;

        displayQuestionDetails(id, subject, questionText);

        document.querySelector('.right-parent').style.display = "none";
        document.querySelector('.right-parent-2').style.display = 'flex';
    }
});


document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search');
    
    searchInput.addEventListener('input', function () {
        const query = this.value.toLowerCase().trim();
        const questionDivs = Array.from(document.querySelectorAll('.window .question-item'));
        
        // Helper function to highlight matched text
        function highlightText(text, query) {
            if (!query) return text;
            return text.replace(new RegExp(`(${query})`, 'gi'), '<mark>$1</mark>');
        }

        // Reference to the window container
        const windowDiv = document.querySelector('.window');
        
        questionDivs.forEach(div => {
            const subjectElem = div.querySelector('h3');
            const questionElem = div.querySelector('p');

            // Ensure original text is stored if new divs are added dynamically
            if (!subjectElem.dataset.originalText) {
                subjectElem.dataset.originalText = subjectElem.textContent;
            }
            if (!questionElem.dataset.originalText) {
                questionElem.dataset.originalText = questionElem.textContent;
            }

            const subjectText = subjectElem.dataset.originalText.toLowerCase().trim();
            const questionText = questionElem.dataset.originalText.toLowerCase().trim();

            const isSubjectMatch = subjectText.includes(query);
            const isQuestionMatch = questionText.includes(query);

            // Reset the content to the original before highlighting
            subjectElem.innerHTML = subjectElem.dataset.originalText;
            questionElem.innerHTML = questionElem.dataset.originalText;

            if (isSubjectMatch) {
                subjectElem.innerHTML = highlightText(subjectElem.dataset.originalText, query);
                questionElem.innerHTML = highlightText(questionElem.dataset.originalText, query);
                div.style.display = 'block'; // Show if subject matches
                
                // Move the div to the top (prepend to the parent)
                windowDiv.prepend(div);
            } else if (isQuestionMatch) {
                subjectElem.innerHTML = highlightText(subjectElem.dataset.originalText, query);
                questionElem.innerHTML = highlightText(questionElem.dataset.originalText, query);
                div.style.display = 'block'; // Show if question matches
                
                // If it matches the question but not subject, keep in place
            } else {
                div.style.display = 'none'; // Hide if no match
            }
        });
    });
});


// Display question details and its responses
function displayQuestionDetails(id, subject, questionText) {
    const subjectElement = document.querySelector('.right-parent-2 .subj');
    const questionElement = document.querySelector('.right-parent-2 .ques');

    const currentQuestion = questions[id];

    subjectElement.textContent = subject;
    questionElement.textContent = questionText;
    questionElement.style.whiteSpace = 'pre-wrap';
    questionElement.style.overflow = 'scroll';


    const responseContainer = document.querySelector('.add-response');
    responseContainer.innerHTML = '';

    if (currentQuestion.responses && currentQuestion.responses.length > 0) {
        renderResponses(currentQuestion.responses, id);
    } else {
        addResponse();
    }
}

// Render responses for a specific question
function renderResponses(responses, questionId) {
    const responseContainer = document.querySelector('.add-response');
    responseContainer.innerHTML = '';

    responses.forEach((response, index) => {
        const upvotes = response.upvotes || 0;
        const downvotes = response.downvotes || 0;

        const responseDiv = document.createElement('div');

        responseDiv.innerHTML = `
            <div>
                <h3>${response.name}</h3>
                <p class="comment">${response.comment}</p>
            </div>
            <div style="display:flex; gap: 10px; flex-direction: column;justify-content: center;align-items: center;">
                <div>
                    <img src="https://i.redd.it/petition-for-these-to-be-the-upvote-and-downvote-buttons-v0-e48q8mgz58tc1.png?width=754&format=png&auto=webp&s=7b8432446e6ff461e77624415118cd079397db7c" alt="Upvote" style="width: 20px;height:20px; cursor: pointer;" class="upvote-btn" data-question-id="${questionId}" data-response-index="${index}">
                    <span id="upvotes-${questionId}-${index}"> ${upvotes}</span>
                </div>
                <div>
                    <img src="https://i.redd.it/petition-for-these-to-be-the-upvote-and-downvote-buttons-v0-nebfr5kz58tc1.png?width=754&format=png&auto=webp&s=3ff7434b5ead8eb9f8865e7cdbaa17147e8bbeab" alt="Downvote" style="width: 20px;height:20px; cursor: pointer;" class="downvote-btn" data-question-id="${questionId}" data-response-index="${index}">
                    <span id="downvotes-${questionId}-${index}"> ${downvotes}</span>
                </div>
            </div>
        `;

        responseDiv.className = 'response-item';
        responseDiv.style.padding = "10px";
        responseDiv.style.backgroundColor = "#f0f0f0";
        responseDiv.style.marginBottom = "5px";
        responseDiv.style.display = "flex";
        responseDiv.style.justifyContent = "space-between";

        responseContainer.appendChild(responseDiv);
    });

    // Add event listeners for upvote and downvote buttons after rendering
    const upvoteButtons = document.querySelectorAll('.upvote-btn');
    const downvoteButtons = document.querySelectorAll('.downvote-btn');

    upvoteButtons.forEach(button => {
        button.addEventListener('click', function () {
            const questionId = this.getAttribute('data-question-id');
            const index = this.getAttribute('data-response-index');
            upvoteResponse(questionId, index);
        });
    });

    downvoteButtons.forEach(button => {
        button.addEventListener('click', function () {
            const questionId = this.getAttribute('data-question-id');
            const index = this.getAttribute('data-response-index');
            downvoteResponse(questionId, index);
        });
    });
}


// Add a new response to a question
function addResponse() {
    const name = document.querySelector("#name").value.trim();
    const comment = formatText(document.querySelector('#comment').value);

    if (!name || !comment || !questionDiv) return;

    const questionId = questionDiv.dataset.id;

    if (!questions[questionId]) {
        console.error('Question not found in questions object.');
        return;
    }

    const response = { name, comment, upvotes: 0, downvotes: 0 };
    questions[questionId].responses.push(response);

    localStorage.setItem('questions', JSON.stringify(questions));

    renderResponses(questions[questionId].responses, questionId);

    document.querySelector("#name").value = '';
    document.querySelector('#comment').value = '';
}
function removeHandler() {
    if (!questionDiv) return;
    const questionIdToRemove = questionDiv.getAttribute('data-id');

    delete questions[questionIdToRemove];
    localStorage.setItem('questions', JSON.stringify(questions));

    questionDiv.remove();

    const subjectElement = document.querySelector('.right-parent-2 .subj');
    subjectElement.textContent = 'subject';
    document.querySelector('.right-parent-2 .ques').textContent = 'question';

    document.querySelector('.right-parent-2').style.display = 'none';
    document.querySelector('.right-parent').style.display = 'flex';

    questionDiv = null;
}

// Upvote a response and move it up if it has a higher score
function upvoteResponse(questionId, index) {
    questions[questionId].responses[index].upvotes += 1;

    // Update the upvote count in the UI directly
    const upvoteElement = document.querySelector(`#upvotes-${questionId}-${index}`);
    upvoteElement.textContent = questions[questionId].responses[index].upvotes;

    // Move the response up if necessary
    moveResponseUp(questions[questionId].responses, questionId, index);

    // Update the questions in localStorage
    // localStorage.setItem('questions', JSON.stringify(questions));
}

function downvoteResponse(questionId, index) {
    questions[questionId].responses[index].downvotes += 1;

    // Update the downvote count in the UI directly
    const downvoteElement = document.querySelector(`#downvotes-${questionId}-${index}`);
    downvoteElement.textContent = questions[questionId].responses[index].downvotes;

    // Move the response down if necessary
    moveResponseDown(questions[questionId].responses, questionId, index);

    // Update the questions in localStorage
    // localStorage.setItem('questions', JSON.stringify(questions));
}


//copy move up
function moveResponseUp(responses, questionId, index) {
    const responseContainer = document.querySelector('.add-response'); // Get the response container
    let currentIndex = index;

    // Loop through the previous elements to find the right condition to swap
    while (index > 0) {
        const currentResponse = responses[index];
        const previousResponse = responses[index - 1];
        const currentScore = currentResponse.upvotes - currentResponse.downvotes;
        const previousScore = previousResponse.upvotes - previousResponse.downvotes;

        // If current score is higher, swap with the previous one
        if (currentScore > previousScore) {
            // Swap responses in the array
            [responses[index], responses[index - 1]] = [previousResponse, currentResponse];

            // Swap the divs in the DOM
            const currentDiv = responseContainer.children[index];
            const previousDiv = responseContainer.children[index - 1];
            responseContainer.insertBefore(currentDiv, previousDiv);

            const btnCurrContainderDiv = currentDiv.children[1];

            const currUpBtnContainer = btnCurrContainderDiv.children[0].children[0];
            currUpBtnContainer.setAttribute("data-response-index", index - 1)

            const currDownBtnContainer = btnCurrContainderDiv.children[1].children[0];
            currDownBtnContainer.setAttribute("data-response-index", index - 1);

            // for prevDiv

            const btnPreContainderDiv = previousDiv.children[1];

            const preUpBtnContainer = btnPreContainderDiv.children[0].children[0];
            preUpBtnContainer.setAttribute("data-response-index", index)

            const preDownBtnContainer = btnPreContainderDiv.children[1].children[0];
            preDownBtnContainer.setAttribute("data-response-index", index)


            const currentUpvoteSpan = currentDiv.querySelector(`#upvotes-${questionId}-${index}`);
            const currentDownvoteSpan = currentDiv.querySelector(`#downvotes-${questionId}-${index}`);
            const previousUpvoteSpan = previousDiv.querySelector(`#upvotes-${questionId}-${index - 1}`);
            const previousDownvoteSpan = previousDiv.querySelector(`#downvotes-${questionId}-${index - 1}`);

            // Update the spans to reflect their new indices
            currentUpvoteSpan.id = `upvotes-${questionId}-${index - 1}`;
            currentDownvoteSpan.id = `downvotes-${questionId}-${index - 1}`;
            previousUpvoteSpan.id = `upvotes-${questionId}-${index}`;
            previousDownvoteSpan.id = `downvotes-${questionId}-${index}`;

            // Update current index for next loop check
            index--;
        } else {
            break; // Break loop if no more swaps are needed
        }
    }
    localStorage.setItem('questions', JSON.stringify(questions));
}




//copy move down

function moveResponseDown(responses, questionId, index) {
    const responseContainer = document.querySelector('.add-response'); // Get the response container
    let currentIndex = index;

    // Loop through the previous elements to find the right condition to swap
    while (index < responses.length - 1) {
        const currentResponse = responses[index];
        const previousResponse = responses[Number(index) + 1];
        const currentScore = currentResponse.upvotes - currentResponse.downvotes;
        const previousScore = previousResponse.upvotes - previousResponse.downvotes;

        // If current score is higher, swap with the previous one
        if (currentScore < previousScore) {
            // Swap responses in the array
            [responses[index], responses[Number(index) + 1]] = [previousResponse, currentResponse];

            // Swap the divs in the DOM
            const currentDiv = responseContainer.children[index];
            const previousDiv = responseContainer.children[Number(index) + 1];
            responseContainer.insertBefore(previousDiv, currentDiv);

            const btnCurrContainderDiv = currentDiv.children[1];

            const currUpBtnContainer = btnCurrContainderDiv.children[0].children[0];
            currUpBtnContainer.setAttribute("data-response-index", Number(index) + 1)

            const currDownBtnContainer = btnCurrContainderDiv.children[1].children[0];
            currDownBtnContainer.setAttribute("data-response-index", Number(index) + 1);

            // for prevDiv

            const btnPreContainderDiv = previousDiv.children[1];

            const preUpBtnContainer = btnPreContainderDiv.children[0].children[0];
            preUpBtnContainer.setAttribute("data-response-index", index)

            const preDownBtnContainer = btnPreContainderDiv.children[1].children[0];
            preDownBtnContainer.setAttribute("data-response-index", index)


            const currentUpvoteSpan = currentDiv.querySelector(`#upvotes-${questionId}-${index}`);
            const currentDownvoteSpan = currentDiv.querySelector(`#downvotes-${questionId}-${index}`);
            const previousUpvoteSpan = previousDiv.querySelector(`#upvotes-${questionId}-${Number(index) + 1}`);
            const previousDownvoteSpan = previousDiv.querySelector(`#downvotes-${questionId}-${Number(index) + 1}`);

            // Update the spans to reflect their new indices
            currentUpvoteSpan.id = `upvotes-${questionId}-${Number(index) + 1}`;
            currentDownvoteSpan.id = `downvotes-${questionId}-${Number(index) + 1}`;
            previousUpvoteSpan.id = `upvotes-${questionId}-${index}`;
            previousDownvoteSpan.id = `downvotes-${questionId}-${index}`;

            // Update current index for next loop check
            index++;
        } else {
            break; // Break loop if no more swaps are needed
        }
    }
    localStorage.setItem('questions', JSON.stringify(questions));
}
