import React from 'react';
import { Link } from 'react-router-dom';

// Static files (e.g. /cv.pdf) must bypass the router, like external links.
export const isExternal = (href) => /^(https?:|mailto:)/.test(href) || /\.pdf$/.test(href);

export const SmartLink = ({ href, children, ...rest }) => {
    if (isExternal(href)) {
        const newTab = !href.startsWith('mailto:');
        return (
            <a href={href} {...(newTab ? { target: '_blank', rel: 'noreferrer' } : {})} {...rest}>
                {children}
            </a>
        );
    }
    return <Link to={href} {...rest}>{children}</Link>;
};

// Renders an array of strings, { text, href } links and { strong } emphasis.
const Rich = ({ parts }) => (
    <>
        {parts.map((part, i) => {
            if (typeof part === 'string') return <React.Fragment key={i}>{part}</React.Fragment>;
            if (part.strong) return <strong key={i}>{part.strong}</strong>;
            return <SmartLink key={i} href={part.href}>{part.text}</SmartLink>;
        })}
    </>
);

// "Varadhan, P. S., *Gulati, A.*, ..." -> emphasizes the starred name.
export const Authors = ({ authors }) => (
    <>
        {authors.split('*').map((chunk, i) => (i % 2 ? <strong key={i}>{chunk}</strong> : chunk))}
    </>
);

export default Rich;
