// Simpletron Machine Language
// processor.js - branch "file-loaded-prg"

// node.js declarations
const fs = require('node:fs');
const readline = require('readline-sync');

const prgFile = 'prgfile.json';

// limits
const MEMMAX = 65536;   // FFFF - Maximum memory storage for both code and data
const HEXRDX = 16;      // Hexadecimal conversion factor

// instructions
const READ = 10;        // 0A - read integer from input into memory
const WRITE = 11;       // 0B - write integer from memory to output
const READSTR = 12;     // 0C - read string from input into memory
const WRITESTR = 13;    // 0D - write string from memory to output
const LOAD = 20;        // 14 - load from memory to accumulator
const STORE = 21;       // 15 - store from accumulator to memory
const ADD = 30;         // 1E - accumulator + memory -> accumulator
const SUBTRACT = 31;    // 1F - accumulator - memory -> accumulator
const DIVIDE = 32;      // 20 - accumulator / memory -> accumulator
const MULTIPLY = 33;    // 21 - accumulator * memory -> accumulator
const REMAINDER = 34;   // 22 - accumulator % memory -> accumulator
const EXPONENT = 35;    // 23 - accumulator ^ memory -> accumulator
const BRANCH = 40;      // 28 - move to memory's location
const BRANCHNEG = 41;   // 29 - move to memory's location if accumulator is negative
const BRANCHZERO = 42;  // 2A - move to memory's location if accumulator is zero
const HALT = 43;        // 2B - stop program
const NEWLINE = 50;     // 32 - display a newline (CRLF) character
const DISPSTR = 55;     // 37 - display a string (same as WRITESTR?)

// misc
const ADDR_FORMAT = 4;  // the minimum and maximum display length of a memory address
const CODE_OFFSET = 256; // start program code at 0x0100.

// memory
const memory = new Array(MEMMAX);

console.log("Simpletron Machine Language");
console.log("Version 1.5");
console.log("Original concept by Deitel's 'Java How To Program, 5th Ed.'");
console.log("Converted to Javascript by Jumpspace Solutions");
console.log("Copyright (c) 2023 by Patrick Wong");

// initialize memory space
for (let counter = 0; counter < memory.length; counter++) {
    memory[counter] = "+0000";
}

console.log(".  .  . Memory initialized.");

//read source code file into memory
let rawCode = fs.readFileSync(prgFile, 'utf-8');
let sourceCode = JSON.parse(rawCode);

console.log("Reading file contents.  .  .");
// Assume JSON file is: { "sml": [ { "addr": "0100",  "code": "0A01" }, { "addr": "0101", "code": "0A02" } ... ] }

// populate memory space with instructions/code from file
for (var counter = 0; counter < sourceCode.sml.length; counter++) {
    var address = sourceCode.sml[counter].addr;
    var internalAddr = parseInt(address, HEXRDX);
    memory[internalAddr] = sourceCode.sml[counter].code;
}

console.log("Program loaded, executing.  .  .");

executeCode();

function executeCode() {
    'use strict';

    // Calculations
    let accumulator = 0;
    let accTemp = 0;

    // Operations
    let instCounter = CODE_OFFSET;    // instructions are now between memory locations 256 - 511 (0100 - 01FF)
    let instRegister = "";
    let operation = "";
    let operand = 0;
    let haltFlag = false;

    // Placement
    let inNum = "";
    let inStr = "";
    let left = "";
    let leftSide = "";
    let right = "";
    let rightSide = "";

    // Reading
    let readSuccess = false;

    // Writing
    //let taDisp = document.getElementById("taOutput");

    // String manipulation
    let counter = 0;
    let strSize = 0;
    let singleChar = "";
    let outputText = "";
    
    while (!haltFlag) {
        instRegister = memory[instCounter];
        operation = parseInt(instRegister.slice(0, 2), HEXRDX);
        operand = parseInt((instRegister.slice(2, 4)), HEXRDX);

        switch (operation) {
            case READ:        // Read integer from input
                // inNum = prompt("Enter an integer:");
                // TODO: use node.js methods to read integer
                inNum = getInput("Enter an integer: ");
                if (inNum != null && inNum != "" && !isNaN(parseInt(inNum, HEXRDX))) {
                    memory[operand] = parseInt(inNum).toString(HEXRDX).toUpperCase();
                    instCounter++;
                }
                else {
                    haltFlag = true;
                }
                break;
            case WRITE:       // Write integer to output
                // taDisp.value += parseInt(memory[operand], HEXRDX).toUpperCase().toString() + String.fromCharCode(13, 10);
                console.log(parseInt(memory[operand], HEXRDX).toUpperCase().toString());
                instCounter++;
                break;
            case WRITESTR:    // Write string to output
                strSize = parseInt(memory[operand].substring(0, 2), HEXRDX);
                singleChar = memory[operand].substring(2, 4);
                outputText = String.fromCharCode(parseInt(singleChar, HEXRDX));
                for (counter = operand + 1; counter <= (Math.trunc(strSize / 2) + (operand + 1)); counter++) {
                    singleChar = memory[counter].substring(0, 2);
                    outputText += String.fromCharCode(parseInt(singleChar, HEXRDX));
                    singleChar = memory[counter].substring(2, 4);
                    if (singleChar != "00") {
                        outputText += String.fromCharCode(parseInt(singleChar, HEXRDX));
                    }
                    else {
                        outputText += " ";
                    }
                }
                // taDisp.value += outputText;
                console.log(outputText);
                instCounter++;
                break;
            case READSTR:     // Read string from input
                // inStr = prompt("Enter your text:");
                // TODO: add a console prompt for string input
                inStr = getInput("Enter your text: ");
                if (inStr != null && inStr != "") {
                    leftSide = inStr.length.toString(HEXRDX).toUpperCase();
                    rightSide = inStr.charCodeAt(0).toString(HEXRDX).toUpperCase();
                    left = (leftSide.length < 2) ? "0" + leftSide : leftSide;
                    right = (rightSide.length < 2) ? "0" + rightSide : rightSide;
                    memory[operand++] = left + right;
                    for (counter = 1; counter < inStr.length; counter += 2) {
                        leftSide = inStr.charCodeAt(counter).toString(HEXRDX).toUpperCase();
                        rightSide = inStr.charCodeAt(counter + 1).toString(HEXRDX).toUpperCase();
                        if (isNaN(inStr.charCodeAt(counter + 1))) {
                            rightSide = "00";
                        }
                        left = (leftSide.length < 2) ? "0" + leftSide : leftSide;
                        right = (rightSide.length < 2) ? "0" + rightSide : rightSide;
                        memory[operand++] = left + right;
                    }
                    instCounter++;
                }
                else {
                    haltFlag = true;
                }
                break;
            case LOAD:        // Load value from memory to accumulator
                accumulator = parseInt(memory[operand], HEXRDX);
                instCounter++;
                break;
            case STORE:       // Store value from accumulator to memory
                memory[operand] = accumulator.toString(HEXRDX);
                instCounter++;
                break;
            case ADD:         // Add memory value to accumulator
                accumulator += parseInt(memory[operand], HEXRDX);
                instCounter++;
                break;
            case SUBTRACT:    // Subtract memory value from accumulator
                accumulator -= parseInt(memory[operand], HEXRDX);
                instCounter++;
                break;
            case DIVIDE:      // Divide accumulator by memory value
                if (memory[operand] != "00") {
                    accumulator /= parseInt(memory[operand], HEXRDX);
                    instCounter++;
                }
                else {
                    alert("ERROR: Division by Zero at address" + instCounter.toString(16));
                    haltFlag = true;
                }
                break;
            case MULTIPLY:    // Multiply accumulator by memory value
                accumulator *= parseInt(memory[operand], HEXRDX);
                instCounter++;
                break;
            case REMAINDER:   // Find the remainder of dividing accumulator by memory value
                accumulator %= parseInt(memory[operand], HEXRDX);
                instCounter++;
                break;
            case EXPONENT:    // Raise the accumulator by the power of memory value
                accTemp = accumulator;
                accumulator = Math.pow(accTemp, parseInt(memory[operand], HEXRDX));
                instCounter++;
                break;
            case BRANCH:      // Go to the instruction space indicated by the memory value
                instCounter = operand + CODE_OFFSET;
                console.log(instCounter);
                break;
            case BRANCHNEG:   // If accumulator is negative, go to the instruction space indicated by the memory value
                if (accumulator < 0) {
                    instCounter = operand + CODE_OFFSET;
                    console.log(instCounter);
                }
                else {
                    instCounter++;
                }
                break;
            case BRANCHZERO:  // If accumulator is zero, go to the instruction space indicated by the memory value
                if (accumulator == 0) {
                    instCounter = operand + CODE_OFFSET;
                    console.log(instCounter);
                }
                else {
                    instCounter++;
                }
                break;
            case NEWLINE:     // Display a newline/carriage return
                // taDisp.value += String.fromCharCode(13, 10);
                console.log("\n");
                instCounter++;
                break;
            // case DISPSTR:     // TODO: Code this to display a string from a memory address
                
                instCounter++;
                break;
            case HALT:        // End Program
                haltFlag = true;
                console.log("Program Ended.");
                break;
            default:          // Invalid Command
                haltFlag = true;
                console.log("Invalid command! Program Aborted.");
                break;
        }
    }

    //displayValues(instCounter, accumulator, instRegister, "");    
}

function getInput(promptText) {
    'use strict';

    let intValue = readline.question(promptText);
    return intValue;
}

/* function doTest() {
    console.log("Nothing to see here!");
} */

/* function memDump() {
    let memCell = 0;
    let memValue = "";
    let memTable = document.getElementById("mem-core");
    for (let memRow = 0; memRow < HEXRDX; memRow++) {
        let headerRow = memTable.insertRow();
        let headerCell = headerRow.insertCell();
        switch (memRow) {
            case 10:
                memValue = "A";
                break;
            case 11:
                memValue = "B";
                break;
            case 12:
                memValue = "C";
                break;
            case 13:
                memValue = "D";
                break;
            case 14:
                memValue = "E";
                break;
            case 15:
                memValue = "F";
                break;
            default:
                memValue = memRow.toString();
                break;
        }

        let textCell = document.createTextNode(memValue);
        headerCell.appendChild(textCell);
        for (let memCol = 0; memCol < HEXRDX * HEXRDX; memCol++) {
            let itemRow = headerRow.insertCell();
            let textValue = document.createTextNode(memory[memCell++]);
            itemRow.appendChild(textValue);
        }
    }
} */

/* function displayValues(instructionPtr, accumulator, instructionReg, disp) {
    'use strict';

    let acc, insPtr, lastIns, outputText;
    acc = document.getElementById("acc");
    insPtr = document.getElementById("ins-ptr");
    lastIns = document.getElementById("last-ins");
    outputText = document.getElementById("taOutput");

    lastIns.innerText = instructionReg;
    insPtr.innerText = instructionPtr;
    acc.innerText = accumulator;
    outputText.value += String.fromCharCode(13, 10) + disp;
} */

/* function setInstDisplay(memAddr) {
    'use strict';

    let nextAddr = "";
    let addrEntry = document.getElementById("addr");
    nextAddr = memAddr.toString(HEXRDX).toUpperCase();
    addrEntry.innerText = nextAddr.padStart(ADDR_FORMAT, "0");
} */

/* function doneCodeEntry() {
    'use strict';

    let codeIn = document.getElementById("codeInput").disabled = true;
    let nextBtn = document.getElementById("nextButton").disabled = true;
    let taDisp = document.getElementById("taOutput");
    taDisp.value += "----- Code Entry Complete! -----" + String.fromCharCode(13, 10);
    taDisp.value += "Mode: Execution" + String.fromCharCode(13, 10);
    executeCode();
} */

/* function parseInst() {
    'use strict';

    let instAddr = document.getElementById("addr");
    let instCounter = parseInt(instAddr.innerText, HEXRDX);
    let code = document.getElementById("codeInput");
    let currOp = document.getElementById("ins-ptr");
    let sign = document.getElementById("data-sign");
    let lastInst = document.getElementById("last-ins");

    let dataValue = code.value;
    if ((code.value)[0] == "+") {
        dataValue = (code.value).substring(1);
        sign.innerText = "+";
    }
    else if ((code.value)[0] == "-") {
        dataValue = (code.value).substring(1);
        sign.innerText = "-";
    }
    else {
        dataValue = code.value;
        sign.innerText = "";
    }

    if (parseInt(code.value, HEXRDX) < 65536) {
        let taAdd = document.getElementById("taOutput");
        taAdd.value += instAddr.innerText + " -> " + code.value + String.fromCharCode(13, 10);

        memory[instCounter] = dataValue;
        ++instCounter;
        setInstDisplay(instCounter);
    }
    currOp.innerText = dataValue.slice(0, 2);
    lastInst.innerText = dataValue;
    code.value = "";
} */
 
/*function init() {
    'use strict';

    if (document && document.getElementById) {
        for (let counter = 0; counter < memory.length; counter++) {
            memory[counter] = "+0000";
        }
        let intro = document.getElementById("taOutput");
        intro.value = "Simpletron Machine Language" + String.fromCharCode(13, 10);
        intro.value += "Version 1.5" + String.fromCharCode(13, 10);
        intro.value += "Original concept by Deitel's 'Java How To Program, 5th Ed.'" + String.fromCharCode(13, 10);
        intro.value += "Converted to Javascript by Jumpspace Solutions" + String.fromCharCode(13, 10);
        intro.value += "Copyright (c) 2023 by Patrick Wong" + String.fromCharCode(13, 10);
        intro.value += String.fromCharCode(13, 10);
        intro.value += "Mode: Data Entry" + String.fromCharCode(13, 10);

        setInstDisplay(256);
    }
}*/

// window.onload = init;