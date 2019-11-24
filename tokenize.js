//Load files
const fs = require('fs');

//Keep track of tokens
var tokens = [];

//Keep track of time between comp start & end
const { performance } = require('perf_hooks');
var startTime;

/** Start Program **/
(function() {
    console.log(`\n[+ PJC +] Started tokenization. (${Date.now()})\n`);
    startTime = performance.now();
    main("./test.pj");
})();

//Main function
function main(file_name) {
    var data = open_file(file_name);
    
    var tokens = lex(data);
    finish('tokenization');
    
    // if(fs.existsSync('./LOCKFILE')) error(2);
    // fs.writeFileSync('./LOCKFILE', tokens.join('\n'));
    
    compile(tokens);
    
}

//Opening files
function open_file(path) {
    data = fs.readFileSync(path).toString();
    return data;
}

//Lexer
function lex(contents) {
    var states = {parentheses: 0, string: 0, comment: 0, name: 0};
    var token = "";
    
    var string = "";
    var number = "";

    var newContents = "";

    /** Ignore Comments **/
    var lines = contents.split('\n');
    for(var i in lines) {

        if(lines[i].indexOf('?/') > -1) {
            newContents += lines[i].slice(0, lines[i].indexOf('?/'));
        } else {
            newContents += lines[i];
        }

        if(newContents) newContents += '\n';

    }

    //Set document contents to be document contents without comments
    contents = newContents;
    clearToken();

    for(var i in contents) {

        var char = contents[i];
        token += char;

        // console.log(tokens);

        /** Name Decloration **/
        if(states.name == 1) {
            if(char == " " || char == ";") {

                if(char == " " && token == " ") {
                    clearToken();
                    continue;
                }

                states.name = 0;
                tokens.push(`NAME(${token.slice(0, token.length - 1)})`);
                clearToken();
            }
        }

        token = token.trim();

        /** Detect Chunks **/
        switch (token) {
            
            case "print":
                tokens.push("PRINT");
            break;

            case "fn": 
                tokens.push("FUNCTION");
                clearToken();
                states.name = 1;
            break;

            default:

                /** Detect Symbols **/

                switch(char) {

                    case "\"":
                        if(states.string == 0) states.string = 1;
                        else if(states.string == 1) states.string = 0;
                    break;

                    case "(":
                        states.parentheses++;
                        tokens.push("(");
                    break;
                        
                    case ")":
                            states.parentheses--;
                            tokens.push(")");
                    break;

                    case "(":
                        states.parentheses++;
                        tokens.push("{");
                    break;
                        
                    case ")":
                            states.parentheses--;
                            tokens.push("}0");
                    break;

                    case ";":
                        tokens.push("END");
                        clearToken();
                    break;

                    case "/":
                        tokens.push("DIVIDE");
                        clearToken();
                    break;

                    case "*":
                        tokens.push("TIMES");
                        clearToken();
                    break;

                    case "+":
                        tokens.push("PLUS");
                        clearToken();
                    break;

                    case "-":
                        tokens.push("MINUS");
                        clearToken();
                    break;

                    case "{":
                        tokens.push('{');
                        clearToken();
                    break;

                    case "}":
                        tokens.push('}');
                        clearToken();
                    break;

                }

            break;

        }

        /** Number Handler **/
        if(char.match(/[0-9]/)) {
            number += char;
        } else if(number) {
            tokens.push(`INT(${number})`);
            number = "";
        }
        
        /** String Handler **/
        if(states.string == 1 && char != "\"") {
            string += char;
            clearToken();
        } else if (string.length > 0 && states.string == 0) {
            tokens.push(`STRING(${string})`)
            clearString();
        }

    }

    /* Document Read */

    //Catch unmatched braces
    if(states.parentheses != 0) error(1);

    function clearToken() {token = "";}
    function clearString() {string = "";}

    /* Return */
    return(tokens);

}

//Error thrower 
function error(error_id, args) {
    switch (error_id) {
        
        case 0:
            console.log(`[+ PJC +] Process terminated successfully!`);
        break;

        case 1:
            console.log(`[- PJC -] Error: Unmatched braces.`);
        break;

        case 2:
            console.log(`[- PJC -] Error: Another file is being compiled, please wait for that process to terminate.`);
        break;
    }

    console.log();
    process.exit(1);

}

//Compiler (Actually a transpiller but whatever)
function compile(instructions) {

    
    var cpi = "";
    var states = {waitingForBrackets: false};
    var brackets = [];

    cpi += `#include <iostream>\nusing namespace std;\n`;
    
    for(var i in instructions) {
            
        startTime = performance.now();
        
        if(i != 0) cpi += " ";
        var instruction = instructions[i];
        

        if(instruction == "FUNCTION") {
            
            if(instructions[parseInt(i + 1)] == "NAME(main)") { cpi += `int`; continue; }

            cpi += `void`;
            continue;
        }

        if(instruction == "PRINT") {
            cpi += `cout << `
            continue;
        }

        if(instruction.indexOf("STRING(") == 0) {
            cpi += `"${instruction.slice(7).slice(0, -1)}"`;
            continue;
        }

        if(instruction.indexOf("NAME(") == 0) {
            cpi += instruction.slice(5).slice(0, -1);
            continue;
        }

        if(instruction.indexOf("PLUS") == 0) {
            cpi += "+";
            continue;
        }

        if(instruction.indexOf("MINUS") == 0) {
            cpi += "-";
            continue;
        }

        if(instruction.indexOf("DIVIDE") == 0) {
            cpi += "/";
            continue;
        }

        if(instruction.indexOf("MULTIPLY") == 0) {
            cpi += "*";
            continue;
        }

        if(instruction.indexOf("INT(") == 0) {
            cpi += parseInt(instruction.slice(4).slice(0, -1));
            continue;
        }

        if(instruction == "(") {
            states.waitingForBrackets = true;
            cpi += "("
            brackets.push([]);
            continue;
        }

        if(instruction == "END") {
            cpi += ";"
            continue;
        }

        cpi += instruction;
        
}

console.log(instructions)
console.log(cpi);

finish('transpilling.');

fs.writeFileSync('./program.cpp', cpi);

var child = require('child_process').exec(`g++ ${__dirname}/program.cpp`); 
child.stdout.on('data', function(data) {
    console.log(`[+ G++ > PJC +] ${data.toString()}`); 
});

process.exit(0);

}

//Log Finish!
function finish(task) {
    var finishTime = performance.now();
    console.log(`[+ PJC +] Finished ${task}. (Took ~${Math.trunc((finishTime - startTime) * 100) / 100}ms)\n`);
}
