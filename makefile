all:
	$(MAKE) grammar
	$(MAKE)	lex
	
	g++ -std=c++11 -Wextra compiler/grammar.tab.c compiler/lex.yy.c compiler/main.cpp -o compiler.out
	mv compiler.out bin/

grammar:
	bison -d compiler/grammar.y
	mv grammar.tab.* compiler/

lex:
	flex compiler/lex.l
	mv lex.yy.* compiler/

run:
	$(MAKE) all
	./bin/compiler.out < test/main.aal