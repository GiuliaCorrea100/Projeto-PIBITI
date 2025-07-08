import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './telaMenu.css';

// URL para uma imagem de perfil padrão
const DEFAULT_AVATAR = 'https://camo.githubusercontent.com/b617b075456f03a893a7726a2636279e8557b3ac1c0f48f4b8a6e87a55e2e8e3/68747470733a2f2f63646e2d69636f6e732d706e672e666c617469636f6e2e636f6d2f3531322f363539362f363539363435362e706e67';

interface UserData {
  id: number;
  nome: string;
  email: string;
  senha?: string;
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
  const [originalData, setOriginalData] = useState<UserData | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(DEFAULT_AVATAR);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Função para lidar com erro de carregamento da imagem
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = DEFAULT_AVATAR;
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userData?.id) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`http://localhost:3000/usuarios/${userData.id}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        // Atualiza a imagem no estado para refletir na UI imediatamente
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      const response = await axios.get<UserData>('http://localhost:3000/autorizacoes/me2', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setUserName(response.data.nome);
      setUserData(response.data);
      setOriginalData({ ...response.data });
      // Define a URL da foto de perfil com timestamp para evitar cache
      setProfileImage(`http://localhost:3000/usuarios/${response.data.id}/foto?${new Date().getTime()}`);

    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      setUserName('usuário');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.userId) {
      const user = {
        id: location.state.userId,
        nome: location.state.userName,
        email: location.state.userEmail,
        senha: location.state.userPassword,
      };
      setUserName(user.nome);
      setUserData(user);
      setOriginalData({ ...user });
      // Define a URL da foto de perfil
      setProfileImage(`http://localhost:3000/usuarios/${user.id}/foto?${new Date().getTime()}`);
      setLoading(false);
    } else {
      fetchUserData();
    }
  }, [location.state]);

  const toggleProfileModal = () => {
    setIsProfileModalOpen(!isProfileModalOpen);
    if (!isProfileModalOpen && userData) {
      setOriginalData({...userData});
      // Atualiza a foto ao abrir o modal
      setProfileImage(`http://localhost:3000/usuarios/${userData.id}/foto?${new Date().getTime()}`);
    }
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    if (originalData) {
      setUserData({...originalData});
    }
  };

  const handleSave = async () => {
      if (!userData?.id || !originalData) return;
      
      const updateData: any = {};
      
      if (userData.nome && userData.nome !== originalData.nome) {
        updateData.nome = userData.nome;
      }
      
      if (userData.email && userData.email !== originalData.email) {
        updateData.email = userData.email;
      }
      
      if (userData.senha && userData.senha.trim() !== '') {
        updateData.senha = userData.senha;
      }

      if (Object.keys(updateData).length === 0) {
        setAlertMessage('Nenhuma alteração foi feita');
        setTimeout(() => setAlertMessage(null), 1500);
        return;
      }

      try {
        const response = await axios.put(
          `http://localhost:3000/usuarios/${userData.id}`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (response.status === 200) {
          if (updateData.nome) {
              setUserName(updateData.nome);
          }
          setAlertMessage('Alterações salvas com sucesso!');
          setOriginalData({ ...userData, senha: '' });
          setUserData(prev => prev ? {...prev, senha: ''} : null);

          setTimeout(() => {
            setAlertMessage(null);
            closeProfileModal();
          }, 1500);
        }
      } catch (error: any) {
        console.error('Erro ao salvar alterações:', error.response || error.message);
        setAlertMessage(`Erro ao salvar: ${error.response?.data?.message || error.message}`);
      }
  };

  return (
    <div className="menu-container">
      <header className="menu-header">
        <div className="user-button-container">
          <button className="user-button" onClick={toggleProfileModal}>
            <img 
              src={profileImage} 
              alt="Perfil" 
              className="header-profile-avatar"
              onError={handleImageError}
            />
            <span>{loading ? 'Carregando...' : userName}</span>
          </button>
        </div>
      </header>

      {isProfileModalOpen && (
        <div className="profile-modal-overlay" onClick={closeProfileModal}>
          <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="profile-header">
              <div className="profile-avatar-wrapper">
                <label htmlFor="avatar-upload" className="avatar-label">
                  <img
                    src={profileImage}
                    alt="Foto de perfil"
                    className="profile-avatar"
                    onError={handleImageError}
                  />
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <span className="avatar-edit-icon">📸</span>
                </label>
              </div>

              <div className="profile-details">
                <h2>{userData?.nome}</h2>
                <p>{userData?.email}</p>
              </div>
            </div>

            <div className="profile-fields">
              <div className="field-group">
                <label>Nome</label>
                <input 
                  type="text" 
                  value={userData?.nome || ''} 
                  onChange={(e) =>
                    setUserData((prev) => prev ? { ...prev, nome: e.target.value } : null)
                  }
                />
              </div>
              <div className="field-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={userData?.email || ''} 
                  onChange={(e) =>
                    setUserData((prev) => prev ? { ...prev, email: e.target.value } : null)
                  }
                />
              </div>
              <div className="field-group">
                <label>Senha</label>
                <input 
                  type="password" 
                  placeholder="Nova senha" 
                  value={userData?.senha || ''} 
                  onChange={(e) =>
                    setUserData((prev) => prev ? { ...prev, senha: e.target.value } : null)
                  }
                />
              </div>
            </div>

            <div className="profile-actions">
              <div className="right-buttons">
                <button className="cancel-button" onClick={closeProfileModal}>Cancelar</button>
                <button className="save-button" onClick={handleSave}>Salvar</button>
              </div>
            </div>
          </div>
          {alertMessage && (
            <div className="custom-alert-overlay">
              <div className="custom-alert-box">
                <p>{alertMessage}</p>
                <button onClick={() => setAlertMessage(null)}>OK</button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default TelaMenu;