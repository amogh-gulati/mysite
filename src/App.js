import { useEffect } from 'react';
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import ExperiencePage from './components/ExperiencePage';
import ResearchPage from './components/ResearchPage';
import BlogsTab, { BlogPostPage } from './components/BlogsTab';
import NotFound from './components/NotFound';
import { SmartLink } from './components/Rich';
import { LINKS, PROFILE } from './data/profile';

const NAV = [
    { to: '/', label: 'About', end: true },
    { to: '/experience', label: 'Experience' },
    { to: '/research', label: 'Research' },
    { to: '/blog', label: 'Writing' },
];

const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

const LegacyBlogRedirect = () => {
    const { slug } = useParams();
    return <Navigate to={`/blog/${slug}`} replace />;
};

function App() {
    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <div className="app">
                <header className="site-header">
                    <Link to="/" className="brand">{PROFILE.name}</Link>
                    <nav aria-label="Main">
                        {NAV.map((item) => (
                            <NavLink key={item.to} to={item.to} end={item.end} className="nav-link">
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </header>

                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/experience" element={<ExperiencePage />} />
                    <Route path="/research" element={<ResearchPage />} />
                    <Route path="/blog" element={<BlogsTab />} />
                    <Route path="/blog/:slug" element={<BlogPostPage />} />
                    <Route path="/blogs" element={<Navigate to="/blog" replace />} />
                    <Route path="/blogs/:slug" element={<LegacyBlogRedirect />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>

                <footer className="site-footer">
                    <ul className="link-row">
                        {LINKS.map((link) => (
                            <li key={link.label}><SmartLink href={link.href}>{link.label}</SmartLink></li>
                        ))}
                    </ul>
                    <span className="meta">{PROFILE.email} · {PROFILE.location}</span>
                </footer>
            </div>
        </BrowserRouter>
    );
}

export default App;
