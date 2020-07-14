(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["static\\development\\pages\\blog\\[title].js"],{

/***/ "./node_modules/html-dom-parser/lib/constants.js":
/*!*******************************************************!*\
  !*** ./node_modules/html-dom-parser/lib/constants.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * SVG elements are case-sensitive.
 *
 * @see {@link https://developer.mozilla.org/docs/Web/SVG/Element#SVG_elements_A_to_Z}
 */
var CASE_SENSITIVE_TAG_NAMES = [
  'animateMotion',
  'animateTransform',
  'clipPath',
  'feBlend',
  'feColorMatrix',
  'feComponentTransfer',
  'feComposite',
  'feConvolveMatrix',
  'feDiffuseLighting',
  'feDisplacementMap',
  'feDropShadow',
  'feFlood',
  'feFuncA',
  'feFuncB',
  'feFuncG',
  'feFuncR',
  'feGaussainBlur',
  'feImage',
  'feMerge',
  'feMergeNode',
  'feMorphology',
  'feOffset',
  'fePointLight',
  'feSpecularLighting',
  'feSpotLight',
  'feTile',
  'feTurbulence',
  'foreignObject',
  'linearGradient',
  'radialGradient',
  'textPath'
];

module.exports = {
  CASE_SENSITIVE_TAG_NAMES: CASE_SENSITIVE_TAG_NAMES
};


/***/ }),

/***/ "./node_modules/html-dom-parser/lib/domparser.js":
/*!*******************************************************!*\
  !*** ./node_modules/html-dom-parser/lib/domparser.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var utilities = __webpack_require__(/*! ./utilities */ "./node_modules/html-dom-parser/lib/utilities.js");

// constants
var HTML = 'html';
var HEAD = 'head';
var BODY = 'body';
var FIRST_TAG_REGEX = /<([a-zA-Z]+[0-9]?)/; // e.g., <h1>
var HEAD_TAG_REGEX = /<head.*>/i;
var BODY_TAG_REGEX = /<body.*>/i;
// http://www.w3.org/TR/html/syntax.html#void-elements
var VOID_ELEMENTS_REGEX = /<(area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)(.*?)\/?>/gi;

// detect IE browser
var isIE9 = utilities.isIE(9);
var isIE = isIE9 || utilities.isIE();

// falls back to `parseFromString` if `createHTMLDocument` cannot be used
var parseFromDocument = function () {
  throw new Error(
    'This browser does not support `document.implementation.createHTMLDocument`'
  );
};

var parseFromString = function () {
  throw new Error(
    'This browser does not support `DOMParser.prototype.parseFromString`'
  );
};

/**
 * DOMParser (performance: slow).
 *
 * @see https://developer.mozilla.org/docs/Web/API/DOMParser#Parsing_an_SVG_or_HTML_document
 */
if (typeof window.DOMParser === 'function') {
  var domParser = new window.DOMParser();

  // IE9 does not support 'text/html' MIME type
  // https://msdn.microsoft.com/en-us/library/ff975278(v=vs.85).aspx
  var mimeType = isIE9 ? 'text/xml' : 'text/html';

  /**
   * Creates an HTML document using `DOMParser.parseFromString`.
   *
   * @param  {string} html      - The HTML string.
   * @param  {string} [tagName] - The element to render the HTML (with 'body' as fallback).
   * @return {HTMLDocument}
   */
  parseFromString = function (html, tagName) {
    if (tagName) {
      html = '<' + tagName + '>' + html + '</' + tagName + '>';
    }

    // because IE9 only supports MIME type 'text/xml', void elements need to be self-closed
    if (isIE9) {
      html = html.replace(VOID_ELEMENTS_REGEX, '<$1$2$3/>');
    }

    return domParser.parseFromString(html, mimeType);
  };

  parseFromDocument = parseFromString;
}

/**
 * DOMImplementation (performance: fair).
 *
 * @see https://developer.mozilla.org/docs/Web/API/DOMImplementation/createHTMLDocument
 */
if (document.implementation) {
  // title parameter is required in IE
  // https://msdn.microsoft.com/en-us/library/ff975457(v=vs.85).aspx
  var doc = document.implementation.createHTMLDocument(
    isIE ? 'html-dom-parser' : undefined
  );

  /**
   * Use HTML document created by `document.implementation.createHTMLDocument`.
   *
   * @param  {string} html      - The HTML string.
   * @param  {string} [tagName] - The element to render the HTML (with 'body' as fallback).
   * @return {HTMLDocument}
   */
  parseFromDocument = function (html, tagName) {
    if (tagName) {
      doc.documentElement.getElementsByTagName(tagName)[0].innerHTML = html;
      return doc;
    }

    try {
      doc.documentElement.innerHTML = html;
      return doc;
      // fallback when certain elements in `documentElement` are read-only (IE9)
    } catch (err) {
      if (parseFromString) {
        return parseFromString(html);
      }
    }
  };
}

/**
 * Template (performance: fast).
 *
 * @see https://developer.mozilla.org/docs/Web/HTML/Element/template
 */
var template = document.createElement('template');
var parseFromTemplate;

if (template.content) {
  /**
   * Uses a template element (content fragment) to parse HTML.
   *
   * @param  {string} html - The HTML string.
   * @return {NodeList}
   */
  parseFromTemplate = function (html) {
    template.innerHTML = html;
    return template.content.childNodes;
  };
}

/**
 * Parses HTML string to DOM nodes.
 *
 * @param  {string} html - The HTML string.
 * @return {NodeList|Array}
 */
function domparser(html) {
  var firstTagName;
  var match = html.match(FIRST_TAG_REGEX);

  if (match && match[1]) {
    firstTagName = match[1].toLowerCase();
  }

  var doc;
  var element;
  var elements;

  switch (firstTagName) {
    case HTML:
      doc = parseFromString(html);

      // the created document may come with filler head/body elements,
      // so make sure to remove them if they don't actually exist
      if (!HEAD_TAG_REGEX.test(html)) {
        element = doc.getElementsByTagName(HEAD)[0];
        if (element) {
          element.parentNode.removeChild(element);
        }
      }

      if (!BODY_TAG_REGEX.test(html)) {
        element = doc.getElementsByTagName(BODY)[0];
        if (element) {
          element.parentNode.removeChild(element);
        }
      }

      return doc.getElementsByTagName(HTML);

    case HEAD:
    case BODY:
      elements = parseFromDocument(html).getElementsByTagName(firstTagName);

      // if there's a sibling element, then return both elements
      if (BODY_TAG_REGEX.test(html) && HEAD_TAG_REGEX.test(html)) {
        return elements[0].parentNode.childNodes;
      }
      return elements;

    // low-level tag or text
    default:
      if (parseFromTemplate) {
        return parseFromTemplate(html);
      }

      return parseFromDocument(html, BODY).getElementsByTagName(BODY)[0]
        .childNodes;
  }
}

module.exports = domparser;


/***/ }),

/***/ "./node_modules/html-dom-parser/lib/html-to-dom-client.js":
/*!****************************************************************!*\
  !*** ./node_modules/html-dom-parser/lib/html-to-dom-client.js ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var domparser = __webpack_require__(/*! ./domparser */ "./node_modules/html-dom-parser/lib/domparser.js");
var utilities = __webpack_require__(/*! ./utilities */ "./node_modules/html-dom-parser/lib/utilities.js");

var formatDOM = utilities.formatDOM;
var isIE9 = utilities.isIE(9);

var DIRECTIVE_REGEX = /<(![a-zA-Z\s]+)>/; // e.g., <!doctype html>

/**
 * Parses HTML and reformats DOM nodes output.
 *
 * @param  {String} html - The HTML string.
 * @return {Array}       - The formatted DOM nodes.
 */
function parseDOM(html) {
  if (typeof html !== 'string') {
    throw new TypeError('First argument must be a string');
  }

  if (!html) {
    return [];
  }

  // match directive
  var match = html.match(DIRECTIVE_REGEX);
  var directive;

  if (match && match[1]) {
    directive = match[1];

    // remove directive in IE9 because DOMParser uses
    // MIME type 'text/xml' instead of 'text/html'
    if (isIE9) {
      html = html.replace(match[0], '');
    }
  }

  return formatDOM(domparser(html), null, directive);
}

module.exports = parseDOM;


/***/ }),

/***/ "./node_modules/html-dom-parser/lib/utilities.js":
/*!*******************************************************!*\
  !*** ./node_modules/html-dom-parser/lib/utilities.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var CASE_SENSITIVE_TAG_NAMES = __webpack_require__(/*! ./constants */ "./node_modules/html-dom-parser/lib/constants.js").CASE_SENSITIVE_TAG_NAMES;

var caseSensitiveTagNamesMap = {};
var tagName;
for (var i = 0, len = CASE_SENSITIVE_TAG_NAMES.length; i < len; i++) {
  tagName = CASE_SENSITIVE_TAG_NAMES[i];
  caseSensitiveTagNamesMap[tagName.toLowerCase()] = tagName;
}

/**
 * Gets case-sensitive tag name.
 *
 * @param  {String}           tagName - The lowercase tag name.
 * @return {String|undefined}
 */
function getCaseSensitiveTagName(tagName) {
  return caseSensitiveTagNamesMap[tagName];
}

/**
 * Formats DOM attributes to a hash map.
 *
 * @param  {NamedNodeMap} attributes - The list of attributes.
 * @return {Object}                  - A map of attribute name to value.
 */
function formatAttributes(attributes) {
  var result = {};
  var attribute;
  // `NamedNodeMap` is array-like
  for (var i = 0, len = attributes.length; i < len; i++) {
    attribute = attributes[i];
    result[attribute.name] = attribute.value;
  }
  return result;
}

/**
 * Corrects the tag name if it is case-sensitive (SVG).
 * Otherwise, returns the lowercase tag name (HTML).
 *
 * @param  {String} tagName - The lowercase tag name.
 * @return {String}         - The formatted tag name.
 */
function formatTagName(tagName) {
  tagName = tagName.toLowerCase();
  var caseSensitiveTagName = getCaseSensitiveTagName(tagName);
  if (caseSensitiveTagName) {
    return caseSensitiveTagName;
  }
  return tagName;
}

/**
 * Formats the browser DOM nodes to mimic the output of `htmlparser2.parseDOM()`.
 *
 * @param  {NodeList} nodes        - The DOM nodes.
 * @param  {Object}   [parentObj]  - The formatted parent node.
 * @param  {String}   [directive]  - The directive.
 * @return {Object[]}              - The formatted DOM object.
 */
function formatDOM(nodes, parentObj, directive) {
  parentObj = parentObj || null;

  var result = [];
  var node;
  var prevNode;
  var nodeObj;

  // `NodeList` is array-like
  for (var i = 0, len = nodes.length; i < len; i++) {
    node = nodes[i];
    // reset
    nodeObj = {
      next: null,
      prev: result[i - 1] || null,
      parent: parentObj
    };

    // set the next node for the previous node (if applicable)
    prevNode = result[i - 1];
    if (prevNode) {
      prevNode.next = nodeObj;
    }

    // set the node name if it's not "#text" or "#comment"
    // e.g., "div"
    if (node.nodeName[0] !== '#') {
      nodeObj.name = formatTagName(node.nodeName);
      // also, nodes of type "tag" have "attribs"
      nodeObj.attribs = {}; // default
      if (node.attributes && node.attributes.length) {
        nodeObj.attribs = formatAttributes(node.attributes);
      }
    }

    // set the node type
    // e.g., "tag"
    switch (node.nodeType) {
      // 1 = element
      case 1:
        if (nodeObj.name === 'script' || nodeObj.name === 'style') {
          nodeObj.type = nodeObj.name;
        } else {
          nodeObj.type = 'tag';
        }
        // recursively format the children
        nodeObj.children = formatDOM(node.childNodes, nodeObj);
        break;
      // 2 = attribute
      // 3 = text
      case 3:
        nodeObj.type = 'text';
        nodeObj.data = node.nodeValue;
        break;
      // 8 = comment
      case 8:
        nodeObj.type = 'comment';
        nodeObj.data = node.nodeValue;
        break;
    }

    result.push(nodeObj);
  }

  if (directive) {
    result.unshift({
      name: directive.substring(0, directive.indexOf(' ')).toLowerCase(),
      data: directive,
      type: 'directive',
      next: result[0] ? result[0] : null,
      prev: null,
      parent: parentObj
    });

    if (result[1]) {
      result[1].prev = result[0];
    }
  }

  return result;
}

/**
 * Detects IE with or without version.
 *
 * @param  {Number}  [version] - The IE version to detect.
 * @return {Boolean}           - Whether IE or the version has been detected.
 */
function isIE(version) {
  if (version) {
    return document.documentMode === version;
  }
  return /(MSIE |Trident\/|Edge\/)/.test(navigator.userAgent);
}

module.exports = {
  formatAttributes: formatAttributes,
  formatDOM: formatDOM,
  isIE: isIE
};


/***/ }),

/***/ "./node_modules/html-react-parser/index.js":
/*!*************************************************!*\
  !*** ./node_modules/html-react-parser/index.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var domToReact = __webpack_require__(/*! ./lib/dom-to-react */ "./node_modules/html-react-parser/lib/dom-to-react.js");
var htmlToDOM = __webpack_require__(/*! html-dom-parser */ "./node_modules/html-dom-parser/lib/html-to-dom-client.js");

// decode HTML entities by default for `htmlparser2`
var domParserOptions = { decodeEntities: true, lowerCaseAttributeNames: false };

/**
 * Converts HTML string to React elements.
 *
 * @param  {String}   html                    - HTML string.
 * @param  {Object}   [options]               - Parser options.
 * @param  {Object}   [options.htmlparser2]   - htmlparser2 options.
 * @param  {Object}   [options.library]       - Library for React, Preact, etc.
 * @param  {Function} [options.replace]       - Replace method.
 * @return {JSX.Element|JSX.Element[]|String} - React element(s), empty array, or string.
 */
function HTMLReactParser(html, options) {
  if (typeof html !== 'string') {
    throw new TypeError('First argument must be a string');
  }
  if (html === '') {
    return [];
  }
  options = options || {};
  return domToReact(
    htmlToDOM(html, options.htmlparser2 || domParserOptions),
    options
  );
}

HTMLReactParser.domToReact = domToReact;
HTMLReactParser.htmlToDOM = htmlToDOM;

// support CommonJS and ES Modules
module.exports = HTMLReactParser;
module.exports.default = HTMLReactParser;


/***/ }),

/***/ "./node_modules/html-react-parser/lib/attributes-to-props.js":
/*!*******************************************************************!*\
  !*** ./node_modules/html-react-parser/lib/attributes-to-props.js ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var reactProperty = __webpack_require__(/*! react-property */ "./node_modules/react-property/index.js");
var styleToObject = __webpack_require__(/*! style-to-object */ "./node_modules/style-to-object/index.js");
var utilities = __webpack_require__(/*! ./utilities */ "./node_modules/html-react-parser/lib/utilities.js");

var camelCase = utilities.camelCase;

var htmlProperties = reactProperty.html;
var svgProperties = reactProperty.svg;
var isCustomAttribute = reactProperty.isCustomAttribute;

var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Converts HTML/SVG DOM attributes to React props.
 *
 * @param  {Object} [attributes={}] - The HTML/SVG DOM attributes.
 * @return {Object}                 - The React props.
 */
function attributesToProps(attributes) {
  attributes = attributes || {};

  var attributeName;
  var attributeNameLowerCased;
  var attributeValue;
  var property;
  var props = {};

  for (attributeName in attributes) {
    attributeValue = attributes[attributeName];

    // ARIA (aria-*) or custom data (data-*) attribute
    if (isCustomAttribute(attributeName)) {
      props[attributeName] = attributeValue;
      continue;
    }

    // convert HTML attribute to React prop
    attributeNameLowerCased = attributeName.toLowerCase();
    if (hasOwnProperty.call(htmlProperties, attributeNameLowerCased)) {
      property = htmlProperties[attributeNameLowerCased];
      props[property.propertyName] =
        property.hasBooleanValue ||
        (property.hasOverloadedBooleanValue && !attributeValue)
          ? true
          : attributeValue;
      continue;
    }

    // convert SVG attribute to React prop
    if (hasOwnProperty.call(svgProperties, attributeName)) {
      property = svgProperties[attributeName];
      props[property.propertyName] = attributeValue;
      continue;
    }

    // preserve custom attribute if React >=16
    if (utilities.PRESERVE_CUSTOM_ATTRIBUTES) {
      props[attributeName] = attributeValue;
    }
  }

  // convert inline style to object
  if (attributes.style != null) {
    props.style = cssToJs(attributes.style);
  }

  return props;
}

/**
 * Converts inline CSS style to POJO (Plain Old JavaScript Object).
 *
 * @param  {String} style - The inline CSS style.
 * @return {Object}       - The style object.
 */
function cssToJs(style) {
  var styleObject = {};

  if (style) {
    styleToObject(style, function (property, value) {
      // skip CSS comment
      if (property && value) {
        styleObject[camelCase(property)] = value;
      }
    });
  }

  return styleObject;
}

module.exports = attributesToProps;


/***/ }),

/***/ "./node_modules/html-react-parser/lib/dom-to-react.js":
/*!************************************************************!*\
  !*** ./node_modules/html-react-parser/lib/dom-to-react.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var attributesToProps = __webpack_require__(/*! ./attributes-to-props */ "./node_modules/html-react-parser/lib/attributes-to-props.js");
var utilities = __webpack_require__(/*! ./utilities */ "./node_modules/html-react-parser/lib/utilities.js");

/**
 * Converts DOM nodes to React elements.
 *
 * @param {DomElement[]} nodes - The DOM nodes.
 * @param {Object} [options={}] - The additional options.
 * @param {Function} [options.replace] - The replacer.
 * @param {Object} [options.library] - The library (React, Preact, etc.).
 * @return {String|ReactElement|ReactElement[]}
 */
function domToReact(nodes, options) {
  options = options || {};

  var React = options.library || __webpack_require__(/*! react */ "./node_modules/react/index.js");
  var cloneElement = React.cloneElement;
  var createElement = React.createElement;
  var isValidElement = React.isValidElement;

  var result = [];
  var node;
  var hasReplace = typeof options.replace === 'function';
  var replaceElement;
  var props;
  var children;
  var data;
  var trim = options.trim;

  for (var i = 0, len = nodes.length; i < len; i++) {
    node = nodes[i];

    // replace with custom React element (if present)
    if (hasReplace) {
      replaceElement = options.replace(node);

      if (isValidElement(replaceElement)) {
        // set "key" prop for sibling elements
        // https://fb.me/react-warning-keys
        if (len > 1) {
          replaceElement = cloneElement(replaceElement, {
            key: replaceElement.key || i
          });
        }
        result.push(replaceElement);
        continue;
      }
    }

    if (node.type === 'text') {
      // if trim option is enabled, skip whitespace text nodes
      if (trim) {
        data = node.data.trim();
        if (data) {
          result.push(node.data);
        }
      } else {
        result.push(node.data);
      }
      continue;
    }

    props = node.attribs;
    if (!shouldPassAttributesUnaltered(node)) {
      props = attributesToProps(node.attribs);
    }

    children = null;

    switch (node.type) {
      case 'script':
      case 'style':
        // prevent text in <script> or <style> from being escaped
        // https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml
        if (node.children[0]) {
          props.dangerouslySetInnerHTML = {
            __html: node.children[0].data
          };
        }
        break;

      case 'tag':
        // setting textarea value in children is an antipattern in React
        // https://reactjs.org/docs/forms.html#the-textarea-tag
        if (node.name === 'textarea' && node.children[0]) {
          props.defaultValue = node.children[0].data;
        } else if (node.children && node.children.length) {
          // continue recursion of creating React elements (if applicable)
          children = domToReact(node.children, options);
        }
        break;

      // skip all other cases (e.g., comment)
      default:
        continue;
    }

    // set "key" prop for sibling elements
    // https://fb.me/react-warning-keys
    if (len > 1) {
      props.key = i;
    }

    result.push(createElement(node.name, props, children));
  }

  return result.length === 1 ? result[0] : result;
}

/**
 * Determines whether attributes should be altered or not.
 *
 * @param {React.ReactElement} node
 * @return {Boolean}
 */
function shouldPassAttributesUnaltered(node) {
  return (
    utilities.PRESERVE_CUSTOM_ATTRIBUTES &&
    node.type === 'tag' &&
    utilities.isCustomComponent(node.name, node.attribs)
  );
}

module.exports = domToReact;


/***/ }),

/***/ "./node_modules/html-react-parser/lib/utilities.js":
/*!*********************************************************!*\
  !*** ./node_modules/html-react-parser/lib/utilities.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var React = __webpack_require__(/*! react */ "./node_modules/react/index.js");
var hyphenPatternRegex = /-([a-z])/g;
var CUSTOM_PROPERTY_OR_NO_HYPHEN_REGEX = /^--[a-zA-Z0-9-]+$|^[^-]+$/;

/**
 * Converts a string to camelCase.
 *
 * @param  {String} string - The string.
 * @return {String}
 */
function camelCase(string) {
  if (typeof string !== 'string') {
    throw new TypeError('First argument must be a string');
  }

  // custom property or no hyphen found
  if (CUSTOM_PROPERTY_OR_NO_HYPHEN_REGEX.test(string)) {
    return string;
  }

  // convert to camelCase
  return string
    .toLowerCase()
    .replace(hyphenPatternRegex, function (_, character) {
      return character.toUpperCase();
    });
}

/**
 * Swap key with value in an object.
 *
 * @param  {Object}   obj        - The object.
 * @param  {Function} [override] - The override method.
 * @return {Object}              - The inverted object.
 */
function invertObject(obj, override) {
  if (!obj || typeof obj !== 'object') {
    throw new TypeError('First argument must be an object');
  }

  var key;
  var value;
  var isOverridePresent = typeof override === 'function';
  var overrides = {};
  var result = {};

  for (key in obj) {
    value = obj[key];

    if (isOverridePresent) {
      overrides = override(key, value);
      if (overrides && overrides.length === 2) {
        result[overrides[0]] = overrides[1];
        continue;
      }
    }

    if (typeof value === 'string') {
      result[value] = key;
    }
  }

  return result;
}

/**
 * Check if a given tag is a custom component.
 *
 * @see {@link https://github.com/facebook/react/blob/v16.6.3/packages/react-dom/src/shared/isCustomComponent.js}
 *
 * @param {string} tagName - The name of the html tag.
 * @param {Object} props   - The props being passed to the element.
 * @return {boolean}
 */
function isCustomComponent(tagName, props) {
  if (tagName.indexOf('-') === -1) {
    return props && typeof props.is === 'string';
  }

  switch (tagName) {
    // These are reserved SVG and MathML elements.
    // We don't mind this whitelist too much because we expect it to never grow.
    // The alternative is to track the namespace in a few places which is convoluted.
    // https://w3c.github.io/webcomponents/spec/custom/#custom-elements-core-concepts
    case 'annotation-xml':
    case 'color-profile':
    case 'font-face':
    case 'font-face-src':
    case 'font-face-uri':
    case 'font-face-format':
    case 'font-face-name':
    case 'missing-glyph':
      return false;
    default:
      return true;
  }
}

/**
 * @constant {Boolean}
 * @see {@link https://reactjs.org/blog/2017/09/08/dom-attributes-in-react-16.html}
 */
var PRESERVE_CUSTOM_ATTRIBUTES = React.version.split('.')[0] >= 16;

module.exports = {
  PRESERVE_CUSTOM_ATTRIBUTES: PRESERVE_CUSTOM_ATTRIBUTES,
  camelCase: camelCase,
  invertObject: invertObject,
  isCustomComponent: isCustomComponent
};


/***/ }),

/***/ "./node_modules/inline-style-parser/index.js":
/*!***************************************************!*\
  !*** ./node_modules/inline-style-parser/index.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// http://www.w3.org/TR/CSS21/grammar.html
// https://github.com/visionmedia/css-parse/pull/49#issuecomment-30088027
var COMMENT_REGEX = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;

var NEWLINE_REGEX = /\n/g;
var WHITESPACE_REGEX = /^\s*/;

// declaration
var PROPERTY_REGEX = /^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/;
var COLON_REGEX = /^:\s*/;
var VALUE_REGEX = /^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/;
var SEMICOLON_REGEX = /^[;\s]*/;

// https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/Trim#Polyfill
var TRIM_REGEX = /^\s+|\s+$/g;

// strings
var NEWLINE = '\n';
var FORWARD_SLASH = '/';
var ASTERISK = '*';
var EMPTY_STRING = '';

// types
var TYPE_COMMENT = 'comment';
var TYPE_DECLARATION = 'declaration';

/**
 * @param {String} style
 * @param {Object} [options]
 * @return {Object[]}
 * @throws {TypeError}
 * @throws {Error}
 */
module.exports = function(style, options) {
  if (typeof style !== 'string') {
    throw new TypeError('First argument must be a string');
  }

  if (!style) return [];

  options = options || {};

  /**
   * Positional.
   */
  var lineno = 1;
  var column = 1;

  /**
   * Update lineno and column based on `str`.
   *
   * @param {String} str
   */
  function updatePosition(str) {
    var lines = str.match(NEWLINE_REGEX);
    if (lines) lineno += lines.length;
    var i = str.lastIndexOf(NEWLINE);
    column = ~i ? str.length - i : column + str.length;
  }

  /**
   * Mark position and patch `node.position`.
   *
   * @return {Function}
   */
  function position() {
    var start = { line: lineno, column: column };
    return function(node) {
      node.position = new Position(start);
      whitespace();
      return node;
    };
  }

  /**
   * Store position information for a node.
   *
   * @constructor
   * @property {Object} start
   * @property {Object} end
   * @property {undefined|String} source
   */
  function Position(start) {
    this.start = start;
    this.end = { line: lineno, column: column };
    this.source = options.source;
  }

  /**
   * Non-enumerable source string.
   */
  Position.prototype.content = style;

  var errorsList = [];

  /**
   * Error `msg`.
   *
   * @param {String} msg
   * @throws {Error}
   */
  function error(msg) {
    var err = new Error(
      options.source + ':' + lineno + ':' + column + ': ' + msg
    );
    err.reason = msg;
    err.filename = options.source;
    err.line = lineno;
    err.column = column;
    err.source = style;

    if (options.silent) {
      errorsList.push(err);
    } else {
      throw err;
    }
  }

  /**
   * Match `re` and return captures.
   *
   * @param {RegExp} re
   * @return {undefined|Array}
   */
  function match(re) {
    var m = re.exec(style);
    if (!m) return;
    var str = m[0];
    updatePosition(str);
    style = style.slice(str.length);
    return m;
  }

  /**
   * Parse whitespace.
   */
  function whitespace() {
    match(WHITESPACE_REGEX);
  }

  /**
   * Parse comments.
   *
   * @param {Object[]} [rules]
   * @return {Object[]}
   */
  function comments(rules) {
    var c;
    rules = rules || [];
    while ((c = comment())) {
      if (c !== false) {
        rules.push(c);
      }
    }
    return rules;
  }

  /**
   * Parse comment.
   *
   * @return {Object}
   * @throws {Error}
   */
  function comment() {
    var pos = position();
    if (FORWARD_SLASH != style.charAt(0) || ASTERISK != style.charAt(1)) return;

    var i = 2;
    while (
      EMPTY_STRING != style.charAt(i) &&
      (ASTERISK != style.charAt(i) || FORWARD_SLASH != style.charAt(i + 1))
    ) {
      ++i;
    }
    i += 2;

    if (EMPTY_STRING === style.charAt(i - 1)) {
      return error('End of comment missing');
    }

    var str = style.slice(2, i - 2);
    column += 2;
    updatePosition(str);
    style = style.slice(i);
    column += 2;

    return pos({
      type: TYPE_COMMENT,
      comment: str
    });
  }

  /**
   * Parse declaration.
   *
   * @return {Object}
   * @throws {Error}
   */
  function declaration() {
    var pos = position();

    // prop
    var prop = match(PROPERTY_REGEX);
    if (!prop) return;
    comment();

    // :
    if (!match(COLON_REGEX)) return error("property missing ':'");

    // val
    var val = match(VALUE_REGEX);

    var ret = pos({
      type: TYPE_DECLARATION,
      property: trim(prop[0].replace(COMMENT_REGEX, EMPTY_STRING)),
      value: val
        ? trim(val[0].replace(COMMENT_REGEX, EMPTY_STRING))
        : EMPTY_STRING
    });

    // ;
    match(SEMICOLON_REGEX);

    return ret;
  }

  /**
   * Parse declarations.
   *
   * @return {Object[]}
   */
  function declarations() {
    var decls = [];

    comments(decls);

    // declarations
    var decl;
    while ((decl = declaration())) {
      if (decl !== false) {
        decls.push(decl);
        comments(decls);
      }
    }

    return decls;
  }

  whitespace();
  return declarations();
};

/**
 * Trim `str`.
 *
 * @param {String} str
 * @return {String}
 */
function trim(str) {
  return str ? str.replace(TRIM_REGEX, EMPTY_STRING) : EMPTY_STRING;
}


/***/ }),

/***/ "./node_modules/next/dist/build/webpack/loaders/next-client-pages-loader.js?page=%2Fblog%2F%5Btitle%5D&absolutePagePath=I%3A%5C%40markdown%5Cnnn%5Cheroku-nextjs-master%5Cpages%5Cblog%5C%5Btitle%5D.js!./":
/*!**************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-client-pages-loader.js?page=%2Fblog%2F%5Btitle%5D&absolutePagePath=I%3A%5C%40markdown%5Cnnn%5Cheroku-nextjs-master%5Cpages%5Cblog%5C%5Btitle%5D.js ***!
  \**************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


    (window.__NEXT_P = window.__NEXT_P || []).push([
      "/blog/[title]",
      function () {
        return __webpack_require__(/*! ./pages/blog/[title].js */ "./pages/blog/[title].js");
      }
    ]);
  

/***/ }),

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "./node_modules/react-property/index.js":
/*!**********************************************!*\
  !*** ./node_modules/react-property/index.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var HTMLDOMPropertyConfig = __webpack_require__(/*! ./lib/HTMLDOMPropertyConfig */ "./node_modules/react-property/lib/HTMLDOMPropertyConfig.js");
var SVGDOMPropertyConfig = __webpack_require__(/*! ./lib/SVGDOMPropertyConfig */ "./node_modules/react-property/lib/SVGDOMPropertyConfig.js");
var injection = __webpack_require__(/*! ./lib/injection */ "./node_modules/react-property/lib/injection.js");

var MUST_USE_PROPERTY = injection.MUST_USE_PROPERTY;
var HAS_BOOLEAN_VALUE = injection.HAS_BOOLEAN_VALUE;
var HAS_NUMERIC_VALUE = injection.HAS_NUMERIC_VALUE;
var HAS_POSITIVE_NUMERIC_VALUE = injection.HAS_POSITIVE_NUMERIC_VALUE;
var HAS_OVERLOADED_BOOLEAN_VALUE = injection.HAS_OVERLOADED_BOOLEAN_VALUE;

/**
 * @see https://github.com/facebook/react/blob/15-stable/src/renderers/dom/shared/DOMProperty.js#L14-L16
 *
 * @param  {Number}  value
 * @param  {Number}  bitmask
 * @return {Boolean}
 */
function checkMask(value, bitmask) {
  return (value & bitmask) === bitmask;
}

/**
 * @see https://github.com/facebook/react/blob/15-stable/src/renderers/dom/shared/DOMProperty.js#L57
 *
 * @param {Object}  domPropertyConfig - HTMLDOMPropertyConfig or SVGDOMPropertyConfig
 * @param {Object}  config            - The object to be mutated
 * @param {Boolean} isSVG             - Whether the injected config is HTML or SVG (it assumes the default is HTML)
 */
function injectDOMPropertyConfig(domPropertyConfig, config, isSVG) {
  var Properties = domPropertyConfig.Properties;
  var DOMAttributeNames = domPropertyConfig.DOMAttributeNames;
  var attributeName;
  var propertyName;
  var propConfig;

  for (propertyName in Properties) {
    attributeName =
      DOMAttributeNames[propertyName] ||
      (isSVG ? propertyName : propertyName.toLowerCase());
    propConfig = Properties[propertyName];

    config[attributeName] = {
      attributeName: attributeName,
      propertyName: propertyName,
      mustUseProperty: checkMask(propConfig, MUST_USE_PROPERTY),
      hasBooleanValue: checkMask(propConfig, HAS_BOOLEAN_VALUE),
      hasNumericValue: checkMask(propConfig, HAS_NUMERIC_VALUE),
      hasPositiveNumericValue: checkMask(
        propConfig,
        HAS_POSITIVE_NUMERIC_VALUE
      ),
      hasOverloadedBooleanValue: checkMask(
        propConfig,
        HAS_OVERLOADED_BOOLEAN_VALUE
      )
    };
  }
}

/**
 * HTML properties config.
 *
 * @type {Object}
 */
var html = {};
injectDOMPropertyConfig(HTMLDOMPropertyConfig, html);

/**
 * SVG properties config.
 *
 * @type {Object}
 */
var svg = {};
injectDOMPropertyConfig(SVGDOMPropertyConfig, svg, true);

/**
 * HTML and SVG properties config.
 *
 * @type {Object}
 */
var properties = {};
injectDOMPropertyConfig(HTMLDOMPropertyConfig, properties);
injectDOMPropertyConfig(SVGDOMPropertyConfig, properties, true);

var ATTRIBUTE_NAME_START_CHAR =
  ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD';
var ATTRIBUTE_NAME_CHAR =
  ATTRIBUTE_NAME_START_CHAR + '\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040';

module.exports = {
  html: html,
  svg: svg,
  properties: properties,

  /**
   * Checks whether a property name is a custom attribute.
   *
   * @see https://github.com/facebook/react/blob/15-stable/src/renderers/dom/shared/HTMLDOMPropertyConfig.js#L23-L25
   *
   * @param {String}
   * @return {Boolean}
   */
  isCustomAttribute: RegExp.prototype.test.bind(
    new RegExp('^(data|aria)-[' + ATTRIBUTE_NAME_CHAR + ']*$')
  )
};


/***/ }),

/***/ "./node_modules/react-property/lib/HTMLDOMPropertyConfig.js":
/*!******************************************************************!*\
  !*** ./node_modules/react-property/lib/HTMLDOMPropertyConfig.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = {
  Properties: {
    autoFocus: 4,
    accept: 0,
    acceptCharset: 0,
    accessKey: 0,
    action: 0,
    allowFullScreen: 4,
    allowTransparency: 0,
    alt: 0,
    as: 0,
    async: 4,
    autoComplete: 0,
    autoPlay: 4,
    capture: 4,
    cellPadding: 0,
    cellSpacing: 0,
    charSet: 0,
    challenge: 0,
    checked: 5,
    cite: 0,
    classID: 0,
    className: 0,
    cols: 24,
    colSpan: 0,
    content: 0,
    contentEditable: 0,
    contextMenu: 0,
    controls: 4,
    controlsList: 0,
    coords: 0,
    crossOrigin: 0,
    data: 0,
    dateTime: 0,
    default: 4,
    defer: 4,
    dir: 0,
    disabled: 4,
    download: 32,
    draggable: 0,
    encType: 0,
    form: 0,
    formAction: 0,
    formEncType: 0,
    formMethod: 0,
    formNoValidate: 4,
    formTarget: 0,
    frameBorder: 0,
    headers: 0,
    height: 0,
    hidden: 4,
    high: 0,
    href: 0,
    hrefLang: 0,
    htmlFor: 0,
    httpEquiv: 0,
    icon: 0,
    id: 0,
    inputMode: 0,
    integrity: 0,
    is: 0,
    keyParams: 0,
    keyType: 0,
    kind: 0,
    label: 0,
    lang: 0,
    list: 0,
    loop: 4,
    low: 0,
    manifest: 0,
    marginHeight: 0,
    marginWidth: 0,
    max: 0,
    maxLength: 0,
    media: 0,
    mediaGroup: 0,
    method: 0,
    min: 0,
    minLength: 0,
    multiple: 5,
    muted: 5,
    name: 0,
    nonce: 0,
    noValidate: 4,
    open: 4,
    optimum: 0,
    pattern: 0,
    placeholder: 0,
    playsInline: 4,
    poster: 0,
    preload: 0,
    profile: 0,
    radioGroup: 0,
    readOnly: 4,
    referrerPolicy: 0,
    rel: 0,
    required: 4,
    reversed: 4,
    role: 0,
    rows: 24,
    rowSpan: 8,
    sandbox: 0,
    scope: 0,
    scoped: 4,
    scrolling: 0,
    seamless: 4,
    selected: 5,
    shape: 0,
    size: 24,
    sizes: 0,
    span: 24,
    spellCheck: 0,
    src: 0,
    srcDoc: 0,
    srcLang: 0,
    srcSet: 0,
    start: 8,
    step: 0,
    style: 0,
    summary: 0,
    tabIndex: 0,
    target: 0,
    title: 0,
    type: 0,
    useMap: 0,
    value: 0,
    width: 0,
    wmode: 0,
    wrap: 0,
    about: 0,
    datatype: 0,
    inlist: 0,
    prefix: 0,
    property: 0,
    resource: 0,
    typeof: 0,
    vocab: 0,
    autoCapitalize: 0,
    autoCorrect: 0,
    autoSave: 0,
    color: 0,
    itemProp: 0,
    itemScope: 4,
    itemType: 0,
    itemID: 0,
    itemRef: 0,
    results: 0,
    security: 0,
    unselectable: 0
  },
  DOMAttributeNames: {
    acceptCharset: 'accept-charset',
    className: 'class',
    htmlFor: 'for',
    httpEquiv: 'http-equiv'
  }
};


/***/ }),

/***/ "./node_modules/react-property/lib/SVGDOMPropertyConfig.js":
/*!*****************************************************************!*\
  !*** ./node_modules/react-property/lib/SVGDOMPropertyConfig.js ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = {
  Properties: {
    accentHeight: 0,
    accumulate: 0,
    additive: 0,
    alignmentBaseline: 0,
    allowReorder: 0,
    alphabetic: 0,
    amplitude: 0,
    arabicForm: 0,
    ascent: 0,
    attributeName: 0,
    attributeType: 0,
    autoReverse: 0,
    azimuth: 0,
    baseFrequency: 0,
    baseProfile: 0,
    baselineShift: 0,
    bbox: 0,
    begin: 0,
    bias: 0,
    by: 0,
    calcMode: 0,
    capHeight: 0,
    clip: 0,
    clipPath: 0,
    clipRule: 0,
    clipPathUnits: 0,
    colorInterpolation: 0,
    colorInterpolationFilters: 0,
    colorProfile: 0,
    colorRendering: 0,
    contentScriptType: 0,
    contentStyleType: 0,
    cursor: 0,
    cx: 0,
    cy: 0,
    d: 0,
    decelerate: 0,
    descent: 0,
    diffuseConstant: 0,
    direction: 0,
    display: 0,
    divisor: 0,
    dominantBaseline: 0,
    dur: 0,
    dx: 0,
    dy: 0,
    edgeMode: 0,
    elevation: 0,
    enableBackground: 0,
    end: 0,
    exponent: 0,
    externalResourcesRequired: 0,
    fill: 0,
    fillOpacity: 0,
    fillRule: 0,
    filter: 0,
    filterRes: 0,
    filterUnits: 0,
    floodColor: 0,
    floodOpacity: 0,
    focusable: 0,
    fontFamily: 0,
    fontSize: 0,
    fontSizeAdjust: 0,
    fontStretch: 0,
    fontStyle: 0,
    fontVariant: 0,
    fontWeight: 0,
    format: 0,
    from: 0,
    fx: 0,
    fy: 0,
    g1: 0,
    g2: 0,
    glyphName: 0,
    glyphOrientationHorizontal: 0,
    glyphOrientationVertical: 0,
    glyphRef: 0,
    gradientTransform: 0,
    gradientUnits: 0,
    hanging: 0,
    horizAdvX: 0,
    horizOriginX: 0,
    ideographic: 0,
    imageRendering: 0,
    in: 0,
    in2: 0,
    intercept: 0,
    k: 0,
    k1: 0,
    k2: 0,
    k3: 0,
    k4: 0,
    kernelMatrix: 0,
    kernelUnitLength: 0,
    kerning: 0,
    keyPoints: 0,
    keySplines: 0,
    keyTimes: 0,
    lengthAdjust: 0,
    letterSpacing: 0,
    lightingColor: 0,
    limitingConeAngle: 0,
    local: 0,
    markerEnd: 0,
    markerMid: 0,
    markerStart: 0,
    markerHeight: 0,
    markerUnits: 0,
    markerWidth: 0,
    mask: 0,
    maskContentUnits: 0,
    maskUnits: 0,
    mathematical: 0,
    mode: 0,
    numOctaves: 0,
    offset: 0,
    opacity: 0,
    operator: 0,
    order: 0,
    orient: 0,
    orientation: 0,
    origin: 0,
    overflow: 0,
    overlinePosition: 0,
    overlineThickness: 0,
    paintOrder: 0,
    panose1: 0,
    pathLength: 0,
    patternContentUnits: 0,
    patternTransform: 0,
    patternUnits: 0,
    pointerEvents: 0,
    points: 0,
    pointsAtX: 0,
    pointsAtY: 0,
    pointsAtZ: 0,
    preserveAlpha: 0,
    preserveAspectRatio: 0,
    primitiveUnits: 0,
    r: 0,
    radius: 0,
    refX: 0,
    refY: 0,
    renderingIntent: 0,
    repeatCount: 0,
    repeatDur: 0,
    requiredExtensions: 0,
    requiredFeatures: 0,
    restart: 0,
    result: 0,
    rotate: 0,
    rx: 0,
    ry: 0,
    scale: 0,
    seed: 0,
    shapeRendering: 0,
    slope: 0,
    spacing: 0,
    specularConstant: 0,
    specularExponent: 0,
    speed: 0,
    spreadMethod: 0,
    startOffset: 0,
    stdDeviation: 0,
    stemh: 0,
    stemv: 0,
    stitchTiles: 0,
    stopColor: 0,
    stopOpacity: 0,
    strikethroughPosition: 0,
    strikethroughThickness: 0,
    string: 0,
    stroke: 0,
    strokeDasharray: 0,
    strokeDashoffset: 0,
    strokeLinecap: 0,
    strokeLinejoin: 0,
    strokeMiterlimit: 0,
    strokeOpacity: 0,
    strokeWidth: 0,
    surfaceScale: 0,
    systemLanguage: 0,
    tableValues: 0,
    targetX: 0,
    targetY: 0,
    textAnchor: 0,
    textDecoration: 0,
    textRendering: 0,
    textLength: 0,
    to: 0,
    transform: 0,
    u1: 0,
    u2: 0,
    underlinePosition: 0,
    underlineThickness: 0,
    unicode: 0,
    unicodeBidi: 0,
    unicodeRange: 0,
    unitsPerEm: 0,
    vAlphabetic: 0,
    vHanging: 0,
    vIdeographic: 0,
    vMathematical: 0,
    values: 0,
    vectorEffect: 0,
    version: 0,
    vertAdvY: 0,
    vertOriginX: 0,
    vertOriginY: 0,
    viewBox: 0,
    viewTarget: 0,
    visibility: 0,
    widths: 0,
    wordSpacing: 0,
    writingMode: 0,
    x: 0,
    xHeight: 0,
    x1: 0,
    x2: 0,
    xChannelSelector: 0,
    xlinkActuate: 0,
    xlinkArcrole: 0,
    xlinkHref: 0,
    xlinkRole: 0,
    xlinkShow: 0,
    xlinkTitle: 0,
    xlinkType: 0,
    xmlBase: 0,
    xmlns: 0,
    xmlnsXlink: 0,
    xmlLang: 0,
    xmlSpace: 0,
    y: 0,
    y1: 0,
    y2: 0,
    yChannelSelector: 0,
    z: 0,
    zoomAndPan: 0
  },
  DOMAttributeNames: {
    accentHeight: 'accent-height',
    alignmentBaseline: 'alignment-baseline',
    arabicForm: 'arabic-form',
    baselineShift: 'baseline-shift',
    capHeight: 'cap-height',
    clipPath: 'clip-path',
    clipRule: 'clip-rule',
    colorInterpolation: 'color-interpolation',
    colorInterpolationFilters: 'color-interpolation-filters',
    colorProfile: 'color-profile',
    colorRendering: 'color-rendering',
    dominantBaseline: 'dominant-baseline',
    enableBackground: 'enable-background',
    fillOpacity: 'fill-opacity',
    fillRule: 'fill-rule',
    floodColor: 'flood-color',
    floodOpacity: 'flood-opacity',
    fontFamily: 'font-family',
    fontSize: 'font-size',
    fontSizeAdjust: 'font-size-adjust',
    fontStretch: 'font-stretch',
    fontStyle: 'font-style',
    fontVariant: 'font-variant',
    fontWeight: 'font-weight',
    glyphName: 'glyph-name',
    glyphOrientationHorizontal: 'glyph-orientation-horizontal',
    glyphOrientationVertical: 'glyph-orientation-vertical',
    horizAdvX: 'horiz-adv-x',
    horizOriginX: 'horiz-origin-x',
    imageRendering: 'image-rendering',
    letterSpacing: 'letter-spacing',
    lightingColor: 'lighting-color',
    markerEnd: 'marker-end',
    markerMid: 'marker-mid',
    markerStart: 'marker-start',
    overlinePosition: 'overline-position',
    overlineThickness: 'overline-thickness',
    paintOrder: 'paint-order',
    panose1: 'panose-1',
    pointerEvents: 'pointer-events',
    renderingIntent: 'rendering-intent',
    shapeRendering: 'shape-rendering',
    stopColor: 'stop-color',
    stopOpacity: 'stop-opacity',
    strikethroughPosition: 'strikethrough-position',
    strikethroughThickness: 'strikethrough-thickness',
    strokeDasharray: 'stroke-dasharray',
    strokeDashoffset: 'stroke-dashoffset',
    strokeLinecap: 'stroke-linecap',
    strokeLinejoin: 'stroke-linejoin',
    strokeMiterlimit: 'stroke-miterlimit',
    strokeOpacity: 'stroke-opacity',
    strokeWidth: 'stroke-width',
    textAnchor: 'text-anchor',
    textDecoration: 'text-decoration',
    textRendering: 'text-rendering',
    underlinePosition: 'underline-position',
    underlineThickness: 'underline-thickness',
    unicodeBidi: 'unicode-bidi',
    unicodeRange: 'unicode-range',
    unitsPerEm: 'units-per-em',
    vAlphabetic: 'v-alphabetic',
    vHanging: 'v-hanging',
    vIdeographic: 'v-ideographic',
    vMathematical: 'v-mathematical',
    vectorEffect: 'vector-effect',
    vertAdvY: 'vert-adv-y',
    vertOriginX: 'vert-origin-x',
    vertOriginY: 'vert-origin-y',
    wordSpacing: 'word-spacing',
    writingMode: 'writing-mode',
    xHeight: 'x-height',
    xlinkActuate: 'xlink:actuate',
    xlinkArcrole: 'xlink:arcrole',
    xlinkHref: 'xlink:href',
    xlinkRole: 'xlink:role',
    xlinkShow: 'xlink:show',
    xlinkTitle: 'xlink:title',
    xlinkType: 'xlink:type',
    xmlBase: 'xml:base',
    xmlnsXlink: 'xmlns:xlink',
    xmlLang: 'xml:lang',
    xmlSpace: 'xml:space'
  }
};


/***/ }),

/***/ "./node_modules/react-property/lib/injection.js":
/*!******************************************************!*\
  !*** ./node_modules/react-property/lib/injection.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = {
  MUST_USE_PROPERTY: 1,
  HAS_BOOLEAN_VALUE: 4,
  HAS_NUMERIC_VALUE: 8,
  HAS_POSITIVE_NUMERIC_VALUE: 24,
  HAS_OVERLOADED_BOOLEAN_VALUE: 32
};


/***/ }),

/***/ "./node_modules/react/index.js":
/*!*******************************************************************************************!*\
  !*** delegated ./node_modules/react/index.js from dll-reference dll_5030f387d328e4415785 ***!
  \*******************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference dll_5030f387d328e4415785 */ "dll-reference dll_5030f387d328e4415785"))("./node_modules/react/index.js");

/***/ }),

/***/ "./node_modules/string-hash/index.js":
/*!*******************************************!*\
  !*** ./node_modules/string-hash/index.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function hash(str) {
  var hash = 5381,
      i    = str.length;

  while(i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */
  return hash >>> 0;
}

module.exports = hash;


/***/ }),

/***/ "./node_modules/style-to-object/index.js":
/*!***********************************************!*\
  !*** ./node_modules/style-to-object/index.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var parse = __webpack_require__(/*! inline-style-parser */ "./node_modules/inline-style-parser/index.js");

/**
 * Parses inline style to object.
 *
 * @example
 * // returns { 'line-height': '42' }
 * StyleToObject('line-height: 42;');
 *
 * @param  {String}      style      - The inline style.
 * @param  {Function}    [iterator] - The iterator function.
 * @return {null|Object}
 */
function StyleToObject(style, iterator) {
  var output = null;
  if (!style || typeof style !== 'string') {
    return output;
  }

  var declaration;
  var declarations = parse(style);
  var hasIterator = typeof iterator === 'function';
  var property;
  var value;

  for (var i = 0, len = declarations.length; i < len; i++) {
    declaration = declarations[i];
    property = declaration.property;
    value = declaration.value;

    if (hasIterator) {
      iterator(property, value, declaration);
    } else if (value) {
      output || (output = {});
      output[property] = value;
    }
  }

  return output;
}

module.exports = StyleToObject;


/***/ }),

/***/ "./node_modules/styled-jsx/dist/lib/stylesheet.js":
/*!********************************************************!*\
  !*** ./node_modules/styled-jsx/dist/lib/stylesheet.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

exports.__esModule = true;
exports["default"] = void 0;

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/*
Based on Glamor's sheet
https://github.com/threepointone/glamor/blob/667b480d31b3721a905021b26e1290ce92ca2879/src/sheet.js
*/
var isProd = typeof process !== 'undefined' && process.env && "development" === 'production';

var isString = function isString(o) {
  return Object.prototype.toString.call(o) === '[object String]';
};

var StyleSheet =
/*#__PURE__*/
function () {
  function StyleSheet(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        _ref$name = _ref.name,
        name = _ref$name === void 0 ? 'stylesheet' : _ref$name,
        _ref$optimizeForSpeed = _ref.optimizeForSpeed,
        optimizeForSpeed = _ref$optimizeForSpeed === void 0 ? isProd : _ref$optimizeForSpeed,
        _ref$isBrowser = _ref.isBrowser,
        isBrowser = _ref$isBrowser === void 0 ? typeof window !== 'undefined' : _ref$isBrowser;

    invariant(isString(name), '`name` must be a string');
    this._name = name;
    this._deletedRulePlaceholder = "#" + name + "-deleted-rule____{}";
    invariant(typeof optimizeForSpeed === 'boolean', '`optimizeForSpeed` must be a boolean');
    this._optimizeForSpeed = optimizeForSpeed;
    this._isBrowser = isBrowser;
    this._serverSheet = undefined;
    this._tags = [];
    this._injected = false;
    this._rulesCount = 0;
    var node = this._isBrowser && document.querySelector('meta[property="csp-nonce"]');
    this._nonce = node ? node.getAttribute('content') : null;
  }

  var _proto = StyleSheet.prototype;

  _proto.setOptimizeForSpeed = function setOptimizeForSpeed(bool) {
    invariant(typeof bool === 'boolean', '`setOptimizeForSpeed` accepts a boolean');
    invariant(this._rulesCount === 0, 'optimizeForSpeed cannot be when rules have already been inserted');
    this.flush();
    this._optimizeForSpeed = bool;
    this.inject();
  };

  _proto.isOptimizeForSpeed = function isOptimizeForSpeed() {
    return this._optimizeForSpeed;
  };

  _proto.inject = function inject() {
    var _this = this;

    invariant(!this._injected, 'sheet already injected');
    this._injected = true;

    if (this._isBrowser && this._optimizeForSpeed) {
      this._tags[0] = this.makeStyleTag(this._name);
      this._optimizeForSpeed = 'insertRule' in this.getSheet();

      if (!this._optimizeForSpeed) {
        if (!isProd) {
          console.warn('StyleSheet: optimizeForSpeed mode not supported falling back to standard mode.');
        }

        this.flush();
        this._injected = true;
      }

      return;
    }

    this._serverSheet = {
      cssRules: [],
      insertRule: function insertRule(rule, index) {
        if (typeof index === 'number') {
          _this._serverSheet.cssRules[index] = {
            cssText: rule
          };
        } else {
          _this._serverSheet.cssRules.push({
            cssText: rule
          });
        }

        return index;
      },
      deleteRule: function deleteRule(index) {
        _this._serverSheet.cssRules[index] = null;
      }
    };
  };

  _proto.getSheetForTag = function getSheetForTag(tag) {
    if (tag.sheet) {
      return tag.sheet;
    } // this weirdness brought to you by firefox


    for (var i = 0; i < document.styleSheets.length; i++) {
      if (document.styleSheets[i].ownerNode === tag) {
        return document.styleSheets[i];
      }
    }
  };

  _proto.getSheet = function getSheet() {
    return this.getSheetForTag(this._tags[this._tags.length - 1]);
  };

  _proto.insertRule = function insertRule(rule, index) {
    invariant(isString(rule), '`insertRule` accepts only strings');

    if (!this._isBrowser) {
      if (typeof index !== 'number') {
        index = this._serverSheet.cssRules.length;
      }

      this._serverSheet.insertRule(rule, index);

      return this._rulesCount++;
    }

    if (this._optimizeForSpeed) {
      var sheet = this.getSheet();

      if (typeof index !== 'number') {
        index = sheet.cssRules.length;
      } // this weirdness for perf, and chrome's weird bug
      // https://stackoverflow.com/questions/20007992/chrome-suddenly-stopped-accepting-insertrule


      try {
        sheet.insertRule(rule, index);
      } catch (error) {
        if (!isProd) {
          console.warn("StyleSheet: illegal rule: \n\n" + rule + "\n\nSee https://stackoverflow.com/q/20007992 for more info");
        }

        return -1;
      }
    } else {
      var insertionPoint = this._tags[index];

      this._tags.push(this.makeStyleTag(this._name, rule, insertionPoint));
    }

    return this._rulesCount++;
  };

  _proto.replaceRule = function replaceRule(index, rule) {
    if (this._optimizeForSpeed || !this._isBrowser) {
      var sheet = this._isBrowser ? this.getSheet() : this._serverSheet;

      if (!rule.trim()) {
        rule = this._deletedRulePlaceholder;
      }

      if (!sheet.cssRules[index]) {
        // @TBD Should we throw an error?
        return index;
      }

      sheet.deleteRule(index);

      try {
        sheet.insertRule(rule, index);
      } catch (error) {
        if (!isProd) {
          console.warn("StyleSheet: illegal rule: \n\n" + rule + "\n\nSee https://stackoverflow.com/q/20007992 for more info");
        } // In order to preserve the indices we insert a deleteRulePlaceholder


        sheet.insertRule(this._deletedRulePlaceholder, index);
      }
    } else {
      var tag = this._tags[index];
      invariant(tag, "old rule at index `" + index + "` not found");
      tag.textContent = rule;
    }

    return index;
  };

  _proto.deleteRule = function deleteRule(index) {
    if (!this._isBrowser) {
      this._serverSheet.deleteRule(index);

      return;
    }

    if (this._optimizeForSpeed) {
      this.replaceRule(index, '');
    } else {
      var tag = this._tags[index];
      invariant(tag, "rule at index `" + index + "` not found");
      tag.parentNode.removeChild(tag);
      this._tags[index] = null;
    }
  };

  _proto.flush = function flush() {
    this._injected = false;
    this._rulesCount = 0;

    if (this._isBrowser) {
      this._tags.forEach(function (tag) {
        return tag && tag.parentNode.removeChild(tag);
      });

      this._tags = [];
    } else {
      // simpler on server
      this._serverSheet.cssRules = [];
    }
  };

  _proto.cssRules = function cssRules() {
    var _this2 = this;

    if (!this._isBrowser) {
      return this._serverSheet.cssRules;
    }

    return this._tags.reduce(function (rules, tag) {
      if (tag) {
        rules = rules.concat(Array.prototype.map.call(_this2.getSheetForTag(tag).cssRules, function (rule) {
          return rule.cssText === _this2._deletedRulePlaceholder ? null : rule;
        }));
      } else {
        rules.push(null);
      }

      return rules;
    }, []);
  };

  _proto.makeStyleTag = function makeStyleTag(name, cssString, relativeToTag) {
    if (cssString) {
      invariant(isString(cssString), 'makeStyleTag acceps only strings as second parameter');
    }

    var tag = document.createElement('style');
    if (this._nonce) tag.setAttribute('nonce', this._nonce);
    tag.type = 'text/css';
    tag.setAttribute("data-" + name, '');

    if (cssString) {
      tag.appendChild(document.createTextNode(cssString));
    }

    var head = document.head || document.getElementsByTagName('head')[0];

    if (relativeToTag) {
      head.insertBefore(tag, relativeToTag);
    } else {
      head.appendChild(tag);
    }

    return tag;
  };

  _createClass(StyleSheet, [{
    key: "length",
    get: function get() {
      return this._rulesCount;
    }
  }]);

  return StyleSheet;
}();

exports["default"] = StyleSheet;

function invariant(condition, message) {
  if (!condition) {
    throw new Error("StyleSheet: " + message + ".");
  }
}
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/styled-jsx/dist/style.js":
/*!***********************************************!*\
  !*** ./node_modules/styled-jsx/dist/style.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
exports.flush = flush;
exports["default"] = void 0;

var _react = __webpack_require__(/*! react */ "./node_modules/react/index.js");

var _stylesheetRegistry = _interopRequireDefault(__webpack_require__(/*! ./stylesheet-registry */ "./node_modules/styled-jsx/dist/stylesheet-registry.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var styleSheetRegistry = new _stylesheetRegistry["default"]();

var JSXStyle =
/*#__PURE__*/
function (_Component) {
  _inheritsLoose(JSXStyle, _Component);

  function JSXStyle(props) {
    var _this;

    _this = _Component.call(this, props) || this;
    _this.prevProps = {};
    return _this;
  }

  JSXStyle.dynamic = function dynamic(info) {
    return info.map(function (tagInfo) {
      var baseId = tagInfo[0];
      var props = tagInfo[1];
      return styleSheetRegistry.computeId(baseId, props);
    }).join(' ');
  } // probably faster than PureComponent (shallowEqual)
  ;

  var _proto = JSXStyle.prototype;

  _proto.shouldComponentUpdate = function shouldComponentUpdate(otherProps) {
    return this.props.id !== otherProps.id || // We do this check because `dynamic` is an array of strings or undefined.
    // These are the computed values for dynamic styles.
    String(this.props.dynamic) !== String(otherProps.dynamic);
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    styleSheetRegistry.remove(this.props);
  };

  _proto.render = function render() {
    // This is a workaround to make the side effect async safe in the "render" phase.
    // See https://github.com/zeit/styled-jsx/pull/484
    if (this.shouldComponentUpdate(this.prevProps)) {
      // Updates
      if (this.prevProps.id) {
        styleSheetRegistry.remove(this.prevProps);
      }

      styleSheetRegistry.add(this.props);
      this.prevProps = this.props;
    }

    return null;
  };

  return JSXStyle;
}(_react.Component);

exports["default"] = JSXStyle;

function flush() {
  var cssRules = styleSheetRegistry.cssRules();
  styleSheetRegistry.flush();
  return cssRules;
}

/***/ }),

/***/ "./node_modules/styled-jsx/dist/stylesheet-registry.js":
/*!*************************************************************!*\
  !*** ./node_modules/styled-jsx/dist/stylesheet-registry.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
exports["default"] = void 0;

var _stringHash = _interopRequireDefault(__webpack_require__(/*! string-hash */ "./node_modules/string-hash/index.js"));

var _stylesheet = _interopRequireDefault(__webpack_require__(/*! ./lib/stylesheet */ "./node_modules/styled-jsx/dist/lib/stylesheet.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var sanitize = function sanitize(rule) {
  return rule.replace(/\/style/gi, '\\/style');
};

var StyleSheetRegistry =
/*#__PURE__*/
function () {
  function StyleSheetRegistry(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        _ref$styleSheet = _ref.styleSheet,
        styleSheet = _ref$styleSheet === void 0 ? null : _ref$styleSheet,
        _ref$optimizeForSpeed = _ref.optimizeForSpeed,
        optimizeForSpeed = _ref$optimizeForSpeed === void 0 ? false : _ref$optimizeForSpeed,
        _ref$isBrowser = _ref.isBrowser,
        isBrowser = _ref$isBrowser === void 0 ? typeof window !== 'undefined' : _ref$isBrowser;

    this._sheet = styleSheet || new _stylesheet["default"]({
      name: 'styled-jsx',
      optimizeForSpeed: optimizeForSpeed
    });

    this._sheet.inject();

    if (styleSheet && typeof optimizeForSpeed === 'boolean') {
      this._sheet.setOptimizeForSpeed(optimizeForSpeed);

      this._optimizeForSpeed = this._sheet.isOptimizeForSpeed();
    }

    this._isBrowser = isBrowser;
    this._fromServer = undefined;
    this._indices = {};
    this._instancesCounts = {};
    this.computeId = this.createComputeId();
    this.computeSelector = this.createComputeSelector();
  }

  var _proto = StyleSheetRegistry.prototype;

  _proto.add = function add(props) {
    var _this = this;

    if (undefined === this._optimizeForSpeed) {
      this._optimizeForSpeed = Array.isArray(props.children);

      this._sheet.setOptimizeForSpeed(this._optimizeForSpeed);

      this._optimizeForSpeed = this._sheet.isOptimizeForSpeed();
    }

    if (this._isBrowser && !this._fromServer) {
      this._fromServer = this.selectFromServer();
      this._instancesCounts = Object.keys(this._fromServer).reduce(function (acc, tagName) {
        acc[tagName] = 0;
        return acc;
      }, {});
    }

    var _this$getIdAndRules = this.getIdAndRules(props),
        styleId = _this$getIdAndRules.styleId,
        rules = _this$getIdAndRules.rules; // Deduping: just increase the instances count.


    if (styleId in this._instancesCounts) {
      this._instancesCounts[styleId] += 1;
      return;
    }

    var indices = rules.map(function (rule) {
      return _this._sheet.insertRule(rule);
    }) // Filter out invalid rules
    .filter(function (index) {
      return index !== -1;
    });
    this._indices[styleId] = indices;
    this._instancesCounts[styleId] = 1;
  };

  _proto.remove = function remove(props) {
    var _this2 = this;

    var _this$getIdAndRules2 = this.getIdAndRules(props),
        styleId = _this$getIdAndRules2.styleId;

    invariant(styleId in this._instancesCounts, "styleId: `" + styleId + "` not found");
    this._instancesCounts[styleId] -= 1;

    if (this._instancesCounts[styleId] < 1) {
      var tagFromServer = this._fromServer && this._fromServer[styleId];

      if (tagFromServer) {
        tagFromServer.parentNode.removeChild(tagFromServer);
        delete this._fromServer[styleId];
      } else {
        this._indices[styleId].forEach(function (index) {
          return _this2._sheet.deleteRule(index);
        });

        delete this._indices[styleId];
      }

      delete this._instancesCounts[styleId];
    }
  };

  _proto.update = function update(props, nextProps) {
    this.add(nextProps);
    this.remove(props);
  };

  _proto.flush = function flush() {
    this._sheet.flush();

    this._sheet.inject();

    this._fromServer = undefined;
    this._indices = {};
    this._instancesCounts = {};
    this.computeId = this.createComputeId();
    this.computeSelector = this.createComputeSelector();
  };

  _proto.cssRules = function cssRules() {
    var _this3 = this;

    var fromServer = this._fromServer ? Object.keys(this._fromServer).map(function (styleId) {
      return [styleId, _this3._fromServer[styleId]];
    }) : [];

    var cssRules = this._sheet.cssRules();

    return fromServer.concat(Object.keys(this._indices).map(function (styleId) {
      return [styleId, _this3._indices[styleId].map(function (index) {
        return cssRules[index].cssText;
      }).join(_this3._optimizeForSpeed ? '' : '\n')];
    }) // filter out empty rules
    .filter(function (rule) {
      return Boolean(rule[1]);
    }));
  }
  /**
   * createComputeId
   *
   * Creates a function to compute and memoize a jsx id from a basedId and optionally props.
   */
  ;

  _proto.createComputeId = function createComputeId() {
    var cache = {};
    return function (baseId, props) {
      if (!props) {
        return "jsx-" + baseId;
      }

      var propsToString = String(props);
      var key = baseId + propsToString; // return `jsx-${hashString(`${baseId}-${propsToString}`)}`

      if (!cache[key]) {
        cache[key] = "jsx-" + (0, _stringHash["default"])(baseId + "-" + propsToString);
      }

      return cache[key];
    };
  }
  /**
   * createComputeSelector
   *
   * Creates a function to compute and memoize dynamic selectors.
   */
  ;

  _proto.createComputeSelector = function createComputeSelector(selectoPlaceholderRegexp) {
    if (selectoPlaceholderRegexp === void 0) {
      selectoPlaceholderRegexp = /__jsx-style-dynamic-selector/g;
    }

    var cache = {};
    return function (id, css) {
      // Sanitize SSR-ed CSS.
      // Client side code doesn't need to be sanitized since we use
      // document.createTextNode (dev) and the CSSOM api sheet.insertRule (prod).
      if (!this._isBrowser) {
        css = sanitize(css);
      }

      var idcss = id + css;

      if (!cache[idcss]) {
        cache[idcss] = css.replace(selectoPlaceholderRegexp, id);
      }

      return cache[idcss];
    };
  };

  _proto.getIdAndRules = function getIdAndRules(props) {
    var _this4 = this;

    var css = props.children,
        dynamic = props.dynamic,
        id = props.id;

    if (dynamic) {
      var styleId = this.computeId(id, dynamic);
      return {
        styleId: styleId,
        rules: Array.isArray(css) ? css.map(function (rule) {
          return _this4.computeSelector(styleId, rule);
        }) : [this.computeSelector(styleId, css)]
      };
    }

    return {
      styleId: this.computeId(id),
      rules: Array.isArray(css) ? css : [css]
    };
  }
  /**
   * selectFromServer
   *
   * Collects style tags from the document with id __jsx-XXX
   */
  ;

  _proto.selectFromServer = function selectFromServer() {
    var elements = Array.prototype.slice.call(document.querySelectorAll('[id^="__jsx-"]'));
    return elements.reduce(function (acc, element) {
      var id = element.id.slice(2);
      acc[id] = element;
      return acc;
    }, {});
  };

  return StyleSheetRegistry;
}();

exports["default"] = StyleSheetRegistry;

function invariant(condition, message) {
  if (!condition) {
    throw new Error("StyleSheetRegistry: " + message + ".");
  }
}

/***/ }),

/***/ "./node_modules/styled-jsx/style.js":
/*!******************************************!*\
  !*** ./node_modules/styled-jsx/style.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./dist/style */ "./node_modules/styled-jsx/dist/style.js")


/***/ }),

/***/ "./node_modules/webpack/buildin/harmony-module.js":
/*!*******************************************!*\
  !*** (webpack)/buildin/harmony-module.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function(originalModule) {
	if (!originalModule.webpackPolyfill) {
		var module = Object.create(originalModule);
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		Object.defineProperty(module, "exports", {
			enumerable: true
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),

/***/ "./pages/blog/[title].js":
/*!*******************************!*\
  !*** ./pages/blog/[title].js ***!
  \*******************************/
/*! exports provided: __N_SSG, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(module) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__N_SSG", function() { return __N_SSG; });
/* harmony import */ var styled_jsx_style__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! styled-jsx/style */ "./node_modules/styled-jsx/style.js");
/* harmony import */ var styled_jsx_style__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(styled_jsx_style__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var html_react_parser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! html-react-parser */ "./node_modules/html-react-parser/index.js");
/* harmony import */ var html_react_parser__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(html_react_parser__WEBPACK_IMPORTED_MODULE_2__);
var _jsxFileName = "I:\\@markdown\\nnn\\heroku-nextjs-master\\pages\\blog\\[title].js";


var __jsx = react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement;
//zeit/[name].js
 // import 'style.css';

function Blog(_ref) {
  var blog = _ref.blog;
  console.log('blog', blog);
  return __jsx("div", {
    className: "jsx-2191854122",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 9,
      columnNumber: 9
    }
  }, __jsx("h1", {
    className: "jsx-2191854122",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 10,
      columnNumber: 13
    }
  }, blog[0].title), html_react_parser__WEBPACK_IMPORTED_MODULE_2___default()(blog[0].content), __jsx(styled_jsx_style__WEBPACK_IMPORTED_MODULE_0___default.a, {
    id: "2191854122",
    __self: this
  }, "img{max-width:100%;}table{border-collapse:collapse;width:100%;}table,th,td{border:1px solid #EAEAEA;border-radius:3px;padding:5px;}tr:nth-child(even){background-color:#F8F8F8;}body{font-family:Helvetica,Arial,Freesans,clean,sans-serif;padding:1em;margin:auto;max-width:42em;background:#fefefe;}h1,h2,h3,h4,h5,h6{font-weight:bold;}h1{color:#000000;font-size:28px;}h2{border-bottom:1px solid #CCCCCC;color:#000000;font-size:24px;}h3{font-size:18px;}h4{font-size:16px;}h5{font-size:14px;}h6{color:#777777;background-color:inherit;font-size:14px;}hr{height:0.2em;border:0;color:#CCCCCC;background-color:#CCCCCC;}p,blockquote,ul,ol,dl,li,table,pre{margin:15px 0;}code,pre{border-radius:3px;background-color:#F8F8F8;color:inherit;}code{border:1px solid #EAEAEA;margin:0 2px;padding:0 5px;}pre{border:1px solid #CCCCCC;line-height:1.25em;overflow:auto;padding:6px 10px;}pre>code{border:0;margin:0;padding:0;}a,a:visited{color:#4183C4;background-color:inherit;-webkit-text-decoration:none;text-decoration:none;}pre{display:block;margin:0 0 10px;color:#333;word-break:break-all;word-wrap:break-word;border:1px solid #ccc;padding:16px;overflow:auto;font-size:85%;line-height:1.45;background-color:#f7f7f7;border-radius:3px;}.hljs{display:block;overflow-x:auto;padding:0.5em;color:black;}.hljs-comment,.hljs-quote,.hljs-variable{color:#008000;}.hljs-keyword,.hljs-selector-tag,.hljs-built_in,.hljs-name,.hljs-tag{color:#00f;}.hljs-string,.hljs-title,.hljs-section,.hljs-attribute,.hljs-literal,.hljs-template-tag,.hljs-template-variable,.hljs-type,.hljs-addition{color:#a31515;}.hljs-deletion,.hljs-selector-attr,.hljs-selector-pseudo,.hljs-meta{color:#2b91af;}.hljs-doctag{color:#808080;}.hljs-attr{color:#f00;}.hljs-symbol,.hljs-bullet,.hljs-link{color:#00b0e8;}.hljs-emphasis{font-style:italic;}.hljs-strong{font-weight:bold;}.linenumber{float:left;border-right:3px solid #6ce26c;padding-right:7px;margin-right:7px;}.linenumber span{display:block;}.linenumber span::before{content:attr(data-linenumber);}body p,body blockquote,body ul,body ol,body dl,body table,body pre{margin-top:0;margin-bottom:16px;}.alert{padding:15px;margin-bottom:20px;border:1px solid transparent;border-radius:4px;}.alert h4{margin-top:0;color:inherit;}.alert .alert-link{font-weight:700;}.alert>p,.alert>ul{margin-bottom:0;}.alert>p+p{margin-top:5px;}.alert-dismissable,.alert-dismissible{padding-right:35px;}.alert-dismissable .close,.alert-dismissible .close{position:relative;top:-2px;right:-21px;color:inherit;}.alert-success{color:#3c763d;background-color:#dff0d8;border-color:#d6e9c6;}.alert-success hr{border-top-color:#c9e2b3;}.alert-success .alert-link{color:#2b542c;}.alert-info{color:#31708f;background-color:#d9edf7;border-color:#bce8f1;}.alert-info hr{border-top-color:#a6e1ec;}.alert-info .alert-link{color:#245269;}.alert-warning{color:#8a6d3b;background-color:#fcf8e3;border-color:#faebcc;}.alert-warning hr{border-top-color:#f7e1b5;}.alert-warning .alert-link{color:#66512c;}.alert-danger{color:#a94442;background-color:#f2dede;border-color:#ebccd1;}.alert-danger hr{border-top-color:#e4b9c0;}.alert-danger .alert-link{color:#843534;}blockquote{position:relative;margin:16px 0;padding:5px 8px 5px 30px;background:none repeat scroll 0 0 rgba(102,128,153,.05);border:none;color:#333;border-left:10px solid #d6dbdf;}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkk6XFxAbWFya2Rvd25cXG5ublxcaGVyb2t1LW5leHRqcy1tYXN0ZXJcXHBhZ2VzXFxibG9nXFxbdGl0bGVdLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVkrQixBQUdvQyxBQUlVLEFBS0EsQUFNQSxBQUlpQyxBQVF6QyxBQUlILEFBS2tCLEFBTWpCLEFBSUEsQUFJQSxBQUlELEFBTUQsQUFPQyxBQUlJLEFBTU8sQUFNQSxBQU9oQixBQU1LLEFBUUEsQUFjQSxBQVVBLEFBUUgsQUFZRyxBQU9BLEFBSUEsQUFJSCxBQU1HLEFBSUksQUFJRCxBQUlOLEFBT0csQUFJZ0IsQUFHbUQsQUFFaEUsQUFDRyxBQUNZLEFBQ0MsQUFDVixBQUNnQyxBQUNhLEFBQzFDLEFBQ2MsQUFDRixBQUNmLEFBQ2MsQUFDRixBQUNULEFBQ2MsQUFDRixBQUNiLEFBQ2MsQUFDRixBQUVuQixTQTlIVCxFQThDYixBQTJCQSxBQWtCbUMsRUF6SHRCLEFBc0kyRixBQUUvRCxBQUNGLENBdEtwQixBQXVCVSxBQWE3QixBQTZCNkIsQUFRVCxBQWNBLEFBVXBCLEFBb0JBLEFBT0EsQUFJQSxBQVVBLEFBbUJBLEFBZXdELEFBRWIsQUFDVSxBQUViLEFBQ2dCLEFBRWIsQUFDWSxBQUViLENBdE4xQyxBQTBDQSxBQUlBLEFBSUEsQUFzSjRCLENBRlMsQUFDQyxDQTVLdEMsQUFzSkEsQ0ExRzZCLEFBb0JmLEFBa0ZkLEFBNkJrRixBQWVoRSxDQWhCMEMsR0E1STFDLEdBekRILEFBS08sQUFNdEIsQUE4RGlCLEFBTU0sQUF5SHNCLEFBR0gsQUFHRyxBQUdELEVBaEJKLEFBS3VELENBOUcvRixDQTVEQSxDQXlFZSxBQWNHLEFBeUVsQixFQTVKa0IsQUE4SnVGLEFBRWxDLEFBc0IxQyxJQXJON0IsQUF5RDZCLEVBZ0JYLENBdkJDLEFBMENNLEFBeUdxRixBQUNoQyxBQUdILEFBR0csQUFHRCxFQTFHcEQsQ0E0RUgsQ0E1S04sQUE4REUsQ0FZQSxBQXFDRixFQXBGRyxNQTBDbkIsQ0EySCtHLENBdkxwRyxBQXFDWCxDQTdDQSxDQStHQSxDQWpEQSxBQWtKNEQsQ0F0SXZDLEVBa0dBLEFBb0IwRCxBQUdILEFBR0csQUFHRCxDQTlLOUUsQUF5QkEsQUFxSTBGLENBekZqRSxJQXZGZCxTQWtFWCxFQWtHQSxDQW5LYyxDQStLNkUsSUF4RmpFLE1BVjFCLElBNUVrQixZQXVGRCxPQXRGakIsQ0FxTWdCLEtBOUdFLE9BK0dILE9BOUdHLElBK0dpQixVQTlHZCxpQkFDUSxJQThHN0IscUJBN0dzQixrQkFDdEIiLCJmaWxlIjoiSTpcXEBtYXJrZG93blxcbm5uXFxoZXJva3UtbmV4dGpzLW1hc3RlclxccGFnZXNcXGJsb2dcXFt0aXRsZV0uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvL3plaXQvW25hbWVdLmpzXHJcbmltcG9ydCBmZXRjaCBmcm9tICdub2RlLWZldGNoJztcclxuaW1wb3J0IHBhcnNlIGZyb20gJ2h0bWwtcmVhY3QtcGFyc2VyJztcclxuLy8gaW1wb3J0ICdzdHlsZS5jc3MnO1xyXG5cclxuZnVuY3Rpb24gQmxvZyh7IGJsb2cgfSkge1xyXG4gICAgY29uc29sZS5sb2coJ2Jsb2cnLCBibG9nKTtcclxuICAgIHJldHVybiAoXHJcbiAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgPGgxPntibG9nWzBdLnRpdGxlfTwvaDE+XHJcbiAgICAgICAgICAgIHtwYXJzZShibG9nWzBdLmNvbnRlbnQpfVxyXG5cclxuICAgICAgICAgICAgPHN0eWxlIGpzeCBnbG9iYWw+e2BcclxuICAgICAgICAgICAgICAgIGltZyB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF4LXdpZHRoOiAxMDAlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRhYmxlIHtcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAxMDAlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRhYmxlLCB0aCwgdGQge1xyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNFQUVBRUE7XHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogM3B4O1xyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6IDVweDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0cjpudGgtY2hpbGQoZXZlbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNGOEY4Rjg7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgYm9keSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9udC1mYW1pbHk6IEhlbHZldGljYSwgQXJpYWwsIEZyZWVzYW5zLCBjbGVhbiwgc2Fucy1zZXJpZjtcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6MWVtO1xyXG4gICAgICAgICAgICAgICAgbWFyZ2luOmF1dG87XHJcbiAgICAgICAgICAgICAgICBtYXgtd2lkdGg6NDJlbTtcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6I2ZlZmVmZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBoMSwgaDIsIGgzLCBoNCwgaDUsIGg2IHtcclxuICAgICAgICAgICAgICAgICAgICBmb250LXdlaWdodDogYm9sZDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBoMSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICMwMDAwMDA7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9udC1zaXplOiAyOHB4O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGgyIHtcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI0NDQ0NDQztcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogIzAwMDAwMDtcclxuICAgICAgICAgICAgICAgICAgICBmb250LXNpemU6IDI0cHg7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaDMge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbnQtc2l6ZTogMThweDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBoNCB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9udC1zaXplOiAxNnB4O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGg1IHtcclxuICAgICAgICAgICAgICAgICAgICBmb250LXNpemU6IDE0cHg7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaDYge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAjNzc3Nzc3O1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IGluaGVyaXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9udC1zaXplOiAxNHB4O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGhyIHtcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IDAuMmVtO1xyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlcjogMDtcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogI0NDQ0NDQztcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjQ0NDQ0NDO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHAsIGJsb2NrcXVvdGUsIHVsLCBvbCwgZGwsIGxpLCB0YWJsZSwgcHJlIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW46IDE1cHggMDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb2RlLCBwcmUge1xyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDNweDtcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjRjhGOEY4O1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBpbmhlcml0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvZGUge1xyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNFQUVBRUE7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiAwIDJweDtcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAwIDVweDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBwcmUge1xyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNDQ0NDQ0M7XHJcbiAgICAgICAgICAgICAgICAgICAgbGluZS1oZWlnaHQ6IDEuMjVlbTtcclxuICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdzogYXV0bztcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiA2cHggMTBweDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBwcmUgPiBjb2RlIHtcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXI6IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiAwO1xyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgYSwgYTp2aXNpdGVkIHtcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogIzQxODNDNDtcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiBpbmhlcml0O1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICBWaXN1YWwgU3R1ZGlvLWxpa2Ugc3R5bGUgYmFzZWQgb24gb3JpZ2luYWwgQyMgY29sb3JpbmcgYnkgSmFzb24gRGlhbW9uZCA8amFzb25AZGlhbW9uZC5uYW1lPlxyXG4gICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIHByZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogYmxvY2s7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiAwIDAgMTBweDtcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogIzMzMztcclxuICAgICAgICAgICAgICAgICAgICB3b3JkLWJyZWFrOiBicmVhay1hbGw7XHJcbiAgICAgICAgICAgICAgICAgICAgd29yZC13cmFwOiBicmVhay13b3JkO1xyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNjY2M7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogMTZweDtcclxuICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdzogYXV0bztcclxuICAgICAgICAgICAgICAgICAgICBmb250LXNpemU6IDg1JTtcclxuICAgICAgICAgICAgICAgICAgICBsaW5lLWhlaWdodDogMS40NTtcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjdmN2Y3O1xyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDNweDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC5obGpzIHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBibG9jaztcclxuICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdy14OiBhdXRvO1xyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6IDAuNWVtO1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGJhY2tncm91bmQ6IHdoaXRlOyAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBibGFjaztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAuaGxqcy1jb21tZW50LFxyXG4gICAgICAgICAgICAgICAgLmhsanMtcXVvdGUsXHJcbiAgICAgICAgICAgICAgICAuaGxqcy12YXJpYWJsZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICMwMDgwMDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLmhsanMta2V5d29yZCxcclxuICAgICAgICAgICAgICAgIC5obGpzLXNlbGVjdG9yLXRhZyxcclxuICAgICAgICAgICAgICAgIC5obGpzLWJ1aWx0X2luLFxyXG4gICAgICAgICAgICAgICAgLmhsanMtbmFtZSxcclxuICAgICAgICAgICAgICAgIC5obGpzLXRhZyB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICMwMGY7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLmhsanMtc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgLmhsanMtdGl0bGUsXHJcbiAgICAgICAgICAgICAgICAuaGxqcy1zZWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgLmhsanMtYXR0cmlidXRlLFxyXG4gICAgICAgICAgICAgICAgLmhsanMtbGl0ZXJhbCxcclxuICAgICAgICAgICAgICAgIC5obGpzLXRlbXBsYXRlLXRhZyxcclxuICAgICAgICAgICAgICAgIC5obGpzLXRlbXBsYXRlLXZhcmlhYmxlLFxyXG4gICAgICAgICAgICAgICAgLmhsanMtdHlwZSxcclxuICAgICAgICAgICAgICAgIC5obGpzLWFkZGl0aW9uIHtcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogI2EzMTUxNTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAuaGxqcy1kZWxldGlvbixcclxuICAgICAgICAgICAgICAgIC5obGpzLXNlbGVjdG9yLWF0dHIsXHJcbiAgICAgICAgICAgICAgICAuaGxqcy1zZWxlY3Rvci1wc2V1ZG8sXHJcbiAgICAgICAgICAgICAgICAuaGxqcy1tZXRhIHtcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogIzJiOTFhZjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAuaGxqcy1kb2N0YWcge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAjODA4MDgwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC5obGpzLWF0dHIge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAjZjAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC5obGpzLXN5bWJvbCxcclxuICAgICAgICAgICAgICAgIC5obGpzLWJ1bGxldCxcclxuICAgICAgICAgICAgICAgIC5obGpzLWxpbmsge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAjMDBiMGU4O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC5obGpzLWVtcGhhc2lzIHtcclxuICAgICAgICAgICAgICAgICAgICBmb250LXN0eWxlOiBpdGFsaWM7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLmhsanMtc3Ryb25nIHtcclxuICAgICAgICAgICAgICAgICAgICBmb250LXdlaWdodDogYm9sZDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAubGluZW51bWJlciB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmxvYXQ6IGxlZnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyLXJpZ2h0OiAzcHggc29saWQgIzZjZTI2YztcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nLXJpZ2h0OiA3cHg7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luLXJpZ2h0OiA3cHg7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLmxpbmVudW1iZXIgc3BhbiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogYmxvY2s7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLmxpbmVudW1iZXIgc3Bhbjo6YmVmb3JlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBhdHRyKGRhdGEtbGluZW51bWJlcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgYm9keSBwLCBib2R5IGJsb2NrcXVvdGUsIGJvZHkgdWwsIGJvZHkgb2wsIGJvZHkgZGwsIGJvZHkgdGFibGUsIGJvZHkgcHJle21hcmdpbi10b3A6IDA7bWFyZ2luLWJvdHRvbTogMTZweDt9XHJcblxyXG4gICAgICAgICAgICAgICAgLmFsZXJ0IHsgcGFkZGluZzogMTVweDsgbWFyZ2luLWJvdHRvbTogMjBweDsgYm9yZGVyOiAxcHggc29saWQgdHJhbnNwYXJlbnQ7IGJvcmRlci1yYWRpdXM6IDRweDsgfVxyXG4gICAgICAgICAgICAgICAgLmFsZXJ0IGg0IHsgbWFyZ2luLXRvcDogMDsgY29sb3I6IGluaGVyaXQ7IH1cclxuICAgICAgICAgICAgICAgIC5hbGVydCAuYWxlcnQtbGluayB7IGZvbnQtd2VpZ2h0OiA3MDA7IH1cclxuICAgICAgICAgICAgICAgIC5hbGVydD5wLCAuYWxlcnQ+dWwgeyBtYXJnaW4tYm90dG9tOiAwOyB9XHJcbiAgICAgICAgICAgICAgICAuYWxlcnQ+cCtwIHsgbWFyZ2luLXRvcDogNXB4OyB9XHJcbiAgICAgICAgICAgICAgICAuYWxlcnQtZGlzbWlzc2FibGUsIC5hbGVydC1kaXNtaXNzaWJsZSB7IHBhZGRpbmctcmlnaHQ6IDM1cHg7IH1cclxuICAgICAgICAgICAgICAgIC5hbGVydC1kaXNtaXNzYWJsZSAuY2xvc2UsIC5hbGVydC1kaXNtaXNzaWJsZSAuY2xvc2UgeyBwb3NpdGlvbjogcmVsYXRpdmU7IHRvcDogLTJweDsgcmlnaHQ6IC0yMXB4OyBjb2xvcjogaW5oZXJpdDsgfVxyXG4gICAgICAgICAgICAgICAgLmFsZXJ0LXN1Y2Nlc3MgeyBjb2xvcjogIzNjNzYzZDsgYmFja2dyb3VuZC1jb2xvcjogI2RmZjBkODsgYm9yZGVyLWNvbG9yOiAjZDZlOWM2OyB9XHJcbiAgICAgICAgICAgICAgICAuYWxlcnQtc3VjY2VzcyBociB7IGJvcmRlci10b3AtY29sb3I6ICNjOWUyYjM7IH1cclxuICAgICAgICAgICAgICAgIC5hbGVydC1zdWNjZXNzIC5hbGVydC1saW5rIHsgY29sb3I6ICMyYjU0MmM7IH1cclxuICAgICAgICAgICAgICAgIC5hbGVydC1pbmZvIHsgY29sb3I6ICMzMTcwOGY7IGJhY2tncm91bmQtY29sb3I6ICNkOWVkZjc7IGJvcmRlci1jb2xvcjogI2JjZThmMTsgfVxyXG4gICAgICAgICAgICAgICAgLmFsZXJ0LWluZm8gaHIgeyBib3JkZXItdG9wLWNvbG9yOiAjYTZlMWVjOyB9XHJcbiAgICAgICAgICAgICAgICAuYWxlcnQtaW5mbyAuYWxlcnQtbGluayB7IGNvbG9yOiAjMjQ1MjY5OyB9XHJcbiAgICAgICAgICAgICAgICAuYWxlcnQtd2FybmluZyB7IGNvbG9yOiAjOGE2ZDNiOyBiYWNrZ3JvdW5kLWNvbG9yOiAjZmNmOGUzOyBib3JkZXItY29sb3I6ICNmYWViY2M7IH1cclxuICAgICAgICAgICAgICAgIC5hbGVydC13YXJuaW5nIGhyIHsgYm9yZGVyLXRvcC1jb2xvcjogI2Y3ZTFiNTsgfVxyXG4gICAgICAgICAgICAgICAgLmFsZXJ0LXdhcm5pbmcgLmFsZXJ0LWxpbmsgeyBjb2xvcjogIzY2NTEyYzsgfVxyXG4gICAgICAgICAgICAgICAgLmFsZXJ0LWRhbmdlciB7IGNvbG9yOiAjYTk0NDQyOyBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJkZWRlOyBib3JkZXItY29sb3I6ICNlYmNjZDE7IH1cclxuICAgICAgICAgICAgICAgIC5hbGVydC1kYW5nZXIgaHIgeyBib3JkZXItdG9wLWNvbG9yOiAjZTRiOWMwOyB9XHJcbiAgICAgICAgICAgICAgICAuYWxlcnQtZGFuZ2VyIC5hbGVydC1saW5rIHsgY29sb3I6ICM4NDM1MzQ7IH1cclxuICAgICAgICAgICAgICAgIGJsb2NrcXVvdGUge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW46IDE2cHggMDtcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiA1cHggOHB4IDVweCAzMHB4O1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IG5vbmUgcmVwZWF0IHNjcm9sbCAwIDAgcmdiYSgxMDIsMTI4LDE1MywuMDUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlcjogbm9uZTtcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogIzMzMztcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXItbGVmdDogMTBweCBzb2xpZCAjZDZkYmRmO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBgfTwvc3R5bGU+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICApO1xyXG59XHJcblxyXG4vLyDpppblhYjmiafooYzjgIIg6L+U5Zue6Lev5b6E5Lul5L2/55So5pWw57uE6L+b6KGM6aKE5p6E5bu644CCXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRTdGF0aWNQYXRocygpIHtcclxuICAgIC8vIHplaXTojrflj5YzMOS4queUsUFQSeeuoeeQhueahOWtmOWCqOW6k1xyXG4gICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goJ2h0dHBzOi8vZGVzb2xhdGUtZWFydGgtODYxMDQuaGVyb2t1YXBwLmNvbS9hcGkvbGlzdHMnKTtcclxuICAgIGNvbnN0IHJlcG9zID0gYXdhaXQgcmVzLmpzb24oKTtcclxuICAgIC8vIOWtmOWCqOW6k+WQjeensOeahOi3r+W+hFxyXG4gICAgY29uc3QgcGF0aHMgPSByZXBvcy5tYXAocmVwbyA9PiBgL2Jsb2cvJHtyZXBvLl9pZH1gKTtcclxuICAgIGNvbnNvbGUubG9nKCdwYXRocycsIHBhdGhzKTtcclxuICAgIHJldHVybiB7IHBhdGhzLCBmYWxsYmFjazogZmFsc2UgfTtcclxufVxyXG5cclxuLy8g5o6l5pS25bim5pyJ6Lev55Sx5L+h5oGv55qE5Y+C5pWwXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRTdGF0aWNQcm9wcyh7IHBhcmFtcyB9KSB7XHJcbiAgICAvLyDlr7nlupTkuo7mlofku7blkI16ZWl0L1tuYW1lXS5qc1xyXG5cclxuICAgIGxldCBpZCA9IHBhcmFtcy50aXRsZTtcclxuICAgIGNvbnNvbGUubG9nKCdpZCcsIGlkKTtcclxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGBodHRwczovL2Rlc29sYXRlLWVhcnRoLTg2MTA0Lmhlcm9rdWFwcC5jb20vYXBpL2xpc3RzL2lkLyR7aWR9YCk7XHJcbiAgICBjb25zdCBibG9nID0gYXdhaXQgcmVzLmpzb24oKTtcclxuICAgIC8vIGNvbnNvbGUubG9nKCdibG9nJywgYmxvZyk7XHJcblxyXG4gICAgcmV0dXJuIHsgcHJvcHM6IHsgYmxvZyB9IH07XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEJsb2c7XHJcbiJdfQ== */\n/*@ sourceURL=I:\\\\@markdown\\\\nnn\\\\heroku-nextjs-master\\\\pages\\\\blog\\\\[title].js */"));
} // 首先执行。 返回路径以使用数组进行预构建。


_c = Blog;
var __N_SSG = true;
/* harmony default export */ __webpack_exports__["default"] = (Blog);

var _c;

$RefreshReg$(_c, "Blog");

;
    var _a, _b;
    // Legacy CSS implementations will `eval` browser code in a Node.js context
    // to extract CSS. For backwards compatibility, we need to check we're in a
    // browser context before continuing.
    if (typeof self !== 'undefined' &&
        // AMP / No-JS mode does not inject these helpers:
        '$RefreshHelpers$' in self) {
        var currentExports_1 = module.__proto__.exports;
        var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;
        // This cannot happen in MainTemplate because the exports mismatch between
        // templating and execution.
        self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports_1, module.i);
        // A module can be accepted automatically based on its exports, e.g. when
        // it is a Refresh Boundary.
        if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports_1)) {
            // Save the previous exports on update so we can compare the boundary
            // signatures.
            module.hot.dispose(function (data) {
                data.prevExports = currentExports_1;
            });
            // Unconditionally accept an update to this module, we'll check if it's
            // still a Refresh Boundary later.
            module.hot.accept();
            // This field is set when the previous version of this module was a
            // Refresh Boundary, letting us know we need to check for invalidation or
            // enqueue an update.
            if (prevExports !== null) {
                // A boundary can become ineligible if its exports are incompatible
                // with the previous exports.
                //
                // For example, if you add/remove/change exports, we'll want to
                // re-execute the importing modules, and force those components to
                // re-render. Similarly, if you convert a class component to a
                // function, we want to invalidate the boundary.
                if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports_1)) {
                    module.hot.invalidate();
                }
                else {
                    self.$RefreshHelpers$.scheduleUpdate();
                }
            }
        }
        else {
            // Since we just executed the code for the module, it's possible that the
            // new exports made it ineligible for being a boundary.
            // We only care about the case when we were _previously_ a boundary,
            // because we already accepted this update (accidental side effect).
            var isNoLongerABoundary = prevExports !== null;
            if (isNoLongerABoundary) {
                module.hot.invalidate();
            }
        }
    }

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../node_modules/webpack/buildin/harmony-module.js */ "./node_modules/webpack/buildin/harmony-module.js")(module)))

/***/ }),

/***/ 3:
/*!******************************************************************************************************************************************************************!*\
  !*** multi next-client-pages-loader?page=%2Fblog%2F%5Btitle%5D&absolutePagePath=I%3A%5C%40markdown%5Cnnn%5Cheroku-nextjs-master%5Cpages%5Cblog%5C%5Btitle%5D.js ***!
  \******************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! next-client-pages-loader?page=%2Fblog%2F%5Btitle%5D&absolutePagePath=I%3A%5C%40markdown%5Cnnn%5Cheroku-nextjs-master%5Cpages%5Cblog%5C%5Btitle%5D.js! */"./node_modules/next/dist/build/webpack/loaders/next-client-pages-loader.js?page=%2Fblog%2F%5Btitle%5D&absolutePagePath=I%3A%5C%40markdown%5Cnnn%5Cheroku-nextjs-master%5Cpages%5Cblog%5C%5Btitle%5D.js!./");


/***/ }),

/***/ "dll-reference dll_5030f387d328e4415785":
/*!*******************************************!*\
  !*** external "dll_5030f387d328e4415785" ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = dll_5030f387d328e4415785;

/***/ })

},[[3,"static/runtime/webpack.js"]]]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvaHRtbC1kb20tcGFyc2VyL2xpYi9jb25zdGFudHMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2h0bWwtZG9tLXBhcnNlci9saWIvZG9tcGFyc2VyLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9odG1sLWRvbS1wYXJzZXIvbGliL2h0bWwtdG8tZG9tLWNsaWVudC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvaHRtbC1kb20tcGFyc2VyL2xpYi91dGlsaXRpZXMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2h0bWwtcmVhY3QtcGFyc2VyL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9odG1sLXJlYWN0LXBhcnNlci9saWIvYXR0cmlidXRlcy10by1wcm9wcy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvaHRtbC1yZWFjdC1wYXJzZXIvbGliL2RvbS10by1yZWFjdC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvaHRtbC1yZWFjdC1wYXJzZXIvbGliL3V0aWxpdGllcy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvaW5saW5lLXN0eWxlLXBhcnNlci9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWNsaWVudC1wYWdlcy1sb2FkZXIuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvcmVhY3QtcHJvcGVydHkvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3JlYWN0LXByb3BlcnR5L2xpYi9IVE1MRE9NUHJvcGVydHlDb25maWcuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3JlYWN0LXByb3BlcnR5L2xpYi9TVkdET01Qcm9wZXJ0eUNvbmZpZy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvcmVhY3QtcHJvcGVydHkvbGliL2luamVjdGlvbi5qcyIsIndlYnBhY2s6Ly8vZGVsZWdhdGVkIC4vbm9kZV9tb2R1bGVzL3JlYWN0L2luZGV4LmpzIGZyb20gZGxsLXJlZmVyZW5jZSBkbGxfNTAzMGYzODdkMzI4ZTQ0MTU3ODUiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3N0cmluZy1oYXNoL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9zdHlsZS10by1vYmplY3QvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3N0eWxlZC1qc3gvZGlzdC9saWIvc3R5bGVzaGVldC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvc3R5bGVkLWpzeC9kaXN0L3N0eWxlLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9zdHlsZWQtanN4L2Rpc3Qvc3R5bGVzaGVldC1yZWdpc3RyeS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvc3R5bGVkLWpzeC9zdHlsZS5qcyIsIndlYnBhY2s6Ly8vKHdlYnBhY2spL2J1aWxkaW4vaGFybW9ueS1tb2R1bGUuanMiLCJ3ZWJwYWNrOi8vLy4vcGFnZXMvYmxvZy9bdGl0bGVdLmpzIiwid2VicGFjazovLy9leHRlcm5hbCBcImRsbF81MDMwZjM4N2QzMjhlNDQxNTc4NVwiIl0sIm5hbWVzIjpbIkJsb2ciLCJibG9nIiwiY29uc29sZSIsImxvZyIsInRpdGxlIiwicGFyc2UiLCJjb250ZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUN6Q0EsZ0JBQWdCLG1CQUFPLENBQUMsb0VBQWE7O0FBRXJDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDO0FBQzNDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsY0FBYyxPQUFPO0FBQ3JCLGNBQWMsT0FBTztBQUNyQixjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLE9BQU87QUFDckIsY0FBYyxPQUFPO0FBQ3JCLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYyxPQUFPO0FBQ3JCLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWSxPQUFPO0FBQ25CLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7QUN2TEEsZ0JBQWdCLG1CQUFPLENBQUMsb0VBQWE7QUFDckMsZ0JBQWdCLG1CQUFPLENBQUMsb0VBQWE7O0FBRXJDO0FBQ0E7O0FBRUEseUNBQXlDOztBQUV6QztBQUNBO0FBQ0E7QUFDQSxZQUFZLE9BQU87QUFDbkIsWUFBWSxNQUFNO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7QUN4Q0EsK0JBQStCLG1CQUFPLENBQUMsb0VBQWE7O0FBRXBEO0FBQ0E7QUFDQSxzREFBc0QsU0FBUztBQUMvRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWSxPQUFPO0FBQ25CLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLGFBQWE7QUFDekIsWUFBWSxPQUFPO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMsU0FBUztBQUNuRDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxPQUFPO0FBQ25CLFlBQVksT0FBTztBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWSxTQUFTO0FBQ3JCLFlBQVksT0FBTztBQUNuQixZQUFZLE9BQU87QUFDbkIsWUFBWSxTQUFTO0FBQ3JCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHFDQUFxQyxTQUFTO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQjtBQUMzQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLE9BQU87QUFDbkIsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQy9KQSxpQkFBaUIsbUJBQU8sQ0FBQyxnRkFBb0I7QUFDN0MsZ0JBQWdCLG1CQUFPLENBQUMsaUZBQWlCOztBQUV6QztBQUNBLHdCQUF3Qjs7QUFFeEI7QUFDQTtBQUNBO0FBQ0EsWUFBWSxPQUFPO0FBQ25CLFlBQVksT0FBTztBQUNuQixZQUFZLE9BQU87QUFDbkIsWUFBWSxPQUFPO0FBQ25CLFlBQVksU0FBUztBQUNyQixZQUFZLGlDQUFpQztBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNuQ0Esb0JBQW9CLG1CQUFPLENBQUMsOERBQWdCO0FBQzVDLG9CQUFvQixtQkFBTyxDQUFDLGdFQUFpQjtBQUM3QyxnQkFBZ0IsbUJBQU8sQ0FBQyxzRUFBYTs7QUFFckM7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVksT0FBTyxlQUFlO0FBQ2xDLFlBQVksT0FBTztBQUNuQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVksT0FBTztBQUNuQixZQUFZLE9BQU87QUFDbkI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7QUMxRkEsd0JBQXdCLG1CQUFPLENBQUMsMEZBQXVCO0FBQ3ZELGdCQUFnQixtQkFBTyxDQUFDLHNFQUFhOztBQUVyQztBQUNBO0FBQ0E7QUFDQSxXQUFXLGFBQWE7QUFDeEIsV0FBVyxPQUFPLFlBQVk7QUFDOUIsV0FBVyxTQUFTO0FBQ3BCLFdBQVcsT0FBTztBQUNsQixZQUFZO0FBQ1o7QUFDQTtBQUNBOztBQUVBLGlDQUFpQyxtQkFBTyxDQUFDLDRDQUFPO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHFDQUFxQyxTQUFTO0FBQzlDOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxtQkFBbUI7QUFDOUIsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7OztBQzNIQSxZQUFZLG1CQUFPLENBQUMsNENBQU87QUFDM0I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLE9BQU87QUFDbkIsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLE9BQU87QUFDbkIsWUFBWSxTQUFTO0FBQ3JCLFlBQVksT0FBTztBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsY0FBYztBQUNkLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDN0dBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1FQUFtRTtBQUNuRSwwQkFBMEI7O0FBRTFCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxXQUFXLE9BQU87QUFDbEIsV0FBVyxPQUFPO0FBQ2xCLFlBQVk7QUFDWixZQUFZO0FBQ1osWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLE9BQU87QUFDdkIsZ0JBQWdCLE9BQU87QUFDdkIsZ0JBQWdCLGlCQUFpQjtBQUNqQztBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLE9BQU87QUFDcEIsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsT0FBTztBQUNwQixjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLFNBQVM7QUFDdEIsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2QsY0FBYztBQUNkO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNuUUE7QUFDQTtBQUNBO0FBQ0EsZUFBZSxtQkFBTyxDQUFDLHdEQUFtRTtBQUMxRjtBQUNBOzs7Ozs7Ozs7Ozs7QUNOQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLHNCQUFzQjtBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEscUNBQXFDOztBQUVyQztBQUNBO0FBQ0E7O0FBRUEsMkJBQTJCO0FBQzNCO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QixVQUFVOzs7Ozs7Ozs7Ozs7QUN2THRDLDRCQUE0QixtQkFBTyxDQUFDLCtGQUE2QjtBQUNqRSwyQkFBMkIsbUJBQU8sQ0FBQyw2RkFBNEI7QUFDL0QsZ0JBQWdCLG1CQUFPLENBQUMsdUVBQWlCOztBQUV6QztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVksT0FBTztBQUNuQixZQUFZLE9BQU87QUFDbkIsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsV0FBVyxRQUFRO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUM1SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDdlVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNOQSxnSzs7Ozs7Ozs7Ozs7O0FDQWE7O0FBRWI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7QUNoQkEsWUFBWSxtQkFBTyxDQUFDLHdFQUFxQjs7QUFFekM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Ysa0NBQWtDO0FBQ2xDO0FBQ0EsWUFBWSxPQUFPO0FBQ25CLFlBQVksU0FBUztBQUNyQixZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsNENBQTRDLFNBQVM7QUFDckQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsNEJBQTRCO0FBQzVCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7O0FDekNBLCtDQUFhOztBQUViO0FBQ0E7O0FBRUEsMkNBQTJDLGdCQUFnQixrQkFBa0IsT0FBTywyQkFBMkIsd0RBQXdELGdDQUFnQyx1REFBdUQsMkRBQTJELEVBQUU7O0FBRTNULDZEQUE2RCxzRUFBc0UsOERBQThELG9CQUFvQjs7QUFFck47QUFDQTtBQUNBO0FBQ0E7QUFDQSw4REFBOEQsYUFBb0I7O0FBRWxGO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQztBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLG9FQUFvRTtBQUNwRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsV0FBVztBQUNYOztBQUVBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7O0FBR0wsbUJBQW1CLGlDQUFpQztBQUNwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsT0FBTztBQUNQOzs7QUFHQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLFNBQVM7OztBQUdUO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsT0FBTzs7QUFFUDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxPQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQSxDQUFDOztBQUVEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQzs7Ozs7Ozs7Ozs7OztBQy9SYTs7QUFFYjtBQUNBO0FBQ0E7O0FBRUEsYUFBYSxtQkFBTyxDQUFDLDRDQUFPOztBQUU1QixpREFBaUQsbUJBQU8sQ0FBQyxvRkFBdUI7O0FBRWhGLHNDQUFzQyx1Q0FBdUMsa0JBQWtCOztBQUUvRiwrQ0FBK0MsMERBQTBELDJDQUEyQyxpQ0FBaUM7O0FBRXJMOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHO0FBQ0g7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLENBQUM7O0FBRUQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDOzs7Ozs7Ozs7Ozs7QUMzRWE7O0FBRWI7QUFDQTs7QUFFQSx5Q0FBeUMsbUJBQU8sQ0FBQyx3REFBYTs7QUFFOUQseUNBQXlDLG1CQUFPLENBQUMsMEVBQWtCOztBQUVuRSxzQ0FBc0MsdUNBQXVDLGtCQUFrQjs7QUFFL0Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFJO0FBQ1g7O0FBRUE7QUFDQTtBQUNBLDBDQUEwQzs7O0FBRzFDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsdUNBQXVDLGtCQUFrQixjQUFjLE9BQU8sR0FBRyxjQUFjLEdBQUc7O0FBRWxHO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSyxJQUFJO0FBQ1Q7O0FBRUE7QUFDQSxDQUFDOztBQUVEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQzs7Ozs7Ozs7Ozs7QUM3UEEsaUJBQWlCLG1CQUFPLENBQUMsNkRBQWM7Ozs7Ozs7Ozs7OztBQ0F2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN2QkE7Q0FHQTs7QUFFQSxTQUFTQSxJQUFULE9BQXdCO0FBQUEsTUFBUkMsSUFBUSxRQUFSQSxJQUFRO0FBQ3BCQyxTQUFPLENBQUNDLEdBQVIsQ0FBWSxNQUFaLEVBQW9CRixJQUFwQjtBQUNBLFNBQ0k7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEtBQ0k7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEtBQUtBLElBQUksQ0FBQyxDQUFELENBQUosQ0FBUUcsS0FBYixDQURKLEVBRUtDLHdEQUFLLENBQUNKLElBQUksQ0FBQyxDQUFELENBQUosQ0FBUUssT0FBVCxDQUZWO0FBQUE7QUFBQTtBQUFBLGluaUJBREo7QUEyT0gsQyxDQUVEOzs7S0EvT1NOLEk7O0FBdVFNQSxtRUFBZjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDNVFBLDBDIiwiZmlsZSI6InN0YXRpY1xcZGV2ZWxvcG1lbnRcXHBhZ2VzXFxibG9nXFxbdGl0bGVdLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBTVkcgZWxlbWVudHMgYXJlIGNhc2Utc2Vuc2l0aXZlLlxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2RvY3MvV2ViL1NWRy9FbGVtZW50I1NWR19lbGVtZW50c19BX3RvX1p9XG4gKi9cbnZhciBDQVNFX1NFTlNJVElWRV9UQUdfTkFNRVMgPSBbXG4gICdhbmltYXRlTW90aW9uJyxcbiAgJ2FuaW1hdGVUcmFuc2Zvcm0nLFxuICAnY2xpcFBhdGgnLFxuICAnZmVCbGVuZCcsXG4gICdmZUNvbG9yTWF0cml4JyxcbiAgJ2ZlQ29tcG9uZW50VHJhbnNmZXInLFxuICAnZmVDb21wb3NpdGUnLFxuICAnZmVDb252b2x2ZU1hdHJpeCcsXG4gICdmZURpZmZ1c2VMaWdodGluZycsXG4gICdmZURpc3BsYWNlbWVudE1hcCcsXG4gICdmZURyb3BTaGFkb3cnLFxuICAnZmVGbG9vZCcsXG4gICdmZUZ1bmNBJyxcbiAgJ2ZlRnVuY0InLFxuICAnZmVGdW5jRycsXG4gICdmZUZ1bmNSJyxcbiAgJ2ZlR2F1c3NhaW5CbHVyJyxcbiAgJ2ZlSW1hZ2UnLFxuICAnZmVNZXJnZScsXG4gICdmZU1lcmdlTm9kZScsXG4gICdmZU1vcnBob2xvZ3knLFxuICAnZmVPZmZzZXQnLFxuICAnZmVQb2ludExpZ2h0JyxcbiAgJ2ZlU3BlY3VsYXJMaWdodGluZycsXG4gICdmZVNwb3RMaWdodCcsXG4gICdmZVRpbGUnLFxuICAnZmVUdXJidWxlbmNlJyxcbiAgJ2ZvcmVpZ25PYmplY3QnLFxuICAnbGluZWFyR3JhZGllbnQnLFxuICAncmFkaWFsR3JhZGllbnQnLFxuICAndGV4dFBhdGgnXG5dO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQ0FTRV9TRU5TSVRJVkVfVEFHX05BTUVTOiBDQVNFX1NFTlNJVElWRV9UQUdfTkFNRVNcbn07XG4iLCJ2YXIgdXRpbGl0aWVzID0gcmVxdWlyZSgnLi91dGlsaXRpZXMnKTtcblxuLy8gY29uc3RhbnRzXG52YXIgSFRNTCA9ICdodG1sJztcbnZhciBIRUFEID0gJ2hlYWQnO1xudmFyIEJPRFkgPSAnYm9keSc7XG52YXIgRklSU1RfVEFHX1JFR0VYID0gLzwoW2EtekEtWl0rWzAtOV0/KS87IC8vIGUuZy4sIDxoMT5cbnZhciBIRUFEX1RBR19SRUdFWCA9IC88aGVhZC4qPi9pO1xudmFyIEJPRFlfVEFHX1JFR0VYID0gLzxib2R5Lio+L2k7XG4vLyBodHRwOi8vd3d3LnczLm9yZy9UUi9odG1sL3N5bnRheC5odG1sI3ZvaWQtZWxlbWVudHNcbnZhciBWT0lEX0VMRU1FTlRTX1JFR0VYID0gLzwoYXJlYXxiYXNlfGJyfGNvbHxlbWJlZHxocnxpbWd8aW5wdXR8a2V5Z2VufGxpbmt8bWVudWl0ZW18bWV0YXxwYXJhbXxzb3VyY2V8dHJhY2t8d2JyKSguKj8pXFwvPz4vZ2k7XG5cbi8vIGRldGVjdCBJRSBicm93c2VyXG52YXIgaXNJRTkgPSB1dGlsaXRpZXMuaXNJRSg5KTtcbnZhciBpc0lFID0gaXNJRTkgfHwgdXRpbGl0aWVzLmlzSUUoKTtcblxuLy8gZmFsbHMgYmFjayB0byBgcGFyc2VGcm9tU3RyaW5nYCBpZiBgY3JlYXRlSFRNTERvY3VtZW50YCBjYW5ub3QgYmUgdXNlZFxudmFyIHBhcnNlRnJvbURvY3VtZW50ID0gZnVuY3Rpb24gKCkge1xuICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgJ1RoaXMgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGBkb2N1bWVudC5pbXBsZW1lbnRhdGlvbi5jcmVhdGVIVE1MRG9jdW1lbnRgJ1xuICApO1xufTtcblxudmFyIHBhcnNlRnJvbVN0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgdGhyb3cgbmV3IEVycm9yKFxuICAgICdUaGlzIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBgRE9NUGFyc2VyLnByb3RvdHlwZS5wYXJzZUZyb21TdHJpbmdgJ1xuICApO1xufTtcblxuLyoqXG4gKiBET01QYXJzZXIgKHBlcmZvcm1hbmNlOiBzbG93KS5cbiAqXG4gKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2RvY3MvV2ViL0FQSS9ET01QYXJzZXIjUGFyc2luZ19hbl9TVkdfb3JfSFRNTF9kb2N1bWVudFxuICovXG5pZiAodHlwZW9mIHdpbmRvdy5ET01QYXJzZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgdmFyIGRvbVBhcnNlciA9IG5ldyB3aW5kb3cuRE9NUGFyc2VyKCk7XG5cbiAgLy8gSUU5IGRvZXMgbm90IHN1cHBvcnQgJ3RleHQvaHRtbCcgTUlNRSB0eXBlXG4gIC8vIGh0dHBzOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvZmY5NzUyNzgodj12cy44NSkuYXNweFxuICB2YXIgbWltZVR5cGUgPSBpc0lFOSA/ICd0ZXh0L3htbCcgOiAndGV4dC9odG1sJztcblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBIVE1MIGRvY3VtZW50IHVzaW5nIGBET01QYXJzZXIucGFyc2VGcm9tU3RyaW5nYC5cbiAgICpcbiAgICogQHBhcmFtICB7c3RyaW5nfSBodG1sICAgICAgLSBUaGUgSFRNTCBzdHJpbmcuXG4gICAqIEBwYXJhbSAge3N0cmluZ30gW3RhZ05hbWVdIC0gVGhlIGVsZW1lbnQgdG8gcmVuZGVyIHRoZSBIVE1MICh3aXRoICdib2R5JyBhcyBmYWxsYmFjaykuXG4gICAqIEByZXR1cm4ge0hUTUxEb2N1bWVudH1cbiAgICovXG4gIHBhcnNlRnJvbVN0cmluZyA9IGZ1bmN0aW9uIChodG1sLCB0YWdOYW1lKSB7XG4gICAgaWYgKHRhZ05hbWUpIHtcbiAgICAgIGh0bWwgPSAnPCcgKyB0YWdOYW1lICsgJz4nICsgaHRtbCArICc8LycgKyB0YWdOYW1lICsgJz4nO1xuICAgIH1cblxuICAgIC8vIGJlY2F1c2UgSUU5IG9ubHkgc3VwcG9ydHMgTUlNRSB0eXBlICd0ZXh0L3htbCcsIHZvaWQgZWxlbWVudHMgbmVlZCB0byBiZSBzZWxmLWNsb3NlZFxuICAgIGlmIChpc0lFOSkge1xuICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZShWT0lEX0VMRU1FTlRTX1JFR0VYLCAnPCQxJDIkMy8+Jyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRvbVBhcnNlci5wYXJzZUZyb21TdHJpbmcoaHRtbCwgbWltZVR5cGUpO1xuICB9O1xuXG4gIHBhcnNlRnJvbURvY3VtZW50ID0gcGFyc2VGcm9tU3RyaW5nO1xufVxuXG4vKipcbiAqIERPTUltcGxlbWVudGF0aW9uIChwZXJmb3JtYW5jZTogZmFpcikuXG4gKlxuICogQHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9kb2NzL1dlYi9BUEkvRE9NSW1wbGVtZW50YXRpb24vY3JlYXRlSFRNTERvY3VtZW50XG4gKi9cbmlmIChkb2N1bWVudC5pbXBsZW1lbnRhdGlvbikge1xuICAvLyB0aXRsZSBwYXJhbWV0ZXIgaXMgcmVxdWlyZWQgaW4gSUVcbiAgLy8gaHR0cHM6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9mZjk3NTQ1Nyh2PXZzLjg1KS5hc3B4XG4gIHZhciBkb2MgPSBkb2N1bWVudC5pbXBsZW1lbnRhdGlvbi5jcmVhdGVIVE1MRG9jdW1lbnQoXG4gICAgaXNJRSA/ICdodG1sLWRvbS1wYXJzZXInIDogdW5kZWZpbmVkXG4gICk7XG5cbiAgLyoqXG4gICAqIFVzZSBIVE1MIGRvY3VtZW50IGNyZWF0ZWQgYnkgYGRvY3VtZW50LmltcGxlbWVudGF0aW9uLmNyZWF0ZUhUTUxEb2N1bWVudGAuXG4gICAqXG4gICAqIEBwYXJhbSAge3N0cmluZ30gaHRtbCAgICAgIC0gVGhlIEhUTUwgc3RyaW5nLlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IFt0YWdOYW1lXSAtIFRoZSBlbGVtZW50IHRvIHJlbmRlciB0aGUgSFRNTCAod2l0aCAnYm9keScgYXMgZmFsbGJhY2spLlxuICAgKiBAcmV0dXJuIHtIVE1MRG9jdW1lbnR9XG4gICAqL1xuICBwYXJzZUZyb21Eb2N1bWVudCA9IGZ1bmN0aW9uIChodG1sLCB0YWdOYW1lKSB7XG4gICAgaWYgKHRhZ05hbWUpIHtcbiAgICAgIGRvYy5kb2N1bWVudEVsZW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUodGFnTmFtZSlbMF0uaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgIHJldHVybiBkb2M7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGRvYy5kb2N1bWVudEVsZW1lbnQuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgIHJldHVybiBkb2M7XG4gICAgICAvLyBmYWxsYmFjayB3aGVuIGNlcnRhaW4gZWxlbWVudHMgaW4gYGRvY3VtZW50RWxlbWVudGAgYXJlIHJlYWQtb25seSAoSUU5KVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgaWYgKHBhcnNlRnJvbVN0cmluZykge1xuICAgICAgICByZXR1cm4gcGFyc2VGcm9tU3RyaW5nKGh0bWwpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBUZW1wbGF0ZSAocGVyZm9ybWFuY2U6IGZhc3QpLlxuICpcbiAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZG9jcy9XZWIvSFRNTC9FbGVtZW50L3RlbXBsYXRlXG4gKi9cbnZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJyk7XG52YXIgcGFyc2VGcm9tVGVtcGxhdGU7XG5cbmlmICh0ZW1wbGF0ZS5jb250ZW50KSB7XG4gIC8qKlxuICAgKiBVc2VzIGEgdGVtcGxhdGUgZWxlbWVudCAoY29udGVudCBmcmFnbWVudCkgdG8gcGFyc2UgSFRNTC5cbiAgICpcbiAgICogQHBhcmFtICB7c3RyaW5nfSBodG1sIC0gVGhlIEhUTUwgc3RyaW5nLlxuICAgKiBAcmV0dXJuIHtOb2RlTGlzdH1cbiAgICovXG4gIHBhcnNlRnJvbVRlbXBsYXRlID0gZnVuY3Rpb24gKGh0bWwpIHtcbiAgICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSBodG1sO1xuICAgIHJldHVybiB0ZW1wbGF0ZS5jb250ZW50LmNoaWxkTm9kZXM7XG4gIH07XG59XG5cbi8qKlxuICogUGFyc2VzIEhUTUwgc3RyaW5nIHRvIERPTSBub2Rlcy5cbiAqXG4gKiBAcGFyYW0gIHtzdHJpbmd9IGh0bWwgLSBUaGUgSFRNTCBzdHJpbmcuXG4gKiBAcmV0dXJuIHtOb2RlTGlzdHxBcnJheX1cbiAqL1xuZnVuY3Rpb24gZG9tcGFyc2VyKGh0bWwpIHtcbiAgdmFyIGZpcnN0VGFnTmFtZTtcbiAgdmFyIG1hdGNoID0gaHRtbC5tYXRjaChGSVJTVF9UQUdfUkVHRVgpO1xuXG4gIGlmIChtYXRjaCAmJiBtYXRjaFsxXSkge1xuICAgIGZpcnN0VGFnTmFtZSA9IG1hdGNoWzFdLnRvTG93ZXJDYXNlKCk7XG4gIH1cblxuICB2YXIgZG9jO1xuICB2YXIgZWxlbWVudDtcbiAgdmFyIGVsZW1lbnRzO1xuXG4gIHN3aXRjaCAoZmlyc3RUYWdOYW1lKSB7XG4gICAgY2FzZSBIVE1MOlxuICAgICAgZG9jID0gcGFyc2VGcm9tU3RyaW5nKGh0bWwpO1xuXG4gICAgICAvLyB0aGUgY3JlYXRlZCBkb2N1bWVudCBtYXkgY29tZSB3aXRoIGZpbGxlciBoZWFkL2JvZHkgZWxlbWVudHMsXG4gICAgICAvLyBzbyBtYWtlIHN1cmUgdG8gcmVtb3ZlIHRoZW0gaWYgdGhleSBkb24ndCBhY3R1YWxseSBleGlzdFxuICAgICAgaWYgKCFIRUFEX1RBR19SRUdFWC50ZXN0KGh0bWwpKSB7XG4gICAgICAgIGVsZW1lbnQgPSBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoSEVBRClbMF07XG4gICAgICAgIGlmIChlbGVtZW50KSB7XG4gICAgICAgICAgZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghQk9EWV9UQUdfUkVHRVgudGVzdChodG1sKSkge1xuICAgICAgICBlbGVtZW50ID0gZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKEJPRFkpWzBdO1xuICAgICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICAgIGVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKEhUTUwpO1xuXG4gICAgY2FzZSBIRUFEOlxuICAgIGNhc2UgQk9EWTpcbiAgICAgIGVsZW1lbnRzID0gcGFyc2VGcm9tRG9jdW1lbnQoaHRtbCkuZ2V0RWxlbWVudHNCeVRhZ05hbWUoZmlyc3RUYWdOYW1lKTtcblxuICAgICAgLy8gaWYgdGhlcmUncyBhIHNpYmxpbmcgZWxlbWVudCwgdGhlbiByZXR1cm4gYm90aCBlbGVtZW50c1xuICAgICAgaWYgKEJPRFlfVEFHX1JFR0VYLnRlc3QoaHRtbCkgJiYgSEVBRF9UQUdfUkVHRVgudGVzdChodG1sKSkge1xuICAgICAgICByZXR1cm4gZWxlbWVudHNbMF0ucGFyZW50Tm9kZS5jaGlsZE5vZGVzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGVsZW1lbnRzO1xuXG4gICAgLy8gbG93LWxldmVsIHRhZyBvciB0ZXh0XG4gICAgZGVmYXVsdDpcbiAgICAgIGlmIChwYXJzZUZyb21UZW1wbGF0ZSkge1xuICAgICAgICByZXR1cm4gcGFyc2VGcm9tVGVtcGxhdGUoaHRtbCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwYXJzZUZyb21Eb2N1bWVudChodG1sLCBCT0RZKS5nZXRFbGVtZW50c0J5VGFnTmFtZShCT0RZKVswXVxuICAgICAgICAuY2hpbGROb2RlcztcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRvbXBhcnNlcjtcbiIsInZhciBkb21wYXJzZXIgPSByZXF1aXJlKCcuL2RvbXBhcnNlcicpO1xudmFyIHV0aWxpdGllcyA9IHJlcXVpcmUoJy4vdXRpbGl0aWVzJyk7XG5cbnZhciBmb3JtYXRET00gPSB1dGlsaXRpZXMuZm9ybWF0RE9NO1xudmFyIGlzSUU5ID0gdXRpbGl0aWVzLmlzSUUoOSk7XG5cbnZhciBESVJFQ1RJVkVfUkVHRVggPSAvPCghW2EtekEtWlxcc10rKT4vOyAvLyBlLmcuLCA8IWRvY3R5cGUgaHRtbD5cblxuLyoqXG4gKiBQYXJzZXMgSFRNTCBhbmQgcmVmb3JtYXRzIERPTSBub2RlcyBvdXRwdXQuXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBodG1sIC0gVGhlIEhUTUwgc3RyaW5nLlxuICogQHJldHVybiB7QXJyYXl9ICAgICAgIC0gVGhlIGZvcm1hdHRlZCBET00gbm9kZXMuXG4gKi9cbmZ1bmN0aW9uIHBhcnNlRE9NKGh0bWwpIHtcbiAgaWYgKHR5cGVvZiBodG1sICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgfVxuXG4gIGlmICghaHRtbCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIC8vIG1hdGNoIGRpcmVjdGl2ZVxuICB2YXIgbWF0Y2ggPSBodG1sLm1hdGNoKERJUkVDVElWRV9SRUdFWCk7XG4gIHZhciBkaXJlY3RpdmU7XG5cbiAgaWYgKG1hdGNoICYmIG1hdGNoWzFdKSB7XG4gICAgZGlyZWN0aXZlID0gbWF0Y2hbMV07XG5cbiAgICAvLyByZW1vdmUgZGlyZWN0aXZlIGluIElFOSBiZWNhdXNlIERPTVBhcnNlciB1c2VzXG4gICAgLy8gTUlNRSB0eXBlICd0ZXh0L3htbCcgaW5zdGVhZCBvZiAndGV4dC9odG1sJ1xuICAgIGlmIChpc0lFOSkge1xuICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZShtYXRjaFswXSwgJycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmb3JtYXRET00oZG9tcGFyc2VyKGh0bWwpLCBudWxsLCBkaXJlY3RpdmUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlRE9NO1xuIiwidmFyIENBU0VfU0VOU0lUSVZFX1RBR19OQU1FUyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJykuQ0FTRV9TRU5TSVRJVkVfVEFHX05BTUVTO1xuXG52YXIgY2FzZVNlbnNpdGl2ZVRhZ05hbWVzTWFwID0ge307XG52YXIgdGFnTmFtZTtcbmZvciAodmFyIGkgPSAwLCBsZW4gPSBDQVNFX1NFTlNJVElWRV9UQUdfTkFNRVMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgdGFnTmFtZSA9IENBU0VfU0VOU0lUSVZFX1RBR19OQU1FU1tpXTtcbiAgY2FzZVNlbnNpdGl2ZVRhZ05hbWVzTWFwW3RhZ05hbWUudG9Mb3dlckNhc2UoKV0gPSB0YWdOYW1lO1xufVxuXG4vKipcbiAqIEdldHMgY2FzZS1zZW5zaXRpdmUgdGFnIG5hbWUuXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSAgICAgICAgICAgdGFnTmFtZSAtIFRoZSBsb3dlcmNhc2UgdGFnIG5hbWUuXG4gKiBAcmV0dXJuIHtTdHJpbmd8dW5kZWZpbmVkfVxuICovXG5mdW5jdGlvbiBnZXRDYXNlU2Vuc2l0aXZlVGFnTmFtZSh0YWdOYW1lKSB7XG4gIHJldHVybiBjYXNlU2Vuc2l0aXZlVGFnTmFtZXNNYXBbdGFnTmFtZV07XG59XG5cbi8qKlxuICogRm9ybWF0cyBET00gYXR0cmlidXRlcyB0byBhIGhhc2ggbWFwLlxuICpcbiAqIEBwYXJhbSAge05hbWVkTm9kZU1hcH0gYXR0cmlidXRlcyAtIFRoZSBsaXN0IG9mIGF0dHJpYnV0ZXMuXG4gKiBAcmV0dXJuIHtPYmplY3R9ICAgICAgICAgICAgICAgICAgLSBBIG1hcCBvZiBhdHRyaWJ1dGUgbmFtZSB0byB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gZm9ybWF0QXR0cmlidXRlcyhhdHRyaWJ1dGVzKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgdmFyIGF0dHJpYnV0ZTtcbiAgLy8gYE5hbWVkTm9kZU1hcGAgaXMgYXJyYXktbGlrZVxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gYXR0cmlidXRlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGF0dHJpYnV0ZSA9IGF0dHJpYnV0ZXNbaV07XG4gICAgcmVzdWx0W2F0dHJpYnV0ZS5uYW1lXSA9IGF0dHJpYnV0ZS52YWx1ZTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIENvcnJlY3RzIHRoZSB0YWcgbmFtZSBpZiBpdCBpcyBjYXNlLXNlbnNpdGl2ZSAoU1ZHKS5cbiAqIE90aGVyd2lzZSwgcmV0dXJucyB0aGUgbG93ZXJjYXNlIHRhZyBuYW1lIChIVE1MKS5cbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHRhZ05hbWUgLSBUaGUgbG93ZXJjYXNlIHRhZyBuYW1lLlxuICogQHJldHVybiB7U3RyaW5nfSAgICAgICAgIC0gVGhlIGZvcm1hdHRlZCB0YWcgbmFtZS5cbiAqL1xuZnVuY3Rpb24gZm9ybWF0VGFnTmFtZSh0YWdOYW1lKSB7XG4gIHRhZ05hbWUgPSB0YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gIHZhciBjYXNlU2Vuc2l0aXZlVGFnTmFtZSA9IGdldENhc2VTZW5zaXRpdmVUYWdOYW1lKHRhZ05hbWUpO1xuICBpZiAoY2FzZVNlbnNpdGl2ZVRhZ05hbWUpIHtcbiAgICByZXR1cm4gY2FzZVNlbnNpdGl2ZVRhZ05hbWU7XG4gIH1cbiAgcmV0dXJuIHRhZ05hbWU7XG59XG5cbi8qKlxuICogRm9ybWF0cyB0aGUgYnJvd3NlciBET00gbm9kZXMgdG8gbWltaWMgdGhlIG91dHB1dCBvZiBgaHRtbHBhcnNlcjIucGFyc2VET00oKWAuXG4gKlxuICogQHBhcmFtICB7Tm9kZUxpc3R9IG5vZGVzICAgICAgICAtIFRoZSBET00gbm9kZXMuXG4gKiBAcGFyYW0gIHtPYmplY3R9ICAgW3BhcmVudE9ial0gIC0gVGhlIGZvcm1hdHRlZCBwYXJlbnQgbm9kZS5cbiAqIEBwYXJhbSAge1N0cmluZ30gICBbZGlyZWN0aXZlXSAgLSBUaGUgZGlyZWN0aXZlLlxuICogQHJldHVybiB7T2JqZWN0W119ICAgICAgICAgICAgICAtIFRoZSBmb3JtYXR0ZWQgRE9NIG9iamVjdC5cbiAqL1xuZnVuY3Rpb24gZm9ybWF0RE9NKG5vZGVzLCBwYXJlbnRPYmosIGRpcmVjdGl2ZSkge1xuICBwYXJlbnRPYmogPSBwYXJlbnRPYmogfHwgbnVsbDtcblxuICB2YXIgcmVzdWx0ID0gW107XG4gIHZhciBub2RlO1xuICB2YXIgcHJldk5vZGU7XG4gIHZhciBub2RlT2JqO1xuXG4gIC8vIGBOb2RlTGlzdGAgaXMgYXJyYXktbGlrZVxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gbm9kZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBub2RlID0gbm9kZXNbaV07XG4gICAgLy8gcmVzZXRcbiAgICBub2RlT2JqID0ge1xuICAgICAgbmV4dDogbnVsbCxcbiAgICAgIHByZXY6IHJlc3VsdFtpIC0gMV0gfHwgbnVsbCxcbiAgICAgIHBhcmVudDogcGFyZW50T2JqXG4gICAgfTtcblxuICAgIC8vIHNldCB0aGUgbmV4dCBub2RlIGZvciB0aGUgcHJldmlvdXMgbm9kZSAoaWYgYXBwbGljYWJsZSlcbiAgICBwcmV2Tm9kZSA9IHJlc3VsdFtpIC0gMV07XG4gICAgaWYgKHByZXZOb2RlKSB7XG4gICAgICBwcmV2Tm9kZS5uZXh0ID0gbm9kZU9iajtcbiAgICB9XG5cbiAgICAvLyBzZXQgdGhlIG5vZGUgbmFtZSBpZiBpdCdzIG5vdCBcIiN0ZXh0XCIgb3IgXCIjY29tbWVudFwiXG4gICAgLy8gZS5nLiwgXCJkaXZcIlxuICAgIGlmIChub2RlLm5vZGVOYW1lWzBdICE9PSAnIycpIHtcbiAgICAgIG5vZGVPYmoubmFtZSA9IGZvcm1hdFRhZ05hbWUobm9kZS5ub2RlTmFtZSk7XG4gICAgICAvLyBhbHNvLCBub2RlcyBvZiB0eXBlIFwidGFnXCIgaGF2ZSBcImF0dHJpYnNcIlxuICAgICAgbm9kZU9iai5hdHRyaWJzID0ge307IC8vIGRlZmF1bHRcbiAgICAgIGlmIChub2RlLmF0dHJpYnV0ZXMgJiYgbm9kZS5hdHRyaWJ1dGVzLmxlbmd0aCkge1xuICAgICAgICBub2RlT2JqLmF0dHJpYnMgPSBmb3JtYXRBdHRyaWJ1dGVzKG5vZGUuYXR0cmlidXRlcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gc2V0IHRoZSBub2RlIHR5cGVcbiAgICAvLyBlLmcuLCBcInRhZ1wiXG4gICAgc3dpdGNoIChub2RlLm5vZGVUeXBlKSB7XG4gICAgICAvLyAxID0gZWxlbWVudFxuICAgICAgY2FzZSAxOlxuICAgICAgICBpZiAobm9kZU9iai5uYW1lID09PSAnc2NyaXB0JyB8fCBub2RlT2JqLm5hbWUgPT09ICdzdHlsZScpIHtcbiAgICAgICAgICBub2RlT2JqLnR5cGUgPSBub2RlT2JqLm5hbWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbm9kZU9iai50eXBlID0gJ3RhZyc7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVjdXJzaXZlbHkgZm9ybWF0IHRoZSBjaGlsZHJlblxuICAgICAgICBub2RlT2JqLmNoaWxkcmVuID0gZm9ybWF0RE9NKG5vZGUuY2hpbGROb2Rlcywgbm9kZU9iaik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gMiA9IGF0dHJpYnV0ZVxuICAgICAgLy8gMyA9IHRleHRcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgbm9kZU9iai50eXBlID0gJ3RleHQnO1xuICAgICAgICBub2RlT2JqLmRhdGEgPSBub2RlLm5vZGVWYWx1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyA4ID0gY29tbWVudFxuICAgICAgY2FzZSA4OlxuICAgICAgICBub2RlT2JqLnR5cGUgPSAnY29tbWVudCc7XG4gICAgICAgIG5vZGVPYmouZGF0YSA9IG5vZGUubm9kZVZhbHVlO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXN1bHQucHVzaChub2RlT2JqKTtcbiAgfVxuXG4gIGlmIChkaXJlY3RpdmUpIHtcbiAgICByZXN1bHQudW5zaGlmdCh7XG4gICAgICBuYW1lOiBkaXJlY3RpdmUuc3Vic3RyaW5nKDAsIGRpcmVjdGl2ZS5pbmRleE9mKCcgJykpLnRvTG93ZXJDYXNlKCksXG4gICAgICBkYXRhOiBkaXJlY3RpdmUsXG4gICAgICB0eXBlOiAnZGlyZWN0aXZlJyxcbiAgICAgIG5leHQ6IHJlc3VsdFswXSA/IHJlc3VsdFswXSA6IG51bGwsXG4gICAgICBwcmV2OiBudWxsLFxuICAgICAgcGFyZW50OiBwYXJlbnRPYmpcbiAgICB9KTtcblxuICAgIGlmIChyZXN1bHRbMV0pIHtcbiAgICAgIHJlc3VsdFsxXS5wcmV2ID0gcmVzdWx0WzBdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRGV0ZWN0cyBJRSB3aXRoIG9yIHdpdGhvdXQgdmVyc2lvbi5cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICBbdmVyc2lvbl0gLSBUaGUgSUUgdmVyc2lvbiB0byBkZXRlY3QuXG4gKiBAcmV0dXJuIHtCb29sZWFufSAgICAgICAgICAgLSBXaGV0aGVyIElFIG9yIHRoZSB2ZXJzaW9uIGhhcyBiZWVuIGRldGVjdGVkLlxuICovXG5mdW5jdGlvbiBpc0lFKHZlcnNpb24pIHtcbiAgaWYgKHZlcnNpb24pIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuZG9jdW1lbnRNb2RlID09PSB2ZXJzaW9uO1xuICB9XG4gIHJldHVybiAvKE1TSUUgfFRyaWRlbnRcXC98RWRnZVxcLykvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBmb3JtYXRBdHRyaWJ1dGVzOiBmb3JtYXRBdHRyaWJ1dGVzLFxuICBmb3JtYXRET006IGZvcm1hdERPTSxcbiAgaXNJRTogaXNJRVxufTtcbiIsInZhciBkb21Ub1JlYWN0ID0gcmVxdWlyZSgnLi9saWIvZG9tLXRvLXJlYWN0Jyk7XG52YXIgaHRtbFRvRE9NID0gcmVxdWlyZSgnaHRtbC1kb20tcGFyc2VyJyk7XG5cbi8vIGRlY29kZSBIVE1MIGVudGl0aWVzIGJ5IGRlZmF1bHQgZm9yIGBodG1scGFyc2VyMmBcbnZhciBkb21QYXJzZXJPcHRpb25zID0geyBkZWNvZGVFbnRpdGllczogdHJ1ZSwgbG93ZXJDYXNlQXR0cmlidXRlTmFtZXM6IGZhbHNlIH07XG5cbi8qKlxuICogQ29udmVydHMgSFRNTCBzdHJpbmcgdG8gUmVhY3QgZWxlbWVudHMuXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSAgIGh0bWwgICAgICAgICAgICAgICAgICAgIC0gSFRNTCBzdHJpbmcuXG4gKiBAcGFyYW0gIHtPYmplY3R9ICAgW29wdGlvbnNdICAgICAgICAgICAgICAgLSBQYXJzZXIgb3B0aW9ucy5cbiAqIEBwYXJhbSAge09iamVjdH0gICBbb3B0aW9ucy5odG1scGFyc2VyMl0gICAtIGh0bWxwYXJzZXIyIG9wdGlvbnMuXG4gKiBAcGFyYW0gIHtPYmplY3R9ICAgW29wdGlvbnMubGlicmFyeV0gICAgICAgLSBMaWJyYXJ5IGZvciBSZWFjdCwgUHJlYWN0LCBldGMuXG4gKiBAcGFyYW0gIHtGdW5jdGlvbn0gW29wdGlvbnMucmVwbGFjZV0gICAgICAgLSBSZXBsYWNlIG1ldGhvZC5cbiAqIEByZXR1cm4ge0pTWC5FbGVtZW50fEpTWC5FbGVtZW50W118U3RyaW5nfSAtIFJlYWN0IGVsZW1lbnQocyksIGVtcHR5IGFycmF5LCBvciBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIEhUTUxSZWFjdFBhcnNlcihodG1sLCBvcHRpb25zKSB7XG4gIGlmICh0eXBlb2YgaHRtbCAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGaXJzdCBhcmd1bWVudCBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gIH1cbiAgaWYgKGh0bWwgPT09ICcnKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICByZXR1cm4gZG9tVG9SZWFjdChcbiAgICBodG1sVG9ET00oaHRtbCwgb3B0aW9ucy5odG1scGFyc2VyMiB8fCBkb21QYXJzZXJPcHRpb25zKSxcbiAgICBvcHRpb25zXG4gICk7XG59XG5cbkhUTUxSZWFjdFBhcnNlci5kb21Ub1JlYWN0ID0gZG9tVG9SZWFjdDtcbkhUTUxSZWFjdFBhcnNlci5odG1sVG9ET00gPSBodG1sVG9ET007XG5cbi8vIHN1cHBvcnQgQ29tbW9uSlMgYW5kIEVTIE1vZHVsZXNcbm1vZHVsZS5leHBvcnRzID0gSFRNTFJlYWN0UGFyc2VyO1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IEhUTUxSZWFjdFBhcnNlcjtcbiIsInZhciByZWFjdFByb3BlcnR5ID0gcmVxdWlyZSgncmVhY3QtcHJvcGVydHknKTtcbnZhciBzdHlsZVRvT2JqZWN0ID0gcmVxdWlyZSgnc3R5bGUtdG8tb2JqZWN0Jyk7XG52YXIgdXRpbGl0aWVzID0gcmVxdWlyZSgnLi91dGlsaXRpZXMnKTtcblxudmFyIGNhbWVsQ2FzZSA9IHV0aWxpdGllcy5jYW1lbENhc2U7XG5cbnZhciBodG1sUHJvcGVydGllcyA9IHJlYWN0UHJvcGVydHkuaHRtbDtcbnZhciBzdmdQcm9wZXJ0aWVzID0gcmVhY3RQcm9wZXJ0eS5zdmc7XG52YXIgaXNDdXN0b21BdHRyaWJ1dGUgPSByZWFjdFByb3BlcnR5LmlzQ3VzdG9tQXR0cmlidXRlO1xuXG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIENvbnZlcnRzIEhUTUwvU1ZHIERPTSBhdHRyaWJ1dGVzIHRvIFJlYWN0IHByb3BzLlxuICpcbiAqIEBwYXJhbSAge09iamVjdH0gW2F0dHJpYnV0ZXM9e31dIC0gVGhlIEhUTUwvU1ZHIERPTSBhdHRyaWJ1dGVzLlxuICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICAgICAgICAgLSBUaGUgUmVhY3QgcHJvcHMuXG4gKi9cbmZ1bmN0aW9uIGF0dHJpYnV0ZXNUb1Byb3BzKGF0dHJpYnV0ZXMpIHtcbiAgYXR0cmlidXRlcyA9IGF0dHJpYnV0ZXMgfHwge307XG5cbiAgdmFyIGF0dHJpYnV0ZU5hbWU7XG4gIHZhciBhdHRyaWJ1dGVOYW1lTG93ZXJDYXNlZDtcbiAgdmFyIGF0dHJpYnV0ZVZhbHVlO1xuICB2YXIgcHJvcGVydHk7XG4gIHZhciBwcm9wcyA9IHt9O1xuXG4gIGZvciAoYXR0cmlidXRlTmFtZSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgYXR0cmlidXRlVmFsdWUgPSBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdO1xuXG4gICAgLy8gQVJJQSAoYXJpYS0qKSBvciBjdXN0b20gZGF0YSAoZGF0YS0qKSBhdHRyaWJ1dGVcbiAgICBpZiAoaXNDdXN0b21BdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSkpIHtcbiAgICAgIHByb3BzW2F0dHJpYnV0ZU5hbWVdID0gYXR0cmlidXRlVmFsdWU7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBjb252ZXJ0IEhUTUwgYXR0cmlidXRlIHRvIFJlYWN0IHByb3BcbiAgICBhdHRyaWJ1dGVOYW1lTG93ZXJDYXNlZCA9IGF0dHJpYnV0ZU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChodG1sUHJvcGVydGllcywgYXR0cmlidXRlTmFtZUxvd2VyQ2FzZWQpKSB7XG4gICAgICBwcm9wZXJ0eSA9IGh0bWxQcm9wZXJ0aWVzW2F0dHJpYnV0ZU5hbWVMb3dlckNhc2VkXTtcbiAgICAgIHByb3BzW3Byb3BlcnR5LnByb3BlcnR5TmFtZV0gPVxuICAgICAgICBwcm9wZXJ0eS5oYXNCb29sZWFuVmFsdWUgfHxcbiAgICAgICAgKHByb3BlcnR5Lmhhc092ZXJsb2FkZWRCb29sZWFuVmFsdWUgJiYgIWF0dHJpYnV0ZVZhbHVlKVxuICAgICAgICAgID8gdHJ1ZVxuICAgICAgICAgIDogYXR0cmlidXRlVmFsdWU7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBjb252ZXJ0IFNWRyBhdHRyaWJ1dGUgdG8gUmVhY3QgcHJvcFxuICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKHN2Z1Byb3BlcnRpZXMsIGF0dHJpYnV0ZU5hbWUpKSB7XG4gICAgICBwcm9wZXJ0eSA9IHN2Z1Byb3BlcnRpZXNbYXR0cmlidXRlTmFtZV07XG4gICAgICBwcm9wc1twcm9wZXJ0eS5wcm9wZXJ0eU5hbWVdID0gYXR0cmlidXRlVmFsdWU7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBwcmVzZXJ2ZSBjdXN0b20gYXR0cmlidXRlIGlmIFJlYWN0ID49MTZcbiAgICBpZiAodXRpbGl0aWVzLlBSRVNFUlZFX0NVU1RPTV9BVFRSSUJVVEVTKSB7XG4gICAgICBwcm9wc1thdHRyaWJ1dGVOYW1lXSA9IGF0dHJpYnV0ZVZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIC8vIGNvbnZlcnQgaW5saW5lIHN0eWxlIHRvIG9iamVjdFxuICBpZiAoYXR0cmlidXRlcy5zdHlsZSAhPSBudWxsKSB7XG4gICAgcHJvcHMuc3R5bGUgPSBjc3NUb0pzKGF0dHJpYnV0ZXMuc3R5bGUpO1xuICB9XG5cbiAgcmV0dXJuIHByb3BzO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGlubGluZSBDU1Mgc3R5bGUgdG8gUE9KTyAoUGxhaW4gT2xkIEphdmFTY3JpcHQgT2JqZWN0KS5cbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0eWxlIC0gVGhlIGlubGluZSBDU1Mgc3R5bGUuXG4gKiBAcmV0dXJuIHtPYmplY3R9ICAgICAgIC0gVGhlIHN0eWxlIG9iamVjdC5cbiAqL1xuZnVuY3Rpb24gY3NzVG9KcyhzdHlsZSkge1xuICB2YXIgc3R5bGVPYmplY3QgPSB7fTtcblxuICBpZiAoc3R5bGUpIHtcbiAgICBzdHlsZVRvT2JqZWN0KHN0eWxlLCBmdW5jdGlvbiAocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICAvLyBza2lwIENTUyBjb21tZW50XG4gICAgICBpZiAocHJvcGVydHkgJiYgdmFsdWUpIHtcbiAgICAgICAgc3R5bGVPYmplY3RbY2FtZWxDYXNlKHByb3BlcnR5KV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBzdHlsZU9iamVjdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhdHRyaWJ1dGVzVG9Qcm9wcztcbiIsInZhciBhdHRyaWJ1dGVzVG9Qcm9wcyA9IHJlcXVpcmUoJy4vYXR0cmlidXRlcy10by1wcm9wcycpO1xudmFyIHV0aWxpdGllcyA9IHJlcXVpcmUoJy4vdXRpbGl0aWVzJyk7XG5cbi8qKlxuICogQ29udmVydHMgRE9NIG5vZGVzIHRvIFJlYWN0IGVsZW1lbnRzLlxuICpcbiAqIEBwYXJhbSB7RG9tRWxlbWVudFtdfSBub2RlcyAtIFRoZSBET00gbm9kZXMuXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIC0gVGhlIGFkZGl0aW9uYWwgb3B0aW9ucy5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtvcHRpb25zLnJlcGxhY2VdIC0gVGhlIHJlcGxhY2VyLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zLmxpYnJhcnldIC0gVGhlIGxpYnJhcnkgKFJlYWN0LCBQcmVhY3QsIGV0Yy4pLlxuICogQHJldHVybiB7U3RyaW5nfFJlYWN0RWxlbWVudHxSZWFjdEVsZW1lbnRbXX1cbiAqL1xuZnVuY3Rpb24gZG9tVG9SZWFjdChub2Rlcywgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICB2YXIgUmVhY3QgPSBvcHRpb25zLmxpYnJhcnkgfHwgcmVxdWlyZSgncmVhY3QnKTtcbiAgdmFyIGNsb25lRWxlbWVudCA9IFJlYWN0LmNsb25lRWxlbWVudDtcbiAgdmFyIGNyZWF0ZUVsZW1lbnQgPSBSZWFjdC5jcmVhdGVFbGVtZW50O1xuICB2YXIgaXNWYWxpZEVsZW1lbnQgPSBSZWFjdC5pc1ZhbGlkRWxlbWVudDtcblxuICB2YXIgcmVzdWx0ID0gW107XG4gIHZhciBub2RlO1xuICB2YXIgaGFzUmVwbGFjZSA9IHR5cGVvZiBvcHRpb25zLnJlcGxhY2UgPT09ICdmdW5jdGlvbic7XG4gIHZhciByZXBsYWNlRWxlbWVudDtcbiAgdmFyIHByb3BzO1xuICB2YXIgY2hpbGRyZW47XG4gIHZhciBkYXRhO1xuICB2YXIgdHJpbSA9IG9wdGlvbnMudHJpbTtcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gbm9kZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBub2RlID0gbm9kZXNbaV07XG5cbiAgICAvLyByZXBsYWNlIHdpdGggY3VzdG9tIFJlYWN0IGVsZW1lbnQgKGlmIHByZXNlbnQpXG4gICAgaWYgKGhhc1JlcGxhY2UpIHtcbiAgICAgIHJlcGxhY2VFbGVtZW50ID0gb3B0aW9ucy5yZXBsYWNlKG5vZGUpO1xuXG4gICAgICBpZiAoaXNWYWxpZEVsZW1lbnQocmVwbGFjZUVsZW1lbnQpKSB7XG4gICAgICAgIC8vIHNldCBcImtleVwiIHByb3AgZm9yIHNpYmxpbmcgZWxlbWVudHNcbiAgICAgICAgLy8gaHR0cHM6Ly9mYi5tZS9yZWFjdC13YXJuaW5nLWtleXNcbiAgICAgICAgaWYgKGxlbiA+IDEpIHtcbiAgICAgICAgICByZXBsYWNlRWxlbWVudCA9IGNsb25lRWxlbWVudChyZXBsYWNlRWxlbWVudCwge1xuICAgICAgICAgICAga2V5OiByZXBsYWNlRWxlbWVudC5rZXkgfHwgaVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC5wdXNoKHJlcGxhY2VFbGVtZW50KTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG5vZGUudHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICAvLyBpZiB0cmltIG9wdGlvbiBpcyBlbmFibGVkLCBza2lwIHdoaXRlc3BhY2UgdGV4dCBub2Rlc1xuICAgICAgaWYgKHRyaW0pIHtcbiAgICAgICAgZGF0YSA9IG5vZGUuZGF0YS50cmltKCk7XG4gICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2gobm9kZS5kYXRhKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0LnB1c2gobm9kZS5kYXRhKTtcbiAgICAgIH1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHByb3BzID0gbm9kZS5hdHRyaWJzO1xuICAgIGlmICghc2hvdWxkUGFzc0F0dHJpYnV0ZXNVbmFsdGVyZWQobm9kZSkpIHtcbiAgICAgIHByb3BzID0gYXR0cmlidXRlc1RvUHJvcHMobm9kZS5hdHRyaWJzKTtcbiAgICB9XG5cbiAgICBjaGlsZHJlbiA9IG51bGw7XG5cbiAgICBzd2l0Y2ggKG5vZGUudHlwZSkge1xuICAgICAgY2FzZSAnc2NyaXB0JzpcbiAgICAgIGNhc2UgJ3N0eWxlJzpcbiAgICAgICAgLy8gcHJldmVudCB0ZXh0IGluIDxzY3JpcHQ+IG9yIDxzdHlsZT4gZnJvbSBiZWluZyBlc2NhcGVkXG4gICAgICAgIC8vIGh0dHBzOi8vcmVhY3Rqcy5vcmcvZG9jcy9kb20tZWxlbWVudHMuaHRtbCNkYW5nZXJvdXNseXNldGlubmVyaHRtbFxuICAgICAgICBpZiAobm9kZS5jaGlsZHJlblswXSkge1xuICAgICAgICAgIHByb3BzLmRhbmdlcm91c2x5U2V0SW5uZXJIVE1MID0ge1xuICAgICAgICAgICAgX19odG1sOiBub2RlLmNoaWxkcmVuWzBdLmRhdGFcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICd0YWcnOlxuICAgICAgICAvLyBzZXR0aW5nIHRleHRhcmVhIHZhbHVlIGluIGNoaWxkcmVuIGlzIGFuIGFudGlwYXR0ZXJuIGluIFJlYWN0XG4gICAgICAgIC8vIGh0dHBzOi8vcmVhY3Rqcy5vcmcvZG9jcy9mb3Jtcy5odG1sI3RoZS10ZXh0YXJlYS10YWdcbiAgICAgICAgaWYgKG5vZGUubmFtZSA9PT0gJ3RleHRhcmVhJyAmJiBub2RlLmNoaWxkcmVuWzBdKSB7XG4gICAgICAgICAgcHJvcHMuZGVmYXVsdFZhbHVlID0gbm9kZS5jaGlsZHJlblswXS5kYXRhO1xuICAgICAgICB9IGVsc2UgaWYgKG5vZGUuY2hpbGRyZW4gJiYgbm9kZS5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICAvLyBjb250aW51ZSByZWN1cnNpb24gb2YgY3JlYXRpbmcgUmVhY3QgZWxlbWVudHMgKGlmIGFwcGxpY2FibGUpXG4gICAgICAgICAgY2hpbGRyZW4gPSBkb21Ub1JlYWN0KG5vZGUuY2hpbGRyZW4sIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICAvLyBza2lwIGFsbCBvdGhlciBjYXNlcyAoZS5nLiwgY29tbWVudClcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHNldCBcImtleVwiIHByb3AgZm9yIHNpYmxpbmcgZWxlbWVudHNcbiAgICAvLyBodHRwczovL2ZiLm1lL3JlYWN0LXdhcm5pbmcta2V5c1xuICAgIGlmIChsZW4gPiAxKSB7XG4gICAgICBwcm9wcy5rZXkgPSBpO1xuICAgIH1cblxuICAgIHJlc3VsdC5wdXNoKGNyZWF0ZUVsZW1lbnQobm9kZS5uYW1lLCBwcm9wcywgY2hpbGRyZW4pKTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQubGVuZ3RoID09PSAxID8gcmVzdWx0WzBdIDogcmVzdWx0O1xufVxuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciBhdHRyaWJ1dGVzIHNob3VsZCBiZSBhbHRlcmVkIG9yIG5vdC5cbiAqXG4gKiBAcGFyYW0ge1JlYWN0LlJlYWN0RWxlbWVudH0gbm9kZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gc2hvdWxkUGFzc0F0dHJpYnV0ZXNVbmFsdGVyZWQobm9kZSkge1xuICByZXR1cm4gKFxuICAgIHV0aWxpdGllcy5QUkVTRVJWRV9DVVNUT01fQVRUUklCVVRFUyAmJlxuICAgIG5vZGUudHlwZSA9PT0gJ3RhZycgJiZcbiAgICB1dGlsaXRpZXMuaXNDdXN0b21Db21wb25lbnQobm9kZS5uYW1lLCBub2RlLmF0dHJpYnMpXG4gICk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZG9tVG9SZWFjdDtcbiIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgaHlwaGVuUGF0dGVyblJlZ2V4ID0gLy0oW2Etel0pL2c7XG52YXIgQ1VTVE9NX1BST1BFUlRZX09SX05PX0hZUEhFTl9SRUdFWCA9IC9eLS1bYS16QS1aMC05LV0rJHxeW14tXSskLztcblxuLyoqXG4gKiBDb252ZXJ0cyBhIHN0cmluZyB0byBjYW1lbENhc2UuXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBzdHJpbmcgLSBUaGUgc3RyaW5nLlxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBjYW1lbENhc2Uoc3RyaW5nKSB7XG4gIGlmICh0eXBlb2Ygc3RyaW5nICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgfVxuXG4gIC8vIGN1c3RvbSBwcm9wZXJ0eSBvciBubyBoeXBoZW4gZm91bmRcbiAgaWYgKENVU1RPTV9QUk9QRVJUWV9PUl9OT19IWVBIRU5fUkVHRVgudGVzdChzdHJpbmcpKSB7XG4gICAgcmV0dXJuIHN0cmluZztcbiAgfVxuXG4gIC8vIGNvbnZlcnQgdG8gY2FtZWxDYXNlXG4gIHJldHVybiBzdHJpbmdcbiAgICAudG9Mb3dlckNhc2UoKVxuICAgIC5yZXBsYWNlKGh5cGhlblBhdHRlcm5SZWdleCwgZnVuY3Rpb24gKF8sIGNoYXJhY3Rlcikge1xuICAgICAgcmV0dXJuIGNoYXJhY3Rlci50b1VwcGVyQ2FzZSgpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIFN3YXAga2V5IHdpdGggdmFsdWUgaW4gYW4gb2JqZWN0LlxuICpcbiAqIEBwYXJhbSAge09iamVjdH0gICBvYmogICAgICAgIC0gVGhlIG9iamVjdC5cbiAqIEBwYXJhbSAge0Z1bmN0aW9ufSBbb3ZlcnJpZGVdIC0gVGhlIG92ZXJyaWRlIG1ldGhvZC5cbiAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICAgICAgIC0gVGhlIGludmVydGVkIG9iamVjdC5cbiAqL1xuZnVuY3Rpb24gaW52ZXJ0T2JqZWN0KG9iaiwgb3ZlcnJpZGUpIHtcbiAgaWYgKCFvYmogfHwgdHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGaXJzdCBhcmd1bWVudCBtdXN0IGJlIGFuIG9iamVjdCcpO1xuICB9XG5cbiAgdmFyIGtleTtcbiAgdmFyIHZhbHVlO1xuICB2YXIgaXNPdmVycmlkZVByZXNlbnQgPSB0eXBlb2Ygb3ZlcnJpZGUgPT09ICdmdW5jdGlvbic7XG4gIHZhciBvdmVycmlkZXMgPSB7fTtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuXG4gIGZvciAoa2V5IGluIG9iaikge1xuICAgIHZhbHVlID0gb2JqW2tleV07XG5cbiAgICBpZiAoaXNPdmVycmlkZVByZXNlbnQpIHtcbiAgICAgIG92ZXJyaWRlcyA9IG92ZXJyaWRlKGtleSwgdmFsdWUpO1xuICAgICAgaWYgKG92ZXJyaWRlcyAmJiBvdmVycmlkZXMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgIHJlc3VsdFtvdmVycmlkZXNbMF1dID0gb3ZlcnJpZGVzWzFdO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgcmVzdWx0W3ZhbHVlXSA9IGtleTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGEgZ2l2ZW4gdGFnIGlzIGEgY3VzdG9tIGNvbXBvbmVudC5cbiAqXG4gKiBAc2VlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVhY3QvYmxvYi92MTYuNi4zL3BhY2thZ2VzL3JlYWN0LWRvbS9zcmMvc2hhcmVkL2lzQ3VzdG9tQ29tcG9uZW50LmpzfVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB0YWdOYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGh0bWwgdGFnLlxuICogQHBhcmFtIHtPYmplY3R9IHByb3BzICAgLSBUaGUgcHJvcHMgYmVpbmcgcGFzc2VkIHRvIHRoZSBlbGVtZW50LlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNDdXN0b21Db21wb25lbnQodGFnTmFtZSwgcHJvcHMpIHtcbiAgaWYgKHRhZ05hbWUuaW5kZXhPZignLScpID09PSAtMSkge1xuICAgIHJldHVybiBwcm9wcyAmJiB0eXBlb2YgcHJvcHMuaXMgPT09ICdzdHJpbmcnO1xuICB9XG5cbiAgc3dpdGNoICh0YWdOYW1lKSB7XG4gICAgLy8gVGhlc2UgYXJlIHJlc2VydmVkIFNWRyBhbmQgTWF0aE1MIGVsZW1lbnRzLlxuICAgIC8vIFdlIGRvbid0IG1pbmQgdGhpcyB3aGl0ZWxpc3QgdG9vIG11Y2ggYmVjYXVzZSB3ZSBleHBlY3QgaXQgdG8gbmV2ZXIgZ3Jvdy5cbiAgICAvLyBUaGUgYWx0ZXJuYXRpdmUgaXMgdG8gdHJhY2sgdGhlIG5hbWVzcGFjZSBpbiBhIGZldyBwbGFjZXMgd2hpY2ggaXMgY29udm9sdXRlZC5cbiAgICAvLyBodHRwczovL3czYy5naXRodWIuaW8vd2ViY29tcG9uZW50cy9zcGVjL2N1c3RvbS8jY3VzdG9tLWVsZW1lbnRzLWNvcmUtY29uY2VwdHNcbiAgICBjYXNlICdhbm5vdGF0aW9uLXhtbCc6XG4gICAgY2FzZSAnY29sb3ItcHJvZmlsZSc6XG4gICAgY2FzZSAnZm9udC1mYWNlJzpcbiAgICBjYXNlICdmb250LWZhY2Utc3JjJzpcbiAgICBjYXNlICdmb250LWZhY2UtdXJpJzpcbiAgICBjYXNlICdmb250LWZhY2UtZm9ybWF0JzpcbiAgICBjYXNlICdmb250LWZhY2UtbmFtZSc6XG4gICAgY2FzZSAnbWlzc2luZy1nbHlwaCc6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbi8qKlxuICogQGNvbnN0YW50IHtCb29sZWFufVxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9yZWFjdGpzLm9yZy9ibG9nLzIwMTcvMDkvMDgvZG9tLWF0dHJpYnV0ZXMtaW4tcmVhY3QtMTYuaHRtbH1cbiAqL1xudmFyIFBSRVNFUlZFX0NVU1RPTV9BVFRSSUJVVEVTID0gUmVhY3QudmVyc2lvbi5zcGxpdCgnLicpWzBdID49IDE2O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgUFJFU0VSVkVfQ1VTVE9NX0FUVFJJQlVURVM6IFBSRVNFUlZFX0NVU1RPTV9BVFRSSUJVVEVTLFxuICBjYW1lbENhc2U6IGNhbWVsQ2FzZSxcbiAgaW52ZXJ0T2JqZWN0OiBpbnZlcnRPYmplY3QsXG4gIGlzQ3VzdG9tQ29tcG9uZW50OiBpc0N1c3RvbUNvbXBvbmVudFxufTtcbiIsIi8vIGh0dHA6Ly93d3cudzMub3JnL1RSL0NTUzIxL2dyYW1tYXIuaHRtbFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3Zpc2lvbm1lZGlhL2Nzcy1wYXJzZS9wdWxsLzQ5I2lzc3VlY29tbWVudC0zMDA4ODAyN1xudmFyIENPTU1FTlRfUkVHRVggPSAvXFwvXFwqW14qXSpcXCorKFteLypdW14qXSpcXCorKSpcXC8vZztcblxudmFyIE5FV0xJTkVfUkVHRVggPSAvXFxuL2c7XG52YXIgV0hJVEVTUEFDRV9SRUdFWCA9IC9eXFxzKi87XG5cbi8vIGRlY2xhcmF0aW9uXG52YXIgUFJPUEVSVFlfUkVHRVggPSAvXihcXCo/Wy0jLypcXFxcXFx3XSsoXFxbWzAtOWEtel8tXStcXF0pPylcXHMqLztcbnZhciBDT0xPTl9SRUdFWCA9IC9eOlxccyovO1xudmFyIFZBTFVFX1JFR0VYID0gL14oKD86Jyg/OlxcXFwnfC4pKj8nfFwiKD86XFxcXFwifC4pKj9cInxcXChbXildKj9cXCl8W159O10pKykvO1xudmFyIFNFTUlDT0xPTl9SRUdFWCA9IC9eWztcXHNdKi87XG5cbi8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1N0cmluZy9UcmltI1BvbHlmaWxsXG52YXIgVFJJTV9SRUdFWCA9IC9eXFxzK3xcXHMrJC9nO1xuXG4vLyBzdHJpbmdzXG52YXIgTkVXTElORSA9ICdcXG4nO1xudmFyIEZPUldBUkRfU0xBU0ggPSAnLyc7XG52YXIgQVNURVJJU0sgPSAnKic7XG52YXIgRU1QVFlfU1RSSU5HID0gJyc7XG5cbi8vIHR5cGVzXG52YXIgVFlQRV9DT01NRU5UID0gJ2NvbW1lbnQnO1xudmFyIFRZUEVfREVDTEFSQVRJT04gPSAnZGVjbGFyYXRpb24nO1xuXG4vKipcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHlsZVxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHJldHVybiB7T2JqZWN0W119XG4gKiBAdGhyb3dzIHtUeXBlRXJyb3J9XG4gKiBAdGhyb3dzIHtFcnJvcn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdHlsZSwgb3B0aW9ucykge1xuICBpZiAodHlwZW9mIHN0eWxlICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgfVxuXG4gIGlmICghc3R5bGUpIHJldHVybiBbXTtcblxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAvKipcbiAgICogUG9zaXRpb25hbC5cbiAgICovXG4gIHZhciBsaW5lbm8gPSAxO1xuICB2YXIgY29sdW1uID0gMTtcblxuICAvKipcbiAgICogVXBkYXRlIGxpbmVubyBhbmQgY29sdW1uIGJhc2VkIG9uIGBzdHJgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gICAqL1xuICBmdW5jdGlvbiB1cGRhdGVQb3NpdGlvbihzdHIpIHtcbiAgICB2YXIgbGluZXMgPSBzdHIubWF0Y2goTkVXTElORV9SRUdFWCk7XG4gICAgaWYgKGxpbmVzKSBsaW5lbm8gKz0gbGluZXMubGVuZ3RoO1xuICAgIHZhciBpID0gc3RyLmxhc3RJbmRleE9mKE5FV0xJTkUpO1xuICAgIGNvbHVtbiA9IH5pID8gc3RyLmxlbmd0aCAtIGkgOiBjb2x1bW4gKyBzdHIubGVuZ3RoO1xuICB9XG5cbiAgLyoqXG4gICAqIE1hcmsgcG9zaXRpb24gYW5kIHBhdGNoIGBub2RlLnBvc2l0aW9uYC5cbiAgICpcbiAgICogQHJldHVybiB7RnVuY3Rpb259XG4gICAqL1xuICBmdW5jdGlvbiBwb3NpdGlvbigpIHtcbiAgICB2YXIgc3RhcnQgPSB7IGxpbmU6IGxpbmVubywgY29sdW1uOiBjb2x1bW4gfTtcbiAgICByZXR1cm4gZnVuY3Rpb24obm9kZSkge1xuICAgICAgbm9kZS5wb3NpdGlvbiA9IG5ldyBQb3NpdGlvbihzdGFydCk7XG4gICAgICB3aGl0ZXNwYWNlKCk7XG4gICAgICByZXR1cm4gbm9kZTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3JlIHBvc2l0aW9uIGluZm9ybWF0aW9uIGZvciBhIG5vZGUuXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcHJvcGVydHkge09iamVjdH0gc3RhcnRcbiAgICogQHByb3BlcnR5IHtPYmplY3R9IGVuZFxuICAgKiBAcHJvcGVydHkge3VuZGVmaW5lZHxTdHJpbmd9IHNvdXJjZVxuICAgKi9cbiAgZnVuY3Rpb24gUG9zaXRpb24oc3RhcnQpIHtcbiAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XG4gICAgdGhpcy5lbmQgPSB7IGxpbmU6IGxpbmVubywgY29sdW1uOiBjb2x1bW4gfTtcbiAgICB0aGlzLnNvdXJjZSA9IG9wdGlvbnMuc291cmNlO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vbi1lbnVtZXJhYmxlIHNvdXJjZSBzdHJpbmcuXG4gICAqL1xuICBQb3NpdGlvbi5wcm90b3R5cGUuY29udGVudCA9IHN0eWxlO1xuXG4gIHZhciBlcnJvcnNMaXN0ID0gW107XG5cbiAgLyoqXG4gICAqIEVycm9yIGBtc2dgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbXNnXG4gICAqIEB0aHJvd3Mge0Vycm9yfVxuICAgKi9cbiAgZnVuY3Rpb24gZXJyb3IobXNnKSB7XG4gICAgdmFyIGVyciA9IG5ldyBFcnJvcihcbiAgICAgIG9wdGlvbnMuc291cmNlICsgJzonICsgbGluZW5vICsgJzonICsgY29sdW1uICsgJzogJyArIG1zZ1xuICAgICk7XG4gICAgZXJyLnJlYXNvbiA9IG1zZztcbiAgICBlcnIuZmlsZW5hbWUgPSBvcHRpb25zLnNvdXJjZTtcbiAgICBlcnIubGluZSA9IGxpbmVubztcbiAgICBlcnIuY29sdW1uID0gY29sdW1uO1xuICAgIGVyci5zb3VyY2UgPSBzdHlsZTtcblxuICAgIGlmIChvcHRpb25zLnNpbGVudCkge1xuICAgICAgZXJyb3JzTGlzdC5wdXNoKGVycik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTWF0Y2ggYHJlYCBhbmQgcmV0dXJuIGNhcHR1cmVzLlxuICAgKlxuICAgKiBAcGFyYW0ge1JlZ0V4cH0gcmVcbiAgICogQHJldHVybiB7dW5kZWZpbmVkfEFycmF5fVxuICAgKi9cbiAgZnVuY3Rpb24gbWF0Y2gocmUpIHtcbiAgICB2YXIgbSA9IHJlLmV4ZWMoc3R5bGUpO1xuICAgIGlmICghbSkgcmV0dXJuO1xuICAgIHZhciBzdHIgPSBtWzBdO1xuICAgIHVwZGF0ZVBvc2l0aW9uKHN0cik7XG4gICAgc3R5bGUgPSBzdHlsZS5zbGljZShzdHIubGVuZ3RoKTtcbiAgICByZXR1cm4gbTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSB3aGl0ZXNwYWNlLlxuICAgKi9cbiAgZnVuY3Rpb24gd2hpdGVzcGFjZSgpIHtcbiAgICBtYXRjaChXSElURVNQQUNFX1JFR0VYKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSBjb21tZW50cy5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3RbXX0gW3J1bGVzXVxuICAgKiBAcmV0dXJuIHtPYmplY3RbXX1cbiAgICovXG4gIGZ1bmN0aW9uIGNvbW1lbnRzKHJ1bGVzKSB7XG4gICAgdmFyIGM7XG4gICAgcnVsZXMgPSBydWxlcyB8fCBbXTtcbiAgICB3aGlsZSAoKGMgPSBjb21tZW50KCkpKSB7XG4gICAgICBpZiAoYyAhPT0gZmFsc2UpIHtcbiAgICAgICAgcnVsZXMucHVzaChjKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJ1bGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlIGNvbW1lbnQuXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICogQHRocm93cyB7RXJyb3J9XG4gICAqL1xuICBmdW5jdGlvbiBjb21tZW50KCkge1xuICAgIHZhciBwb3MgPSBwb3NpdGlvbigpO1xuICAgIGlmIChGT1JXQVJEX1NMQVNIICE9IHN0eWxlLmNoYXJBdCgwKSB8fCBBU1RFUklTSyAhPSBzdHlsZS5jaGFyQXQoMSkpIHJldHVybjtcblxuICAgIHZhciBpID0gMjtcbiAgICB3aGlsZSAoXG4gICAgICBFTVBUWV9TVFJJTkcgIT0gc3R5bGUuY2hhckF0KGkpICYmXG4gICAgICAoQVNURVJJU0sgIT0gc3R5bGUuY2hhckF0KGkpIHx8IEZPUldBUkRfU0xBU0ggIT0gc3R5bGUuY2hhckF0KGkgKyAxKSlcbiAgICApIHtcbiAgICAgICsraTtcbiAgICB9XG4gICAgaSArPSAyO1xuXG4gICAgaWYgKEVNUFRZX1NUUklORyA9PT0gc3R5bGUuY2hhckF0KGkgLSAxKSkge1xuICAgICAgcmV0dXJuIGVycm9yKCdFbmQgb2YgY29tbWVudCBtaXNzaW5nJyk7XG4gICAgfVxuXG4gICAgdmFyIHN0ciA9IHN0eWxlLnNsaWNlKDIsIGkgLSAyKTtcbiAgICBjb2x1bW4gKz0gMjtcbiAgICB1cGRhdGVQb3NpdGlvbihzdHIpO1xuICAgIHN0eWxlID0gc3R5bGUuc2xpY2UoaSk7XG4gICAgY29sdW1uICs9IDI7XG5cbiAgICByZXR1cm4gcG9zKHtcbiAgICAgIHR5cGU6IFRZUEVfQ09NTUVOVCxcbiAgICAgIGNvbW1lbnQ6IHN0clxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlIGRlY2xhcmF0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAqIEB0aHJvd3Mge0Vycm9yfVxuICAgKi9cbiAgZnVuY3Rpb24gZGVjbGFyYXRpb24oKSB7XG4gICAgdmFyIHBvcyA9IHBvc2l0aW9uKCk7XG5cbiAgICAvLyBwcm9wXG4gICAgdmFyIHByb3AgPSBtYXRjaChQUk9QRVJUWV9SRUdFWCk7XG4gICAgaWYgKCFwcm9wKSByZXR1cm47XG4gICAgY29tbWVudCgpO1xuXG4gICAgLy8gOlxuICAgIGlmICghbWF0Y2goQ09MT05fUkVHRVgpKSByZXR1cm4gZXJyb3IoXCJwcm9wZXJ0eSBtaXNzaW5nICc6J1wiKTtcblxuICAgIC8vIHZhbFxuICAgIHZhciB2YWwgPSBtYXRjaChWQUxVRV9SRUdFWCk7XG5cbiAgICB2YXIgcmV0ID0gcG9zKHtcbiAgICAgIHR5cGU6IFRZUEVfREVDTEFSQVRJT04sXG4gICAgICBwcm9wZXJ0eTogdHJpbShwcm9wWzBdLnJlcGxhY2UoQ09NTUVOVF9SRUdFWCwgRU1QVFlfU1RSSU5HKSksXG4gICAgICB2YWx1ZTogdmFsXG4gICAgICAgID8gdHJpbSh2YWxbMF0ucmVwbGFjZShDT01NRU5UX1JFR0VYLCBFTVBUWV9TVFJJTkcpKVxuICAgICAgICA6IEVNUFRZX1NUUklOR1xuICAgIH0pO1xuXG4gICAgLy8gO1xuICAgIG1hdGNoKFNFTUlDT0xPTl9SRUdFWCk7XG5cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlIGRlY2xhcmF0aW9ucy5cbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0W119XG4gICAqL1xuICBmdW5jdGlvbiBkZWNsYXJhdGlvbnMoKSB7XG4gICAgdmFyIGRlY2xzID0gW107XG5cbiAgICBjb21tZW50cyhkZWNscyk7XG5cbiAgICAvLyBkZWNsYXJhdGlvbnNcbiAgICB2YXIgZGVjbDtcbiAgICB3aGlsZSAoKGRlY2wgPSBkZWNsYXJhdGlvbigpKSkge1xuICAgICAgaWYgKGRlY2wgIT09IGZhbHNlKSB7XG4gICAgICAgIGRlY2xzLnB1c2goZGVjbCk7XG4gICAgICAgIGNvbW1lbnRzKGRlY2xzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGVjbHM7XG4gIH1cblxuICB3aGl0ZXNwYWNlKCk7XG4gIHJldHVybiBkZWNsYXJhdGlvbnMoKTtcbn07XG5cbi8qKlxuICogVHJpbSBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHRyaW0oc3RyKSB7XG4gIHJldHVybiBzdHIgPyBzdHIucmVwbGFjZShUUklNX1JFR0VYLCBFTVBUWV9TVFJJTkcpIDogRU1QVFlfU1RSSU5HO1xufVxuIiwiXG4gICAgKHdpbmRvdy5fX05FWFRfUCA9IHdpbmRvdy5fX05FWFRfUCB8fCBbXSkucHVzaChbXG4gICAgICBcIi9ibG9nL1t0aXRsZV1cIixcbiAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHJlcXVpcmUoXCJJOlxcXFxAbWFya2Rvd25cXFxcbm5uXFxcXGhlcm9rdS1uZXh0anMtbWFzdGVyXFxcXHBhZ2VzXFxcXGJsb2dcXFxcW3RpdGxlXS5qc1wiKTtcbiAgICAgIH1cbiAgICBdKTtcbiAgIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsInZhciBIVE1MRE9NUHJvcGVydHlDb25maWcgPSByZXF1aXJlKCcuL2xpYi9IVE1MRE9NUHJvcGVydHlDb25maWcnKTtcbnZhciBTVkdET01Qcm9wZXJ0eUNvbmZpZyA9IHJlcXVpcmUoJy4vbGliL1NWR0RPTVByb3BlcnR5Q29uZmlnJyk7XG52YXIgaW5qZWN0aW9uID0gcmVxdWlyZSgnLi9saWIvaW5qZWN0aW9uJyk7XG5cbnZhciBNVVNUX1VTRV9QUk9QRVJUWSA9IGluamVjdGlvbi5NVVNUX1VTRV9QUk9QRVJUWTtcbnZhciBIQVNfQk9PTEVBTl9WQUxVRSA9IGluamVjdGlvbi5IQVNfQk9PTEVBTl9WQUxVRTtcbnZhciBIQVNfTlVNRVJJQ19WQUxVRSA9IGluamVjdGlvbi5IQVNfTlVNRVJJQ19WQUxVRTtcbnZhciBIQVNfUE9TSVRJVkVfTlVNRVJJQ19WQUxVRSA9IGluamVjdGlvbi5IQVNfUE9TSVRJVkVfTlVNRVJJQ19WQUxVRTtcbnZhciBIQVNfT1ZFUkxPQURFRF9CT09MRUFOX1ZBTFVFID0gaW5qZWN0aW9uLkhBU19PVkVSTE9BREVEX0JPT0xFQU5fVkFMVUU7XG5cbi8qKlxuICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVhY3QvYmxvYi8xNS1zdGFibGUvc3JjL3JlbmRlcmVycy9kb20vc2hhcmVkL0RPTVByb3BlcnR5LmpzI0wxNC1MMTZcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICB2YWx1ZVxuICogQHBhcmFtICB7TnVtYmVyfSAgYml0bWFza1xuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gY2hlY2tNYXNrKHZhbHVlLCBiaXRtYXNrKSB7XG4gIHJldHVybiAodmFsdWUgJiBiaXRtYXNrKSA9PT0gYml0bWFzaztcbn1cblxuLyoqXG4gKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWFjdC9ibG9iLzE1LXN0YWJsZS9zcmMvcmVuZGVyZXJzL2RvbS9zaGFyZWQvRE9NUHJvcGVydHkuanMjTDU3XG4gKlxuICogQHBhcmFtIHtPYmplY3R9ICBkb21Qcm9wZXJ0eUNvbmZpZyAtIEhUTUxET01Qcm9wZXJ0eUNvbmZpZyBvciBTVkdET01Qcm9wZXJ0eUNvbmZpZ1xuICogQHBhcmFtIHtPYmplY3R9ICBjb25maWcgICAgICAgICAgICAtIFRoZSBvYmplY3QgdG8gYmUgbXV0YXRlZFxuICogQHBhcmFtIHtCb29sZWFufSBpc1NWRyAgICAgICAgICAgICAtIFdoZXRoZXIgdGhlIGluamVjdGVkIGNvbmZpZyBpcyBIVE1MIG9yIFNWRyAoaXQgYXNzdW1lcyB0aGUgZGVmYXVsdCBpcyBIVE1MKVxuICovXG5mdW5jdGlvbiBpbmplY3RET01Qcm9wZXJ0eUNvbmZpZyhkb21Qcm9wZXJ0eUNvbmZpZywgY29uZmlnLCBpc1NWRykge1xuICB2YXIgUHJvcGVydGllcyA9IGRvbVByb3BlcnR5Q29uZmlnLlByb3BlcnRpZXM7XG4gIHZhciBET01BdHRyaWJ1dGVOYW1lcyA9IGRvbVByb3BlcnR5Q29uZmlnLkRPTUF0dHJpYnV0ZU5hbWVzO1xuICB2YXIgYXR0cmlidXRlTmFtZTtcbiAgdmFyIHByb3BlcnR5TmFtZTtcbiAgdmFyIHByb3BDb25maWc7XG5cbiAgZm9yIChwcm9wZXJ0eU5hbWUgaW4gUHJvcGVydGllcykge1xuICAgIGF0dHJpYnV0ZU5hbWUgPVxuICAgICAgRE9NQXR0cmlidXRlTmFtZXNbcHJvcGVydHlOYW1lXSB8fFxuICAgICAgKGlzU1ZHID8gcHJvcGVydHlOYW1lIDogcHJvcGVydHlOYW1lLnRvTG93ZXJDYXNlKCkpO1xuICAgIHByb3BDb25maWcgPSBQcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV07XG5cbiAgICBjb25maWdbYXR0cmlidXRlTmFtZV0gPSB7XG4gICAgICBhdHRyaWJ1dGVOYW1lOiBhdHRyaWJ1dGVOYW1lLFxuICAgICAgcHJvcGVydHlOYW1lOiBwcm9wZXJ0eU5hbWUsXG4gICAgICBtdXN0VXNlUHJvcGVydHk6IGNoZWNrTWFzayhwcm9wQ29uZmlnLCBNVVNUX1VTRV9QUk9QRVJUWSksXG4gICAgICBoYXNCb29sZWFuVmFsdWU6IGNoZWNrTWFzayhwcm9wQ29uZmlnLCBIQVNfQk9PTEVBTl9WQUxVRSksXG4gICAgICBoYXNOdW1lcmljVmFsdWU6IGNoZWNrTWFzayhwcm9wQ29uZmlnLCBIQVNfTlVNRVJJQ19WQUxVRSksXG4gICAgICBoYXNQb3NpdGl2ZU51bWVyaWNWYWx1ZTogY2hlY2tNYXNrKFxuICAgICAgICBwcm9wQ29uZmlnLFxuICAgICAgICBIQVNfUE9TSVRJVkVfTlVNRVJJQ19WQUxVRVxuICAgICAgKSxcbiAgICAgIGhhc092ZXJsb2FkZWRCb29sZWFuVmFsdWU6IGNoZWNrTWFzayhcbiAgICAgICAgcHJvcENvbmZpZyxcbiAgICAgICAgSEFTX09WRVJMT0FERURfQk9PTEVBTl9WQUxVRVxuICAgICAgKVxuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBIVE1MIHByb3BlcnRpZXMgY29uZmlnLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbnZhciBodG1sID0ge307XG5pbmplY3RET01Qcm9wZXJ0eUNvbmZpZyhIVE1MRE9NUHJvcGVydHlDb25maWcsIGh0bWwpO1xuXG4vKipcbiAqIFNWRyBwcm9wZXJ0aWVzIGNvbmZpZy5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG52YXIgc3ZnID0ge307XG5pbmplY3RET01Qcm9wZXJ0eUNvbmZpZyhTVkdET01Qcm9wZXJ0eUNvbmZpZywgc3ZnLCB0cnVlKTtcblxuLyoqXG4gKiBIVE1MIGFuZCBTVkcgcHJvcGVydGllcyBjb25maWcuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xudmFyIHByb3BlcnRpZXMgPSB7fTtcbmluamVjdERPTVByb3BlcnR5Q29uZmlnKEhUTUxET01Qcm9wZXJ0eUNvbmZpZywgcHJvcGVydGllcyk7XG5pbmplY3RET01Qcm9wZXJ0eUNvbmZpZyhTVkdET01Qcm9wZXJ0eUNvbmZpZywgcHJvcGVydGllcywgdHJ1ZSk7XG5cbnZhciBBVFRSSUJVVEVfTkFNRV9TVEFSVF9DSEFSID1cbiAgJzpBLVpfYS16XFxcXHUwMEMwLVxcXFx1MDBENlxcXFx1MDBEOC1cXFxcdTAwRjZcXFxcdTAwRjgtXFxcXHUwMkZGXFxcXHUwMzcwLVxcXFx1MDM3RFxcXFx1MDM3Ri1cXFxcdTFGRkZcXFxcdTIwMEMtXFxcXHUyMDBEXFxcXHUyMDcwLVxcXFx1MjE4RlxcXFx1MkMwMC1cXFxcdTJGRUZcXFxcdTMwMDEtXFxcXHVEN0ZGXFxcXHVGOTAwLVxcXFx1RkRDRlxcXFx1RkRGMC1cXFxcdUZGRkQnO1xudmFyIEFUVFJJQlVURV9OQU1FX0NIQVIgPVxuICBBVFRSSUJVVEVfTkFNRV9TVEFSVF9DSEFSICsgJ1xcXFwtLjAtOVxcXFx1MDBCN1xcXFx1MDMwMC1cXFxcdTAzNkZcXFxcdTIwM0YtXFxcXHUyMDQwJztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGh0bWw6IGh0bWwsXG4gIHN2Zzogc3ZnLFxuICBwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzLFxuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciBhIHByb3BlcnR5IG5hbWUgaXMgYSBjdXN0b20gYXR0cmlidXRlLlxuICAgKlxuICAgKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWFjdC9ibG9iLzE1LXN0YWJsZS9zcmMvcmVuZGVyZXJzL2RvbS9zaGFyZWQvSFRNTERPTVByb3BlcnR5Q29uZmlnLmpzI0wyMy1MMjVcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9XG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuICBpc0N1c3RvbUF0dHJpYnV0ZTogUmVnRXhwLnByb3RvdHlwZS50ZXN0LmJpbmQoXG4gICAgbmV3IFJlZ0V4cCgnXihkYXRhfGFyaWEpLVsnICsgQVRUUklCVVRFX05BTUVfQ0hBUiArICddKiQnKVxuICApXG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFByb3BlcnRpZXM6IHtcbiAgICBhdXRvRm9jdXM6IDQsXG4gICAgYWNjZXB0OiAwLFxuICAgIGFjY2VwdENoYXJzZXQ6IDAsXG4gICAgYWNjZXNzS2V5OiAwLFxuICAgIGFjdGlvbjogMCxcbiAgICBhbGxvd0Z1bGxTY3JlZW46IDQsXG4gICAgYWxsb3dUcmFuc3BhcmVuY3k6IDAsXG4gICAgYWx0OiAwLFxuICAgIGFzOiAwLFxuICAgIGFzeW5jOiA0LFxuICAgIGF1dG9Db21wbGV0ZTogMCxcbiAgICBhdXRvUGxheTogNCxcbiAgICBjYXB0dXJlOiA0LFxuICAgIGNlbGxQYWRkaW5nOiAwLFxuICAgIGNlbGxTcGFjaW5nOiAwLFxuICAgIGNoYXJTZXQ6IDAsXG4gICAgY2hhbGxlbmdlOiAwLFxuICAgIGNoZWNrZWQ6IDUsXG4gICAgY2l0ZTogMCxcbiAgICBjbGFzc0lEOiAwLFxuICAgIGNsYXNzTmFtZTogMCxcbiAgICBjb2xzOiAyNCxcbiAgICBjb2xTcGFuOiAwLFxuICAgIGNvbnRlbnQ6IDAsXG4gICAgY29udGVudEVkaXRhYmxlOiAwLFxuICAgIGNvbnRleHRNZW51OiAwLFxuICAgIGNvbnRyb2xzOiA0LFxuICAgIGNvbnRyb2xzTGlzdDogMCxcbiAgICBjb29yZHM6IDAsXG4gICAgY3Jvc3NPcmlnaW46IDAsXG4gICAgZGF0YTogMCxcbiAgICBkYXRlVGltZTogMCxcbiAgICBkZWZhdWx0OiA0LFxuICAgIGRlZmVyOiA0LFxuICAgIGRpcjogMCxcbiAgICBkaXNhYmxlZDogNCxcbiAgICBkb3dubG9hZDogMzIsXG4gICAgZHJhZ2dhYmxlOiAwLFxuICAgIGVuY1R5cGU6IDAsXG4gICAgZm9ybTogMCxcbiAgICBmb3JtQWN0aW9uOiAwLFxuICAgIGZvcm1FbmNUeXBlOiAwLFxuICAgIGZvcm1NZXRob2Q6IDAsXG4gICAgZm9ybU5vVmFsaWRhdGU6IDQsXG4gICAgZm9ybVRhcmdldDogMCxcbiAgICBmcmFtZUJvcmRlcjogMCxcbiAgICBoZWFkZXJzOiAwLFxuICAgIGhlaWdodDogMCxcbiAgICBoaWRkZW46IDQsXG4gICAgaGlnaDogMCxcbiAgICBocmVmOiAwLFxuICAgIGhyZWZMYW5nOiAwLFxuICAgIGh0bWxGb3I6IDAsXG4gICAgaHR0cEVxdWl2OiAwLFxuICAgIGljb246IDAsXG4gICAgaWQ6IDAsXG4gICAgaW5wdXRNb2RlOiAwLFxuICAgIGludGVncml0eTogMCxcbiAgICBpczogMCxcbiAgICBrZXlQYXJhbXM6IDAsXG4gICAga2V5VHlwZTogMCxcbiAgICBraW5kOiAwLFxuICAgIGxhYmVsOiAwLFxuICAgIGxhbmc6IDAsXG4gICAgbGlzdDogMCxcbiAgICBsb29wOiA0LFxuICAgIGxvdzogMCxcbiAgICBtYW5pZmVzdDogMCxcbiAgICBtYXJnaW5IZWlnaHQ6IDAsXG4gICAgbWFyZ2luV2lkdGg6IDAsXG4gICAgbWF4OiAwLFxuICAgIG1heExlbmd0aDogMCxcbiAgICBtZWRpYTogMCxcbiAgICBtZWRpYUdyb3VwOiAwLFxuICAgIG1ldGhvZDogMCxcbiAgICBtaW46IDAsXG4gICAgbWluTGVuZ3RoOiAwLFxuICAgIG11bHRpcGxlOiA1LFxuICAgIG11dGVkOiA1LFxuICAgIG5hbWU6IDAsXG4gICAgbm9uY2U6IDAsXG4gICAgbm9WYWxpZGF0ZTogNCxcbiAgICBvcGVuOiA0LFxuICAgIG9wdGltdW06IDAsXG4gICAgcGF0dGVybjogMCxcbiAgICBwbGFjZWhvbGRlcjogMCxcbiAgICBwbGF5c0lubGluZTogNCxcbiAgICBwb3N0ZXI6IDAsXG4gICAgcHJlbG9hZDogMCxcbiAgICBwcm9maWxlOiAwLFxuICAgIHJhZGlvR3JvdXA6IDAsXG4gICAgcmVhZE9ubHk6IDQsXG4gICAgcmVmZXJyZXJQb2xpY3k6IDAsXG4gICAgcmVsOiAwLFxuICAgIHJlcXVpcmVkOiA0LFxuICAgIHJldmVyc2VkOiA0LFxuICAgIHJvbGU6IDAsXG4gICAgcm93czogMjQsXG4gICAgcm93U3BhbjogOCxcbiAgICBzYW5kYm94OiAwLFxuICAgIHNjb3BlOiAwLFxuICAgIHNjb3BlZDogNCxcbiAgICBzY3JvbGxpbmc6IDAsXG4gICAgc2VhbWxlc3M6IDQsXG4gICAgc2VsZWN0ZWQ6IDUsXG4gICAgc2hhcGU6IDAsXG4gICAgc2l6ZTogMjQsXG4gICAgc2l6ZXM6IDAsXG4gICAgc3BhbjogMjQsXG4gICAgc3BlbGxDaGVjazogMCxcbiAgICBzcmM6IDAsXG4gICAgc3JjRG9jOiAwLFxuICAgIHNyY0xhbmc6IDAsXG4gICAgc3JjU2V0OiAwLFxuICAgIHN0YXJ0OiA4LFxuICAgIHN0ZXA6IDAsXG4gICAgc3R5bGU6IDAsXG4gICAgc3VtbWFyeTogMCxcbiAgICB0YWJJbmRleDogMCxcbiAgICB0YXJnZXQ6IDAsXG4gICAgdGl0bGU6IDAsXG4gICAgdHlwZTogMCxcbiAgICB1c2VNYXA6IDAsXG4gICAgdmFsdWU6IDAsXG4gICAgd2lkdGg6IDAsXG4gICAgd21vZGU6IDAsXG4gICAgd3JhcDogMCxcbiAgICBhYm91dDogMCxcbiAgICBkYXRhdHlwZTogMCxcbiAgICBpbmxpc3Q6IDAsXG4gICAgcHJlZml4OiAwLFxuICAgIHByb3BlcnR5OiAwLFxuICAgIHJlc291cmNlOiAwLFxuICAgIHR5cGVvZjogMCxcbiAgICB2b2NhYjogMCxcbiAgICBhdXRvQ2FwaXRhbGl6ZTogMCxcbiAgICBhdXRvQ29ycmVjdDogMCxcbiAgICBhdXRvU2F2ZTogMCxcbiAgICBjb2xvcjogMCxcbiAgICBpdGVtUHJvcDogMCxcbiAgICBpdGVtU2NvcGU6IDQsXG4gICAgaXRlbVR5cGU6IDAsXG4gICAgaXRlbUlEOiAwLFxuICAgIGl0ZW1SZWY6IDAsXG4gICAgcmVzdWx0czogMCxcbiAgICBzZWN1cml0eTogMCxcbiAgICB1bnNlbGVjdGFibGU6IDBcbiAgfSxcbiAgRE9NQXR0cmlidXRlTmFtZXM6IHtcbiAgICBhY2NlcHRDaGFyc2V0OiAnYWNjZXB0LWNoYXJzZXQnLFxuICAgIGNsYXNzTmFtZTogJ2NsYXNzJyxcbiAgICBodG1sRm9yOiAnZm9yJyxcbiAgICBodHRwRXF1aXY6ICdodHRwLWVxdWl2J1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFByb3BlcnRpZXM6IHtcbiAgICBhY2NlbnRIZWlnaHQ6IDAsXG4gICAgYWNjdW11bGF0ZTogMCxcbiAgICBhZGRpdGl2ZTogMCxcbiAgICBhbGlnbm1lbnRCYXNlbGluZTogMCxcbiAgICBhbGxvd1Jlb3JkZXI6IDAsXG4gICAgYWxwaGFiZXRpYzogMCxcbiAgICBhbXBsaXR1ZGU6IDAsXG4gICAgYXJhYmljRm9ybTogMCxcbiAgICBhc2NlbnQ6IDAsXG4gICAgYXR0cmlidXRlTmFtZTogMCxcbiAgICBhdHRyaWJ1dGVUeXBlOiAwLFxuICAgIGF1dG9SZXZlcnNlOiAwLFxuICAgIGF6aW11dGg6IDAsXG4gICAgYmFzZUZyZXF1ZW5jeTogMCxcbiAgICBiYXNlUHJvZmlsZTogMCxcbiAgICBiYXNlbGluZVNoaWZ0OiAwLFxuICAgIGJib3g6IDAsXG4gICAgYmVnaW46IDAsXG4gICAgYmlhczogMCxcbiAgICBieTogMCxcbiAgICBjYWxjTW9kZTogMCxcbiAgICBjYXBIZWlnaHQ6IDAsXG4gICAgY2xpcDogMCxcbiAgICBjbGlwUGF0aDogMCxcbiAgICBjbGlwUnVsZTogMCxcbiAgICBjbGlwUGF0aFVuaXRzOiAwLFxuICAgIGNvbG9ySW50ZXJwb2xhdGlvbjogMCxcbiAgICBjb2xvckludGVycG9sYXRpb25GaWx0ZXJzOiAwLFxuICAgIGNvbG9yUHJvZmlsZTogMCxcbiAgICBjb2xvclJlbmRlcmluZzogMCxcbiAgICBjb250ZW50U2NyaXB0VHlwZTogMCxcbiAgICBjb250ZW50U3R5bGVUeXBlOiAwLFxuICAgIGN1cnNvcjogMCxcbiAgICBjeDogMCxcbiAgICBjeTogMCxcbiAgICBkOiAwLFxuICAgIGRlY2VsZXJhdGU6IDAsXG4gICAgZGVzY2VudDogMCxcbiAgICBkaWZmdXNlQ29uc3RhbnQ6IDAsXG4gICAgZGlyZWN0aW9uOiAwLFxuICAgIGRpc3BsYXk6IDAsXG4gICAgZGl2aXNvcjogMCxcbiAgICBkb21pbmFudEJhc2VsaW5lOiAwLFxuICAgIGR1cjogMCxcbiAgICBkeDogMCxcbiAgICBkeTogMCxcbiAgICBlZGdlTW9kZTogMCxcbiAgICBlbGV2YXRpb246IDAsXG4gICAgZW5hYmxlQmFja2dyb3VuZDogMCxcbiAgICBlbmQ6IDAsXG4gICAgZXhwb25lbnQ6IDAsXG4gICAgZXh0ZXJuYWxSZXNvdXJjZXNSZXF1aXJlZDogMCxcbiAgICBmaWxsOiAwLFxuICAgIGZpbGxPcGFjaXR5OiAwLFxuICAgIGZpbGxSdWxlOiAwLFxuICAgIGZpbHRlcjogMCxcbiAgICBmaWx0ZXJSZXM6IDAsXG4gICAgZmlsdGVyVW5pdHM6IDAsXG4gICAgZmxvb2RDb2xvcjogMCxcbiAgICBmbG9vZE9wYWNpdHk6IDAsXG4gICAgZm9jdXNhYmxlOiAwLFxuICAgIGZvbnRGYW1pbHk6IDAsXG4gICAgZm9udFNpemU6IDAsXG4gICAgZm9udFNpemVBZGp1c3Q6IDAsXG4gICAgZm9udFN0cmV0Y2g6IDAsXG4gICAgZm9udFN0eWxlOiAwLFxuICAgIGZvbnRWYXJpYW50OiAwLFxuICAgIGZvbnRXZWlnaHQ6IDAsXG4gICAgZm9ybWF0OiAwLFxuICAgIGZyb206IDAsXG4gICAgZng6IDAsXG4gICAgZnk6IDAsXG4gICAgZzE6IDAsXG4gICAgZzI6IDAsXG4gICAgZ2x5cGhOYW1lOiAwLFxuICAgIGdseXBoT3JpZW50YXRpb25Ib3Jpem9udGFsOiAwLFxuICAgIGdseXBoT3JpZW50YXRpb25WZXJ0aWNhbDogMCxcbiAgICBnbHlwaFJlZjogMCxcbiAgICBncmFkaWVudFRyYW5zZm9ybTogMCxcbiAgICBncmFkaWVudFVuaXRzOiAwLFxuICAgIGhhbmdpbmc6IDAsXG4gICAgaG9yaXpBZHZYOiAwLFxuICAgIGhvcml6T3JpZ2luWDogMCxcbiAgICBpZGVvZ3JhcGhpYzogMCxcbiAgICBpbWFnZVJlbmRlcmluZzogMCxcbiAgICBpbjogMCxcbiAgICBpbjI6IDAsXG4gICAgaW50ZXJjZXB0OiAwLFxuICAgIGs6IDAsXG4gICAgazE6IDAsXG4gICAgazI6IDAsXG4gICAgazM6IDAsXG4gICAgazQ6IDAsXG4gICAga2VybmVsTWF0cml4OiAwLFxuICAgIGtlcm5lbFVuaXRMZW5ndGg6IDAsXG4gICAga2VybmluZzogMCxcbiAgICBrZXlQb2ludHM6IDAsXG4gICAga2V5U3BsaW5lczogMCxcbiAgICBrZXlUaW1lczogMCxcbiAgICBsZW5ndGhBZGp1c3Q6IDAsXG4gICAgbGV0dGVyU3BhY2luZzogMCxcbiAgICBsaWdodGluZ0NvbG9yOiAwLFxuICAgIGxpbWl0aW5nQ29uZUFuZ2xlOiAwLFxuICAgIGxvY2FsOiAwLFxuICAgIG1hcmtlckVuZDogMCxcbiAgICBtYXJrZXJNaWQ6IDAsXG4gICAgbWFya2VyU3RhcnQ6IDAsXG4gICAgbWFya2VySGVpZ2h0OiAwLFxuICAgIG1hcmtlclVuaXRzOiAwLFxuICAgIG1hcmtlcldpZHRoOiAwLFxuICAgIG1hc2s6IDAsXG4gICAgbWFza0NvbnRlbnRVbml0czogMCxcbiAgICBtYXNrVW5pdHM6IDAsXG4gICAgbWF0aGVtYXRpY2FsOiAwLFxuICAgIG1vZGU6IDAsXG4gICAgbnVtT2N0YXZlczogMCxcbiAgICBvZmZzZXQ6IDAsXG4gICAgb3BhY2l0eTogMCxcbiAgICBvcGVyYXRvcjogMCxcbiAgICBvcmRlcjogMCxcbiAgICBvcmllbnQ6IDAsXG4gICAgb3JpZW50YXRpb246IDAsXG4gICAgb3JpZ2luOiAwLFxuICAgIG92ZXJmbG93OiAwLFxuICAgIG92ZXJsaW5lUG9zaXRpb246IDAsXG4gICAgb3ZlcmxpbmVUaGlja25lc3M6IDAsXG4gICAgcGFpbnRPcmRlcjogMCxcbiAgICBwYW5vc2UxOiAwLFxuICAgIHBhdGhMZW5ndGg6IDAsXG4gICAgcGF0dGVybkNvbnRlbnRVbml0czogMCxcbiAgICBwYXR0ZXJuVHJhbnNmb3JtOiAwLFxuICAgIHBhdHRlcm5Vbml0czogMCxcbiAgICBwb2ludGVyRXZlbnRzOiAwLFxuICAgIHBvaW50czogMCxcbiAgICBwb2ludHNBdFg6IDAsXG4gICAgcG9pbnRzQXRZOiAwLFxuICAgIHBvaW50c0F0WjogMCxcbiAgICBwcmVzZXJ2ZUFscGhhOiAwLFxuICAgIHByZXNlcnZlQXNwZWN0UmF0aW86IDAsXG4gICAgcHJpbWl0aXZlVW5pdHM6IDAsXG4gICAgcjogMCxcbiAgICByYWRpdXM6IDAsXG4gICAgcmVmWDogMCxcbiAgICByZWZZOiAwLFxuICAgIHJlbmRlcmluZ0ludGVudDogMCxcbiAgICByZXBlYXRDb3VudDogMCxcbiAgICByZXBlYXREdXI6IDAsXG4gICAgcmVxdWlyZWRFeHRlbnNpb25zOiAwLFxuICAgIHJlcXVpcmVkRmVhdHVyZXM6IDAsXG4gICAgcmVzdGFydDogMCxcbiAgICByZXN1bHQ6IDAsXG4gICAgcm90YXRlOiAwLFxuICAgIHJ4OiAwLFxuICAgIHJ5OiAwLFxuICAgIHNjYWxlOiAwLFxuICAgIHNlZWQ6IDAsXG4gICAgc2hhcGVSZW5kZXJpbmc6IDAsXG4gICAgc2xvcGU6IDAsXG4gICAgc3BhY2luZzogMCxcbiAgICBzcGVjdWxhckNvbnN0YW50OiAwLFxuICAgIHNwZWN1bGFyRXhwb25lbnQ6IDAsXG4gICAgc3BlZWQ6IDAsXG4gICAgc3ByZWFkTWV0aG9kOiAwLFxuICAgIHN0YXJ0T2Zmc2V0OiAwLFxuICAgIHN0ZERldmlhdGlvbjogMCxcbiAgICBzdGVtaDogMCxcbiAgICBzdGVtdjogMCxcbiAgICBzdGl0Y2hUaWxlczogMCxcbiAgICBzdG9wQ29sb3I6IDAsXG4gICAgc3RvcE9wYWNpdHk6IDAsXG4gICAgc3RyaWtldGhyb3VnaFBvc2l0aW9uOiAwLFxuICAgIHN0cmlrZXRocm91Z2hUaGlja25lc3M6IDAsXG4gICAgc3RyaW5nOiAwLFxuICAgIHN0cm9rZTogMCxcbiAgICBzdHJva2VEYXNoYXJyYXk6IDAsXG4gICAgc3Ryb2tlRGFzaG9mZnNldDogMCxcbiAgICBzdHJva2VMaW5lY2FwOiAwLFxuICAgIHN0cm9rZUxpbmVqb2luOiAwLFxuICAgIHN0cm9rZU1pdGVybGltaXQ6IDAsXG4gICAgc3Ryb2tlT3BhY2l0eTogMCxcbiAgICBzdHJva2VXaWR0aDogMCxcbiAgICBzdXJmYWNlU2NhbGU6IDAsXG4gICAgc3lzdGVtTGFuZ3VhZ2U6IDAsXG4gICAgdGFibGVWYWx1ZXM6IDAsXG4gICAgdGFyZ2V0WDogMCxcbiAgICB0YXJnZXRZOiAwLFxuICAgIHRleHRBbmNob3I6IDAsXG4gICAgdGV4dERlY29yYXRpb246IDAsXG4gICAgdGV4dFJlbmRlcmluZzogMCxcbiAgICB0ZXh0TGVuZ3RoOiAwLFxuICAgIHRvOiAwLFxuICAgIHRyYW5zZm9ybTogMCxcbiAgICB1MTogMCxcbiAgICB1MjogMCxcbiAgICB1bmRlcmxpbmVQb3NpdGlvbjogMCxcbiAgICB1bmRlcmxpbmVUaGlja25lc3M6IDAsXG4gICAgdW5pY29kZTogMCxcbiAgICB1bmljb2RlQmlkaTogMCxcbiAgICB1bmljb2RlUmFuZ2U6IDAsXG4gICAgdW5pdHNQZXJFbTogMCxcbiAgICB2QWxwaGFiZXRpYzogMCxcbiAgICB2SGFuZ2luZzogMCxcbiAgICB2SWRlb2dyYXBoaWM6IDAsXG4gICAgdk1hdGhlbWF0aWNhbDogMCxcbiAgICB2YWx1ZXM6IDAsXG4gICAgdmVjdG9yRWZmZWN0OiAwLFxuICAgIHZlcnNpb246IDAsXG4gICAgdmVydEFkdlk6IDAsXG4gICAgdmVydE9yaWdpblg6IDAsXG4gICAgdmVydE9yaWdpblk6IDAsXG4gICAgdmlld0JveDogMCxcbiAgICB2aWV3VGFyZ2V0OiAwLFxuICAgIHZpc2liaWxpdHk6IDAsXG4gICAgd2lkdGhzOiAwLFxuICAgIHdvcmRTcGFjaW5nOiAwLFxuICAgIHdyaXRpbmdNb2RlOiAwLFxuICAgIHg6IDAsXG4gICAgeEhlaWdodDogMCxcbiAgICB4MTogMCxcbiAgICB4MjogMCxcbiAgICB4Q2hhbm5lbFNlbGVjdG9yOiAwLFxuICAgIHhsaW5rQWN0dWF0ZTogMCxcbiAgICB4bGlua0FyY3JvbGU6IDAsXG4gICAgeGxpbmtIcmVmOiAwLFxuICAgIHhsaW5rUm9sZTogMCxcbiAgICB4bGlua1Nob3c6IDAsXG4gICAgeGxpbmtUaXRsZTogMCxcbiAgICB4bGlua1R5cGU6IDAsXG4gICAgeG1sQmFzZTogMCxcbiAgICB4bWxuczogMCxcbiAgICB4bWxuc1hsaW5rOiAwLFxuICAgIHhtbExhbmc6IDAsXG4gICAgeG1sU3BhY2U6IDAsXG4gICAgeTogMCxcbiAgICB5MTogMCxcbiAgICB5MjogMCxcbiAgICB5Q2hhbm5lbFNlbGVjdG9yOiAwLFxuICAgIHo6IDAsXG4gICAgem9vbUFuZFBhbjogMFxuICB9LFxuICBET01BdHRyaWJ1dGVOYW1lczoge1xuICAgIGFjY2VudEhlaWdodDogJ2FjY2VudC1oZWlnaHQnLFxuICAgIGFsaWdubWVudEJhc2VsaW5lOiAnYWxpZ25tZW50LWJhc2VsaW5lJyxcbiAgICBhcmFiaWNGb3JtOiAnYXJhYmljLWZvcm0nLFxuICAgIGJhc2VsaW5lU2hpZnQ6ICdiYXNlbGluZS1zaGlmdCcsXG4gICAgY2FwSGVpZ2h0OiAnY2FwLWhlaWdodCcsXG4gICAgY2xpcFBhdGg6ICdjbGlwLXBhdGgnLFxuICAgIGNsaXBSdWxlOiAnY2xpcC1ydWxlJyxcbiAgICBjb2xvckludGVycG9sYXRpb246ICdjb2xvci1pbnRlcnBvbGF0aW9uJyxcbiAgICBjb2xvckludGVycG9sYXRpb25GaWx0ZXJzOiAnY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzJyxcbiAgICBjb2xvclByb2ZpbGU6ICdjb2xvci1wcm9maWxlJyxcbiAgICBjb2xvclJlbmRlcmluZzogJ2NvbG9yLXJlbmRlcmluZycsXG4gICAgZG9taW5hbnRCYXNlbGluZTogJ2RvbWluYW50LWJhc2VsaW5lJyxcbiAgICBlbmFibGVCYWNrZ3JvdW5kOiAnZW5hYmxlLWJhY2tncm91bmQnLFxuICAgIGZpbGxPcGFjaXR5OiAnZmlsbC1vcGFjaXR5JyxcbiAgICBmaWxsUnVsZTogJ2ZpbGwtcnVsZScsXG4gICAgZmxvb2RDb2xvcjogJ2Zsb29kLWNvbG9yJyxcbiAgICBmbG9vZE9wYWNpdHk6ICdmbG9vZC1vcGFjaXR5JyxcbiAgICBmb250RmFtaWx5OiAnZm9udC1mYW1pbHknLFxuICAgIGZvbnRTaXplOiAnZm9udC1zaXplJyxcbiAgICBmb250U2l6ZUFkanVzdDogJ2ZvbnQtc2l6ZS1hZGp1c3QnLFxuICAgIGZvbnRTdHJldGNoOiAnZm9udC1zdHJldGNoJyxcbiAgICBmb250U3R5bGU6ICdmb250LXN0eWxlJyxcbiAgICBmb250VmFyaWFudDogJ2ZvbnQtdmFyaWFudCcsXG4gICAgZm9udFdlaWdodDogJ2ZvbnQtd2VpZ2h0JyxcbiAgICBnbHlwaE5hbWU6ICdnbHlwaC1uYW1lJyxcbiAgICBnbHlwaE9yaWVudGF0aW9uSG9yaXpvbnRhbDogJ2dseXBoLW9yaWVudGF0aW9uLWhvcml6b250YWwnLFxuICAgIGdseXBoT3JpZW50YXRpb25WZXJ0aWNhbDogJ2dseXBoLW9yaWVudGF0aW9uLXZlcnRpY2FsJyxcbiAgICBob3JpekFkdlg6ICdob3Jpei1hZHYteCcsXG4gICAgaG9yaXpPcmlnaW5YOiAnaG9yaXotb3JpZ2luLXgnLFxuICAgIGltYWdlUmVuZGVyaW5nOiAnaW1hZ2UtcmVuZGVyaW5nJyxcbiAgICBsZXR0ZXJTcGFjaW5nOiAnbGV0dGVyLXNwYWNpbmcnLFxuICAgIGxpZ2h0aW5nQ29sb3I6ICdsaWdodGluZy1jb2xvcicsXG4gICAgbWFya2VyRW5kOiAnbWFya2VyLWVuZCcsXG4gICAgbWFya2VyTWlkOiAnbWFya2VyLW1pZCcsXG4gICAgbWFya2VyU3RhcnQ6ICdtYXJrZXItc3RhcnQnLFxuICAgIG92ZXJsaW5lUG9zaXRpb246ICdvdmVybGluZS1wb3NpdGlvbicsXG4gICAgb3ZlcmxpbmVUaGlja25lc3M6ICdvdmVybGluZS10aGlja25lc3MnLFxuICAgIHBhaW50T3JkZXI6ICdwYWludC1vcmRlcicsXG4gICAgcGFub3NlMTogJ3Bhbm9zZS0xJyxcbiAgICBwb2ludGVyRXZlbnRzOiAncG9pbnRlci1ldmVudHMnLFxuICAgIHJlbmRlcmluZ0ludGVudDogJ3JlbmRlcmluZy1pbnRlbnQnLFxuICAgIHNoYXBlUmVuZGVyaW5nOiAnc2hhcGUtcmVuZGVyaW5nJyxcbiAgICBzdG9wQ29sb3I6ICdzdG9wLWNvbG9yJyxcbiAgICBzdG9wT3BhY2l0eTogJ3N0b3Atb3BhY2l0eScsXG4gICAgc3RyaWtldGhyb3VnaFBvc2l0aW9uOiAnc3RyaWtldGhyb3VnaC1wb3NpdGlvbicsXG4gICAgc3RyaWtldGhyb3VnaFRoaWNrbmVzczogJ3N0cmlrZXRocm91Z2gtdGhpY2tuZXNzJyxcbiAgICBzdHJva2VEYXNoYXJyYXk6ICdzdHJva2UtZGFzaGFycmF5JyxcbiAgICBzdHJva2VEYXNob2Zmc2V0OiAnc3Ryb2tlLWRhc2hvZmZzZXQnLFxuICAgIHN0cm9rZUxpbmVjYXA6ICdzdHJva2UtbGluZWNhcCcsXG4gICAgc3Ryb2tlTGluZWpvaW46ICdzdHJva2UtbGluZWpvaW4nLFxuICAgIHN0cm9rZU1pdGVybGltaXQ6ICdzdHJva2UtbWl0ZXJsaW1pdCcsXG4gICAgc3Ryb2tlT3BhY2l0eTogJ3N0cm9rZS1vcGFjaXR5JyxcbiAgICBzdHJva2VXaWR0aDogJ3N0cm9rZS13aWR0aCcsXG4gICAgdGV4dEFuY2hvcjogJ3RleHQtYW5jaG9yJyxcbiAgICB0ZXh0RGVjb3JhdGlvbjogJ3RleHQtZGVjb3JhdGlvbicsXG4gICAgdGV4dFJlbmRlcmluZzogJ3RleHQtcmVuZGVyaW5nJyxcbiAgICB1bmRlcmxpbmVQb3NpdGlvbjogJ3VuZGVybGluZS1wb3NpdGlvbicsXG4gICAgdW5kZXJsaW5lVGhpY2tuZXNzOiAndW5kZXJsaW5lLXRoaWNrbmVzcycsXG4gICAgdW5pY29kZUJpZGk6ICd1bmljb2RlLWJpZGknLFxuICAgIHVuaWNvZGVSYW5nZTogJ3VuaWNvZGUtcmFuZ2UnLFxuICAgIHVuaXRzUGVyRW06ICd1bml0cy1wZXItZW0nLFxuICAgIHZBbHBoYWJldGljOiAndi1hbHBoYWJldGljJyxcbiAgICB2SGFuZ2luZzogJ3YtaGFuZ2luZycsXG4gICAgdklkZW9ncmFwaGljOiAndi1pZGVvZ3JhcGhpYycsXG4gICAgdk1hdGhlbWF0aWNhbDogJ3YtbWF0aGVtYXRpY2FsJyxcbiAgICB2ZWN0b3JFZmZlY3Q6ICd2ZWN0b3ItZWZmZWN0JyxcbiAgICB2ZXJ0QWR2WTogJ3ZlcnQtYWR2LXknLFxuICAgIHZlcnRPcmlnaW5YOiAndmVydC1vcmlnaW4teCcsXG4gICAgdmVydE9yaWdpblk6ICd2ZXJ0LW9yaWdpbi15JyxcbiAgICB3b3JkU3BhY2luZzogJ3dvcmQtc3BhY2luZycsXG4gICAgd3JpdGluZ01vZGU6ICd3cml0aW5nLW1vZGUnLFxuICAgIHhIZWlnaHQ6ICd4LWhlaWdodCcsXG4gICAgeGxpbmtBY3R1YXRlOiAneGxpbms6YWN0dWF0ZScsXG4gICAgeGxpbmtBcmNyb2xlOiAneGxpbms6YXJjcm9sZScsXG4gICAgeGxpbmtIcmVmOiAneGxpbms6aHJlZicsXG4gICAgeGxpbmtSb2xlOiAneGxpbms6cm9sZScsXG4gICAgeGxpbmtTaG93OiAneGxpbms6c2hvdycsXG4gICAgeGxpbmtUaXRsZTogJ3hsaW5rOnRpdGxlJyxcbiAgICB4bGlua1R5cGU6ICd4bGluazp0eXBlJyxcbiAgICB4bWxCYXNlOiAneG1sOmJhc2UnLFxuICAgIHhtbG5zWGxpbms6ICd4bWxuczp4bGluaycsXG4gICAgeG1sTGFuZzogJ3htbDpsYW5nJyxcbiAgICB4bWxTcGFjZTogJ3htbDpzcGFjZSdcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBNVVNUX1VTRV9QUk9QRVJUWTogMSxcbiAgSEFTX0JPT0xFQU5fVkFMVUU6IDQsXG4gIEhBU19OVU1FUklDX1ZBTFVFOiA4LFxuICBIQVNfUE9TSVRJVkVfTlVNRVJJQ19WQUxVRTogMjQsXG4gIEhBU19PVkVSTE9BREVEX0JPT0xFQU5fVkFMVUU6IDMyXG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgZGxsLXJlZmVyZW5jZSBkbGxfNTAzMGYzODdkMzI4ZTQ0MTU3ODUgKi8gXCJkbGwtcmVmZXJlbmNlIGRsbF81MDMwZjM4N2QzMjhlNDQxNTc4NVwiKSkoXCIuL25vZGVfbW9kdWxlcy9yZWFjdC9pbmRleC5qc1wiKTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gaGFzaChzdHIpIHtcbiAgdmFyIGhhc2ggPSA1MzgxLFxuICAgICAgaSAgICA9IHN0ci5sZW5ndGg7XG5cbiAgd2hpbGUoaSkge1xuICAgIGhhc2ggPSAoaGFzaCAqIDMzKSBeIHN0ci5jaGFyQ29kZUF0KC0taSk7XG4gIH1cblxuICAvKiBKYXZhU2NyaXB0IGRvZXMgYml0d2lzZSBvcGVyYXRpb25zIChsaWtlIFhPUiwgYWJvdmUpIG9uIDMyLWJpdCBzaWduZWRcbiAgICogaW50ZWdlcnMuIFNpbmNlIHdlIHdhbnQgdGhlIHJlc3VsdHMgdG8gYmUgYWx3YXlzIHBvc2l0aXZlLCBjb252ZXJ0IHRoZVxuICAgKiBzaWduZWQgaW50IHRvIGFuIHVuc2lnbmVkIGJ5IGRvaW5nIGFuIHVuc2lnbmVkIGJpdHNoaWZ0LiAqL1xuICByZXR1cm4gaGFzaCA+Pj4gMDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoYXNoO1xuIiwidmFyIHBhcnNlID0gcmVxdWlyZSgnaW5saW5lLXN0eWxlLXBhcnNlcicpO1xuXG4vKipcbiAqIFBhcnNlcyBpbmxpbmUgc3R5bGUgdG8gb2JqZWN0LlxuICpcbiAqIEBleGFtcGxlXG4gKiAvLyByZXR1cm5zIHsgJ2xpbmUtaGVpZ2h0JzogJzQyJyB9XG4gKiBTdHlsZVRvT2JqZWN0KCdsaW5lLWhlaWdodDogNDI7Jyk7XG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSAgICAgIHN0eWxlICAgICAgLSBUaGUgaW5saW5lIHN0eWxlLlxuICogQHBhcmFtICB7RnVuY3Rpb259ICAgIFtpdGVyYXRvcl0gLSBUaGUgaXRlcmF0b3IgZnVuY3Rpb24uXG4gKiBAcmV0dXJuIHtudWxsfE9iamVjdH1cbiAqL1xuZnVuY3Rpb24gU3R5bGVUb09iamVjdChzdHlsZSwgaXRlcmF0b3IpIHtcbiAgdmFyIG91dHB1dCA9IG51bGw7XG4gIGlmICghc3R5bGUgfHwgdHlwZW9mIHN0eWxlICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cblxuICB2YXIgZGVjbGFyYXRpb247XG4gIHZhciBkZWNsYXJhdGlvbnMgPSBwYXJzZShzdHlsZSk7XG4gIHZhciBoYXNJdGVyYXRvciA9IHR5cGVvZiBpdGVyYXRvciA9PT0gJ2Z1bmN0aW9uJztcbiAgdmFyIHByb3BlcnR5O1xuICB2YXIgdmFsdWU7XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGRlY2xhcmF0aW9ucy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGRlY2xhcmF0aW9uID0gZGVjbGFyYXRpb25zW2ldO1xuICAgIHByb3BlcnR5ID0gZGVjbGFyYXRpb24ucHJvcGVydHk7XG4gICAgdmFsdWUgPSBkZWNsYXJhdGlvbi52YWx1ZTtcblxuICAgIGlmIChoYXNJdGVyYXRvcikge1xuICAgICAgaXRlcmF0b3IocHJvcGVydHksIHZhbHVlLCBkZWNsYXJhdGlvbik7XG4gICAgfSBlbHNlIGlmICh2YWx1ZSkge1xuICAgICAgb3V0cHV0IHx8IChvdXRwdXQgPSB7fSk7XG4gICAgICBvdXRwdXRbcHJvcGVydHldID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG91dHB1dDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTdHlsZVRvT2JqZWN0O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfVxuXG5mdW5jdGlvbiBfY3JlYXRlQ2xhc3MoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfVxuXG4vKlxuQmFzZWQgb24gR2xhbW9yJ3Mgc2hlZXRcbmh0dHBzOi8vZ2l0aHViLmNvbS90aHJlZXBvaW50b25lL2dsYW1vci9ibG9iLzY2N2I0ODBkMzFiMzcyMWE5MDUwMjFiMjZlMTI5MGNlOTJjYTI4Nzkvc3JjL3NoZWV0LmpzXG4qL1xudmFyIGlzUHJvZCA9IHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBwcm9jZXNzLmVudiAmJiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nO1xuXG52YXIgaXNTdHJpbmcgPSBmdW5jdGlvbiBpc1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykgPT09ICdbb2JqZWN0IFN0cmluZ10nO1xufTtcblxudmFyIFN0eWxlU2hlZXQgPVxuLyojX19QVVJFX18qL1xuZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBTdHlsZVNoZWV0KF90ZW1wKSB7XG4gICAgdmFyIF9yZWYgPSBfdGVtcCA9PT0gdm9pZCAwID8ge30gOiBfdGVtcCxcbiAgICAgICAgX3JlZiRuYW1lID0gX3JlZi5uYW1lLFxuICAgICAgICBuYW1lID0gX3JlZiRuYW1lID09PSB2b2lkIDAgPyAnc3R5bGVzaGVldCcgOiBfcmVmJG5hbWUsXG4gICAgICAgIF9yZWYkb3B0aW1pemVGb3JTcGVlZCA9IF9yZWYub3B0aW1pemVGb3JTcGVlZCxcbiAgICAgICAgb3B0aW1pemVGb3JTcGVlZCA9IF9yZWYkb3B0aW1pemVGb3JTcGVlZCA9PT0gdm9pZCAwID8gaXNQcm9kIDogX3JlZiRvcHRpbWl6ZUZvclNwZWVkLFxuICAgICAgICBfcmVmJGlzQnJvd3NlciA9IF9yZWYuaXNCcm93c2VyLFxuICAgICAgICBpc0Jyb3dzZXIgPSBfcmVmJGlzQnJvd3NlciA9PT0gdm9pZCAwID8gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgOiBfcmVmJGlzQnJvd3NlcjtcblxuICAgIGludmFyaWFudChpc1N0cmluZyhuYW1lKSwgJ2BuYW1lYCBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gICAgdGhpcy5fbmFtZSA9IG5hbWU7XG4gICAgdGhpcy5fZGVsZXRlZFJ1bGVQbGFjZWhvbGRlciA9IFwiI1wiICsgbmFtZSArIFwiLWRlbGV0ZWQtcnVsZV9fX197fVwiO1xuICAgIGludmFyaWFudCh0eXBlb2Ygb3B0aW1pemVGb3JTcGVlZCA9PT0gJ2Jvb2xlYW4nLCAnYG9wdGltaXplRm9yU3BlZWRgIG11c3QgYmUgYSBib29sZWFuJyk7XG4gICAgdGhpcy5fb3B0aW1pemVGb3JTcGVlZCA9IG9wdGltaXplRm9yU3BlZWQ7XG4gICAgdGhpcy5faXNCcm93c2VyID0gaXNCcm93c2VyO1xuICAgIHRoaXMuX3NlcnZlclNoZWV0ID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX3RhZ3MgPSBbXTtcbiAgICB0aGlzLl9pbmplY3RlZCA9IGZhbHNlO1xuICAgIHRoaXMuX3J1bGVzQ291bnQgPSAwO1xuICAgIHZhciBub2RlID0gdGhpcy5faXNCcm93c2VyICYmIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ21ldGFbcHJvcGVydHk9XCJjc3Atbm9uY2VcIl0nKTtcbiAgICB0aGlzLl9ub25jZSA9IG5vZGUgPyBub2RlLmdldEF0dHJpYnV0ZSgnY29udGVudCcpIDogbnVsbDtcbiAgfVxuXG4gIHZhciBfcHJvdG8gPSBTdHlsZVNoZWV0LnByb3RvdHlwZTtcblxuICBfcHJvdG8uc2V0T3B0aW1pemVGb3JTcGVlZCA9IGZ1bmN0aW9uIHNldE9wdGltaXplRm9yU3BlZWQoYm9vbCkge1xuICAgIGludmFyaWFudCh0eXBlb2YgYm9vbCA9PT0gJ2Jvb2xlYW4nLCAnYHNldE9wdGltaXplRm9yU3BlZWRgIGFjY2VwdHMgYSBib29sZWFuJyk7XG4gICAgaW52YXJpYW50KHRoaXMuX3J1bGVzQ291bnQgPT09IDAsICdvcHRpbWl6ZUZvclNwZWVkIGNhbm5vdCBiZSB3aGVuIHJ1bGVzIGhhdmUgYWxyZWFkeSBiZWVuIGluc2VydGVkJyk7XG4gICAgdGhpcy5mbHVzaCgpO1xuICAgIHRoaXMuX29wdGltaXplRm9yU3BlZWQgPSBib29sO1xuICAgIHRoaXMuaW5qZWN0KCk7XG4gIH07XG5cbiAgX3Byb3RvLmlzT3B0aW1pemVGb3JTcGVlZCA9IGZ1bmN0aW9uIGlzT3B0aW1pemVGb3JTcGVlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fb3B0aW1pemVGb3JTcGVlZDtcbiAgfTtcblxuICBfcHJvdG8uaW5qZWN0ID0gZnVuY3Rpb24gaW5qZWN0KCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBpbnZhcmlhbnQoIXRoaXMuX2luamVjdGVkLCAnc2hlZXQgYWxyZWFkeSBpbmplY3RlZCcpO1xuICAgIHRoaXMuX2luamVjdGVkID0gdHJ1ZTtcblxuICAgIGlmICh0aGlzLl9pc0Jyb3dzZXIgJiYgdGhpcy5fb3B0aW1pemVGb3JTcGVlZCkge1xuICAgICAgdGhpcy5fdGFnc1swXSA9IHRoaXMubWFrZVN0eWxlVGFnKHRoaXMuX25hbWUpO1xuICAgICAgdGhpcy5fb3B0aW1pemVGb3JTcGVlZCA9ICdpbnNlcnRSdWxlJyBpbiB0aGlzLmdldFNoZWV0KCk7XG5cbiAgICAgIGlmICghdGhpcy5fb3B0aW1pemVGb3JTcGVlZCkge1xuICAgICAgICBpZiAoIWlzUHJvZCkge1xuICAgICAgICAgIGNvbnNvbGUud2FybignU3R5bGVTaGVldDogb3B0aW1pemVGb3JTcGVlZCBtb2RlIG5vdCBzdXBwb3J0ZWQgZmFsbGluZyBiYWNrIHRvIHN0YW5kYXJkIG1vZGUuJyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmZsdXNoKCk7XG4gICAgICAgIHRoaXMuX2luamVjdGVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3NlcnZlclNoZWV0ID0ge1xuICAgICAgY3NzUnVsZXM6IFtdLFxuICAgICAgaW5zZXJ0UnVsZTogZnVuY3Rpb24gaW5zZXJ0UnVsZShydWxlLCBpbmRleCkge1xuICAgICAgICBpZiAodHlwZW9mIGluZGV4ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIF90aGlzLl9zZXJ2ZXJTaGVldC5jc3NSdWxlc1tpbmRleF0gPSB7XG4gICAgICAgICAgICBjc3NUZXh0OiBydWxlXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfdGhpcy5fc2VydmVyU2hlZXQuY3NzUnVsZXMucHVzaCh7XG4gICAgICAgICAgICBjc3NUZXh0OiBydWxlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaW5kZXg7XG4gICAgICB9LFxuICAgICAgZGVsZXRlUnVsZTogZnVuY3Rpb24gZGVsZXRlUnVsZShpbmRleCkge1xuICAgICAgICBfdGhpcy5fc2VydmVyU2hlZXQuY3NzUnVsZXNbaW5kZXhdID0gbnVsbDtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIF9wcm90by5nZXRTaGVldEZvclRhZyA9IGZ1bmN0aW9uIGdldFNoZWV0Rm9yVGFnKHRhZykge1xuICAgIGlmICh0YWcuc2hlZXQpIHtcbiAgICAgIHJldHVybiB0YWcuc2hlZXQ7XG4gICAgfSAvLyB0aGlzIHdlaXJkbmVzcyBicm91Z2h0IHRvIHlvdSBieSBmaXJlZm94XG5cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZG9jdW1lbnQuc3R5bGVTaGVldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChkb2N1bWVudC5zdHlsZVNoZWV0c1tpXS5vd25lck5vZGUgPT09IHRhZykge1xuICAgICAgICByZXR1cm4gZG9jdW1lbnQuc3R5bGVTaGVldHNbaV07XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIF9wcm90by5nZXRTaGVldCA9IGZ1bmN0aW9uIGdldFNoZWV0KCkge1xuICAgIHJldHVybiB0aGlzLmdldFNoZWV0Rm9yVGFnKHRoaXMuX3RhZ3NbdGhpcy5fdGFncy5sZW5ndGggLSAxXSk7XG4gIH07XG5cbiAgX3Byb3RvLmluc2VydFJ1bGUgPSBmdW5jdGlvbiBpbnNlcnRSdWxlKHJ1bGUsIGluZGV4KSB7XG4gICAgaW52YXJpYW50KGlzU3RyaW5nKHJ1bGUpLCAnYGluc2VydFJ1bGVgIGFjY2VwdHMgb25seSBzdHJpbmdzJyk7XG5cbiAgICBpZiAoIXRoaXMuX2lzQnJvd3Nlcikge1xuICAgICAgaWYgKHR5cGVvZiBpbmRleCAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgaW5kZXggPSB0aGlzLl9zZXJ2ZXJTaGVldC5jc3NSdWxlcy5sZW5ndGg7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3NlcnZlclNoZWV0Lmluc2VydFJ1bGUocnVsZSwgaW5kZXgpO1xuXG4gICAgICByZXR1cm4gdGhpcy5fcnVsZXNDb3VudCsrO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9vcHRpbWl6ZUZvclNwZWVkKSB7XG4gICAgICB2YXIgc2hlZXQgPSB0aGlzLmdldFNoZWV0KCk7XG5cbiAgICAgIGlmICh0eXBlb2YgaW5kZXggIT09ICdudW1iZXInKSB7XG4gICAgICAgIGluZGV4ID0gc2hlZXQuY3NzUnVsZXMubGVuZ3RoO1xuICAgICAgfSAvLyB0aGlzIHdlaXJkbmVzcyBmb3IgcGVyZiwgYW5kIGNocm9tZSdzIHdlaXJkIGJ1Z1xuICAgICAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjAwMDc5OTIvY2hyb21lLXN1ZGRlbmx5LXN0b3BwZWQtYWNjZXB0aW5nLWluc2VydHJ1bGVcblxuXG4gICAgICB0cnkge1xuICAgICAgICBzaGVldC5pbnNlcnRSdWxlKHJ1bGUsIGluZGV4KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGlmICghaXNQcm9kKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKFwiU3R5bGVTaGVldDogaWxsZWdhbCBydWxlOiBcXG5cXG5cIiArIHJ1bGUgKyBcIlxcblxcblNlZSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3EvMjAwMDc5OTIgZm9yIG1vcmUgaW5mb1wiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGluc2VydGlvblBvaW50ID0gdGhpcy5fdGFnc1tpbmRleF07XG5cbiAgICAgIHRoaXMuX3RhZ3MucHVzaCh0aGlzLm1ha2VTdHlsZVRhZyh0aGlzLl9uYW1lLCBydWxlLCBpbnNlcnRpb25Qb2ludCkpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9ydWxlc0NvdW50Kys7XG4gIH07XG5cbiAgX3Byb3RvLnJlcGxhY2VSdWxlID0gZnVuY3Rpb24gcmVwbGFjZVJ1bGUoaW5kZXgsIHJ1bGUpIHtcbiAgICBpZiAodGhpcy5fb3B0aW1pemVGb3JTcGVlZCB8fCAhdGhpcy5faXNCcm93c2VyKSB7XG4gICAgICB2YXIgc2hlZXQgPSB0aGlzLl9pc0Jyb3dzZXIgPyB0aGlzLmdldFNoZWV0KCkgOiB0aGlzLl9zZXJ2ZXJTaGVldDtcblxuICAgICAgaWYgKCFydWxlLnRyaW0oKSkge1xuICAgICAgICBydWxlID0gdGhpcy5fZGVsZXRlZFJ1bGVQbGFjZWhvbGRlcjtcbiAgICAgIH1cblxuICAgICAgaWYgKCFzaGVldC5jc3NSdWxlc1tpbmRleF0pIHtcbiAgICAgICAgLy8gQFRCRCBTaG91bGQgd2UgdGhyb3cgYW4gZXJyb3I/XG4gICAgICAgIHJldHVybiBpbmRleDtcbiAgICAgIH1cblxuICAgICAgc2hlZXQuZGVsZXRlUnVsZShpbmRleCk7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHNoZWV0Lmluc2VydFJ1bGUocnVsZSwgaW5kZXgpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgaWYgKCFpc1Byb2QpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oXCJTdHlsZVNoZWV0OiBpbGxlZ2FsIHJ1bGU6IFxcblxcblwiICsgcnVsZSArIFwiXFxuXFxuU2VlIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcS8yMDAwNzk5MiBmb3IgbW9yZSBpbmZvXCIpO1xuICAgICAgICB9IC8vIEluIG9yZGVyIHRvIHByZXNlcnZlIHRoZSBpbmRpY2VzIHdlIGluc2VydCBhIGRlbGV0ZVJ1bGVQbGFjZWhvbGRlclxuXG5cbiAgICAgICAgc2hlZXQuaW5zZXJ0UnVsZSh0aGlzLl9kZWxldGVkUnVsZVBsYWNlaG9sZGVyLCBpbmRleCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB0YWcgPSB0aGlzLl90YWdzW2luZGV4XTtcbiAgICAgIGludmFyaWFudCh0YWcsIFwib2xkIHJ1bGUgYXQgaW5kZXggYFwiICsgaW5kZXggKyBcImAgbm90IGZvdW5kXCIpO1xuICAgICAgdGFnLnRleHRDb250ZW50ID0gcnVsZTtcbiAgICB9XG5cbiAgICByZXR1cm4gaW5kZXg7XG4gIH07XG5cbiAgX3Byb3RvLmRlbGV0ZVJ1bGUgPSBmdW5jdGlvbiBkZWxldGVSdWxlKGluZGV4KSB7XG4gICAgaWYgKCF0aGlzLl9pc0Jyb3dzZXIpIHtcbiAgICAgIHRoaXMuX3NlcnZlclNoZWV0LmRlbGV0ZVJ1bGUoaW5kZXgpO1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX29wdGltaXplRm9yU3BlZWQpIHtcbiAgICAgIHRoaXMucmVwbGFjZVJ1bGUoaW5kZXgsICcnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHRhZyA9IHRoaXMuX3RhZ3NbaW5kZXhdO1xuICAgICAgaW52YXJpYW50KHRhZywgXCJydWxlIGF0IGluZGV4IGBcIiArIGluZGV4ICsgXCJgIG5vdCBmb3VuZFwiKTtcbiAgICAgIHRhZy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRhZyk7XG4gICAgICB0aGlzLl90YWdzW2luZGV4XSA9IG51bGw7XG4gICAgfVxuICB9O1xuXG4gIF9wcm90by5mbHVzaCA9IGZ1bmN0aW9uIGZsdXNoKCkge1xuICAgIHRoaXMuX2luamVjdGVkID0gZmFsc2U7XG4gICAgdGhpcy5fcnVsZXNDb3VudCA9IDA7XG5cbiAgICBpZiAodGhpcy5faXNCcm93c2VyKSB7XG4gICAgICB0aGlzLl90YWdzLmZvckVhY2goZnVuY3Rpb24gKHRhZykge1xuICAgICAgICByZXR1cm4gdGFnICYmIHRhZy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRhZyk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5fdGFncyA9IFtdO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBzaW1wbGVyIG9uIHNlcnZlclxuICAgICAgdGhpcy5fc2VydmVyU2hlZXQuY3NzUnVsZXMgPSBbXTtcbiAgICB9XG4gIH07XG5cbiAgX3Byb3RvLmNzc1J1bGVzID0gZnVuY3Rpb24gY3NzUnVsZXMoKSB7XG4gICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICBpZiAoIXRoaXMuX2lzQnJvd3Nlcikge1xuICAgICAgcmV0dXJuIHRoaXMuX3NlcnZlclNoZWV0LmNzc1J1bGVzO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl90YWdzLnJlZHVjZShmdW5jdGlvbiAocnVsZXMsIHRhZykge1xuICAgICAgaWYgKHRhZykge1xuICAgICAgICBydWxlcyA9IHJ1bGVzLmNvbmNhdChBcnJheS5wcm90b3R5cGUubWFwLmNhbGwoX3RoaXMyLmdldFNoZWV0Rm9yVGFnKHRhZykuY3NzUnVsZXMsIGZ1bmN0aW9uIChydWxlKSB7XG4gICAgICAgICAgcmV0dXJuIHJ1bGUuY3NzVGV4dCA9PT0gX3RoaXMyLl9kZWxldGVkUnVsZVBsYWNlaG9sZGVyID8gbnVsbCA6IHJ1bGU7XG4gICAgICAgIH0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJ1bGVzLnB1c2gobnVsbCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBydWxlcztcbiAgICB9LCBbXSk7XG4gIH07XG5cbiAgX3Byb3RvLm1ha2VTdHlsZVRhZyA9IGZ1bmN0aW9uIG1ha2VTdHlsZVRhZyhuYW1lLCBjc3NTdHJpbmcsIHJlbGF0aXZlVG9UYWcpIHtcbiAgICBpZiAoY3NzU3RyaW5nKSB7XG4gICAgICBpbnZhcmlhbnQoaXNTdHJpbmcoY3NzU3RyaW5nKSwgJ21ha2VTdHlsZVRhZyBhY2NlcHMgb25seSBzdHJpbmdzIGFzIHNlY29uZCBwYXJhbWV0ZXInKTtcbiAgICB9XG5cbiAgICB2YXIgdGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICBpZiAodGhpcy5fbm9uY2UpIHRhZy5zZXRBdHRyaWJ1dGUoJ25vbmNlJywgdGhpcy5fbm9uY2UpO1xuICAgIHRhZy50eXBlID0gJ3RleHQvY3NzJztcbiAgICB0YWcuc2V0QXR0cmlidXRlKFwiZGF0YS1cIiArIG5hbWUsICcnKTtcblxuICAgIGlmIChjc3NTdHJpbmcpIHtcbiAgICAgIHRhZy5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3NTdHJpbmcpKTtcbiAgICB9XG5cbiAgICB2YXIgaGVhZCA9IGRvY3VtZW50LmhlYWQgfHwgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXTtcblxuICAgIGlmIChyZWxhdGl2ZVRvVGFnKSB7XG4gICAgICBoZWFkLmluc2VydEJlZm9yZSh0YWcsIHJlbGF0aXZlVG9UYWcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBoZWFkLmFwcGVuZENoaWxkKHRhZyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRhZztcbiAgfTtcblxuICBfY3JlYXRlQ2xhc3MoU3R5bGVTaGVldCwgW3tcbiAgICBrZXk6IFwibGVuZ3RoXCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcnVsZXNDb3VudDtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gU3R5bGVTaGVldDtcbn0oKTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBTdHlsZVNoZWV0O1xuXG5mdW5jdGlvbiBpbnZhcmlhbnQoY29uZGl0aW9uLCBtZXNzYWdlKSB7XG4gIGlmICghY29uZGl0aW9uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiU3R5bGVTaGVldDogXCIgKyBtZXNzYWdlICsgXCIuXCIpO1xuICB9XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzLmZsdXNoID0gZmx1c2g7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKTtcblxudmFyIF9zdHlsZXNoZWV0UmVnaXN0cnkgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3N0eWxlc2hlZXQtcmVnaXN0cnlcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzTG9vc2Uoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzLnByb3RvdHlwZSk7IHN1YkNsYXNzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IHN1YkNsYXNzOyBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBzdHlsZVNoZWV0UmVnaXN0cnkgPSBuZXcgX3N0eWxlc2hlZXRSZWdpc3RyeVtcImRlZmF1bHRcIl0oKTtcblxudmFyIEpTWFN0eWxlID1cbi8qI19fUFVSRV9fKi9cbmZ1bmN0aW9uIChfQ29tcG9uZW50KSB7XG4gIF9pbmhlcml0c0xvb3NlKEpTWFN0eWxlLCBfQ29tcG9uZW50KTtcblxuICBmdW5jdGlvbiBKU1hTdHlsZShwcm9wcykge1xuICAgIHZhciBfdGhpcztcblxuICAgIF90aGlzID0gX0NvbXBvbmVudC5jYWxsKHRoaXMsIHByb3BzKSB8fCB0aGlzO1xuICAgIF90aGlzLnByZXZQcm9wcyA9IHt9O1xuICAgIHJldHVybiBfdGhpcztcbiAgfVxuXG4gIEpTWFN0eWxlLmR5bmFtaWMgPSBmdW5jdGlvbiBkeW5hbWljKGluZm8pIHtcbiAgICByZXR1cm4gaW5mby5tYXAoZnVuY3Rpb24gKHRhZ0luZm8pIHtcbiAgICAgIHZhciBiYXNlSWQgPSB0YWdJbmZvWzBdO1xuICAgICAgdmFyIHByb3BzID0gdGFnSW5mb1sxXTtcbiAgICAgIHJldHVybiBzdHlsZVNoZWV0UmVnaXN0cnkuY29tcHV0ZUlkKGJhc2VJZCwgcHJvcHMpO1xuICAgIH0pLmpvaW4oJyAnKTtcbiAgfSAvLyBwcm9iYWJseSBmYXN0ZXIgdGhhbiBQdXJlQ29tcG9uZW50IChzaGFsbG93RXF1YWwpXG4gIDtcblxuICB2YXIgX3Byb3RvID0gSlNYU3R5bGUucHJvdG90eXBlO1xuXG4gIF9wcm90by5zaG91bGRDb21wb25lbnRVcGRhdGUgPSBmdW5jdGlvbiBzaG91bGRDb21wb25lbnRVcGRhdGUob3RoZXJQcm9wcykge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmlkICE9PSBvdGhlclByb3BzLmlkIHx8IC8vIFdlIGRvIHRoaXMgY2hlY2sgYmVjYXVzZSBgZHluYW1pY2AgaXMgYW4gYXJyYXkgb2Ygc3RyaW5ncyBvciB1bmRlZmluZWQuXG4gICAgLy8gVGhlc2UgYXJlIHRoZSBjb21wdXRlZCB2YWx1ZXMgZm9yIGR5bmFtaWMgc3R5bGVzLlxuICAgIFN0cmluZyh0aGlzLnByb3BzLmR5bmFtaWMpICE9PSBTdHJpbmcob3RoZXJQcm9wcy5keW5hbWljKTtcbiAgfTtcblxuICBfcHJvdG8uY29tcG9uZW50V2lsbFVubW91bnQgPSBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICBzdHlsZVNoZWV0UmVnaXN0cnkucmVtb3ZlKHRoaXMucHJvcHMpO1xuICB9O1xuXG4gIF9wcm90by5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgLy8gVGhpcyBpcyBhIHdvcmthcm91bmQgdG8gbWFrZSB0aGUgc2lkZSBlZmZlY3QgYXN5bmMgc2FmZSBpbiB0aGUgXCJyZW5kZXJcIiBwaGFzZS5cbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3plaXQvc3R5bGVkLWpzeC9wdWxsLzQ4NFxuICAgIGlmICh0aGlzLnNob3VsZENvbXBvbmVudFVwZGF0ZSh0aGlzLnByZXZQcm9wcykpIHtcbiAgICAgIC8vIFVwZGF0ZXNcbiAgICAgIGlmICh0aGlzLnByZXZQcm9wcy5pZCkge1xuICAgICAgICBzdHlsZVNoZWV0UmVnaXN0cnkucmVtb3ZlKHRoaXMucHJldlByb3BzKTtcbiAgICAgIH1cblxuICAgICAgc3R5bGVTaGVldFJlZ2lzdHJ5LmFkZCh0aGlzLnByb3BzKTtcbiAgICAgIHRoaXMucHJldlByb3BzID0gdGhpcy5wcm9wcztcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICByZXR1cm4gSlNYU3R5bGU7XG59KF9yZWFjdC5Db21wb25lbnQpO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IEpTWFN0eWxlO1xuXG5mdW5jdGlvbiBmbHVzaCgpIHtcbiAgdmFyIGNzc1J1bGVzID0gc3R5bGVTaGVldFJlZ2lzdHJ5LmNzc1J1bGVzKCk7XG4gIHN0eWxlU2hlZXRSZWdpc3RyeS5mbHVzaCgpO1xuICByZXR1cm4gY3NzUnVsZXM7XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxudmFyIF9zdHJpbmdIYXNoID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwic3RyaW5nLWhhc2hcIikpO1xuXG52YXIgX3N0eWxlc2hlZXQgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2xpYi9zdHlsZXNoZWV0XCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbnZhciBzYW5pdGl6ZSA9IGZ1bmN0aW9uIHNhbml0aXplKHJ1bGUpIHtcbiAgcmV0dXJuIHJ1bGUucmVwbGFjZSgvXFwvc3R5bGUvZ2ksICdcXFxcL3N0eWxlJyk7XG59O1xuXG52YXIgU3R5bGVTaGVldFJlZ2lzdHJ5ID1cbi8qI19fUFVSRV9fKi9cbmZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gU3R5bGVTaGVldFJlZ2lzdHJ5KF90ZW1wKSB7XG4gICAgdmFyIF9yZWYgPSBfdGVtcCA9PT0gdm9pZCAwID8ge30gOiBfdGVtcCxcbiAgICAgICAgX3JlZiRzdHlsZVNoZWV0ID0gX3JlZi5zdHlsZVNoZWV0LFxuICAgICAgICBzdHlsZVNoZWV0ID0gX3JlZiRzdHlsZVNoZWV0ID09PSB2b2lkIDAgPyBudWxsIDogX3JlZiRzdHlsZVNoZWV0LFxuICAgICAgICBfcmVmJG9wdGltaXplRm9yU3BlZWQgPSBfcmVmLm9wdGltaXplRm9yU3BlZWQsXG4gICAgICAgIG9wdGltaXplRm9yU3BlZWQgPSBfcmVmJG9wdGltaXplRm9yU3BlZWQgPT09IHZvaWQgMCA/IGZhbHNlIDogX3JlZiRvcHRpbWl6ZUZvclNwZWVkLFxuICAgICAgICBfcmVmJGlzQnJvd3NlciA9IF9yZWYuaXNCcm93c2VyLFxuICAgICAgICBpc0Jyb3dzZXIgPSBfcmVmJGlzQnJvd3NlciA9PT0gdm9pZCAwID8gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgOiBfcmVmJGlzQnJvd3NlcjtcblxuICAgIHRoaXMuX3NoZWV0ID0gc3R5bGVTaGVldCB8fCBuZXcgX3N0eWxlc2hlZXRbXCJkZWZhdWx0XCJdKHtcbiAgICAgIG5hbWU6ICdzdHlsZWQtanN4JyxcbiAgICAgIG9wdGltaXplRm9yU3BlZWQ6IG9wdGltaXplRm9yU3BlZWRcbiAgICB9KTtcblxuICAgIHRoaXMuX3NoZWV0LmluamVjdCgpO1xuXG4gICAgaWYgKHN0eWxlU2hlZXQgJiYgdHlwZW9mIG9wdGltaXplRm9yU3BlZWQgPT09ICdib29sZWFuJykge1xuICAgICAgdGhpcy5fc2hlZXQuc2V0T3B0aW1pemVGb3JTcGVlZChvcHRpbWl6ZUZvclNwZWVkKTtcblxuICAgICAgdGhpcy5fb3B0aW1pemVGb3JTcGVlZCA9IHRoaXMuX3NoZWV0LmlzT3B0aW1pemVGb3JTcGVlZCgpO1xuICAgIH1cblxuICAgIHRoaXMuX2lzQnJvd3NlciA9IGlzQnJvd3NlcjtcbiAgICB0aGlzLl9mcm9tU2VydmVyID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX2luZGljZXMgPSB7fTtcbiAgICB0aGlzLl9pbnN0YW5jZXNDb3VudHMgPSB7fTtcbiAgICB0aGlzLmNvbXB1dGVJZCA9IHRoaXMuY3JlYXRlQ29tcHV0ZUlkKCk7XG4gICAgdGhpcy5jb21wdXRlU2VsZWN0b3IgPSB0aGlzLmNyZWF0ZUNvbXB1dGVTZWxlY3RvcigpO1xuICB9XG5cbiAgdmFyIF9wcm90byA9IFN0eWxlU2hlZXRSZWdpc3RyeS5wcm90b3R5cGU7XG5cbiAgX3Byb3RvLmFkZCA9IGZ1bmN0aW9uIGFkZChwcm9wcykge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZiAodW5kZWZpbmVkID09PSB0aGlzLl9vcHRpbWl6ZUZvclNwZWVkKSB7XG4gICAgICB0aGlzLl9vcHRpbWl6ZUZvclNwZWVkID0gQXJyYXkuaXNBcnJheShwcm9wcy5jaGlsZHJlbik7XG5cbiAgICAgIHRoaXMuX3NoZWV0LnNldE9wdGltaXplRm9yU3BlZWQodGhpcy5fb3B0aW1pemVGb3JTcGVlZCk7XG5cbiAgICAgIHRoaXMuX29wdGltaXplRm9yU3BlZWQgPSB0aGlzLl9zaGVldC5pc09wdGltaXplRm9yU3BlZWQoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5faXNCcm93c2VyICYmICF0aGlzLl9mcm9tU2VydmVyKSB7XG4gICAgICB0aGlzLl9mcm9tU2VydmVyID0gdGhpcy5zZWxlY3RGcm9tU2VydmVyKCk7XG4gICAgICB0aGlzLl9pbnN0YW5jZXNDb3VudHMgPSBPYmplY3Qua2V5cyh0aGlzLl9mcm9tU2VydmVyKS5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgdGFnTmFtZSkge1xuICAgICAgICBhY2NbdGFnTmFtZV0gPSAwO1xuICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgfSwge30pO1xuICAgIH1cblxuICAgIHZhciBfdGhpcyRnZXRJZEFuZFJ1bGVzID0gdGhpcy5nZXRJZEFuZFJ1bGVzKHByb3BzKSxcbiAgICAgICAgc3R5bGVJZCA9IF90aGlzJGdldElkQW5kUnVsZXMuc3R5bGVJZCxcbiAgICAgICAgcnVsZXMgPSBfdGhpcyRnZXRJZEFuZFJ1bGVzLnJ1bGVzOyAvLyBEZWR1cGluZzoganVzdCBpbmNyZWFzZSB0aGUgaW5zdGFuY2VzIGNvdW50LlxuXG5cbiAgICBpZiAoc3R5bGVJZCBpbiB0aGlzLl9pbnN0YW5jZXNDb3VudHMpIHtcbiAgICAgIHRoaXMuX2luc3RhbmNlc0NvdW50c1tzdHlsZUlkXSArPSAxO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBpbmRpY2VzID0gcnVsZXMubWFwKGZ1bmN0aW9uIChydWxlKSB7XG4gICAgICByZXR1cm4gX3RoaXMuX3NoZWV0Lmluc2VydFJ1bGUocnVsZSk7XG4gICAgfSkgLy8gRmlsdGVyIG91dCBpbnZhbGlkIHJ1bGVzXG4gICAgLmZpbHRlcihmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgIHJldHVybiBpbmRleCAhPT0gLTE7XG4gICAgfSk7XG4gICAgdGhpcy5faW5kaWNlc1tzdHlsZUlkXSA9IGluZGljZXM7XG4gICAgdGhpcy5faW5zdGFuY2VzQ291bnRzW3N0eWxlSWRdID0gMTtcbiAgfTtcblxuICBfcHJvdG8ucmVtb3ZlID0gZnVuY3Rpb24gcmVtb3ZlKHByb3BzKSB7XG4gICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICB2YXIgX3RoaXMkZ2V0SWRBbmRSdWxlczIgPSB0aGlzLmdldElkQW5kUnVsZXMocHJvcHMpLFxuICAgICAgICBzdHlsZUlkID0gX3RoaXMkZ2V0SWRBbmRSdWxlczIuc3R5bGVJZDtcblxuICAgIGludmFyaWFudChzdHlsZUlkIGluIHRoaXMuX2luc3RhbmNlc0NvdW50cywgXCJzdHlsZUlkOiBgXCIgKyBzdHlsZUlkICsgXCJgIG5vdCBmb3VuZFwiKTtcbiAgICB0aGlzLl9pbnN0YW5jZXNDb3VudHNbc3R5bGVJZF0gLT0gMTtcblxuICAgIGlmICh0aGlzLl9pbnN0YW5jZXNDb3VudHNbc3R5bGVJZF0gPCAxKSB7XG4gICAgICB2YXIgdGFnRnJvbVNlcnZlciA9IHRoaXMuX2Zyb21TZXJ2ZXIgJiYgdGhpcy5fZnJvbVNlcnZlcltzdHlsZUlkXTtcblxuICAgICAgaWYgKHRhZ0Zyb21TZXJ2ZXIpIHtcbiAgICAgICAgdGFnRnJvbVNlcnZlci5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRhZ0Zyb21TZXJ2ZXIpO1xuICAgICAgICBkZWxldGUgdGhpcy5fZnJvbVNlcnZlcltzdHlsZUlkXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2luZGljZXNbc3R5bGVJZF0uZm9yRWFjaChmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMyLl9zaGVldC5kZWxldGVSdWxlKGluZGV4KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZGVsZXRlIHRoaXMuX2luZGljZXNbc3R5bGVJZF07XG4gICAgICB9XG5cbiAgICAgIGRlbGV0ZSB0aGlzLl9pbnN0YW5jZXNDb3VudHNbc3R5bGVJZF07XG4gICAgfVxuICB9O1xuXG4gIF9wcm90by51cGRhdGUgPSBmdW5jdGlvbiB1cGRhdGUocHJvcHMsIG5leHRQcm9wcykge1xuICAgIHRoaXMuYWRkKG5leHRQcm9wcyk7XG4gICAgdGhpcy5yZW1vdmUocHJvcHMpO1xuICB9O1xuXG4gIF9wcm90by5mbHVzaCA9IGZ1bmN0aW9uIGZsdXNoKCkge1xuICAgIHRoaXMuX3NoZWV0LmZsdXNoKCk7XG5cbiAgICB0aGlzLl9zaGVldC5pbmplY3QoKTtcblxuICAgIHRoaXMuX2Zyb21TZXJ2ZXIgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5faW5kaWNlcyA9IHt9O1xuICAgIHRoaXMuX2luc3RhbmNlc0NvdW50cyA9IHt9O1xuICAgIHRoaXMuY29tcHV0ZUlkID0gdGhpcy5jcmVhdGVDb21wdXRlSWQoKTtcbiAgICB0aGlzLmNvbXB1dGVTZWxlY3RvciA9IHRoaXMuY3JlYXRlQ29tcHV0ZVNlbGVjdG9yKCk7XG4gIH07XG5cbiAgX3Byb3RvLmNzc1J1bGVzID0gZnVuY3Rpb24gY3NzUnVsZXMoKSB7XG4gICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICB2YXIgZnJvbVNlcnZlciA9IHRoaXMuX2Zyb21TZXJ2ZXIgPyBPYmplY3Qua2V5cyh0aGlzLl9mcm9tU2VydmVyKS5tYXAoZnVuY3Rpb24gKHN0eWxlSWQpIHtcbiAgICAgIHJldHVybiBbc3R5bGVJZCwgX3RoaXMzLl9mcm9tU2VydmVyW3N0eWxlSWRdXTtcbiAgICB9KSA6IFtdO1xuXG4gICAgdmFyIGNzc1J1bGVzID0gdGhpcy5fc2hlZXQuY3NzUnVsZXMoKTtcblxuICAgIHJldHVybiBmcm9tU2VydmVyLmNvbmNhdChPYmplY3Qua2V5cyh0aGlzLl9pbmRpY2VzKS5tYXAoZnVuY3Rpb24gKHN0eWxlSWQpIHtcbiAgICAgIHJldHVybiBbc3R5bGVJZCwgX3RoaXMzLl9pbmRpY2VzW3N0eWxlSWRdLm1hcChmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIGNzc1J1bGVzW2luZGV4XS5jc3NUZXh0O1xuICAgICAgfSkuam9pbihfdGhpczMuX29wdGltaXplRm9yU3BlZWQgPyAnJyA6ICdcXG4nKV07XG4gICAgfSkgLy8gZmlsdGVyIG91dCBlbXB0eSBydWxlc1xuICAgIC5maWx0ZXIoZnVuY3Rpb24gKHJ1bGUpIHtcbiAgICAgIHJldHVybiBCb29sZWFuKHJ1bGVbMV0pO1xuICAgIH0pKTtcbiAgfVxuICAvKipcbiAgICogY3JlYXRlQ29tcHV0ZUlkXG4gICAqXG4gICAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0byBjb21wdXRlIGFuZCBtZW1vaXplIGEganN4IGlkIGZyb20gYSBiYXNlZElkIGFuZCBvcHRpb25hbGx5IHByb3BzLlxuICAgKi9cbiAgO1xuXG4gIF9wcm90by5jcmVhdGVDb21wdXRlSWQgPSBmdW5jdGlvbiBjcmVhdGVDb21wdXRlSWQoKSB7XG4gICAgdmFyIGNhY2hlID0ge307XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChiYXNlSWQsIHByb3BzKSB7XG4gICAgICBpZiAoIXByb3BzKSB7XG4gICAgICAgIHJldHVybiBcImpzeC1cIiArIGJhc2VJZDtcbiAgICAgIH1cblxuICAgICAgdmFyIHByb3BzVG9TdHJpbmcgPSBTdHJpbmcocHJvcHMpO1xuICAgICAgdmFyIGtleSA9IGJhc2VJZCArIHByb3BzVG9TdHJpbmc7IC8vIHJldHVybiBganN4LSR7aGFzaFN0cmluZyhgJHtiYXNlSWR9LSR7cHJvcHNUb1N0cmluZ31gKX1gXG5cbiAgICAgIGlmICghY2FjaGVba2V5XSkge1xuICAgICAgICBjYWNoZVtrZXldID0gXCJqc3gtXCIgKyAoMCwgX3N0cmluZ0hhc2hbXCJkZWZhdWx0XCJdKShiYXNlSWQgKyBcIi1cIiArIHByb3BzVG9TdHJpbmcpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY2FjaGVba2V5XTtcbiAgICB9O1xuICB9XG4gIC8qKlxuICAgKiBjcmVhdGVDb21wdXRlU2VsZWN0b3JcbiAgICpcbiAgICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRvIGNvbXB1dGUgYW5kIG1lbW9pemUgZHluYW1pYyBzZWxlY3RvcnMuXG4gICAqL1xuICA7XG5cbiAgX3Byb3RvLmNyZWF0ZUNvbXB1dGVTZWxlY3RvciA9IGZ1bmN0aW9uIGNyZWF0ZUNvbXB1dGVTZWxlY3RvcihzZWxlY3RvUGxhY2Vob2xkZXJSZWdleHApIHtcbiAgICBpZiAoc2VsZWN0b1BsYWNlaG9sZGVyUmVnZXhwID09PSB2b2lkIDApIHtcbiAgICAgIHNlbGVjdG9QbGFjZWhvbGRlclJlZ2V4cCA9IC9fX2pzeC1zdHlsZS1keW5hbWljLXNlbGVjdG9yL2c7XG4gICAgfVxuXG4gICAgdmFyIGNhY2hlID0ge307XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChpZCwgY3NzKSB7XG4gICAgICAvLyBTYW5pdGl6ZSBTU1ItZWQgQ1NTLlxuICAgICAgLy8gQ2xpZW50IHNpZGUgY29kZSBkb2Vzbid0IG5lZWQgdG8gYmUgc2FuaXRpemVkIHNpbmNlIHdlIHVzZVxuICAgICAgLy8gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUgKGRldikgYW5kIHRoZSBDU1NPTSBhcGkgc2hlZXQuaW5zZXJ0UnVsZSAocHJvZCkuXG4gICAgICBpZiAoIXRoaXMuX2lzQnJvd3Nlcikge1xuICAgICAgICBjc3MgPSBzYW5pdGl6ZShjc3MpO1xuICAgICAgfVxuXG4gICAgICB2YXIgaWRjc3MgPSBpZCArIGNzcztcblxuICAgICAgaWYgKCFjYWNoZVtpZGNzc10pIHtcbiAgICAgICAgY2FjaGVbaWRjc3NdID0gY3NzLnJlcGxhY2Uoc2VsZWN0b1BsYWNlaG9sZGVyUmVnZXhwLCBpZCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjYWNoZVtpZGNzc107XG4gICAgfTtcbiAgfTtcblxuICBfcHJvdG8uZ2V0SWRBbmRSdWxlcyA9IGZ1bmN0aW9uIGdldElkQW5kUnVsZXMocHJvcHMpIHtcbiAgICB2YXIgX3RoaXM0ID0gdGhpcztcblxuICAgIHZhciBjc3MgPSBwcm9wcy5jaGlsZHJlbixcbiAgICAgICAgZHluYW1pYyA9IHByb3BzLmR5bmFtaWMsXG4gICAgICAgIGlkID0gcHJvcHMuaWQ7XG5cbiAgICBpZiAoZHluYW1pYykge1xuICAgICAgdmFyIHN0eWxlSWQgPSB0aGlzLmNvbXB1dGVJZChpZCwgZHluYW1pYyk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdHlsZUlkOiBzdHlsZUlkLFxuICAgICAgICBydWxlczogQXJyYXkuaXNBcnJheShjc3MpID8gY3NzLm1hcChmdW5jdGlvbiAocnVsZSkge1xuICAgICAgICAgIHJldHVybiBfdGhpczQuY29tcHV0ZVNlbGVjdG9yKHN0eWxlSWQsIHJ1bGUpO1xuICAgICAgICB9KSA6IFt0aGlzLmNvbXB1dGVTZWxlY3RvcihzdHlsZUlkLCBjc3MpXVxuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgc3R5bGVJZDogdGhpcy5jb21wdXRlSWQoaWQpLFxuICAgICAgcnVsZXM6IEFycmF5LmlzQXJyYXkoY3NzKSA/IGNzcyA6IFtjc3NdXG4gICAgfTtcbiAgfVxuICAvKipcbiAgICogc2VsZWN0RnJvbVNlcnZlclxuICAgKlxuICAgKiBDb2xsZWN0cyBzdHlsZSB0YWdzIGZyb20gdGhlIGRvY3VtZW50IHdpdGggaWQgX19qc3gtWFhYXG4gICAqL1xuICA7XG5cbiAgX3Byb3RvLnNlbGVjdEZyb21TZXJ2ZXIgPSBmdW5jdGlvbiBzZWxlY3RGcm9tU2VydmVyKCkge1xuICAgIHZhciBlbGVtZW50cyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tpZF49XCJfX2pzeC1cIl0nKSk7XG4gICAgcmV0dXJuIGVsZW1lbnRzLnJlZHVjZShmdW5jdGlvbiAoYWNjLCBlbGVtZW50KSB7XG4gICAgICB2YXIgaWQgPSBlbGVtZW50LmlkLnNsaWNlKDIpO1xuICAgICAgYWNjW2lkXSA9IGVsZW1lbnQ7XG4gICAgICByZXR1cm4gYWNjO1xuICAgIH0sIHt9KTtcbiAgfTtcblxuICByZXR1cm4gU3R5bGVTaGVldFJlZ2lzdHJ5O1xufSgpO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IFN0eWxlU2hlZXRSZWdpc3RyeTtcblxuZnVuY3Rpb24gaW52YXJpYW50KGNvbmRpdGlvbiwgbWVzc2FnZSkge1xuICBpZiAoIWNvbmRpdGlvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlN0eWxlU2hlZXRSZWdpc3RyeTogXCIgKyBtZXNzYWdlICsgXCIuXCIpO1xuICB9XG59IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Rpc3Qvc3R5bGUnKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvcmlnaW5hbE1vZHVsZSkge1xuXHRpZiAoIW9yaWdpbmFsTW9kdWxlLndlYnBhY2tQb2x5ZmlsbCkge1xuXHRcdHZhciBtb2R1bGUgPSBPYmplY3QuY3JlYXRlKG9yaWdpbmFsTW9kdWxlKTtcblx0XHQvLyBtb2R1bGUucGFyZW50ID0gdW5kZWZpbmVkIGJ5IGRlZmF1bHRcblx0XHRpZiAoIW1vZHVsZS5jaGlsZHJlbikgbW9kdWxlLmNoaWxkcmVuID0gW107XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZSwgXCJsb2FkZWRcIiwge1xuXHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiBtb2R1bGUubDtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLCBcImlkXCIsIHtcblx0XHRcdGVudW1lcmFibGU6IHRydWUsXG5cdFx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gbW9kdWxlLmk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZSwgXCJleHBvcnRzXCIsIHtcblx0XHRcdGVudW1lcmFibGU6IHRydWVcblx0XHR9KTtcblx0XHRtb2R1bGUud2VicGFja1BvbHlmaWxsID0gMTtcblx0fVxuXHRyZXR1cm4gbW9kdWxlO1xufTtcbiIsIi8vemVpdC9bbmFtZV0uanNcclxuaW1wb3J0IGZldGNoIGZyb20gJ25vZGUtZmV0Y2gnO1xyXG5pbXBvcnQgcGFyc2UgZnJvbSAnaHRtbC1yZWFjdC1wYXJzZXInO1xyXG4vLyBpbXBvcnQgJ3N0eWxlLmNzcyc7XHJcblxyXG5mdW5jdGlvbiBCbG9nKHsgYmxvZyB9KSB7XHJcbiAgICBjb25zb2xlLmxvZygnYmxvZycsIGJsb2cpO1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICA8aDE+e2Jsb2dbMF0udGl0bGV9PC9oMT5cclxuICAgICAgICAgICAge3BhcnNlKGJsb2dbMF0uY29udGVudCl9XHJcblxyXG4gICAgICAgICAgICA8c3R5bGUganN4IGdsb2JhbD57YFxyXG4gICAgICAgICAgICAgICAgaW1nIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXgtd2lkdGg6IDEwMCU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGFibGUge1xyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDEwMCU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGFibGUsIHRoLCB0ZCB7XHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgI0VBRUFFQTtcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXItcmFkaXVzOiAzcHg7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogNXB4O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRyOm50aC1jaGlsZChldmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI0Y4RjhGODtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBib2R5IHtcclxuICAgICAgICAgICAgICAgICAgICBmb250LWZhbWlseTogSGVsdmV0aWNhLCBBcmlhbCwgRnJlZXNhbnMsIGNsZWFuLCBzYW5zLXNlcmlmO1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzoxZW07XHJcbiAgICAgICAgICAgICAgICBtYXJnaW46YXV0bztcclxuICAgICAgICAgICAgICAgIG1heC13aWR0aDo0MmVtO1xyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDojZmVmZWZlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGgxLCBoMiwgaDMsIGg0LCBoNSwgaDYge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGgxIHtcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogIzAwMDAwMDtcclxuICAgICAgICAgICAgICAgICAgICBmb250LXNpemU6IDI4cHg7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaDIge1xyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjQ0NDQ0NDO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAjMDAwMDAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbnQtc2l6ZTogMjRweDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBoMyB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9udC1zaXplOiAxOHB4O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGg0IHtcclxuICAgICAgICAgICAgICAgICAgICBmb250LXNpemU6IDE2cHg7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaDUge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbnQtc2l6ZTogMTRweDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBoNiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICM3Nzc3Nzc7XHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogaW5oZXJpdDtcclxuICAgICAgICAgICAgICAgICAgICBmb250LXNpemU6IDE0cHg7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaHIge1xyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogMC4yZW07XHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAjQ0NDQ0NDO1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNDQ0NDQ0M7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcCwgYmxvY2txdW90ZSwgdWwsIG9sLCBkbCwgbGksIHRhYmxlLCBwcmUge1xyXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbjogMTVweCAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvZGUsIHByZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogM3B4O1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNGOEY4Rjg7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IGluaGVyaXQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29kZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgI0VBRUFFQTtcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW46IDAgMnB4O1xyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6IDAgNXB4O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHByZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgI0NDQ0NDQztcclxuICAgICAgICAgICAgICAgICAgICBsaW5lLWhlaWdodDogMS4yNWVtO1xyXG4gICAgICAgICAgICAgICAgICAgIG92ZXJmbG93OiBhdXRvO1xyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6IDZweCAxMHB4O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHByZSA+IGNvZGUge1xyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlcjogMDtcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW46IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogMDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBhLCBhOnZpc2l0ZWQge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAjNDE4M0M0O1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IGluaGVyaXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgIFZpc3VhbCBTdHVkaW8tbGlrZSBzdHlsZSBiYXNlZCBvbiBvcmlnaW5hbCBDIyBjb2xvcmluZyBieSBKYXNvbiBEaWFtb25kIDxqYXNvbkBkaWFtb25kLm5hbWU+XHJcbiAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgcHJlIHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBibG9jaztcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW46IDAgMCAxMHB4O1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAjMzMzO1xyXG4gICAgICAgICAgICAgICAgICAgIHdvcmQtYnJlYWs6IGJyZWFrLWFsbDtcclxuICAgICAgICAgICAgICAgICAgICB3b3JkLXdyYXA6IGJyZWFrLXdvcmQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgI2NjYztcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAxNnB4O1xyXG4gICAgICAgICAgICAgICAgICAgIG92ZXJmbG93OiBhdXRvO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbnQtc2l6ZTogODUlO1xyXG4gICAgICAgICAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiAxLjQ1O1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmN2Y3Zjc7XHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogM3B4O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLmhsanMge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xyXG4gICAgICAgICAgICAgICAgICAgIG92ZXJmbG93LXg6IGF1dG87XHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogMC41ZW07XHJcbiAgICAgICAgICAgICAgICAgICAgLyogYmFja2dyb3VuZDogd2hpdGU7ICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IGJsYWNrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC5obGpzLWNvbW1lbnQsXHJcbiAgICAgICAgICAgICAgICAuaGxqcy1xdW90ZSxcclxuICAgICAgICAgICAgICAgIC5obGpzLXZhcmlhYmxlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogIzAwODAwMDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAuaGxqcy1rZXl3b3JkLFxyXG4gICAgICAgICAgICAgICAgLmhsanMtc2VsZWN0b3ItdGFnLFxyXG4gICAgICAgICAgICAgICAgLmhsanMtYnVpbHRfaW4sXHJcbiAgICAgICAgICAgICAgICAuaGxqcy1uYW1lLFxyXG4gICAgICAgICAgICAgICAgLmhsanMtdGFnIHtcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogIzAwZjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAuaGxqcy1zdHJpbmcsXHJcbiAgICAgICAgICAgICAgICAuaGxqcy10aXRsZSxcclxuICAgICAgICAgICAgICAgIC5obGpzLXNlY3Rpb24sXHJcbiAgICAgICAgICAgICAgICAuaGxqcy1hdHRyaWJ1dGUsXHJcbiAgICAgICAgICAgICAgICAuaGxqcy1saXRlcmFsLFxyXG4gICAgICAgICAgICAgICAgLmhsanMtdGVtcGxhdGUtdGFnLFxyXG4gICAgICAgICAgICAgICAgLmhsanMtdGVtcGxhdGUtdmFyaWFibGUsXHJcbiAgICAgICAgICAgICAgICAuaGxqcy10eXBlLFxyXG4gICAgICAgICAgICAgICAgLmhsanMtYWRkaXRpb24ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAjYTMxNTE1O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC5obGpzLWRlbGV0aW9uLFxyXG4gICAgICAgICAgICAgICAgLmhsanMtc2VsZWN0b3ItYXR0cixcclxuICAgICAgICAgICAgICAgIC5obGpzLXNlbGVjdG9yLXBzZXVkbyxcclxuICAgICAgICAgICAgICAgIC5obGpzLW1ldGEge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAjMmI5MWFmO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC5obGpzLWRvY3RhZyB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICM4MDgwODA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLmhsanMtYXR0ciB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICNmMDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLmhsanMtc3ltYm9sLFxyXG4gICAgICAgICAgICAgICAgLmhsanMtYnVsbGV0LFxyXG4gICAgICAgICAgICAgICAgLmhsanMtbGluayB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICMwMGIwZTg7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLmhsanMtZW1waGFzaXMge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbnQtc3R5bGU6IGl0YWxpYztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAuaGxqcy1zdHJvbmcge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC5saW5lbnVtYmVyIHtcclxuICAgICAgICAgICAgICAgICAgICBmbG9hdDogbGVmdDtcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXItcmlnaHQ6IDNweCBzb2xpZCAjNmNlMjZjO1xyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmctcmlnaHQ6IDdweDtcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW4tcmlnaHQ6IDdweDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAubGluZW51bWJlciBzcGFuIHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBibG9jaztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAubGluZW51bWJlciBzcGFuOjpiZWZvcmUge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGF0dHIoZGF0YS1saW5lbnVtYmVyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBib2R5IHAsIGJvZHkgYmxvY2txdW90ZSwgYm9keSB1bCwgYm9keSBvbCwgYm9keSBkbCwgYm9keSB0YWJsZSwgYm9keSBwcmV7bWFyZ2luLXRvcDogMDttYXJnaW4tYm90dG9tOiAxNnB4O31cclxuXHJcbiAgICAgICAgICAgICAgICAuYWxlcnQgeyBwYWRkaW5nOiAxNXB4OyBtYXJnaW4tYm90dG9tOiAyMHB4OyBib3JkZXI6IDFweCBzb2xpZCB0cmFuc3BhcmVudDsgYm9yZGVyLXJhZGl1czogNHB4OyB9XHJcbiAgICAgICAgICAgICAgICAuYWxlcnQgaDQgeyBtYXJnaW4tdG9wOiAwOyBjb2xvcjogaW5oZXJpdDsgfVxyXG4gICAgICAgICAgICAgICAgLmFsZXJ0IC5hbGVydC1saW5rIHsgZm9udC13ZWlnaHQ6IDcwMDsgfVxyXG4gICAgICAgICAgICAgICAgLmFsZXJ0PnAsIC5hbGVydD51bCB7IG1hcmdpbi1ib3R0b206IDA7IH1cclxuICAgICAgICAgICAgICAgIC5hbGVydD5wK3AgeyBtYXJnaW4tdG9wOiA1cHg7IH1cclxuICAgICAgICAgICAgICAgIC5hbGVydC1kaXNtaXNzYWJsZSwgLmFsZXJ0LWRpc21pc3NpYmxlIHsgcGFkZGluZy1yaWdodDogMzVweDsgfVxyXG4gICAgICAgICAgICAgICAgLmFsZXJ0LWRpc21pc3NhYmxlIC5jbG9zZSwgLmFsZXJ0LWRpc21pc3NpYmxlIC5jbG9zZSB7IHBvc2l0aW9uOiByZWxhdGl2ZTsgdG9wOiAtMnB4OyByaWdodDogLTIxcHg7IGNvbG9yOiBpbmhlcml0OyB9XHJcbiAgICAgICAgICAgICAgICAuYWxlcnQtc3VjY2VzcyB7IGNvbG9yOiAjM2M3NjNkOyBiYWNrZ3JvdW5kLWNvbG9yOiAjZGZmMGQ4OyBib3JkZXItY29sb3I6ICNkNmU5YzY7IH1cclxuICAgICAgICAgICAgICAgIC5hbGVydC1zdWNjZXNzIGhyIHsgYm9yZGVyLXRvcC1jb2xvcjogI2M5ZTJiMzsgfVxyXG4gICAgICAgICAgICAgICAgLmFsZXJ0LXN1Y2Nlc3MgLmFsZXJ0LWxpbmsgeyBjb2xvcjogIzJiNTQyYzsgfVxyXG4gICAgICAgICAgICAgICAgLmFsZXJ0LWluZm8geyBjb2xvcjogIzMxNzA4ZjsgYmFja2dyb3VuZC1jb2xvcjogI2Q5ZWRmNzsgYm9yZGVyLWNvbG9yOiAjYmNlOGYxOyB9XHJcbiAgICAgICAgICAgICAgICAuYWxlcnQtaW5mbyBociB7IGJvcmRlci10b3AtY29sb3I6ICNhNmUxZWM7IH1cclxuICAgICAgICAgICAgICAgIC5hbGVydC1pbmZvIC5hbGVydC1saW5rIHsgY29sb3I6ICMyNDUyNjk7IH1cclxuICAgICAgICAgICAgICAgIC5hbGVydC13YXJuaW5nIHsgY29sb3I6ICM4YTZkM2I7IGJhY2tncm91bmQtY29sb3I6ICNmY2Y4ZTM7IGJvcmRlci1jb2xvcjogI2ZhZWJjYzsgfVxyXG4gICAgICAgICAgICAgICAgLmFsZXJ0LXdhcm5pbmcgaHIgeyBib3JkZXItdG9wLWNvbG9yOiAjZjdlMWI1OyB9XHJcbiAgICAgICAgICAgICAgICAuYWxlcnQtd2FybmluZyAuYWxlcnQtbGluayB7IGNvbG9yOiAjNjY1MTJjOyB9XHJcbiAgICAgICAgICAgICAgICAuYWxlcnQtZGFuZ2VyIHsgY29sb3I6ICNhOTQ0NDI7IGJhY2tncm91bmQtY29sb3I6ICNmMmRlZGU7IGJvcmRlci1jb2xvcjogI2ViY2NkMTsgfVxyXG4gICAgICAgICAgICAgICAgLmFsZXJ0LWRhbmdlciBociB7IGJvcmRlci10b3AtY29sb3I6ICNlNGI5YzA7IH1cclxuICAgICAgICAgICAgICAgIC5hbGVydC1kYW5nZXIgLmFsZXJ0LWxpbmsgeyBjb2xvcjogIzg0MzUzNDsgfVxyXG4gICAgICAgICAgICAgICAgYmxvY2txdW90ZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbjogMTZweCAwO1xyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6IDVweCA4cHggNXB4IDMwcHg7XHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogbm9uZSByZXBlYXQgc2Nyb2xsIDAgMCByZ2JhKDEwMiwxMjgsMTUzLC4wNSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiBub25lO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAjMzMzO1xyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlci1sZWZ0OiAxMHB4IHNvbGlkICNkNmRiZGY7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGB9PC9zdHlsZT5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICk7XHJcbn1cclxuXHJcbi8vIOmmluWFiOaJp+ihjOOAgiDov5Tlm57ot6/lvoTku6Xkvb/nlKjmlbDnu4Tov5vooYzpooTmnoTlu7rjgIJcclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFN0YXRpY1BhdGhzKCkge1xyXG4gICAgLy8gemVpdOiOt+WPljMw5Liq55SxQVBJ566h55CG55qE5a2Y5YKo5bqTXHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCgnaHR0cHM6Ly9kZXNvbGF0ZS1lYXJ0aC04NjEwNC5oZXJva3VhcHAuY29tL2FwaS9saXN0cycpO1xyXG4gICAgY29uc3QgcmVwb3MgPSBhd2FpdCByZXMuanNvbigpO1xyXG4gICAgLy8g5a2Y5YKo5bqT5ZCN56ew55qE6Lev5b6EXHJcbiAgICBjb25zdCBwYXRocyA9IHJlcG9zLm1hcChyZXBvID0+IGAvYmxvZy8ke3JlcG8uX2lkfWApO1xyXG4gICAgY29uc29sZS5sb2coJ3BhdGhzJywgcGF0aHMpO1xyXG4gICAgcmV0dXJuIHsgcGF0aHMsIGZhbGxiYWNrOiBmYWxzZSB9O1xyXG59XHJcblxyXG4vLyDmjqXmlLbluKbmnInot6/nlLHkv6Hmga/nmoTlj4LmlbBcclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFN0YXRpY1Byb3BzKHsgcGFyYW1zIH0pIHtcclxuICAgIC8vIOWvueW6lOS6juaWh+S7tuWQjXplaXQvW25hbWVdLmpzXHJcblxyXG4gICAgbGV0IGlkID0gcGFyYW1zLnRpdGxlO1xyXG4gICAgY29uc29sZS5sb2coJ2lkJywgaWQpO1xyXG4gICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYGh0dHBzOi8vZGVzb2xhdGUtZWFydGgtODYxMDQuaGVyb2t1YXBwLmNvbS9hcGkvbGlzdHMvaWQvJHtpZH1gKTtcclxuICAgIGNvbnN0IGJsb2cgPSBhd2FpdCByZXMuanNvbigpO1xyXG4gICAgLy8gY29uc29sZS5sb2coJ2Jsb2cnLCBibG9nKTtcclxuXHJcbiAgICByZXR1cm4geyBwcm9wczogeyBibG9nIH0gfTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQmxvZztcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBkbGxfNTAzMGYzODdkMzI4ZTQ0MTU3ODU7Il0sInNvdXJjZVJvb3QiOiIifQ==