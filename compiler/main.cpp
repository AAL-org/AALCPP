#include <iostream>

extern int yyparse();
extern int yylineno;

int main() {

    int result = yyparse();
    
    if (result == 0) std::cout << "[+] The input is valid." << std::endl;
    else             std::cout << "[-] The input is invalid." << std::endl;

    std::cout << "[~] Parsed " << yylineno << " lines." << std::endl;

    return result;

}