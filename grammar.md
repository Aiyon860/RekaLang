# EBNF grammar for a simple programming language

```ebnf
program       := { declaration } EOF ;

declaration   := varDecl | funcDecl | statement ;

varDecl       := ("var" | "const") IDENT ( "=" expression )? ";" ;
funcDecl      := "func" IDENT "(" parameters? ")" block ;
parameters    := IDENT { "," IDENT } ;

statement     := exprStmt | ifStmt | whileStmt | forStmt | block | returnStmt
               | breakStmt 
               | continueStmt ;
exprStmt      := expression ";" ;
ifStmt        := "if" "(" expression ")" statement ( "else" statement )? ;
whileStmt     := "while" "(" expression ")" statement ;
forStmt       := "for" "(" forInit expression? ";" expression? ")" statement ;
forInit       := varDecl | exprStmt | ";" ;
block         := "{" { declaration } "}" ;
returnStmt    := "return" expression? ";" ;
breakStmt     := "break" ";" ;
continueStmt  := "continue" ";" ;

expression    := assignment ;
assignment    := logicOr ( "=" assignment )? ;
logicOr       := logicAnd { "||" logicAnd } ;
logicAnd      := equality { "&&" equality } ;
equality      := comparison { ( "==" | "!=" ) comparison } ;
comparison    := term { ( "<" | "<=" | ">" | ">=" ) term } ;
term          := factor { ( "+" | "-" ) factor } ;
factor        := power { ( "*" | "/" | "%" ) power } ;
power         := unary { "**" unary } ;              // enforce right-assoc in parser
unary         := ( "!" | "-" ) unary | call ;
call          := primary { "(" args? ")" | "[" expression "]" | "." IDENT } ;
args          := expression { "," expression } ;

primary       := NUMBER | BIGINT | STRING | "true" | "false" | "null"
               | IDENT
               | "(" expression ")"
               | listLit | mapLit | setLit ;

listLit       := "[" [ expression { "," expression } ] "]" ;
mapLit        := "{" [ mapEntry { "," mapEntry } ] "}" ;
mapEntry      := (STRING | IDENT) ":" expression ;
setLit        := "#{" [ expression { "," expression } ] "}" ;
```
