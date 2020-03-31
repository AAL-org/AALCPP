#pragma once

#include <vector>
#include <string>
#include <memory>

namespace compiler {
    
    class SyntaxTree {

        public:
            
            SyntaxTree() = default;
            virtual ~SyntaxTree() = default;
        
            virtual std::string toCode() const = 0;

        protected:

            std::vector<std::unique_ptr<SyntaxTree>>
                children;

    };

}