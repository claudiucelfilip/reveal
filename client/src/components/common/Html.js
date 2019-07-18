import React, { useEffect } from 'react';
// import createDOMPurify from 'dompurify';
// import { JSDOM } from 'jsdom';

// const window = (new JSDOM('')).window;
// const DOMPurify = createDOMPurify(window);

// const ALLOWED_TAGS = [
//     'iframe',
//     'pre',
//     'code',
//     'p',
//     'em',
//     'h1','h2','h3','h4','h5',
//     'a',
//     'img',
//     'embeded',
//     'b'
// ];

const Html = ({ content = '' }) => {
    return (
        <div dangerouslySetInnerHTML={{__html: content}} />
    )
};

export default Html;