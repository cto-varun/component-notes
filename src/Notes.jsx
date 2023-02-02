import React from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import { SyncRedactor } from 'redact-pii';
import filter from 'leo-profanity';

export default function Notes({ onChange, defaultValue, value, ...props }) {
    const creditCardRegex = new RegExp(
        /^(?:4[0-9]{12}(?:[0-9]{3})?|(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})$/g
    );

    const isValidCard = (value) => {
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
                    num = (num % 10) + 1;
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

    const redactor = new SyncRedactor({
        customRedactors: {
            before: [
                {
                    redact(textToRedact) {
                        const matches = textToRedact.match(
                            /\b(?:\d[ -]*?){13,16}\b/g
                        );
                        if (matches) {
                            matches.forEach((m) => {
                                const cardNum = m
                                    .trim()
                                    .replace(/\s/g, '')
                                    .replace('-', '');
                                if (
                                    creditCardRegex.test(cardNum) &&
                                    isValidCard(cardNum)
                                ) {
                                    textToRedact = textToRedact.replace(
                                        m,
                                        '**** **** **** ****'
                                    );
                                }
                            });
                        }
                        return textToRedact;
                    },
                },
            ],
        },
        builtInRedactors: {
            names: {
                enabled: false,
            },
            emailAddress: {
                enabled: false,
            },
            digits: {
                enabled: false,
            },
            username: {
                enabled: false,
            },
            ipAddress: {
                enabled: false,
            },
            streetAddress: {
                enabled: false,
            },
            zipcode: {
                enabled: false,
            },
            phoneNumber: {
                enabled: false,
            },
            creditCardNumber: {
                enabled: false,
                replaceWith: '**** **** **** ****',
            },
            usSocialSecurityNumber: {
                replaceWith: '***-**-****',
            },
            credentials: {
                replaceWith: '*******',
            },
        },
    });

    const handleChange = (value, delta, source, editor) => {
        let splitHtmlText =
            value?.replace(/>/g, '> ')?.replace(/</g, ' <') || '';
        const redactedText = redactor.redact(splitHtmlText);
        const convertedText =
            redactedText?.replace(/> /g, '>')?.replace(/ </g, '<') || '';
        onChange(convertedText, delta, source, editor);
    };

    const handleBlur = (value, source, editor) => {
        let splitHtmlText =
            value?.replace(/>/g, '> ')?.replace(/</g, ' <') || '';
        const filteredText = filter.clean(splitHtmlText);
        onChange(filteredText, null, source, editor);
    };

    return (
        <ReactQuill
            value={value || defaultValue || ''}
            onChange={handleChange}
            onBlur={(range, source, editor) =>
                handleBlur(value, source, editor)
            }
            {...props}
        />
    );
}

/**  Notes will accepts all the props of the ReactQuill */
Notes.propTypes = {
    /** handle on change */
    onChange: PropTypes.func,
};
