/**
 * @file Violet grammar for tree-sitter
 * @license MIT
 *
 * Simple grammar capturing violet's keywords and built-in symbols.
 * User-defined operator templates are not interpreted — operator bodies
 * are just terms, and user operator symbols are tokenized as generic symbols.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  arrow: 1,
  app: 10,
  proj: 20,
};

module.exports = grammar({
  name: 'violet',

  extras: $ => [/[ \t\r\n]+/, $.comment],

  word: $ => $.identifier,

  conflicts: $ => [
    [$.qualified_name, $.implicit_binder],
    [$.qualified_name, $.explicit_binder],
  ],

  rules: {
    source_file: $ => seq(
      repeat($.import_decl),
      repeat($.export_decl),
      repeat($._top_decl),
    ),

    comment: _ => token(seq('#', /[^\n]*/)),

    // ---------------- Top-level declarations ----------------

    import_decl: $ => seq('\\import', field('path', $.qualified_name)),

    export_decl: $ => seq('\\export', repeat1($.identifier)),

    universe_decl: $ => seq('\\universe', repeat1($.identifier)),

    _top_decl: $ => choice(
      $.let_decl,
      $.data_decl,
      $.record_decl,
      $.universe_decl,
      $.operator_decl,
    ),

    let_decl: $ => seq(
      '\\let',
      field('name', $.identifier),
      repeat($._binder),
      ':',
      field('signature', $._term),
      choice(
        seq('=>', field('body', $._term)),
        $.where_block,
      ),
    ),

    where_block: $ => seq(
      '\\where',
      repeat($.open_clause),
      optional(choice(
        $.elim_header,
        repeat1($.stack_move),
      )),
      repeat($.clause),
    ),

    open_clause: $ => seq('\\open', $.identifier),

    elim_header: $ => seq(
      field('head', $.identifier),
      repeat($._intro_atom),
      '<=',
      '\\elim',
      field('target', $.identifier),
    ),

    _intro_atom: $ => choice(
      $.identifier,
      seq('{', $.identifier, '}'),
    ),

    stack_move: _ => seq('<=', choice('\\intro', '\\split')),

    clause: $ => seq(
      '|',
      field('head', $.identifier),
      repeat($._pattern),
      '=>',
      field('body', $._term),
    ),

    _pattern: $ => choice(
      $.identifier,
      $.con_pattern,
      $.imp_var_pattern,
      $.record_pattern,
    ),

    con_pattern: $ => seq('(', $.identifier, repeat($.identifier), ')'),
    imp_var_pattern: $ => seq('{', $.identifier, '}'),

    record_pattern: $ => seq(
      '{',
      $.identifier, '=', $._pattern,
      repeat(seq(',', $.identifier, '=', $._pattern)),
      '}',
    ),

    data_decl: $ => seq(
      '\\data',
      field('name', $.identifier),
      repeat($._binder),
      ':',
      field('signature', $._term),
      repeat($.constructor),
    ),

    record_decl: $ => seq(
      '\\record',
      field('name', $.identifier),
      repeat($._binder),
      ':',
      field('signature', $._term),
      repeat($.field_decl),
    ),

    constructor: $ => seq(
      '|',
      field('name', $.identifier),
      ':',
      field('type', $._term),
    ),

    field_decl: $ => seq(
      '|',
      field('name', $.identifier),
      ':',
      field('type', $._term),
    ),

    _binder: $ => choice($.explicit_binder, $.implicit_binder),

    explicit_binder: $ => seq('(', repeat1($.identifier), ':', $._term, ')'),
    implicit_binder: $ => seq('{', repeat1($.identifier), ':', $._term, '}'),

    operator_decl: $ => seq(
      '\\operator',
      field('template', $.string),
      '=>',
      field('body', $._term),
      repeat($.operator_option),
    ),

    operator_option: $ => choice(
      $.option_stronger_than,
      $.option_weaker_than,
      $.option_same_as,
      $.option_associativity,
    ),

    option_stronger_than: $ => seq('\\stronger_than', ':', $._op_name_path),
    option_weaker_than: $ => seq('\\weaker_than', ':', $._op_name_path),
    option_same_as: $ => seq('\\same_as', ':', $._op_name_path),
    option_associativity: $ => seq('\\associativity', ':', $.associativity),

    associativity: _ => choice('\\left', '\\right', '\\none'),

    _op_name_path: $ => repeat1(choice($.identifier, $.symbol)),

    // ---------------- Terms ----------------

    _term: $ => choice(
      $.pi_type,
      $.implicit_pi,
      $._spine,
    ),

    pi_type: $ => prec.right(PREC.arrow, seq(
      choice($.explicit_binder, $._spine),
      '->',
      $._term,
    )),

    implicit_pi: $ => prec.right(PREC.arrow, seq(
      $.implicit_binder,
      '->',
      $._term,
    )),

    _spine: $ => prec.left(PREC.app, seq(
      $._spine_item,
      repeat($._spine_item),
    )),

    _spine_item: $ => choice(
      $.projection,
      $.qualified_name,
      $.atom,
      $.symbol,
      $.universe_join,
    ),

    universe_join: _ => '⊔',

    projection: $ => prec(PREC.proj, seq(
      field('base', choice($.qualified_name, $.atom)),
      repeat1(seq('.', field('field', $.identifier))),
    )),

    atom: $ => choice(
      $.parens_term,
      $.lambda,
      $.hole,
      $.record_literal,
      $.record_update,
      $.string,
    ),

    parens_term: $ => seq('(', $._term, ')'),

    lambda: $ => prec.right(seq(
      '\\',
      repeat1(choice($.identifier, $._binder)),
      '->',
      $._term,
    )),

    hole: $ => prec.right(choice('?', seq('?', $.identifier))),

    record_literal: $ => seq(
      '{',
      optional(seq(
        $._record_entry,
        repeat(seq(',', $._record_entry)),
      )),
      '}',
    ),

    record_update: $ => seq(
      '{',
      field('base', $._term),
      '|',
      optional(seq(
        $._record_entry,
        repeat(seq(',', $._record_entry)),
      )),
      '}',
    ),

    _record_entry: $ => choice(
      seq($.identifier, '=', $._term),
      $.identifier,
    ),

    qualified_name: $ => seq($.identifier, repeat(seq('/', $.identifier))),

    // ---------------- Tokens ----------------

    identifier: _ => /[a-zA-ZÀ-ɏͰ-Ͽ℀-⅏\u{1D400}-\u{1D7FF}][a-zA-Z0-9_\-À-ɏͰ-Ͽ℀-⅏\u{1D400}-\u{1D7FF}]*/u,

    // Generic symbol token. We exclude `,`, `/`, `?`, `:`, `.` because they
    // carry structural meaning in this grammar. `=` is included so user
    // operators like `~x = ~y` tokenize correctly; reserved multi-char
    // sequences (`->`, `<=`, `=>`) win by longest-match.
    symbol: _ => token(prec(-1, /[+\-*<>=!&^%@$]+/)),

    string: _ => /"[^"\n]*"/,
  }
});
