import React from 'react';

const TagList = ({ tags }) => {
    return (
        <>
            {tags
                .split('|')
                .filter(tag => tag)
                .map((tag, index) => (
                    <span className="tag" key={index}>{tag}</span>
                ))}
        </>
    );
};

export default TagList;