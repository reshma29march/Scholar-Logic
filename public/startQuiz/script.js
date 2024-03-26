// Define your quiz questions here
const quizQuestions = [
    {
        question: "Which of the following function of Array object adds one or more elements to the end of an array and returns the new length of the array?",
        options: ["pop()", "push()", "join()", "map()"],
        answer: 1
    },
    {
        question: "Which of the following is a valid type of function JavaScript supports?",
        options: ["named function", "anonymous function", "Both of the above", "None of the above"],
        answer: 2
    },
    {
        question: "Which of the following is correct about callbacks?",
        options: ["A callback is a plain JavaScript function passed to some method as an argument or option.", "Some callbacks are just events, called to give the user a chance to react when a certain state is triggered.", "Both of the above", "None of the above"],
        answer: 2
    },
    {
        question: "Which built-in method returns the calling string value converted to lower case?",
        options: ["toLowerCase()", "toLower()", "changeCase(case)", "None of the above"],
        answer: 0
    },
    {
        question: "Which of the following function of Number object returns the number's value?",
        options: ["toString()", "valueOf()", "toLocaleString()", "toPrecision()"],
        answer: 1
    }
];

document.addEventListener('DOMContentLoaded', function () {
  const studentInfoContainer = document.getElementById('studentInfo');
  const questionsContainer = document.getElementById('questions');
  const resultContainer = document.getElementById('result');
  const downloadPdfBtn = document.getElementById('downloadPdf');

  let quizGenerated = false; // Flag to track if quiz has been generated

  // Function to generate student name and subject form
  function generateStudentForm() {
      const studentFormHtml = `
          <form id="studentForm">
              <div class="form-group">
                  <label for="studentName">Student Name:</label>
                  <input type="text" class="form-control" id="studentName" required>
              </div>
              <div class="form-group">
                  <label for="subject">Subject:</label>
                  <input type="text" class="form-control" id="subject" required>
              </div>
              <button type="submit" class="btn btn-primary" style="margin-top: 20px; margin-bottom: 20px;">Start Quiz</button>
                        </form>
      `;
      studentInfoContainer.innerHTML = studentFormHtml;

      const studentForm = document.getElementById('studentForm');
      studentForm.addEventListener('submit', function (event) {
          event.preventDefault();
          if (!quizGenerated) { // Generate quiz only if it hasn't been generated yet
              generateQuiz();
              quizGenerated = true; // Set flag to true after generating quiz
          }
          // Hide student information after submitting
          studentInfoContainer.style.display = 'none';
      });
  }

  // Function to generate quiz questions
  function generateQuiz() {
      const quizFormHtml = quizQuestions.map((question, index) => {
          const optionsHtml = question.options.map((option, i) => `
              <div class="form-check">
                  <input class="form-check-input" type="radio" name="question${index}" id="question${index}-option${i}" value="${i}" required>
                  <label class="form-check-label" for="question${index}-option${i}"style="color: white;">
                      ${option}
                  </label>
              </div>
          `).join('');

          return `
              <div class="card mt-3">
                  <div class="card-body">
                      <h5 class="card-title">${index + 1}. ${question.question}</h5>
                      ${optionsHtml}
                  </div>
              </div>
          `;
      }).join('');

      const quizForm = document.createElement('form');
      quizForm.innerHTML = quizFormHtml;

      const submitButton = document.createElement('button');
      submitButton.setAttribute('type', 'submit');
      submitButton.setAttribute('class', 'btn btn-primary');
      submitButton.textContent = 'Submit';
      quizForm.appendChild(submitButton);

      questionsContainer.appendChild(quizForm);

      quizForm.addEventListener('submit', function (event) {
          event.preventDefault();
          calculateResult();
      });
  }

  // Function to calculate quiz result
  function calculateResult() {
      const totalQuestions = quizQuestions.length;
      let score = 0;

      for (let i = 0; i < totalQuestions; i++) {
          const selectedOption = document.querySelector(`input[name="question${i}"]:checked`);
          if (selectedOption) {
              const selectedAnswer = parseInt(selectedOption.value);
              if (selectedAnswer === quizQuestions[i].answer) {
                  score++;
              }
          }
      }

      const percentageScore = (score / totalQuestions) * 100;
      const passOrFail = percentageScore >= 55 ? "Pass" : "Fail";

      resultContainer.innerHTML = `
          <h3>Result:</h3>
          <p>Student Name: ${document.getElementById('studentName').value}</p>
          <p>Subject: ${document.getElementById('subject').value}</p>
          <p>Score: ${score}/${totalQuestions} (${percentageScore.toFixed(2)}%)</p>
          <p>Status: ${passOrFail}</p>
      `;
      resultContainer.style.display = 'block';

      downloadPdfBtn.style.display = 'block';
  }

  // Event listener for downloading PDF
  downloadPdfBtn.addEventListener('click', async function () {
      const pdfDoc = await PDFLib.PDFDocument.create();
      const page = pdfDoc.addPage([400, 400]); // Adjust dimensions as needed

      const { width, height } = page.getSize();
      const fontSize = 15;
      const text = resultContainer.textContent;

      page.drawText(text, {
          x: 50,
          y: height - 4 * fontSize,
          size: fontSize,
      });

      const pdfBytes = await pdfDoc.save();

      // Create a blob from the PDF data
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      // Create a link element and set its attributes for downloading
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'quiz_result.pdf';

      // Simulate click to trigger download
      link.click();
  });
  generateStudentForm();
});
