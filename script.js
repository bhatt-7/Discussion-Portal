let questionDiv = null;
let questions = {};
let isFavoritesVisible = false;
let originalIndex = null;
function showForm() {
    document.querySelector('.right-parent').style.display = "flex";
    document.querySelector('.right-parent-2').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    questions = JSON.parse(localStorage.getItem('questions')) || {};
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
    questions = JSON.parse(localStorage.getItem('questions')) || {};

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

    // if (starred) {
    //     let lastStarredDiv = null;

    //     for (const div of container.children) {
    //         if (div.querySelector('.star-icon').src.includes('filled_star.png')) {
    //             lastStarredDiv = div;
    //         }
    //     }

    //     if (prepend) {
    //         container.insertBefore(newQuestionDiv, container.firstChild);
    //     } else {
    //         if (lastStarredDiv) {
    //             container.insertBefore(newQuestionDiv, lastStarredDiv.nextSibling);
    //         } else {
    //             container.appendChild(newQuestionDiv);
    //         }
    //     }
    // } else {
    //     let lastStarredDiv = null;

    //     for (const div of container.children) {
    //         if (div.querySelector('.star-icon').src.includes('filled_star.png')) {
    //             lastStarredDiv = div;
    //         }
    //     }

    //     if (lastStarredDiv) {
    //         container.insertBefore(newQuestionDiv, lastStarredDiv.nextSibling);
    //     } else {
    //         if (prepend) {
    //             container.insertBefore(newQuestionDiv, container.firstChild);
    //         } else {
    //             container.appendChild(newQuestionDiv);
    //         }
    //     }
    // }

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

    // const starredQuestions = Object.values(questions).filter(q => q.starred);
    // starredQuestions.forEach(q => addQuestionToWindow(q, true));

    // const nonStarredQuestions = Object.values(questions).filter(q => !q.starred);
    // nonStarredQuestions.reverse().forEach(q => addQuestionToWindow(q));

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
    const questionDivs = Array.from(document.querySelectorAll('.window .question-item'));

    // Store original content in a data attribute
    questionDivs.forEach(div => {
        const subjectElem = div.querySelector('h3');
        const questionElem = div.querySelector('p');
        subjectElem.dataset.originalText = subjectElem.textContent;
        questionElem.dataset.originalText = questionElem.textContent;
    });

    document.getElementById('search').addEventListener('input', function () {
        const query = this.value.toLowerCase().trim();
        const windowDiv = document.querySelector('.window');
        windowDiv.innerHTML = '';

        function highlightText(text, query) {
            if (!query) return text;
            return text.replace(new RegExp(`(${query})`, 'gi'), '<mark>$1</mark>');
        }

        if (query) {
            const subjectMatches = [];
            const questionMatches = [];

            questionDivs.forEach(div => {
                const subjectElem = div.querySelector('h3');
                const questionElem = div.querySelector('p');
                const subject = subjectElem.dataset.originalText.toLowerCase().trim();
                const questionText = questionElem.dataset.originalText.toLowerCase().trim();

                const isSubjectMatch = subject.includes(query);
                const isQuestionMatch = questionText.includes(query);

                if (isSubjectMatch) {
                    subjectElem.innerHTML = highlightText(subjectElem.dataset.originalText, query);
                    questionElem.innerHTML = highlightText(questionElem.dataset.originalText, query);
                    subjectMatches.push(div);
                } else if (isQuestionMatch) {
                    subjectElem.innerHTML = highlightText(subjectElem.dataset.originalText, query);
                    questionElem.innerHTML = highlightText(questionElem.dataset.originalText, query);
                    questionMatches.push(div);
                }
            });

            [...subjectMatches, ...questionMatches].forEach(div => windowDiv.appendChild(div));
        } else {
            // Reset and show all divs
            questionDivs.forEach(div => {
                const subjectElem = div.querySelector('h3');
                const questionElem = div.querySelector('p');
                subjectElem.innerHTML = subjectElem.dataset.originalText;
                questionElem.innerHTML = questionElem.dataset.originalText;
                windowDiv.appendChild(div);
            });
        }
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
                    <img src="https://i.redd.it/petition-for-these-to-be-the-upvote-and-downvote-buttons-v0-e48q8mgz58tc1.png?width=754&format=png&auto=webp&s=7b8432446e6ff461e77624415118cd079397db7c" alt="Upvote" style="width: 20px;height:20px; cursor: pointer;" onclick="upvoteResponse('${questionId}', ${index})">
                    <span> ${upvotes}</span>
                </div>
                <div>
                    <img src="https://i.redd.it/petition-for-these-to-be-the-upvote-and-downvote-buttons-v0-nebfr5kz58tc1.png?width=754&format=png&auto=webp&s=3ff7434b5ead8eb9f8865e7cdbaa17147e8bbeab" alt="Downvote" style="width: 20px;height:20px; cursor: pointer;" onclick="downvoteResponse('${questionId}', ${index})">
                    <span> ${downvotes}</span>
                </div>
            </div>
        `;

        responseDiv.className = 'response-item';
        responseDiv.id = `${index}`;
        responseDiv.style.padding = "10px";
        responseDiv.style.backgroundColor = "#f0f0f0";
        responseDiv.style.marginBottom = "5px";
        responseDiv.style.display = "flex";
        responseDiv.style.justifyContent = "space-between";

        responseContainer.appendChild(responseDiv);
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
    questions = JSON.parse(localStorage.getItem('questions')) || {};

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

    moveResponseUp(questions[questionId].responses, questionId, index);

    localStorage.setItem('questions', JSON.stringify(questions));
    renderResponses(questions[questionId].responses, questionId);
}


//copy of upvote
// function upvoteResponse(questionId, index) {
//     console.log(index)
//     questions[questionId].responses[index].upvotes += 1;
//     localStorage.setItem('questions', JSON.stringify(questions));

//     const reviews = questions[questionId].responses;
//     const currentReview = reviews[index];
//     const currentDifference = currentReview.upvotes - currentReview.downvotes;

//     let copyIndex = index - 1;
//     while (copyIndex >= 0) {
//         const copyReview = reviews[copyIndex];
//         const copyDifference = copyReview.upvotes - copyReview.downvotes;
//         if (copyDifference > currentDifference) {
//             break;
//         }
//         copyIndex--;
//     }
//     const currentResponseDiv = document.querySelector(`.add-response`);
//     const currentDiv=currentResponseDiv.children[index];
//     console.log(currentDiv);

//     currentDiv.remove();
//     currentResponseDiv.insertBefore(currentDiv, currentResponseDiv.children[copyIndex + 1]);
//     // console.log(currentResponseDiv);

//     moveResponseUp(questions[questionId].responses, questionId, index);

//     // renderResponses(questions[questionId].responses, questionId);
// }



// Downvote a response and move it down if it has a lower score
function downvoteResponse(questionId, index) {
    questions[questionId].responses[index].downvotes += 1;

    moveResponseDown(questions[questionId].responses, questionId, index);

    localStorage.setItem('questions', JSON.stringify(questions));
    renderResponses(questions[questionId].responses, questionId);
}

// Move a response up based on its score
function moveResponseUp(responses, questionId, index) {
    console.log(responses, questionId, index)
    while (index > 0) {
        const currentResponse = responses[index];
        const previousResponse = responses[index - 1];

        if ((currentResponse.upvotes - currentResponse.downvotes) >
            (previousResponse.upvotes - previousResponse.downvotes)) {
            [responses[index], responses[index - 1]] = [previousResponse, currentResponse];
            index--;
        } else break

    }
    localStorage.setItem('questions', JSON.stringify(questions));
}

// Move a response down based on its score
function moveResponseDown(responses, questionId, index) {
    while (index < responses.length - 1) {
        const currentResponse = responses[index];
        const nextResponse = responses[index + 1];

        if ((currentResponse.upvotes - currentResponse.downvotes) <
            (nextResponse.upvotes - nextResponse.downvotes)) {
            [responses[index], responses[index + 1]] = [nextResponse, currentResponse];
        }
        index++;
    }
}
