"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Notes;
var _react = _interopRequireDefault(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _reactQuill = _interopRequireDefault(require("react-quill"));
var _redactPii = require("redact-pii");
var _leoProfanity = _interopRequireDefault(require("leo-profanity"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function Notes(_ref) {
  let {
    onChange,
    defaultValue,
    value,
    ...props
  } = _ref;
  const creditCardRegex = new RegExp(/^(?:4[0-9]{12}(?:[0-9]{3})?|(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})$/g);
  const isValidCard = value => {
    var sum = 0,
      alt = false,
      i = value.length - 1,
      num;
    while (i >= 0) {
      //get the next digit
      num = parseInt(value.charAt(i), 10);

      //if it's not a valid number, abort
      if (isNaN(num)) {
        return false;
      }

      //if it's an alternate number...
      if (alt) {
        num *= 2;
        if (num > 9) {
          num = num % 10 + 1;
        }
      }

      //flip the alternate bit
      alt = !alt;

      //add to the rest of the sum
      sum += num;

      //go to next digit
      i--;
    }

    //determine if it's valid
    return sum % 10 == 0;
  };
  const redactor = new _redactPii.SyncRedactor({
    customRedactors: {
      before: [{
        redact(textToRedact) {
          const matches = textToRedact.match(/\b(?:\d[ -]*?){13,16}\b/g);
          if (matches) {
            matches.forEach(m => {
              const cardNum = m.trim().replace(/\s/g, '').replace('-', '');
              if (creditCardRegex.test(cardNum) && isValidCard(cardNum)) {
                textToRedact = textToRedact.replace(m, '**** **** **** ****');
              }
            });
          }
          return textToRedact;
        }
      }]
    },
    builtInRedactors: {
      names: {
        enabled: false
      },
      emailAddress: {
        enabled: false
      },
      digits: {
        enabled: false
      },
      username: {
        enabled: false
      },
      ipAddress: {
        enabled: false
      },
      streetAddress: {
        enabled: false
      },
      zipcode: {
        enabled: false
      },
      phoneNumber: {
        enabled: false
      },
      creditCardNumber: {
        enabled: false,
        replaceWith: '**** **** **** ****'
      },
      usSocialSecurityNumber: {
        replaceWith: '***-**-****'
      },
      credentials: {
        replaceWith: '*******'
      }
    }
  });
  const handleChange = (value, delta, source, editor) => {
    let splitHtmlText = value?.replace(/>/g, '> ')?.replace(/</g, ' <') || '';
    const redactedText = redactor.redact(splitHtmlText);
    const convertedText = redactedText?.replace(/> /g, '>')?.replace(/ </g, '<') || '';
    onChange(convertedText, delta, source, editor);
  };
  const handleBlur = (value, source, editor) => {
    let splitHtmlText = value?.replace(/>/g, '> ')?.replace(/</g, ' <') || '';
    const filteredText = _leoProfanity.default.clean(splitHtmlText);
    onChange(filteredText, null, source, editor);
  };
  return /*#__PURE__*/_react.default.createElement(_reactQuill.default, _extends({
    value: value || defaultValue || '',
    onChange: handleChange,
    onBlur: (range, source, editor) => handleBlur(value, source, editor)
  }, props));
}

/**  Notes will accepts all the props of the ReactQuill */
Notes.propTypes = {
  /** handle on change */
  onChange: _propTypes.default.func
};
module.exports = exports.default;