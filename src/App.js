import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import './App.css';
import Notebook from './components/Notebook';
import ExperienceTab from './components/ExperienceTab';
import BlogsTab, { BlogPostPage } from './components/BlogsTab';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }


function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header className="site-nav">
          <div className="site-brand">
            <p className="brand-title">Amogh Gulati</p>
            <p className="brand-subtitle">Engineer | Researcher</p>
          </div>
          <nav className="tab-nav" aria-label="Main tabs">
            <NavLink to="/" end className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}>
              Home
            </NavLink>
            <NavLink to="/experience" className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}>
              Experience
            </NavLink>
            <NavLink to="/blogs" className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}>
              Blogs
            </NavLink>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<Notebook />} />
          <Route path="/experience" element={<ExperienceTab />} />
          <Route path="/blogs" element={<BlogsTab />} />
          <Route path="/blogs/:slug" element={<BlogPostPage />} />
          <Route path="*" element={<Notebook />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
