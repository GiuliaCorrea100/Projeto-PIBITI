import React, { useEffect, useState } from 'react';
import axios from 'axios';
import defaultAvatarImg from '../../menu/img/defaultAvatar.jpg';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  fotoUrl?: string;
}

const NotificacoesPage: React.FC = () => {
  const [notificacoes, setNotificacoes] = useState<Usuario[]>([]);

  const fetchNotificacoes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<Usuario[]>('http://localhost:3000/notificacoes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotificacoes(response.data);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  };

  const handleAceitar = async (id: number) => {
    try {
      await axios.post(`http://localhost:3000/notificacoes/${id}/aceitar`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotificacoes((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Erro ao aceitar:', error);
    }
  };

  const handleRecusar = async (id: number) => {
    try {
      await axios.post(`http://localhost:3000/notificacoes/${id}/recusar`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotificacoes((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Erro ao recusar:', error);
    }
  };

  useEffect(() => {
    fetchNotificacoes();
  }, []);

  return (
    <div className="notificacoes-container">
      <h2>Notificações</h2>
      {notificacoes.length === 0 ? (
        <p>Nenhuma notificação pendente.</p>
      ) : (
        notificacoes.map((usuario) => (
          <div key={usuario.id} className="notificacao-card">
            <img
              src={usuario.fotoUrl || defaultAvatarImg}
              alt={usuario.nome}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = defaultAvatarImg }}
              className="avatar-notificacao"
            />
            <div className="info-notificacao">
              <strong>{usuario.nome}</strong>
              <small>{usuario.email}</small>
            </div>
            <div className="botoes-notificacao">
              <button className="btn-aceitar" onClick={() => handleAceitar(usuario.id)}>Aceitar</button>
              <button className="btn-recusar" onClick={() => handleRecusar(usuario.id)}>Recusar</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default NotificacoesPage;
