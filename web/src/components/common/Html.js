import React from 'react';
import DOMPurify from 'dompurify'

const ALLOWED_TAGS = [
    'iframe',
    'pre',
    'code',
    'p',
    'em',
    'h1','h2','h3','h4','h5',
    'a',
    'img',
    'embeded',
    'b'
];

const Html = ({ content }) => {
    return (
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content, {ALLOWED_TAGS}) }} />
    )
};

export default Html;