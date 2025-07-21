import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NotificacaoBadge: React.FC = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchNotificacoesCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('http://localhost:3000/notificacoes/count', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCount(response.data.count);
      } catch (error) {
        console.error('Erro ao buscar contagem de notificações:', error);
      }
    };

    fetchNotificacoesCount();
  }, []);

  if (count === 0) return null;

  return (
    <span className="notificacao-badge">
      {count > 9 ? '9+' : count}
    </span>
  );
};

export default NotificacaoBadge;