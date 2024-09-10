import { questionBank } from "./questionBank.js";

document.addEventListener("DOMContentLoaded", () => {
    const selectedTopicsList = document.getElementById("selected-topics-list");
    const startQuizButton = document.getElementById("start-quiz-button");
    const stopwatch = document.getElementById("stopwatch");

    const questionQuantityButtons = document.querySelectorAll(".question-quantity-option");
    questionQuantityButtons.forEach(button => {
        button.addEventListener("click", selectQuizQuestionQuantity);
    });

    startQuizButton.addEventListener("click", startQuiz)
    
    // gets selected quiz IDs from session storage
    function getSelectedQuizIds() {
        // gets the key "selectedQuizzes" from sessionStorage
        // if selectedQuizzes is not null, undefined, false, 0, or an empty string:
        // it removes the string. otherwise, it returns an empty array []
        const selectedQuizIds = sessionStorage.getItem("selectedQuizzes");
        return selectedQuizIds ? JSON.parse(selectedQuizIds) : [];
    }

    function makeQuizIdsReadable() {
        const selectedQuizIds = getSelectedQuizIds();
        
        // returns the selected quiz IDs in a more readable format
        // e.g. "past-perfect-continuous" => "Past Perfect Continuous"
        return selectedQuizIds.map(quizName => 
            quizName.split("-")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")
        );
    }

    function makeQuizIdsCammelCase() {
        const selectedQuizIds = getSelectedQuizIds();
        
        // returns the selected quiz IDs in a cammel case format
        // e.g. "Past Perfect Continuous" => "pastPerfectContinuous"

        return selectedQuizIds.map(quizName =>
        quizName.split("-")
                .map((word, index) => index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join("")
        );
    }

    function selectQuizQuestionQuantity() {
        const selectedQuantity = this.id.split('-')[0];
        const selectedQuantityOptions = document.querySelectorAll(".question-quantity-option");

        selectedQuantityOptions.forEach(option => {
            if (option.classList.contains("question-quantity-option-selection")) {
                option.classList.remove("question-quantity-option-selection");

            }
        });

        this.classList.add("question-quantity-option-selection");

        // store the selected quantity in sessionStorage only after clicking the start quiz button
        // if there is a selected quantity, you can store it, if no selection border is displayed, remove the session
        if (selectedQuantity) {
            sessionStorage.setItem("questionQuantity", selectedQuantity);
        } else {
            sessionStorage.removeItem("questionQuantity");
        }

        // remove the "questionQuantity" sessionStorage when the user leaves / refreshes the page
        window.addEventListener("beforeunload", () => {
            sessionStorage.removeItem("questionQuantity");
        });
    }

    function startQuiz() {
        const selectedQuizIds = getSelectedQuizIds();
        const questionQuantity = sessionStorage.getItem("questionQuantity");

        // if no quizzes are selected, display an alert
        if (selectedQuizIds.length === 0) {
            alert("Please select at least one quiz topic.");
            window.location.href = "quiz-selection.html";
            return;
        }

        // if no question quantity is selected, display an alert
        if (!questionQuantity) {
            alert("Please select a question quantity.");
            return;
        }

        showQuestions();
    }



    
    function showQuestions() {
        const startingPage = document.getElementById("starting-container");
        const questionQuantity = sessionStorage.getItem("questionQuantity");
        const quizIDs = makeQuizIdsCammelCase();

        startQuizButton.innerText = "Submit";
        startQuizButton.removeEventListener("click", startQuiz);
        startQuizButton.style.cursor = "not-allowed";
        startQuizButton.addEventListener("mouseover", () => {
            startQuizButton.style.backgroundColor = "rgb(255, 0, 0, 0.7)"; 
        });
    
        startQuizButton.addEventListener("mouseout", () => {
            startQuizButton.style.backgroundColor = "";
        });


        

        // i = question topics, j = question number
        // for each quiz topic, display the amount of questions (questionQuantity)
        // so if the user selects pastSimple, it gets the 5 questions from the pastSimple question bank
        // repeats for each topic selected

        let allQuestions = {};
        for (let i = 0; i < quizIDs.length; i++) {
            let quizID = quizIDs[i];
            if (!allQuestions[quizID]) {
                allQuestions[quizID] = [];
            }
            for (let j = 0; j < questionQuantity; j++) {
                allQuestions[quizID].push(questionBank()[quizID][j]);
            }
        }


        sessionStorage.setItem("questions", JSON.stringify(allQuestions));
/*         console.log(JSON.parse(sessionStorage.getItem("questions"))); */
        console.log(allQuestions);
        
        let wholeQuestionContainer = document.getElementById("whole-question-container");
        if (!wholeQuestionContainer) {
            wholeQuestionContainer = document.createElement("div");
            wholeQuestionContainer.id = "whole-question-container";
            document.body.appendChild(wholeQuestionContainer);
        }
        
        let questionContainers = [];
        quizIDs.forEach(quizID => {
            for (let j = 0; j < questionQuantity; j++) {
                // Create a section for each question
                const section = document.createElement("section");
                section.classList.add("question-container");
        
                // Create a div for the question text
                const questionDiv = document.createElement("h2");
                questionDiv.classList.add("question");
                questionDiv.innerText = allQuestions[quizID][j].question;


                const clueButton = document.createElement("button");
                clueButton.classList.add("clue-button");
                clueButton.innerText = "?";



                const answerButtonContainer = document.createElement("div");
                answerButtonContainer.classList.add("answer-button-container");


                const nextAndPreviousButtonContainer = document.createElement("div");
                nextAndPreviousButtonContainer.classList.add("next-previous-button-container");

                const previousButton = document.createElement("button");
                previousButton.classList.add("previous-button");
                previousButton.innerText = "Previous";


                const nextButton = document.createElement("button");
                nextButton.classList.add("next-button");
                nextButton.innerText = "Next";




                
                clueButton.addEventListener("click", () => {
                    const currentQuizID = makeQuizIdsReadable()[quizIDs.indexOf(quizID)];

                    const clueDiv = document.createElement("div");
                    clueDiv.classList.add("clue-div");
                    clueDiv.innerText = currentQuizID;
                    section.replaceChild(clueDiv, clueButton);

                    setTimeout(() => {
                        section.replaceChild(clueButton, clueDiv);
                    }, 2000);
                });

                const shuffledOptions = shuffle(allQuestions[quizID][j].options);
                shuffledOptions.forEach(option => {
                    const button = document.createElement("button");
                    button.classList.add("answer-option");
                    button.innerText = option;
                    answerButtonContainer.appendChild(button);
                });


                section.appendChild(questionDiv);
                section.appendChild(clueButton);
                section.appendChild(answerButtonContainer);
                nextAndPreviousButtonContainer.appendChild(previousButton);
                nextAndPreviousButtonContainer.appendChild(nextButton);
                section.appendChild(nextAndPreviousButtonContainer);
                questionContainers.push(section);

                

        
                // Append the section to the main container
                questionContainers = shuffle(questionContainers);

                questionContainers.forEach(section => {
                    wholeQuestionContainer.appendChild(section);
                });
            }
        });


        const questionContainer = document.querySelectorAll("#whole-question-container .question-container");

        questionContainer.forEach((question, index) => {
            // Hide all questions
            question.style.display = "none";
        
            // Show only the first question
            if (index === 0) {
                question.style.display = "block";
            }

            const nextButton = question.querySelector(".next-button");
            const previousButton = question.querySelector(".previous-button");
            
            nextButton.addEventListener("click", () => {
                question.style.display = "none";
                questionContainer[index + 1].style.display = "block";
            });

            previousButton.addEventListener("click", () => {
                question.style.display = "none";
                questionContainer[index - 1].style.display = "block";
        });
        
        // hides the previous button on the first question
        if (index === 0) {
            previousButton.style.display = "none";
        }

        // hides the next button on the last question
        if (index === questionContainer.length - 1) {
            nextButton.style.display = "none";
        }
    });
        

        startingPage.style.display = "none";
        wholeQuestionContainer.style.display = "block";
    }
    




    // displays selected topics
    function displaySelectedQuizzes() {
        const selectedQuizIds = makeQuizIdsReadable();

        selectedQuizIds.forEach((quiz) => {
            const li = document.createElement("li");
            li.textContent = quiz
            selectedTopicsList.appendChild(li);
        });
    };
    displaySelectedQuizzes();


});