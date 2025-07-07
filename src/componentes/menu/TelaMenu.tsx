import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

interface UserData {
  id: number;
  nome: string;
  email: string;
  senha?: string;  // Adicionado
  cargo?: string;
  createdAt?: string;
}

const UserIcon: React.FC = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="white" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="user-icon-svg"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const TelaMenu: React.FC = () => {
  const location = useLocation();
  const [userName, setUserName] = useState<string>('usuário');
  const [loading, setLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
      if (location.state?.userName) {
        setUserName(location.state.userName);
        // Cria um objeto userData com os dados da location
        setUserData({
          id: location.state.userId,
          nome: location.state.userName,
          email: location.state.userEmail,
          senha: location.state.userPassword
        });
        setLoading(false);
      } else {
        fetchUserData();
      }
  }, [location]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get<UserData>('http://localhost:3000/autorizacoes/me2', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Dados recebidos:', response.data);
      setUserName(response.data.nome);
      setUserData(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      setUserName('usuário');
    } finally {
      setLoading(false);
    }
  };

  const toggleProfileModal = () => {
    setIsProfileModalOpen(!isProfileModalOpen);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não disponível';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="menu-container">
      <header className="menu-header">
        <div className="user-button-container">
          <button className="user-button" onClick={toggleProfileModal}>
            <UserIcon />
            <span>{loading ? 'Carregando...' : userName}</span>
          </button>
        </div>
      </header>

      {isProfileModalOpen && (
        <div className="profile-modal-overlay" onClick={closeProfileModal}>
          <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>OLÁ!</h2>
            
            {userData ? (
              <div className="user-info">
                <div className="info-row">
                  <span className="info-label">Nome: {userData.nome}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email: {userData.email}</span>
                </div>
                <div className="info-row">
                    <span className="info-label">Senha: {userData.senha}</span>
                </div>
              </div>
            ) : (
              <p>Carregando dados do usuário...</p>
            )}
            
            <button className="profile-modal-close-button" onClick={closeProfileModal}>
              Fechar
            </button>
          </div>
        </div>
      )}

      <main className="menu-main-content">
        <h2>OLÁ</h2>
        
        <div className="central-boxes">
          <div className="box">
            <h3>Servidores</h3>
            <div className="servidor-lista">
              <div className="servidor-item">
                <span>Servidor 1</span>
                <span className="local">Local</span>
              </div>
              <div className="servidor-item">
                <span>Servidor 2</span>
                <span className="local">Local</span>
              </div>
            </div>
            <button className="perfil-button">Ver Perfil</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TelaMenu;