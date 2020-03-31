%code requires {

    #include <memory>

    #include "SyntaxTree/SyntaxTree.hpp"
}

%{

    #include <math.h>
    #include <stdio.h>
    #include <stdlib.h>
    #include <iostream>
    #include <memory>

    std::unique_ptr<compiler::SyntaxTree> root;

    #include "SyntaxTree/Includes.hpp"

    using namespace compiler;

    extern char *yytext;

    int yylex (void);
    void yyerror (char const *);

%}

%define api.value.type {compiler::SyntaxTree *}

%token FUNCTION NAME LEFT_BRACKET RIGHT_BRACKET LEFT_BRACE RIGHT_BRACE HEXADECIMAL_INTEGER OCTAL_INTEGER DENARY_INTEGER BINARY_INTEGER DENARY_FLOAT COLON SEMICOLON
%start input

%%

input:
    function function_list                                                      { root.reset($1, $2); }

function_list:
    function function_list                                                      { $$ = $1; }
    | %empty

function:
    FUNCTION NAME LEFT_BRACKET RIGHT_BRACKET LEFT_BRACE statements RIGHT_BRACE  { $$ = new compiler::Function($1, $5); }
    | %empty

statements:
    statements statement                                                        { $$ = new compiler::Statements($1, $2); }
    | %empty

statement:
    name SEMICOLON                                                              { $$ = new Statement($1); std::cout << "Created Statement\n"; }

name:
    NAME                                                                        { $$ = $1; }

%%

void yyerror (char const *x) {
    
    printf("Error %s\n", x);
    exit(1);

}
