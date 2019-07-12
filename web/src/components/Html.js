import React from 'react';
import DOMPurify from 'dompurify'


const Html = ({ content }) => {
    return (
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content, {ALLOWED_TAGS: ['iframe']}) }} />
    )
};

export default Html;