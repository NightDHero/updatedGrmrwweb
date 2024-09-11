import { questionBank } from "./questionBank.js";

document.addEventListener("DOMContentLoaded", () => {

    function getSelectedQuizIDs() {
        const quizIDs = sessionStorage.getItem("selectedQuizIDs");
        return quizIDs ? JSON.parse(quizIDs) : [];
    }
    
    function makeQuizIDsReadable(quizIDs) {
        return quizIDs.map(quizName => 
            quizName.split("-")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")
        );
    }

    function makeQuizIDsCamelCase(quizIDs) {
        return quizIDs.map(quizName => 
            quizName.split("-")
                    .map((word, index) => index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join("")
        );
    }

    function showSelectedQuizzes(quizIDs) {
        const selectedTopicsList = document.getElementById("selected-topics-list");
        const readableQuizIDs = makeQuizIDsReadable(quizIDs);

        readableQuizIDs.forEach(quizID => {
            const li = document.createElement("li");
            li.textContent = quizID;
            selectedTopicsList.appendChild(li);
        });
    }


    function showQuestionQuantityBorderWhenSelected() {
        document.getElementById("start-quiz-button").disabled = true;
        const questionQuantityOptionButtons = document.querySelectorAll(".question-quantity-option");
        questionQuantityOptionButtons.forEach(button => {
            button.addEventListener("click", () => {
                if (button.classList.contains("question-quantity-selection")) {
                    button.classList.remove("question-quantity-selection");
                    document.getElementById("start-quiz-button").disabled = true;
                } else {
                    questionQuantityOptionButtons.forEach(button => button.classList.remove("question-quantity-selection"));
                    button.classList.add("question-quantity-selection");
                    document.getElementById("start-quiz-button").disabled = false;
                }
            });
        });
    }



    function getSelectedQuestionQuantity() {
        const questionQuantityOptionButtons = document.querySelectorAll(".question-quantity-option");

        let questionQuantity = 0;
        questionQuantityOptionButtons.forEach(button => {
            if (button.classList.contains("question-quantity-selection")) {
                questionQuantity = button.dataset.quantity;
                sessionStorage.setItem("questionQuantity", questionQuantity);
            }
        });
        return questionQuantity;
    }

    function startQuizCheckup() {
        if (!getSelectedQuestionQuantity()) {
            alert("Please select the number of questions you would like to answer per topic.");
            return false;
        }

        if (sessionStorage.getItem("selectedQuizIDs") === null) {
            alert("Please select at least one topic to start.");
            window.location.href = "quiz-selection.html";
            return false;
        }

        return true;
    }

    
    function prepareQuizEnvironment() {
        document.getElementById("starting-container").style.display = "none";

        const startQuizButton = document.getElementById("start-quiz-button");
        const submitQuizButton = getOrCreateElement("submit-quiz-button", "submit-button", "button", document.body, "Submit Quiz");
        replaceElement(submitQuizButton, startQuizButton, "Submit Quiz");
    }


    function getQuestionsFromQuestionBank(cammelCasedQuizIDs, questionQuantity) {
        // Use parameters if provided, otherwise get values from other functions
        cammelCasedQuizIDs = cammelCasedQuizIDs || makeQuizIDsCamelCase(getSelectedQuizIDs());
        questionQuantity = questionQuantity || getSelectedQuestionQuantity();
        
        let allQuestions = {};
        for (let i = 0; i < cammelCasedQuizIDs.length; i++) {
            let quizID = cammelCasedQuizIDs[i];
            if (!allQuestions[quizID]) {
                allQuestions[quizID] = [];
            }
            const questions = questionBank()[quizID];
            if (!questions || questions.length < questionQuantity) {
                console.error(`Not enough questions available for quiz ID: ${quizID}`);
                continue;
            }
            for (let j = 0; j < questionQuantity; j++) {
                allQuestions[quizID].push(questions[j]);
            }
        }
        sessionStorage.setItem("questions", JSON.stringify(allQuestions));
        return allQuestions;
    }

    function getOrCreateElement(elementID = null, elementClass = null, elementType = "div", parentElement = document.body, innerText = null) {
        let element = document.getElementById(elementID);

        if (!(parentElement instanceof HTMLElement)) {
            throw new Error('parentElement must be a valid DOM element');
        }

        if (!element) {
            element = document.createElement(elementType);
            element.id = elementID;
            element.className = elementClass;
            element.innerText = innerText;
            parentElement.appendChild(element);
        }
        return element;
    }

    function checkIfQuizIsFinished() {
        const questions = document.querySelectorAll(".question-container");
        const currentQuestion = document.querySelector(".question-container:not([style*='display: none'])");
        const questionsArray = Array.from(questions);
        const currentQuestionIndex = questionsArray.indexOf(currentQuestion);
        const submitButton = document.getElementById("submit-quiz-button");
    }

    function buildQuizQuestionElements() {
        const cammelCasedQuizIDs = makeQuizIDsCamelCase(getSelectedQuizIDs());
        const questionQuantity = getSelectedQuestionQuantity();
        let wholeQuestionContainer = getOrCreateElement("whole-question-container");

        let allQuestions = getQuestionsFromQuestionBank();
        let questionContainers = [];
        let totalQuestionQuantity = cammelCasedQuizIDs.length * questionQuantity;
        let questionNumberElement = getOrCreateElement("question-number", "question-number", "p", header);

        cammelCasedQuizIDs.forEach(quizID => {
            let quizContainer = getOrCreateElement(`${quizID}-container`, "quiz-container", "div", wholeQuestionContainer);
            let quizHeader = getOrCreateElement(`${quizID}-header`, "quiz-header", "h2", quizContainer, quizID);
            
            allQuestions[quizID].forEach((question, index) => {
                let questionContainer = getOrCreateElement(`${quizID}-question-${index}`, "question-container", "div", quizContainer);
                let questionText = getOrCreateElement(`${quizID}-question-${index}-text`, "question-text", "p", questionContainer, question.question);
                question.options.forEach((option, optionIndex) => {
                    let optionText = getOrCreateElement(`${quizID}-question-${index}-option-${optionIndex}`, "question-option", "button", questionContainer, option);
                });
                let nextAndPreviousContainer = getOrCreateElement(`${quizID}-question-${index}-button-container`, "next-previous-button-container", "div", questionContainer);
                let previousButton = getOrCreateElement(`${quizID}-question-${index}-previous`, "previous-button", "button", nextAndPreviousContainer, "Previous");
                let nextButton = getOrCreateElement(`${quizID}-question-${index}-next`, "next-button", "button", nextAndPreviousContainer, "Next");
                
                questionContainers.push(questionContainer);
            });
        });        
    }
    

    function headersInQuiz() {
        const questions = document.querySelectorAll(".question-container");
        const questionHeaders = document.querySelectorAll(".quiz-header");

        
        questionHeaders.forEach(header => {
            header.style.display = "none";
        });

        questions.forEach((question, index) => {
            question.style.display = (index === 0) ? "flex" : "none";
            

        });
    }

    function selectOption() {
        const questions = document.querySelectorAll(".question-container");
        questions.forEach(question => {
            const options = question.querySelectorAll(".question-option");

            options.forEach(option => {
                option.addEventListener("click", () => {
                    if (option.classList.contains("selected-option")) {
                        options.forEach(opt => opt.classList.remove("selected-option"));
                        selectedOptions = [];
                    } else {
                        options.forEach(opt => opt.classList.remove("selected-option"));
                        option.classList.toggle("selected-option");
                    }
                });
            }); 
        });
    }

    function getSelectedOptions() {
        const questions = document.querySelectorAll(".question-container");
        let selectedOptions = {};
        questions.forEach(question => {
            const options = question.querySelectorAll(".selected-option");
            options.forEach(option => {
                selectedOptions[question.id] = option.innerText;
            });
        });
        return selectedOptions;
    }

    function gradeQuiz() {
        const selectedAnswers = getSelectedOptions();
        const cammelCasedQuizIDs = makeQuizIDsCamelCase(getSelectedQuizIDs());
        const questionQuantity = getSelectedQuestionQuantity();
        const questionsFromBank = getQuestionsFromQuestionBank(cammelCasedQuizIDs, questionQuantity);
    
        let score = 0;
        let totalQuestions = 0;
        let correctAnswers = {};
        let incorrectAnswers = {};

        cammelCasedQuizIDs.forEach(quizID => {
            const quizQuestionsFromBank = questionsFromBank[quizID];
            quizQuestionsFromBank.forEach((question, index) => {
                const questionId = `${quizID}-question-${index}`; 
                const correctAnswer = question.answer;
                const selectedAnswer = selectedAnswers[questionId];

                if (selectedAnswer !== correctAnswer) {
                    incorrectAnswers[questionId] = selectedAnswer;
                } else {
                    correctAnswers[questionId] = correctAnswer;
                }
                if (selectedAnswer === correctAnswer) {
                    score++;
                }
                totalQuestions++;
                
            });
        });

        return displayQuizResults(score, totalQuestions, correctAnswers, incorrectAnswers);
    }

    function prepareQuizResultsInterface() {
        
    }


    function displayQuizResults(score, totalQuestions, correctAnswers, incorrectAnswers) {
        const quizResultsContainer = getOrCreateElement("quiz-results-container", "quiz-results-container", "div", document.body);
        const quizResults = getOrCreateElement("quiz-results", "quiz-results", "div", quizResultsContainer);
        const scoreElement = getOrCreateElement("score", "score", "p", quizResults, `Score: ${score}/${totalQuestions}`);
        const retakeQuizButton = getOrCreateElement("retake-quiz-button", "retake-quiz-button", "button", quizResults, "Retake Quiz");

        const wholeQuestionContainer = document.getElementById("whole-question-container");
        
        const quizContainers = document.querySelectorAll(".question-container");
        quizContainers.forEach(container => {
            container.style.display = "flex";
            container.style.flexDirection = "column"; // Ensure the containers are displayed in a column
        });

        const nextButtons = document.querySelectorAll(".next-button");
        const previousButtons = document.querySelectorAll(".previous-button");
        nextButtons.forEach(button => button.style.display = "none");
        previousButtons.forEach(button => button.style.display = "none");

        const questionOptions = document.querySelectorAll(".question-option");
        questionOptions.forEach(option => option.classList.remove(".selected-option"));

        retakeQuizButton.addEventListener("click", () => {
            window.location.reload();
        });

        const homeButton = getOrCreateElement("home-button", "home-button", "button", quizResults, "Home");
        homeButton.addEventListener("click", () => {
            window.location.href = "index.html";
        });

        const quizSelectionButton = getOrCreateElement("quiz-selection-button", "quiz-selection-button", "button", quizResults, "Quiz Selection");
        quizSelectionButton.addEventListener("click", () => {
            window.location.href = "quiz-selection.html";
        });

        console.log("Correct Answers: ", correctAnswers);
        console.log("Incorrect Answers: ", incorrectAnswers);
    }

    let currentQuestionNumber = 0;
    function updateQuestionNumber() {
        const questionNumberElement = document.getElementById("question-number");
        const totalQuestionQuantity = getSelectedQuestionQuantity() * getSelectedQuizIDs().length;
        questionNumberElement.innerHTML = `<span class="fraction"><sup>${currentQuestionNumber + 1}</sup>―<sub>${totalQuestionQuantity}</sub></span>`;
    }

    
    function replaceElement(newElement, oldElement, innerText = null) {
        if (!(oldElement instanceof HTMLElement)) {
            throw new Error('oldElement must be a valid DOM element');
        }

        if (!oldElement) {
            throw new Error('oldElement must be a valid DOM element');
        }

        if (newElement) {
            newElement.innerText = innerText;
            oldElement.parentNode.replaceChild(newElement, oldElement);
        }

        return newElement;
    }

    function setupQuestionNavigation() {
        const nextButtons = document.querySelectorAll(".next-button");
        const previousButton = document.querySelectorAll(".previous-button");
        checkIfFirstOrLastQuestion();

        nextButtons.forEach(nextButton => {
            nextButton.addEventListener("click", () => {
                showNextQuestion();
                checkIfFirstOrLastQuestion()
            });
        });

        previousButton.forEach(prevButton => {
            prevButton.addEventListener("click", () => {
                showPreviousQuestion();
                checkIfFirstOrLastQuestion()
            });
        });
    }

    function startStopwatch() {
        let time = 0;
        setInterval(() => {
            time++;
            const hours = Math.floor(time / 3600);
            const minutes = Math.floor((time % 3600) / 60);
            const seconds = time % 60;
    
            const formattedTime = 
                String(hours).padStart(2, '0') + ':' + 
                String(minutes).padStart(2, '0') + ':' + 
                String(seconds).padStart(2, '0');
    
            document.getElementById("stopwatch").innerText = formattedTime;
        }, 1000);
    }








    function checkIfFirstOrLastQuestion() {
        const questions = document.querySelectorAll(".question-container");
        const lastQuestion = questions.length - 1;
        const currentQuestionIndex = Array.from(questions).indexOf(document.querySelector(".question-container:not([style*='display: none'])"));
        const previousButtons = document.querySelectorAll(".previous-button");
        const nextButtons = document.querySelectorAll(".next-button");
    
        previousButtons.forEach(button => {
            button.disabled = currentQuestionIndex === 0;
        });
    
        nextButtons.forEach(button => {
            button.disabled = currentQuestionIndex === lastQuestion;
        });
    }
    
    function showNextQuestion() {
        const currentQuestion = document.querySelector(".question-container:not([style*='display: none'])");
        const questions = Array.from(document.querySelectorAll('.question-container'));
        const currentQuestionIndex = questions.indexOf(currentQuestion);
        const nextQuestion = questions[currentQuestionIndex + 1];


        if (nextQuestion) {
            currentQuestion.style.display = "none";
            nextQuestion.style.display = "flex";
            currentQuestionNumber++;
            updateQuestionNumber();
        }

        
    }

    function showPreviousQuestion() {
        const currentQuestion = document.querySelector(".question-container:not([style*='display: none'])");
        const questions = Array.from(document.querySelectorAll('.question-container'));
        const currentQuestionIndex = questions.indexOf(currentQuestion);
        const previousQuestion = questions[currentQuestionIndex - 1];

        if (previousQuestion) {
            currentQuestion.style.display = "none";
            previousQuestion.style.display = "flex";
            currentQuestionNumber--;
            updateQuestionNumber();
        }
    }

    document.getElementById("start-quiz-button").addEventListener("click", () => {
        if (startQuizCheckup()) {
            prepareQuizEnvironment();
            buildQuizQuestionElements();
            headersInQuiz();
            setupQuestionNavigation();
            updateQuestionNumber();
            startStopwatch();
            selectOption();

            document.getElementById("submit-quiz-button").addEventListener("click", () => {
                gradeQuiz();
            });


        }
        
    });

    

    showSelectedQuizzes(getSelectedQuizIDs());
    showQuestionQuantityBorderWhenSelected();

    


});
