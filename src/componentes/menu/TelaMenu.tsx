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
  instituicaoAtual?: number;
  aceitaPerto?: boolean;
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

  // Estados para o modal de informações
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [cargo, setCargo] = useState('');
  const [instituicaoAtual, setInstituicaoAtual] = useState<number | ''>('');
  const [aceitaPerto, setAceitaPerto] = useState(false);

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
      
      const response = await axios.get<UserData>('http://localhost:3000/autorizacoes/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setUserName(response.data.nome);
      setUserData(response.data);
      setOriginalData({ ...response.data });
      
      const fotoResponse = await axios.get(`http://localhost:3000/usuarios/${response.data.id}/foto`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob' // Isso é importante para imagens
      });
      
      if (fotoResponse.data.size > 0) {
        const imageUrl = URL.createObjectURL(fotoResponse.data);
        setProfileImage(imageUrl);
      } else {
        setProfileImage(DEFAULT_AVATAR);
      }

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
      setProfileImage(`http://localhost:3000/usuarios/${userData.id}/foto?${new Date().getTime()}`);
    }
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    if (originalData) {
      setUserData({...originalData});
    }
  };

  const handleSaveProfile = async () => {
    if (!userData?.id || !originalData) return;
    
    const updateData: Partial<UserData> = {};
    
    // Verifica e inclui nome se foi alterado
    if (userData.nome !== originalData.nome) {
      updateData.nome = userData.nome;
    }
    
    // Verifica e inclui email se foi alterado
    if (userData.email !== originalData.email) {
      updateData.email = userData.email;
    }
    
    // Verifica e inclui senha se foi preenchida
    if (userData.senha && userData.senha.trim() !== '') {
      if (userData.senha.length < 8) {
        setAlertMessage('A senha deve conter pelo menos 8 caracteres');
        setTimeout(() => setAlertMessage(null), 1500);
        return;
      }
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
        // Atualiza os dados do usuário
        const updatedUser = await axios.get<UserData>(`http://localhost:3000/autorizacoes/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        
        // Atualiza TODOS os estados relevantes
        setUserName(updatedUser.data.nome);
        setUserData(updatedUser.data);
        setOriginalData(updatedUser.data);
        
        // Atualiza a imagem do perfil para forçar recarregamento
        setProfileImage(`http://localhost:3000/usuarios/${updatedUser.data.id}/foto?${new Date().getTime()}`);
        
        setAlertMessage('Alterações salvas com sucesso!');
        
        setTimeout(() => {
          setAlertMessage(null);
          closeProfileModal();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Erro ao salvar alterações:', error);
      let errorMessage = 'Erro ao salvar alterações';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes('500')) {
        errorMessage = 'O email já está em uso por outro usuário';
      }
      
      setAlertMessage(errorMessage);
    }
  };

  const handleSaveInfo = async () => {
    if (!userData?.id) return;

    try {
      const response = await axios.put(
        `http://localhost:3000/usuarios/${userData.id}`,
        {
          cargo,
          instituicaoAtual: instituicaoAtual === '' ? null : Number(instituicaoAtual),
          aceitaPerto: Boolean(aceitaPerto)
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.status === 200) {
        const updatedUser = await axios.get<UserData>(`http://localhost:3000/autorizacoes/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        setUserName(updatedUser.data.nome);
        setUserData(updatedUser.data);
        setOriginalData({ ...updatedUser.data });

        setAlertMessage('Informações salvas com sucesso!');
        setUserData(prev => prev ? {...prev, cargo, instituicaoAtual: Number(instituicaoAtual), aceitaPerto } : null);
        setTimeout(() => {
          setAlertMessage(null);
          closeInfoModal();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Erro ao salvar informações:', error.response || error.message);
      setAlertMessage(`Erro ao salvar: ${error.response?.data?.message || error.message}`);
    }
    await fetchUserData();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const openInfoModal = () => {
    if (userData) {
      setCargo(userData.cargo || '');
      setInstituicaoAtual(userData.instituicaoAtual || '');
      setAceitaPerto(userData.aceitaPerto || false);
    }
    setIsInfoModalOpen(true);
  };

  const closeInfoModal = () => {
    setIsInfoModalOpen(false);
  };

  return (
    <div className="menu-container">
      <header className="menu-header">
        <div className='left-header'>
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
        <div className='right-header'>
          <button className="user-button">
            MENSAGENS
          </button>
          <button className="user-button" onClick={openInfoModal}>
            INFORMAÇÕES
          </button>
          <button className='user-button' onClick={handleLogout}>
            SAIR
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
                  onChange={(e) => {
                      if (userData) {
                        setUserData({ ...userData, email: e.target.value });
                      }
                    }
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
                <button className="save-button" onClick={handleSaveProfile}>Salvar</button>
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

      {isInfoModalOpen && (
        <div className="profile-modal-overlay" onClick={closeInfoModal}>
          <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="profile-fields">
              <h2>Informações do Servidor</h2>

              <div className="field-group">
                <label>Cargo</label>
                <input 
                  type="text" 
                  value={cargo} 
                  onChange={(e) => setCargo(e.target.value)} 
                />
              </div>

              <div className="field-group">
                <label>Instituição Atual</label>
                <input 
                  type="text" 
                  value={instituicaoAtual} 
                  onChange={(e) => setInstituicaoAtual(e.target.value === '' ? '' : Number(e.target.value))} 
                />
              </div>

              <div className="field-group checkbox-group">
                <label className='checkbox-label'>
                  <input 
                    type="checkbox" 
                    checked={aceitaPerto} 
                    onChange={(e) => setAceitaPerto(e.target.checked)} 
                  />
                  <span className="checkbox-text">Aceita instituições perto?</span>
                </label>
              </div>

              <div className="profile-actions">
                <div className="right-buttons">
                  <button className="cancel-button" onClick={closeInfoModal}>Fechar</button>
                  <button className="save-button" onClick={handleSaveInfo}>Salvar</button>
                </div>
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