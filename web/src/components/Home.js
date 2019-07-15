import React, { useState, useEffect, useContext, useCallback } from 'react';
import SmartContract from '../SmartContract';
import { Link, Redirect } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import Html from './common/Html';
import TagList from './common/TagList';

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
            <div>
                <input type="text" onChange={onSearch} />
            </div>
            <div className="row d-flex flex-wrap">
                {filteredPosts
                    .map(post => (
                        <article className="col-md-4" key={post.id}>
                            <div className="content">
                                <h2 className="title">{post.title}</h2>
                                <TagList tags={post.tags} />
                                <p className="excerpt">
                                    {post.excerpt}
                                </p>
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