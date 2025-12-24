import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './Layout.css'

const Layout = ({username}) => {
    return (
        <div className="app-container">
            <Header username={username}/>

            <main className="content">
                {/* O Outlet renderizará o componente da página atual aqui */}
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};

export default Layout;