import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import SmartContract from '../SmartContract';
import { Link, Redirect } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import TagList from './common/TagList';
import { Meta } from './common/core';
import moment from 'moment';
import styled from 'styled-components';
import Shuffle from 'shufflejs';

const Article = styled.article`
    margin-bottom: 30px;
    .title {
        font-size: 24px;
        margin-bottom: 10px;
    }
    .grid-sizer {
        display: none;
    }
`;
const Wrapper = styled.div`
    
`;
const ArticleList = styled.div`
    ${Article} {
        opacity: 0 !important;
    }
    &.initialized {
        ${Article} {
            opacity: 1 !important;
        }   
    }
`;
const getArticleClass = (post) => {
    let sizeCount = 1;
    if (post.title.length > 70) {
        sizeCount += 1;
    }
    if (post.excerpt.length > 140) {
        sizeCount += 1;
    }
    return `col-md-${sizeCount * 2 + 2}`;
}
const Home = () => {
    const smartContract = useContext(SmartContract);
    const [posts, setPosts] = useState([]);
    const listRef = useRef();
    const suffleRef = useRef();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const posts = await smartContract.getPosts();
                setPosts(posts);
                suffleRef.current = new Shuffle(listRef.current, {
                    itemSelector: '.article-item',
                    sizer: '.grid-sizer',
                    buffer: 1,
                });

                suffleRef.current.on(Shuffle.EventType.LAYOUT, function () {
                    listRef.current.classList.add('initialized');
                  });
                
                suffleRef.current.sort({
                    reverse: true,
                    by: (element) => {
                        return parseInt(element.getAttribute('data-score'));
                    }
                });

            } catch (err) {
                smartContract.notify('danger', err.message);
            }
        };

        fetchData();

        return () => {
            if (suffleRef.current) {
                suffleRef.current.destroy();
            }
        }
    }, [smartContract]);

    const onSearch = useCallback((event) => {
        const term = event.target.value.toLowerCase();

        suffleRef.current.filter(function (element) {
            return !term || element.innerText.toLowerCase().includes(term);
        });
    }, []);

    if (!smartContract.privateKey) {
        return <Redirect to="/login" />
    }
   
    return (
        <Wrapper>
            <div className="row">
                <div className="pb-4 col-md-6">
                    <h5>Search</h5>
                    <input type="text" placeholder="Enter Tag, Title, Excerpt, Owner ID" className="form-control js-shuffle-search" onChange={onSearch} />
                </div>
            </div>
            <ArticleList className="row" ref={listRef}>

                {posts
                    .map(post => (
                        <Article className={'article-item col-sm-12 ' + getArticleClass(post)} key={post.id} data-score={post.score}>
                            <Link to={'/post/' + post.id}>
                                <h2 className="title">{post.title}</h2>
                            </Link>
                            <Meta>
                                {post.rating} points by <span title={post.owner}>{post.owner.slice(0, 6)}</span>
                                {' '} - {moment.unix(post.created_at).fromNow()}
                            </Meta>

                            <p className="excerpt">
                                {post.excerpt}
                            </p>
                            <TagList tags={post.tags} />
                            <p>
                                <Link className="underlined" to={'/post/' + post.id}>Read More</Link>
                            </p>
                        </Article>
                    ))}
                <div className="col-1 hidden grid-sizer" />
            </ArticleList>
        </Wrapper>
    );
};

export default observer(Home);