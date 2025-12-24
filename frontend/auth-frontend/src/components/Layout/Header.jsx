import React from 'react';
import {  NavLink, useNavigate } from 'react-router-dom';

const Header = ({username}) => {
    const navigate = useNavigate();
    const userName = username ? username : "Usuário RegulaSense";
    const userSpecialtyIcon = "fa-solid fa-user-circle";

    const handleLogoutClick = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    };

    return (
        <>
            <header>
                <div className="header-left">
                    <img src="./RegulaSense.png" alt="RegulaSense Logo" height="35" style={{ marginRight: '15px' }} />
                </div>
                <div className="header-right">
                    <span className="user-info">
                        <i className={userSpecialtyIcon}></i> Bem-vindo(a), <strong>{userName}</strong>!
                    </span>
                    <button className="logout-button" onClick={handleLogoutClick}>Sair</button>
                </div>
            </header>
            
            <nav>
                <ul>
                    <li><NavLink to="/home"><i className="fa-solid fa-house"></i> Início</NavLink></li>
                    <li><NavLink to="/regulaflow"><i className="fas fa-redo-alt"></i> RegulaFlow</NavLink></li>
                    <li><NavLink to="/solicitacoes"><i className="fas fa-magic"></i> FillSense</NavLink></li>
                    <li><NavLink to="/relatorios"><i className="fa-solid fa-heart-pulse"></i> Relatórios</NavLink></li>
                </ul>
            </nav>
        </>
    );
};

export default Header;