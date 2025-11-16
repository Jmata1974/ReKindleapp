import Layout from "./Layout.jsx";

import Home from "./Home";

import Orbit from "./Orbit";

import Notes from "./Notes";

import Reminders from "./Reminders";

import Insights from "./Insights";

import Profile from "./Profile";

import Gamification from "./Gamification";

import ImportContacts from "./ImportContacts";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Orbit: Orbit,
    
    Notes: Notes,
    
    Reminders: Reminders,
    
    Insights: Insights,
    
    Profile: Profile,
    
    Gamification: Gamification,
    
    ImportContacts: ImportContacts,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Orbit" element={<Orbit />} />
                
                <Route path="/Notes" element={<Notes />} />
                
                <Route path="/Reminders" element={<Reminders />} />
                
                <Route path="/Insights" element={<Insights />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Gamification" element={<Gamification />} />
                
                <Route path="/ImportContacts" element={<ImportContacts />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}