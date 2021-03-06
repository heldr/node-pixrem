// Jasmine unit tests
// To run tests, run these commands from the project root:
// 1. `npm install -g jasmine-node`
// 2. `jasmine-node spec`

'use strict';
var fs = require('fs');
var pixrem = require('../lib/pixrem');
var css = '.rule { font-size: 2rem }';

describe('pixrem', function () {

  it('should generate fallbacks using default settings', function () {
    var expected = '.rule { font-size: 32px; font-size: 2rem }';
    var processed = pixrem.process(css);

    expect(processed).toBe(expected);
  });

  it('should generate fallbacks with a pixel root em value', function () {
    var expected = '.rule { font-size: 40px; font-size: 2rem }';
    var processed = pixrem.process(css, '20px');

    expect(processed).toBe(expected);
  });

  it('should generate fallbacks with a em root em value', function () {
    var expected = '.rule { font-size: 48px; font-size: 2rem }';
    var processed = pixrem.process(css, '1.5em');

    expect(processed).toBe(expected);
  });

  it('should generate fallbacks with a rem root em value', function () {
    var expected = '.rule { font-size: 56px; font-size: 2rem }';
    var processed = pixrem.process(css, '1.75rem');

    expect(processed).toBe(expected);
  });

  it('should generate fallbacks with a percent root em value', function () {
    var expected = '.rule { font-size: 48px; font-size: 2rem }';
    var processed = pixrem.process(css, '150%');

    expect(processed).toBe(expected);
  });

  it('should generate fallbacks with a unitless root em value', function () {
    var expected = '.rule { font-size: 36px; font-size: 2rem }';
    var processed = pixrem.process(css, '18');

    expect(processed).toBe(expected);
  });

  it('should replace rules with fallbacks when option.replace is true', function () {
    var expected = '.rule { font-size: 40px }';
    var processed = pixrem.process(css, '20px', { replace: true });

    expect(processed).toBe(expected);
  });

  it('should generate integer fallbacks, rounded down', function () {
    var expected = '.rule { font-size: 49px; font-size: 2rem }';
    var processed = pixrem.process(css, '155%');

    expect(processed).toBe(expected);
  });

  it('should handle < 1 values and values without a leading 0', function () {
    var css = '.rule { margin: 0.5rem .5rem 0rem -2rem }';
    var expected = '.rule { margin: 8px 8px 0px -32px; margin: 0.5rem .5rem 0rem -2rem }';
    var processed = pixrem.process(css);

    expect(processed).toBe(expected);
  });

  it('should generate default fallback with an inline sourcemap', function () {
    var expected = '.rule { font-size: 32px; font-size: 2rem }\n/*# sourceMappingURL=whatever.css.map */';
    var processed = pixrem.process(css, undefined, {}, {
      map: { 'inline': false },
      to: 'whatever.css'
    });
    expect(processed).toBe(expected);
  });

  it('should not convert rem in at-rules', function () {
    var css = '@media screen { .rule { font-size: 2rem } } @keyframes name { from { font-size: 2rem } }';
    var processed = pixrem.process(css);
    expect(processed).toBe(css);
  });

  it('should convert rem in at-rules if options is true', function () {
    var css = '@media screen { .rule { font-size: 2rem } }';
    var expected = '@media screen { .rule { font-size: 32px; font-size: 2rem } }';
    var processed = pixrem.process(css, undefined, { atrules: true });
    expect(processed).toBe(expected);
  });

  it('should not convert rem in nested at-rules', function () {
    var css = '@media screen { .rule { font-size: 2rem } @media screen { .rule { font-size: 2rem } @media screen { .rule { font-size: 2rem } } } }';
    var processed = pixrem.process(css);
    expect(processed).toBe(css);
  });

  it('should not convert rem in unsupported feature (value)', function () {
    var css = '.rule { width: calc(100% - 2rem); background: linear-gradient(red 2rem, blue) }';
    var processed = pixrem.process(css);
    expect(processed).toBe(css);
  });

  it('should not convert rem in unsupported feature (property)', function () {
    var css = '.rule { transform: translate(2rem) }';
    var processed = pixrem.process(css);
    expect(processed).toBe(css);
  });

  it('should not convert rem in unsupported feature (with prefixes)', function () {
    var css = '.rule { width: -webkit-calc(100% - 2rem); width: calc(100% - 2rem); -ms-transform: translate(2rem) }';
    var processed = pixrem.process(css);
    expect(processed).toBe(css);
  });

  it('should use default root font-size as defined in CSS', function () {
    var css = 'html { font-size: 62.5% } .rule { font-size: 2rem; }';
    var expected = 'html { font-size: 62.5% } .rule { font-size: 20px; font-size: 2rem; }';
    var processed = pixrem.process(css);
    expect(processed).toBe(expected);

    css = '.rule { font-size: 2rem; } :root { font: italic 100 20px/24px sans-serif }';
    expected = '.rule { font-size: 40px; font-size: 2rem; } :root { font: italic 100 20px/24px sans-serif }';
    processed = pixrem.process(css);
    expect(processed).toBe(expected);

  });

  it('should run through font shorthand without root size', function () {
    var css = 'html { font: inherit } .rule { font-size: 2rem; }';
    var expected = 'html { font: inherit } .rule { font-size: 32px; font-size: 2rem; }';
    var processed = pixrem.process(css);

    expect(processed).toBe(expected);
  });

});
