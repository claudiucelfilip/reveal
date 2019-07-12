import React, { useCallback, useState, useEffect, useRef } from 'react';
import SmartContract from '../SmartContract';
import Quill from 'quill';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
const smartContract = SmartContract.getInstance();

const Create = ({ history }) => {
    const [loading, setLoading] = useState(false);
    const publicTextRef = useRef();
    const privateTextRef = useRef();

    const quillPublicTextRef = useRef();
    const quillPrivateTextRef = useRef();
    const onSubmit = useCallback(async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = {};
        formData.forEach((value, key) => {
            switch (key) {
                case 'price':
                    data[key] = parseInt(value);
                    break;
                default:
                    data[key] = value
            }
        });

        data.publicText = quillPublicTextRef.current.root.innerHTML;
        data.privateText = quillPrivateTextRef.current.root.innerHTML;

        setLoading(true);
        try {
            await smartContract.createPost(data);
            history.push('/');
        } catch (err) {
            console.err(err);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const toolbarOptions = [
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            ['blockquote', 'code-block'],

            [{ 'header': 1 }, { 'header': 2 }],               // custom button values
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
            [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
            [{ 'direction': 'rtl' }],                         // text direction

            [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
            [{ 'font': [] }],
            [{ 'align': [] }],

            ['clean'],                                         // remove formatting button
            ['link', 'image', 'video'],
        ];

        quillPublicTextRef.current = new Quill(publicTextRef.current, {
            modules: {
                toolbar: toolbarOptions
            },
            placeholder: 'Compose an epic...',
            theme: 'snow'  // or 'bubble'
        });

        quillPrivateTextRef.current = new Quill(privateTextRef.current, {
            modules: {
                toolbar: toolbarOptions
            },
            placeholder: 'Compose an epic...',
            theme: 'snow'  // or 'bubble'
        });
    }, []);
    if (loading) {
        return <h3>loading...</h3>;
    }
    return (
        <>
            <h1>Create</h1>
            <form onSubmit={onSubmit}>
                <div>
                    <label>Title</label>
                    <input type="text" name="title" />
                </div>
                <div>
                    <label>Public Text</label>

                    {/* <textarea  name="publicText" /> */}
                    <div id="publicText" ref={publicTextRef} />
                </div>
                <div>
                    <label>Private Text</label>
                    {/* <textarea name="privateText" /> */}
                    <div id="privateText" ref={privateTextRef} />
                </div>
                <div>
                    <label>Price</label>
                    <input type="text" name="price" defaultValue={200} />
                </div>
                <div>
                    <button type="submit">Create</button>
                </div>
            </form>
        </>
    );
};

export default Create;