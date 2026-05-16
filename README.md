# tree-sitter-violet

A [tree-sitter](https://tree-sitter.github.io/) grammar for the
[violet](https://github.com/dannypsnl/violet) dependently-typed language.

This is a **simple** grammar: it recognises violet's keywords, built-in
symbols, and the structure of top-level declarations (`\let`, `\data`,
`\record`, `\operator`, …). User-defined operator templates inside
`\operator "..."` are kept as opaque strings; user operator tokens like
`+`, `*`, `<*>` are tokenised as a generic `symbol` node, not interpreted.

## Usage

```sh
npm install
npx tree-sitter generate
npx tree-sitter test
npx tree-sitter parse path/to/file.vt
```

## What the grammar knows about

**Keywords**

`\import`, `\export`, `\universe`, `\let`, `\data`, `\record`, `\operator`,
`\where`, `\open`, `\elim`, `\intro`, `\split`, `\stronger_than`,
`\weaker_than`, `\same_as`, `\associativity`, `\left`, `\right`, `\none`,
and the bare `\` lambda.

**Reserved punctuation**

`->`, `<=`, `=>`, `:`, `/`, `|`, `⊔`, `(`, `)`, `{`, `}`, `?`, `.`, `=`, `,`.

**Top-level declarations**

`\import`, `\export`, `\universe`, `\let`, `\data`, `\record`, `\operator`.

**Term forms**

Pi types, lambdas (typed and untyped), application spines, holes (`?` /
`?name`), record literals, record updates, record-pattern punning,
projection chains (`r.x.y`), qualified names (`Nat/suc`), and the
universe join `⊔`.

**Not modelled**

User operator templates inside `\operator "..."` are left as a single
string node; the surrounding parser does not attempt to interpret the
template or apply user-declared precedence to subsequent terms.
