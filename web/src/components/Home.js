import React, { useState, useEffect, useContext, useCallback } from 'react';
import SmartContract from '../SmartContract';
import { Link, Redirect } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import Html from './Html';

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
                console.error(err);
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
    const filteredPosts = posts.filter(post => {
        return !term || [post.title, post.tags, post.excerpt].join(' ').toLowerCase().includes(term);
    });
    return (
        <>
            <h1>Home</h1>
            <div>
                <input type="text" onChange={onSearch} />
            </div>
            <div className="row d-flex flex-wrap">
                {filteredPosts
                    .map(post => (
                        <article className="col-md-4" key={post.id}>
                            <div className="content">
                                <h2>{post.title}</h2>
                                <div>{post.tags.split().map(tag => (
                                    <span>{tag}</span>
                                ))}</div>
                                <Html content={post.excerpt} />
                                <p>
                                    <Link className="btn btn-secondary" to={'/post/' + post.id}>Read More</Link>
                                </p>

                            </div>
                        </article>
                    ))}
            </div>
        </>
    );
};

export default observer(Home);