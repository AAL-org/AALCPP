//Load files
const fs = require('fs');

//Keep track of tokens
var tokens = [];

//Variables
var variables = [];

//Keep track of time between comp start & end
const { performance } = require('perf_hooks');
var startTime;

/** Start Program **/
(function() {
    fs.writeFileSync('./logFile', '');
    atl(`\n[+ ALC +] Started tokenization. (${Date.now()})\n`, true);
    startTime = performance.now();
    main("./input.aal");
})();

//Main function
function main(file_name) {
    var data = open_file(file_name);
    
    var tokens = lex(data);
    finish('tokenization');
    
    compile(tokens);
    
}

//Opening files
function open_file(path) {
    data = fs.readFileSync(path).toString();
    return data;
}

//Lexer
function lex(contents) {

    var states = {parentheses: 0, string: 0, comment: 0, name: 0, decloration: 0};
    var token = "";
    
    var string = "";
    var number = "";

    var decType = "";

    var newContents = "";

    /** Ignore Comments **/
    var lines = contents.split('\n');
    for(var i in lines) {

        if(lines[i].indexOf('/?') > -1) {
            newContents += lines[i].slice(0, lines[i].indexOf('/?'));
        } else {
            newContents += lines[i];
        }

        if(newContents) newContents += '\n';

    }
    
    //Set document contents to be document contents without comments
    contents = newContents;
    clearToken();

    atl(`\nLoaded File:\n${contents}`)

    for(var i in contents) {

        var char = contents[i];
        token += char;

        token = token.trim();


        atl(`\n\nChatacter [${i}]:\n\nChar:\n${char}\n\nToken:\n'${token}'\n\nTokens:\n[${tokens.join(' | ')}]\n\nStates:\n${JSON.stringify(states)}`);

        /** Variable Handler **/
        for(var i in variables) {
            if(token == variables[i].name) {
                tokens.push(`VAR(${variables[i].name})`);
                clearToken();
                continue;
            }            
        }

        /** Name Decloration **/
        if(states.name == 1) {
            if(char.match(/(\W)/g)) {

                if(char == " " && token == "") {
                    clearToken();
                    continue;
                }

                if(char == "(") token = token.slice(0, token.length -1);

                states.name = 0;
                token = token.trim();

                if(states.decloration == 1) {
                    variables.push({name: token, type: decType});
                    tokens.push(`VAR(${token})`)
                    decType = "";
                } else if(states.decloration == 0) {
                    tokens.push(`NAME(${token})`);
                }

                clearToken();

            } else {
                continue;
            }
        }

         /** String Handler **/
         if(states.string == 1 && char != "\"") {
            string += char;
            clearToken();

            continue;

        } else if (string.length > 0 && states.string == 0) {
            tokens.push(`STRING(${string})`)
            clearString();;
        }

        /** Number Handler **/
        if(char.match(/[0-9]/)) {
            number += char;
            continue;
            
        } else if(number != "") {

            if(char == ".") {
                number += "."
            } else {

                if(number.indexOf('.') > -1) tokens.push(`FLOAT(${number})`);
                else tokens.push(`INT(${number})`);

                clearToken();
                number = "";
        
            }

        }
        /** Detect Chunks **/
        switch (token) {
            
            case "print":
                tokens.push("PRINT");
                clearToken();
            break;

            case "fn": 
                decType = "FUNCTION";
                tokens.push("FUNCTION");
                clearToken();
                states.name = 1;
            break;

            case "int":
                decType = "INT";
                tokens.push("DECLORATION(int)");
                clearToken();
                states.name = 1;
                states.decloration = 1;
            break;

            case "str":
                decType = "STRING";
                tokens.push("DECLORATION(string)");
                clearToken();
                states.name = 1;
                states.decloration = 1;
            break;

            case "float":
                decType = "FLOAT";
                tokens.push("DECLORATION(float)");
                clearToken();
                states.name = 1;
                states.decloration = 1;
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
                        clearToken();
                    break;
                        
                    case ")":
                        states.parentheses--;
                        tokens.push(")");
                    break;

                    case ";":
                        tokens.push("END");
                        clearToken();
                    break;

                    case ":":
                        tokens.push("ASSIGN");
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
                        states.parentheses++;
                        tokens.push("{");
                        clearToken();
                        break;
                        
                    case "}":
                        states.parentheses--;
                        tokens.push("}");
                        clearToken();
                    break;

                }

            break;

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
            atl(`[+ ALC +] Process terminated successfully!`, true);
        break;

        case 1:
            atl(`[- ALC -] Eror: Unmatched braces.`, true);
        break;

        case 2:
            atl(`[- ALC -] Error: Another file is being compiled, please wait for that process to terminate.`, true);
        break;
    }

    process.exit(1);

}

//Compiler (Actually a transpiller but whatever)
function compile(instructions) {
    
    var cpi = "";
    var states = {waitingForBrackets: false, concat: false};

    atl(instructions);

    cpi += `#include <iostream>\nusing namespace std;\n`;
    
    startTime = performance.now();
    
    for(var i in instructions) {
                   
        if(i != 0) cpi += " ";
        var instruction = instructions[i];

        atl('\n\n' + 'STRUCT: ' + instructions[parseInt(i - 1)] + '\n');

        if(instruction == "FUNCTION") {
            
            if(instructions[parseInt(i + 1)] == "NAME(main)") { cpi += `int`; continue; }

            cpi += `void`;
            continue;
        }

        if(instruction == "PRINT") {
            
            cpi += `cout << `;
            states.concat = true;

            continue;
        }

        if(instruction.indexOf("DECLORATION(") == 0) {
            cpi += `${instruction.slice(12).slice(0, -1)}`;
            
            continue;
        }

        if(instruction.indexOf("STRING(") == 0) {
            
            var prefix = "", suffix = "";

            if(states.concat) { prefix = `string(`; suffix = `)`; }

            cpi += `${prefix}"${instruction.slice(7).slice(0, -1)}"${suffix}`;

            continue;
        }

        if(instruction.indexOf("INT(") == 0) {

            var prefix = "", suffix = "";

            if(states.concat) { prefix = `to_string(`; suffix = `)`; }

            cpi += `${prefix}${parseInt(instruction.slice(4).slice(0, -1))}${suffix}`;
            
            continue;
        }
 
        if(instruction.indexOf("FLOAT(") == 0) {

            var prefix = "", suffix = "";

            if(states.concat) { prefix = `to_string(`; suffix = `)`; }

            cpi += `${prefix}${parseFloat(instruction.slice(6).slice(0, -1))}${suffix}`;
            
            continue;
        }

        if(instruction == "ASSIGN") {
            cpi += "=";
            continue;  
        }

        if(instruction.indexOf("VAR(") == 0) {
            
            var prefix = "", suffix = "";

            var variable = getVar(instruction.slice(4).slice(0, -1));

            if(states.concat) {
                if(variable.type == "INT") cpi += `to_string(${instruction.slice(4).slice(0, -1)})`;
                if(variable.type == "FLOAT") cpi += `to_string(${instruction.slice(4).slice(0, -1)})`;
                if(variable.type == "STRING") cpi += `${instruction.slice(4).slice(0, -1)}`;
                
                continue;
            }
            
            cpi += `${prefix}${instruction.slice(4).slice(0, -1)}${suffix}`;

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

        if(instruction == "END") {
            cpi += ";"
            continue;
        }

        cpi = cpi.trim() + instruction;
        
        
}

    finish('transpilling.');

    fs.writeFileSync('./program.cpp', cpi);

    atl('\n[+ ALC +] Started compile.');
    startTime = performance.now();

    var child = require('child_process').exec(`g++ ${__dirname}/program.cpp`); 
    child.stdout.on('data', function(data) {
        atl(`[+ G++ > ALC +] ${data.toString()}`, true); 
    });

    finish("compile.");

    fs.unlinkSync('./program.cpp');

    process.exit(0);

}

//Log Finish!
function finish(task) {
    var finishTime = performance.now();
    atl(`[+ ALC +] Finished ${task}. (Took ~${Math.trunc((finishTime - startTime) * 100) / 100}ms)\n`, true);
}

//Log text to logfile
function atl(text, log) {
    fs.appendFileSync('./logFile', text);
    if(log === true) console.log(text);
}

function getVar(name) {
    for(var i in variables) {
        if(variables[i].name == name) return variables[i];
    }
    return false;
}