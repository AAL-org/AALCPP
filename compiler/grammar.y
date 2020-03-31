%{

    #include <math.h>
    #include <stdio.h>
    #include <stdlib.h>
    #include <iostream>

    #include "SyntaxTree/SyntaxTree.hpp"

    int yylex (void);
    void yyerror (char const *);

%}

%define api.value.type {void *}

%token FUNCTION NAME LEFT_BRACKET RIGHT_BRACKET LEFT_BRACE RIGHT_BRACE HEXADECIMAL_INTEGER OCTAL_INTEGER DENARY_INTEGER BINARY_INTEGER DENARY_FLOAT COLON SEMICOLON
%start input

%%

input:
    FUNCTION NAME LEFT_BRACKET RIGHT_BRACKET LEFT_BRACE statements RIGHT_BRACE
    | %empty

statements:
    statements statement            {}
    | %empty

statement:
    name SEMICOLON                  { std::cout << ""; }

name:
    NAME                            {}

%%

std::unique_ptr<compiler::SyntaxTree> root;

void yyerror (char const *x) {
    
    printf("Error %s\n", x);
    exit(1);

}
