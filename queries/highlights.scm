; Keywords (\import, \let, \data, \record, \where, \elim, etc.)
[
  "\\import"
  "\\export"
  "\\universe"
  "\\let"
  "\\data"
  "\\record"
  "\\operator"
  "\\where"
  "\\open"
  "\\elim"
  "\\intro"
  "\\split"
  "\\stronger_than"
  "\\weaker_than"
  "\\same_as"
  "\\associativity"
] @keyword

(associativity) @keyword

; Lambda backslash
"\\" @keyword.function

; Punctuation / operators
[
  "->"
  "<="
  "=>"
] @operator

(symbol) @operator
(universe_join) @operator

[ ":" "|" "/" "." "?" "=" "," ] @punctuation.delimiter
[ "(" ")" "{" "}" ] @punctuation.bracket

; Comments and strings
(comment) @comment
(string) @string

; Holes
(hole) @variable.builtin

; Top-level declarations
(import_decl path: (qualified_name) @module)

(export_decl (identifier) @function)

(universe_decl (identifier) @type)

(let_decl name: (identifier) @function)

(data_decl name: (identifier) @type)
(constructor name: (identifier) @constructor)

(record_decl name: (identifier) @type)
(field_decl name: (identifier) @property)

(operator_decl template: (string) @string.special)

; Binders
(explicit_binder (identifier) @variable.parameter)
(implicit_binder (identifier) @variable.parameter)

; Clauses
(clause head: (identifier) @function)
(elim_header head: (identifier) @function)
(elim_header target: (identifier) @variable)

; Patterns
(con_pattern (identifier) @constructor (identifier)* @variable)
(imp_var_pattern (identifier) @variable)
(record_pattern (identifier) @property)

; Projection field
(projection field: (identifier) @property)

; Qualified names: the leading segments are module/type prefixes,
; the last segment is the bound name.
(qualified_name (identifier) @variable)
