#pragma once

#include "SyntaxTree.hpp"

namespace compiler {
    
    class Statements : public SyntaxTree {

        public:
            
            Statements(SyntaxTree *tree, SyntaxTree *othertree) {
                children.push_back(tree);
                children.push_back(othertree);
            }

            virtual ~Statements() {

            }

            virtual std::string toCode() const {
                
                std::string code;

                for(SyntaxTree *node : children) code += node -> toCode();

                return code;

            }

    };

}