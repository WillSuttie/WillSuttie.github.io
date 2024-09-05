//!THINGS I HAVE LEARNT FROM THIS PROJECT - WRITE THE CODE AS MODULARLY AS POSSIBLE
//!                                       - HOW EVENTLISTENERS WORK
//!                                       - WHEN YOU FIND A PROBLEM THAT SEEMS COMPLICATED, LOOK FOR A SIMPLE SOLUTION
//!                                       - "TOO MANY COMMENTS" IS A MUCH EASIER PROBLEM TO FIX THAN "TOO FEW COMMENTS"

document.addEventListener('DOMContentLoaded', () => {
    let won = false;
    let gameOver = false;
    let activeGuess = ''
    let guesses = [];
    const WORD_LENGTH = 5;
    const GAME_LENGTH = 6;
    const WORD_LIST = ["cigar", "rebut", "sissy"]
    const OTHER_WORDS = ["earls", "count", "midgy"]
    const INITIAL_KEY_COLOUR = "#818384";
    const CORRECT_COLOUR = "#538D4E";
    const PARTIAL_COLOUR = "#B59F3B";
    const INCORRECT_COLOUR = "#3A3A3C";
    const NONE_STATUS = Array(WORD_LENGTH).fill('none');
    const KEYBOARD = [
        { Q: INITIAL_KEY_COLOUR, W: INITIAL_KEY_COLOUR, E: INITIAL_KEY_COLOUR, R: INITIAL_KEY_COLOUR, T: INITIAL_KEY_COLOUR, Y: INITIAL_KEY_COLOUR, U: INITIAL_KEY_COLOUR, I: INITIAL_KEY_COLOUR, O: INITIAL_KEY_COLOUR, P: INITIAL_KEY_COLOUR },
        { A: INITIAL_KEY_COLOUR, S: INITIAL_KEY_COLOUR, D: INITIAL_KEY_COLOUR, F: INITIAL_KEY_COLOUR, G: INITIAL_KEY_COLOUR, H: INITIAL_KEY_COLOUR, J: INITIAL_KEY_COLOUR, K: INITIAL_KEY_COLOUR, L: INITIAL_KEY_COLOUR },
        { ENTER: INITIAL_KEY_COLOUR, Z: INITIAL_KEY_COLOUR, X: INITIAL_KEY_COLOUR, C: INITIAL_KEY_COLOUR, V: INITIAL_KEY_COLOUR, B: INITIAL_KEY_COLOUR, N: INITIAL_KEY_COLOUR, M: INITIAL_KEY_COLOUR, "⌫": INITIAL_KEY_COLOUR }
    ];
    let targetWord = WORD_LIST[getRandomInteger(0, WORD_LIST.length - 1)].toUpperCase();
    
    //!Utility Functions
    //RNG
    function getRandomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    //!Core Game Functions
    // empty previous displayed guesses, shows input row and empty rows for remaining guesses
    function initialiseRows() { 
        document.getElementById("guessesDisplay").innerHTML = ""; // empty previous displayed guesses
        createGuessRow(activeGuess.padEnd(WORD_LENGTH, ' '), Array(WORD_LENGTH).fill('none')) // shows input row
        for (let i = 0; i < GAME_LENGTH - 1; i++) {//shows empty rows for remaining guesses
            createGuessRow(' '.repeat(WORD_LENGTH), NONE_STATUS);
        }
    }
        
    // make sure guess is the correct length, an actual word, and hasn't been guessed before.
    function validateGuess(_guess){
        if (!_guess || _guess.length !== WORD_LENGTH) { 
            showAlert(`Please enter a ${WORD_LENGTH}-letter guess.`);
            activeGuess = '';
            return false;           
        }
        else if (!OTHER_WORDS.includes(_guess.toLowerCase())&&!WORD_LIST.includes(_guess.toLowerCase())){
            showAlert(`Invalid word.`);
            activeGuess = '';
            return false;
        }
        else if (guesses.includes(_guess)){
            showAlert(`${_guess} has already been submitted.`)
            activeGuess = '';
            return false;          
        }
        return true;
    }
    
    //calls validateGuess(), checks if word is correct, adds to guesses[], resets activeGuess, calls updateDisplay, ends game if over, calls updateKeyboard
    function processGuess(_guess) { 
        if (!validateGuess(_guess)){
            return;
        }
        if (_guess === targetWord){
            won = true;
            showAlert("You win! Reload page to play again!", true);
            gameOver = true;
        }
        guesses.push(_guess);
        updateKeyboardColours(_guess);
        activeGuess = "";
        updateDisplay();
        if ((guesses.length >= GAME_LENGTH)&&(!won)) {
            showAlert(`You are a loser. The answer was ${targetWord}. Reload page to play again.`, true);
            gameOver = true;
            return;
        }
        updateKeyboard();
    }

    //!Display / UI Functions
    //creates + updates keyboard HTML/CSS
    function updateKeyboard() { 
        const CONTAINER = document.getElementById('virtualKeyboard');
        CONTAINER.innerHTML = '';
        for (const row of KEYBOARD) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'keyboard-row';
            for (const key in row) {
                const keyButton = document.createElement('button');
                keyButton.className = 'key-button';
                keyButton.textContent = key;
                keyButton.style.display = 'flex';
                keyButton.style.justifyContent = 'center';
                keyButton.style.alignItems = 'center';
                keyButton.style.fontFamily = 'Franklin Gothic, Arial, Helvetica';
                keyButton.style.fontSize = (key === 'ENTER')? '15px': '20px';
                keyButton.style.width = (key === '⌫')||(key === 'ENTER')? '45px': '25px';
                keyButton.style.height = '35px';
                keyButton.style.margin = '3px';
                keyButton.style.border = `2px solid ${row[key]}`;
                keyButton.style.borderRadius = '5px';
                keyButton.style.background = row[key];
                keyButton.style.color = '#FFFFFF';
                keyButton.id = key;
                keyButton.addEventListener('click', () => {
                    if (key == 'ENTER'){processGuess(activeGuess)}
                    else if (key == '⌫'){
                        activeGuess = activeGuess.slice(0, -1)
                        updateCurrentGuessDisplay();
                    }
                    else {
                        activeGuess = activeGuess + key
                        updateCurrentGuessDisplay();
                    }
                });
                rowDiv.appendChild(keyButton);
            }
            CONTAINER.appendChild(rowDiv);
        }
    }

    //updates colours stored in KEYBOARD
    function updateKeyboardColours(_guess) {
        for (let i = 0; i < WORD_LENGTH; i++) {
            if (_guess[i] === targetWord[i]) {
                KEYBOARD.forEach(row => {
                    if (row[_guess[i]] !== undefined) {
                        row[_guess[i]] = CORRECT_COLOUR;
                    }
                });
            } else if (targetWord.includes(_guess[i])) {
                KEYBOARD.forEach(row => {
                    if ((row[_guess[i]] !== undefined)&&(row[_guess[i]] !== CORRECT_COLOUR)) {
                        row[_guess[i]] = PARTIAL_COLOUR;
                    }
                });
            } else {
                KEYBOARD.forEach(row => {
                    if (row[_guess[i]] !== undefined) {
                        row[_guess[i]] = INCORRECT_COLOUR;
                    }
                });
            }
        }
    }

    //generates data for each row of previous guesses and displays them with createGuessRow(), then displays empty rows for remaining guesses
    function updateDisplay() {
        const display = document.getElementById('guessesDisplay');
        display.innerHTML = '';
        for (let i = 0; i < guesses.length; i++) {
            const guess = guesses[i];
            const status = Array(guess.length).fill('incorrect');
            const targetLetterCounts = {};
            for (let j = 0; j < targetWord.length; j++) {
                const letter = targetWord[j];
                targetLetterCounts[letter] = (targetLetterCounts[letter] || 0) + 1;
            }
            for (let j = 0; j < guess.length; j++) {
                if (guess[j] === targetWord[j]) {
                    status[j] = 'correct';
                    targetLetterCounts[guess[j]]--;
                }
            }
            for (let j = 0; j < guess.length; j++) {
                if (status[j] === 'correct') continue;

                if (targetWord.includes(guess[j]) && targetLetterCounts[guess[j]] > 0) {
                    status[j] = 'partial';
                    targetLetterCounts[guess[j]]--;
                }
            }
            createGuessRow(guess, status);
        }
        //displays empty rows for remaining guesses
        const remainingRows = GAME_LENGTH - guesses.length;
        for (let i = 0; i < remainingRows; i++) {
            createGuessRow(' '.repeat(WORD_LENGTH), NONE_STATUS)
        }
    }
    
    //if the game has not ended clears display of previous guesses then renders all previous guesses, current guess and then empty rows for remaining guesses
    function updateCurrentGuessDisplay() {
        if (!gameOver) {
            const display = document.getElementById('guessesDisplay');
            display.innerHTML = '';
            // Render all previous guesses
                //these for loops generate the array of the statuses of the letters in the guess
            for (let i = 0; i < guesses.length; i++) {
                const guess = guesses[i];
                const status = Array(guess.length).fill('incorrect');
                const targetLetterCounts = {};
                for (let j = 0; j < targetWord.length; j++) {
                    const letter = targetWord[j];
                    targetLetterCounts[letter] = (targetLetterCounts[letter] || 0) + 1;
                }
                for (let j = 0; j < guess.length; j++) {
                    if (guess[j] === targetWord[j]) {
                        status[j] = 'correct';
                        targetLetterCounts[guess[j]]--;
                    }
                }
                for (let j = 0; j < guess.length; j++) {
                    if (status[j] === 'correct') continue;
                    if (targetWord.includes(guess[j]) && targetLetterCounts[guess[j]] > 0) {
                        status[j] = 'partial';
                        targetLetterCounts[guess[j]]--;
                    }
                }
                createGuessRow(guess, status);
            }
    
            // Render the current guess
            createGuessRow(activeGuess.padEnd(WORD_LENGTH, ' '), NONE_STATUS);
    
            // Render empty rows for remaining guesses
            const remainingRows = GAME_LENGTH - guesses.length - 1;
            for (let i = 0; i < remainingRows; i++) {
                createGuessRow(' '.repeat(WORD_LENGTH), NONE_STATUS);
            }
        }
    }
    
    //creates letter boxes for word displays, groups them in a div (guess,) is the word that has been guessed; (, status) is an array of whether each letter is correct, incorrect, partial or none.
    function createGuessRow(guess, status) { 
        const statusClasses = {
            correct: 'correct',
            incorrect: 'incorrect',
            partial: 'partial',
            none: 'none'
        };
    
        const row = document.createElement('div');
        row.className = 'div-container';
    
        for (let i = 0; i < guess.length; i++) {
            const letterBox = document.createElement('div');
            letterBox.className = `dynamic-div ${statusClasses[status[i]]}`;
            letterBox.textContent = guess[i] || ' ';
            row.appendChild(letterBox);
        }
        //displays the word
        document.getElementById('guessesDisplay').appendChild(row);
    }

    //displays messages to user
    function showAlert(message, final = false) {
        const alertContainer = document.getElementById('alert-container');
        while (alertContainer.firstChild) {
            alertContainer.removeChild(alertContainer.firstChild);
        }
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert';
        alertDiv.textContent = message;
        alertContainer.appendChild(alertDiv);
        !final && setTimeout(() => {
            alertContainer.removeChild(alertDiv);
        }, 5000);
    }

    //!Event Handling
    //keyboard events
    function keyPress(event) {
        if (!gameOver){
            const key = event.key.toUpperCase();
            if (key === 'ENTER') {
                processGuess(activeGuess);
            } else if (key === 'BACKSPACE') {
                activeGuess = activeGuess.slice(0, -1);
            } else if (/^[A-Z]$/.test(key)) {
                if (activeGuess.length < WORD_LENGTH) {
                    activeGuess += key;
                }
            }
            updateCurrentGuessDisplay();
        }
    }
    document.addEventListener('keydown', keyPress);
    initialiseRows();
    updateKeyboard();    
});
