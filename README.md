# AAL
**A**n **A**wful **L**anguage

---
## Why use AAL?
Dont. Just Dont.

---
## Syntax
`/?` For comments, one line at a time because fuck you. 
`fn <name>(args) {}` For functions. You must have a main function, it dosen't need any args. 
`int <name>, float <name> & str <name>` For variables. 
`""` Strings, not single quotes, those are for litterals. 
`0-9` Numbers. 
`:` Declare variables, e.g `int anAwfulVariable : 1;`

---
## Compiler
To compile your '.aal' program, run `node <path to aal compiler> <'.aal' input file>`;

---
## Features
 - Can't do constants. 
 - Can't do anything that isn't an int / string / float. 
 - Much, **Much** more! 

---
## Add more features.
no.

---
## How does it work?
1. Javascript reads your aal file, tokenizing it.
2. Those tokens are read by the **SAME FILE** making that process pointless.
3. The same file then converts those tokens into C++.
4. That C++ file is then compiled by node (if you have g++ installed).
5. The end.
