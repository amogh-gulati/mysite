import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import CrpsBlog from './blogs/CrpsBlog';

const BLOGS = [
    {
        slug: 'crps',
        title: 'CRPS - Continuous Ranked Probability Score',
        summary: 'How probabilistic forecasting quality is measured via calibration and sharpness.',
        Component: CrpsBlog,
    },
];

const BlogsTab = () => {

    return (
        <main className="tab-page blogs-page">
            <section className="page-hero">
                <h1>Blogs</h1>
                <p>writing practice</p>
            </section>

            <section className="blog-grid">
                {BLOGS.map((blog) => (
                    <Link
                        key={blog.slug}
                        className="blog-card blog-card-button"
                        to={`/blogs/${blog.slug}`}
                    >
                        <p className="blog-status">Published</p>
                        <h2>{blog.title}</h2>
                        <p>{blog.summary}</p>
                    </Link>
                ))}
            </section>
        </main>
    );
};

export const BlogPostPage = () => {
    const { slug } = useParams();

    const activeBlog = useMemo(
        () => BLOGS.find((blog) => blog.slug === slug) || null,
        [slug]
    );

    if (!activeBlog) {
        return (
            <main className="tab-page blogs-page">
                <section className="page-hero">
                    <h1>Blog not found</h1>
                    <p>The blog you are looking for does not exist.</p>
                    <Link to="/blogs" className="back-link-btn">Back to blogs</Link>
                </section>
            </main>
        );
    }

    const ActiveComponent = activeBlog.Component;

    return (
        <main className="tab-page blogs-page">
            <section className="blog-view-header">
                <Link to="/blogs" className="back-link-btn">Back to blogs</Link>
            </section>
            <ActiveComponent />
        </main>
    );
};

export default BlogsTab;
