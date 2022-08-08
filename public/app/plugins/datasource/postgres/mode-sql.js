ace.define(
  'ace/mode/sql_highlight_rules',
  ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/text_highlight_rules'],
  function (require, exports, module) {
    'use strict';

    const oop = require('../lib/oop');
    const TextHighlightRules = require('./text_highlight_rules').TextHighlightRules;

    const SqlHighlightRules = function () {
      const keywords =
        'select|insert|update|delete|from|where|and|or|group|by|order|limit|offset|having|as|case|' +
        'when|else|end|type|left|right|join|on|outer|desc|asc|union|create|table|primary|key|if|' +
        'foreign|not|references|default|null|inner|cross|natural|database|drop|grant';

      const builtinConstants = 'true|false';

      const builtinFunctions =
        'avg|count|first|last|max|min|sum|upper|lower|substring|char_length|round|rank|now|' + 'coalesce';

      const dataTypes =
        'int|int2|int4|int8|numeric|decimal|date|varchar|char|bigint|float|bool|bytea|text|timestamp|' +
        'time|money|real|integer';

      const keywordMapper = this.createKeywordMapper(
        {
          'support.function': builtinFunctions,
          keyword: keywords,
          'constant.language': builtinConstants,
          'storage.type': dataTypes,
        },
        'identifier',
        true
      );

      this.$rules = {
        start: [
          {
            token: 'comment',
            regex: '--.*$',
          },
          {
            token: 'comment',
            start: '/\\*',
            end: '\\*/',
          },
          {
            token: 'string', // " string
            regex: '".*?"',
          },
          {
            token: 'string', // ' string
            regex: "'.*?'",
          },
          {
            token: 'constant.numeric', // float
            regex: '[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b',
          },
          {
            token: keywordMapper,
            regex: '[a-zA-Z_$][a-zA-Z0-9_$]*\\b',
          },
          {
            token: 'keyword.operator',
            regex: '\\+|\\-|\\/|\\/\\/|%|<@>|@>|<@|&|\\^|~|<|>|<=|=>|==|!=|<>|=',
          },
          {
            token: 'paren.lparen',
            regex: '[\\(]',
          },
          {
            token: 'paren.rparen',
            regex: '[\\)]',
          },
          {
            token: 'text',
            regex: '\\s+',
          },
        ],
      };
      this.normalizeRules();
    };

    oop.inherits(SqlHighlightRules, TextHighlightRules);

    exports.SqlHighlightRules = SqlHighlightRules;
  }
);

ace.define(
  'ace/mode/sql',
  ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/text', 'ace/mode/sql_highlight_rules'],
  function (require, exports, module) {
    'use strict';

    const oop = require('../lib/oop');
    const TextMode = require('./text').Mode;
    const SqlHighlightRules = require('./sql_highlight_rules').SqlHighlightRules;

    const Mode = function () {
      this.HighlightRules = SqlHighlightRules;
      this.$behaviour = this.$defaultBehaviour;
    };
    oop.inherits(Mode, TextMode);

    (function () {
      this.lineCommentStart = '--';

      this.$id = 'ace/mode/sql';
    }.call(Mode.prototype));

    exports.Mode = Mode;
  }
);
