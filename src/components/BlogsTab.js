import React from 'react';
import { Link, useParams } from 'react-router-dom';
import CrpsBlog from './blogs/CrpsBlog';
import NotFound from './NotFound';

export const BLOGS = [
    {
        slug: 'crps',
        title: 'CRPS: the Continuous Ranked Probability Score',
        summary: 'How probabilistic forecasts are scored on both calibration and sharpness.',
        Component: CrpsBlog,
    },
];

const BlogsTab = () => (
    <main className="page">
        <header className="page-header">
            <h1>Writing</h1>
            <p className="lede">Notes I write to understand things properly.</p>
        </header>

        <ul className="post-list">
            {BLOGS.map((blog) => (
                <li key={blog.slug}>
                    <Link to={`/blog/${blog.slug}`} className="post-link">
                        <span className="post-title">{blog.title}</span>
                        <span className="meta">{blog.summary}</span>
                    </Link>
                </li>
            ))}
        </ul>
    </main>
);

export const BlogPostPage = () => {
    const { slug } = useParams();
    const blog = BLOGS.find((b) => b.slug === slug);
    if (!blog) return <NotFound />;

    const Post = blog.Component;
    return (
        <main className="page">
            <Link to="/blog" className="more back">← All writing</Link>
            <Post />
        </main>
    );
};

export default BlogsTab;
