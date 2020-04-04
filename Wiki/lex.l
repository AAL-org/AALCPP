%option noyywrap

%{
    #include "grammar.tab.h"
%}

/** Regex Identifiers **/

digit                   [0-9]
letter                  [a-zA-z]
alphanumeric            {digit}|{letter}

uppercase               [A-Z]
lowercase               [a-z]

underscore              [_]

WS                      [ \r\t\v\n\f]
SP      
ES                      (\\(['"\?\\abfnrtv]|[0-7]{1,3}|x[a-fA-F0-9]+))

string                  ({SP}?\"([^\\\n]|${ES}*\"{WS}*)+
name                    \w([0-9]\w)+
function                [{WS}fn ]

/* Unsigned Integers */
hexadecimal_integer     0x({digit}|[a-f])+
octal_integer           0[0-9]+
denary_integer          [1-9][0-9]*
binary_integer          0b[01]+

/* Floats */
denary_float            {denary_integer}+\.${denary_float}+

whitespace              [ \t\v\f\r]
linefeed                \n

%%

{hexadecimal_integer}   { printf("Hex integer: %s\n", yytext); return HEXADECIMAL_INTEGER;  }
{octal_integer}         { printf("Octal integer: %s\n", yytext); return OCTAL_INTEGER;      }
{denary_integer}        { printf("Denary integer: %s\n", yytext); return DENARY_INTEGER;    }
{binary_integer}        { printf("Binary integer: %s\n", yytext); return BINARY_INTEGER;    }

{denary_float}          { printf("Denary float: %s\n", yytext); return DENARY_FLOAT;        }

{name}                  { return NAME;      }
{function}              { return FUNCTION;  }


"++"                    { return DOUBLE_PLUS;  }
"--"                    { return DOUBLE_MINUS; }

"+"                     { return PLUS;          }
"-"                     { return MINUS;         }
"*"                     { return STAR;          }
"/"                     { return FORWARD_SLASH; }
"%"                     { return PERCENT;       }

"&"                     { return AMPERSAND;         }
"&&"                    { return DOUBLE_AMPERSAND;  }
"|"                     { return BAR;               }
"||"                    { return DUOBLE_BAR;        }

"^"                     { return CARET; }

">>"                    { return DOUBLE_RIGHT_CHEVRON;  }
"<<"                    { return DOUBLE_LEFT_CHEVRON;   }

":+"                    { return PLUS_EQUAL;            }
":-"                    { return MINUS_EQUAL;           }
":*"                    { return STAR_EQUAL;            }
":/"                    { return FORWARD_SLASH_EQUAL;   }
":%"                    { return PERCENT_EQUAL;         }

"("                     { return LEFT_BRACKET;  }
")"                     { return RIGHT_BRACKET; }
"{"                     { return LEFT_BRACE;    }
"}"                     { return RIGHT_BRACE;   }

{whitespace}            
{linefeed}              yylineno++

%%
