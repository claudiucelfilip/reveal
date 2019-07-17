import React, { useState, useEffect, useContext, useCallback } from 'react';
import SmartContract from '../SmartContract';
import { Link, Redirect } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import TagList from './common/TagList';
import { Meta } from './common/core';
import moment from 'moment';
import styled from 'styled-components';

const Article = styled.article`
    margin-bottom: 30px;
    .title {
        font-size: 24px;
        margin-bottom: 10px;
    }
`;
const Home = () => {
    const smartContract = useContext(SmartContract);
    const [posts, setPosts] = useState([]);
    const [term, setTerm] = useState();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const posts = await smartContract.getPosts();
                setPosts(posts);
            } catch (err) {
                smartContract.notify('danger', err.message);
            }
        };

        fetchData();
    }, [smartContract]);

    const onSearch = useCallback((event) => {
        setTerm(event.target.value.toLowerCase());
    }, []);

    if (!smartContract.privateKey) {
        return <Redirect to="/login" />
    }
    const filteredPosts = posts
        .filter(post => {
            return !term || [post.title, post.tags, post.excerpt, post.owner].join(' ').toLowerCase().includes(term);
        })
        .sort((a = 0, b = 0) => {
            return b.score - a.score;
        });
    return (
        <>
            <div className="row">
                <div className="pb-4 col-md-6">
                    <h5>Search</h5>
                    <input type="text" placeholder="Enter Tag, Title, Excerpt, Owner ID" className="form-control" onChange={onSearch} />
                </div>
            </div>
            <div className="row">
                {filteredPosts
                    .map(post => (
                        <Article className="col col-12 col-lg-10" key={post.id}>
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
            </div>
        </>
    );
};

export default observer(Home);