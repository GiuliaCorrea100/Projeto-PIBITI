import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './telaMenu.css';
import { Autocomplete, TextField } from "@mui/material";
import '@mui/material/styles';
import defaultAvatarImg from './img/defaultAvatar.jpg';
import ListaUsuarios from '../menu/elementos/ListaUsuarios.tsx';


const DEFAULT_AVATAR = defaultAvatarImg;

interface InstituicaoDestinoData {
  id: number;
  usuarioId: number;
  instituicaoId: number | null;
}

interface UserData {
  id: number;
  nome: string;
  email: string;
  senha?: string;
  cargo?: string;
  instituicaoId?: number;
  aceitaPerto?: boolean;
  createdAt?: string;
  instituicaoDestino?: InstituicaoDestinoData[];
}

interface Instituicao {
  id: number;
  nome: string;
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
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [cargo, setCargo] = useState('');
  const [instituicaoId, setinstituicaoId] = useState<number | ''>('');
  const [aceitaPerto, setAceitaPerto] = useState(false);
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [dadosModalProntos, setDadosModalProntos] = useState<Instituicao[] | null>(null);
  
  const [instituicaoDestino, setInstituicaoDestino] = useState<(number | null)[]>([null]);

  const handleInstituicaoDestinoChange = (index: number, newValue: Instituicao | null) => {
    const novas = [...instituicaoDestino];
    novas[index] = newValue ? newValue.id : null;
    setInstituicaoDestino(novas);
  };

  const addInstituicaoDestino = () => {
    setInstituicaoDestino([...instituicaoDestino, null]);
  };

  const removeInstituicaoDestino = (index: number) => {
    if (instituicaoDestino.length > 1) {
      const novas = instituicaoDestino.filter((_, i) => i !== index);
      setInstituicaoDestino(novas);
    }
  };

  const navigate = useNavigate();

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

      try {
        const fotoResponse = await axios.get(`http://localhost:3000/usuarios/${response.data.id}/foto`, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        });
        
        if (fotoResponse.data.size > 0) {
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
          }
          const newImageUrl = URL.createObjectURL(fotoResponse.data);
          setProfileImage(newImageUrl);
          setObjectUrl(newImageUrl);
        } else {
          setProfileImage(DEFAULT_AVATAR);
        }
      } catch (fotoError) {
        console.warn('Foto do usuário não encontrada, usando avatar padrão.');
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
    fetchUserData();
  }, []); 
  
  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  const toggleProfileModal = () => {
    setIsProfileModalOpen(!isProfileModalOpen);

    if (!isProfileModalOpen) {
      fetchUserData(); 
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
    
    if (userData.nome !== originalData.nome) {
      updateData.nome = userData.nome;
    }
    
    if (userData.email !== originalData.email) {
      updateData.email = userData.email;
    }
    
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
        const updatedUser = await axios.get<UserData>(`http://localhost:3000/autorizacoes/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        
        setUserName(updatedUser.data.nome);
        setUserData(updatedUser.data);
        setOriginalData(updatedUser.data);
        
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

    const destinosValidos = instituicaoDestino.filter(id => id !== null);

    const dataToSave = {
      cargo,
      instituicaoId: instituicaoId === '' ? null : Number(instituicaoId),
      aceitaPerto,
      instituicaoDestino: destinosValidos 
    };

    try {
      const response = await axios.put(
        `http://localhost:3000/usuarios/${userData.id}`,
        dataToSave,
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
        setTimeout(() => {
          setAlertMessage(null);
          closeInfoModal();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Erro ao salvar informações:', error.response || error.message);
      setAlertMessage(`Erro ao salvar: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const openInfoModal = async () => {
    if (!userData) {
      console.error("Dados do usuário não carregados.");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get('http://localhost:3000/instituicoes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDadosModalProntos(response.data);
    } catch (error) {
      console.error('Erro ao buscar instituições:', error);
    }
  };

  useEffect(() => {
    if (dadosModalProntos && userData) {
      setInstituicoes(dadosModalProntos);
      setCargo(userData.cargo || '');
      setinstituicaoId(userData.instituicaoId || '');
      setAceitaPerto(userData.aceitaPerto || false);

      const destinosSalvosDoBackend = userData.instituicaoDestino;

      if (destinosSalvosDoBackend && destinosSalvosDoBackend.length > 0) {
        const idsDeDestino = destinosSalvosDoBackend.map(d => d.instituicaoId);
        setInstituicaoDestino(idsDeDestino);
      } else {
        setInstituicaoDestino([null]);
      }
      
      setIsInfoModalOpen(true);
      
      setDadosModalProntos(null);
    }
  }, [dadosModalProntos, userData]);

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
          <button className="user-button" onClick={() => navigate('/NotificacoesPage')}>
            NOTIFICAÇÕES
          </button>
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
                <Autocomplete
                  getOptionKey={(option) => option.id}
                  size='small'
                  options={instituicoes}
                  getOptionLabel={(option) => option.nome}
                  value={instituicoes.find(inst => inst.id === instituicaoId) || null}
                  onChange={(event, newValue) => {
                    setinstituicaoId(newValue?.id || '');
                  }}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      placeholder="Digite para buscar..."
                      fullWidth
                      size="small"
                    />
                  )}
                  noOptionsText="Nenhuma instituição encontrada"
                />
              </div>

              <div className="field-group">
                <label>Instituição Destino</label>
                {instituicaoDestino.map((instId, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <Autocomplete
                      getOptionKey={(option) => option.id}
                      size='small'
                      options={instituicoes}
                      getOptionLabel={(option) => option.nome}
                      value={instituicoes.find(i => i.id === instId) || null}
                      onChange={(event, newValue) => {
                        handleInstituicaoDestinoChange(index, newValue);
                      }}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          placeholder={`Instituição ${index + 1}`}
                          fullWidth
                          size="small"
                        />
                      )}
                      noOptionsText="Nenhuma instituição encontrada"
                      style={{ flex: 1 }}
                    />
                    {index === 0 ? (
                      <button
                        type="button"
                        onClick={addInstituicaoDestino}
                        style={{ marginLeft: '8px' }}
                        title="Adicionar instituição"
                      >
                        ➕
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removeInstituicaoDestino(index)}
                        style={{ marginLeft: '8px' }}
                        title="Remover instituição"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                ))}
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

      <main>
        {userData && <ListaUsuarios usuarioLogadoId={userData.id} />}
      </main>

    </div>
  );
};

export default TelaMenu;