import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, Paper } from "@mui/material";
import axios from 'axios';
import defaultAvatarImg from '../img/defaultAvatar.jpg';

const DEFAULT_AVATAR = defaultAvatarImg;

interface Contato {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  cargo?: string;
  instituicao?: {
    nome: string;
  };
}

interface EntrarEmContatoProps {
  usuarioLogadoId: number;
}

const EntrarEmContato: React.FC<EntrarEmContatoProps> = ({ usuarioLogadoId }) => {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [fotosUsuarios, setFotosUsuarios] = useState<{ [id: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const buscarContatos = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3000/solicitacoes/contatos/${usuarioLogadoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const contatosProcessados = response.data.map((sol: any) => {
          return sol.usuarioId_alvo === usuarioLogadoId 
            ? sol.usuarioSolicitante 
            : sol.usuarioAlvo;
        });

        setContatos(contatosProcessados);
        contatosProcessados.forEach((contato: Contato) => carregarFotoUsuario(contato.id));
      } catch (err) {
        console.error('Erro ao buscar contatos:', err);
        setError('Erro ao carregar contatos.');
      } finally {
        setLoading(false);
      }
    };

    buscarContatos();
  }, [usuarioLogadoId]);

  const carregarFotoUsuario = async (usuarioId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/usuarios/${usuarioId}/foto`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const blob = response.data;
      const imageUrl = blob.size > 0 ? URL.createObjectURL(blob) : DEFAULT_AVATAR;
      setFotosUsuarios(prev => ({ ...prev, [usuarioId]: imageUrl }));

    } catch (err) {
      console.warn(`Erro ao carregar foto do usuário ${usuarioId}`);
      setFotosUsuarios(prev => ({ ...prev, [usuarioId]: DEFAULT_AVATAR }));
    }
  };

  return (
    <Box sx={{ p: 3, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, width: '90%', maxWidth: '1200px', borderRadius: '12px' }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
          Contatos Confirmados
        </Typography>

        {loading && <Typography>Carregando...</Typography>}
        {error && <Typography color="error">{error}</Typography>}
        {!loading && !error && contatos.length === 0 && (
          <Typography>Nenhum contato confirmado.</Typography>
        )}

        <Box sx={{ width: '100%' }}>
          {contatos.map((contato) => (
            <Paper key={contato.id} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  src={fotosUsuarios[contato.id] || DEFAULT_AVATAR}
                  alt={contato.nome}
                  sx={{ width: 56, height: 56, mr: 2 }}
                />
                <Box>
                    <Typography variant="h6">{contato.nome}</Typography>
                    <Typography variant="body2" color="text.secondary">{contato.cargo || 'Cargo não informado'}</Typography>
                    <Typography variant="body2" color="text.secondary">{contato.instituicao?.nome || 'Instituição não informada'}</Typography>
                    <Typography
                        component="a"
                        href={`https://mail.google.com/mail/?view=cm&to=${contato.email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="body1"
                        sx={{ mt: 1, fontWeight: 'bold', color: '#1976d2', textDecoration: 'none', cursor: 'pointer' }}
                        >
                        {contato.email}
                    </Typography>
                    {contato.telefone && (
                    <Typography>
                      📞 {contato.telefone}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default EntrarEmContato;