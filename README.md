# Resume Parser

## Introduction
Our resume parser application streamlines the recruitment process for HR departments by filtering through large volumes of resumes to identify the best matches based on specified keywords. The application analyzes each resume, extracts relevant information, and compares with the specified keywords. The results are then presented in a PDF format, with all the matching keywords prominently highlighted, making it easier for HR professionals to identify the most suitable candidates quickly and efficiently.

## How to run
- **To run our application successfully, users will need to have Node.js (npm) and Python installed on their computer. The installation steps should be in the following order:**

  1. [Install Node.js](https://nodejs.org/en) (Make sure you follow the instructions to get Node.js installed properly)
  2. [Install Python](https://www.python.org/downloads/)
  4. Clone the repo to your laptop/computer, run:
      ```bash
        git clone <HTTPS>
      ```
  5. Open your preferred code editor (prefer Visual Studio Code) and go to the folder where you've cloned 
  6. At the top-level folder, run
     ```bash
       npm install
     ```
     to install all the applications' dependencies
  7. At the top-level folder, run
     ```bash
        npm run dev
     ```

## Technologies used
- **Web Client:** React, HTML, CSS, JavaScript
- **Backend:** Python, spacy, pdf-lib, pymupdf, FastAPI
