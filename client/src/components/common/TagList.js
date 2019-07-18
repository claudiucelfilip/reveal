import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    margin-bottom: 10px;
`;
const Tag = styled.span`
    border-radius: 5px;
    background: #e3e3e3;
    border: solid 1px #afafaf;
    padding: 1px 8px;
    display: inline-block;
    font-size: 14px;
    margin: 0 10px 10px 0;

    &.clickable {
        cursor: pointer;
    }
`;

const TagList = ({ tags, onTagClick }) => {
    const onClickHandler = tag => () => {
        if (onTagClick) {
            onTagClick(tag);
        }
    };
    return (
        <Wrapper>
            {tags
                .split('|')
                .filter(tag => tag)
                .map((tag, index) => (
                    <Tag key={index} className={onTagClick ? 'clickable' : ''} onClick={onClickHandler(tag)}>{tag}</Tag>
                ))}
        </Wrapper>
    );
};

export default TagList;