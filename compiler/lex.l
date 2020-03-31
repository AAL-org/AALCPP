%option noyywrap

%{
    #include "grammar.tab.h"
    #include <stdio.h>
%}

/** Regex Identifiers **/

/* String Based */

digit                   [0-9]
letter                  [a-zA-z]
alphanumeric            {digit}|{letter}

uppercase               [A-Z]
lowercase               [a-z]

underscore              [_]

WS                      [ \r\t\v\n\f]
SP                      [u8|u|U|L]
ES                      (\\(['"\?\\abfnrtv]|[0-7]{1,3}|x[a-fA-F0-9]+))

string                  ({SP}?\"([^\\\n]|${ES}*\"{WS}*)+
function    ^({WS}*)fn
name        {letter}({digit}*{letter}*)+

/* Unsigned Integers */
hexadecimal_integer     0x({digit}|[a-f])+
octal_integer           0[0-9]+
denary_integer          [1-9][0-9]*
binary_integer          0b[01]+

/* Floats */
denary_float            {denary_integer}+\.${denary_integer}+

/* Bruh */
whitespace              [ \t\v\f\r]
linefeed                \n

%%

{hexadecimal_integer}   { return HEXADECIMAL_INTEGER; }
{octal_integer}         { return OCTAL_INTEGER;       }
{denary_integer}        { return DENARY_INTEGER;      }
{binary_integer}        { return BINARY_INTEGER;      }
{denary_float}          { return DENARY_FLOAT;        }

{function}              { return FUNCTION; }
{name}                  { yylval = nullptr; return NAME;     }

"("                     { return LEFT_BRACKET;  }
")"                     { return RIGHT_BRACKET; }
"{"                     { return LEFT_BRACE;    }
"}"                     { return RIGHT_BRACE;   }

":"                     { return COLON;      }
";"                     { return SEMICOLON; }

{whitespace}            
{linefeed}              yylineno++;

%%

#include <stdio.h>