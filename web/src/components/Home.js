import React, { useState, useEffect, useContext, useCallback } from 'react';
import SmartContract from '../SmartContract';
import { Link, Redirect } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import TagList from './common/TagList';
import moment from 'moment';

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
            <div className="row d-flex flex-wrap">
                {filteredPosts
                    .map(post => (
                        <article className="col-md-4" key={post.id}>
                            <div className="content">
                                <h2 className="title">{post.title}</h2>
                                <p>
                                    {post.rating} points by <span title={post.owner}>{post.owner.slice(0, 6)}</span>
                                    {' '} - {moment.unix(post.created_at).fromNow()}
                                </p>
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