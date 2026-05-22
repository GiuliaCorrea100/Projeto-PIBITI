import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Dialog,
} from '@mui/material';
import axios from 'axios';
import defaultAvatarImg from '../img/defaultAvatar.jpg';
import ChatWindow from './ChatWindow.tsx';

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

const EntrarEmContato: React.FC<EntrarEmContatoProps> = ({
  usuarioLogadoId,
}) => {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [fotosUsuarios, setFotosUsuarios] = useState<{
    [id: number]: string;
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversaAtiva, setConversaAtiva] = useState<any>(null);
  const [chatAberto, setChatAberto] = useState(false);

  useEffect(() => {
    const buscarContatos = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await axios.get(
          `http://localhost:3000/solicitacoes/contatos/${usuarioLogadoId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const contatosProcessados = response.data.map((sol: any) => {
          return sol.usuarioId_alvo === usuarioLogadoId
            ? sol.usuarioSolicitante
            : sol.usuarioAlvo;
        });

        setContatos(contatosProcessados);

        contatosProcessados.forEach((contato: Contato) =>
          carregarFotoUsuario(contato.id)
        );
      } catch (err) {
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

      const response = await axios.get(
        `http://localhost:3000/usuarios/${usuarioId}/foto`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );

      const blob = response.data;

      const imageUrl =
        blob.size > 0
          ? URL.createObjectURL(blob)
          : DEFAULT_AVATAR;

      setFotosUsuarios((prev) => ({
        ...prev,
        [usuarioId]: imageUrl,
      }));
    } catch (err) {
      setFotosUsuarios((prev) => ({
        ...prev,
        [usuarioId]: DEFAULT_AVATAR,
      }));
    }
  };

  const handleAbrirChat = async (contato: Contato) => {
    try {
      const token = localStorage.getItem('token');

      const res = await axios.post(
        'http://localhost:3000/conversas',
        {
          userIDs: [usuarioLogadoId, contato.id],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setConversaAtiva({
        id: res.data.id,
        nome: contato.nome,
        foto: fotosUsuarios[contato.id],
      });

      setChatAberto(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '90%',
          maxWidth: '1200px',
          borderRadius: '12px',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          Contatos Confirmados
        </Typography>

        {loading && <Typography>Carregando...</Typography>}

        {error && (
          <Typography color="error">{error}</Typography>
        )}

        <Box sx={{ width: '100%' }}>
          {contatos.map((contato) => (
            <Paper
              key={contato.id}
              sx={{
                p: 2,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  src={
                    fotosUsuarios[contato.id] ||
                    DEFAULT_AVATAR
                  }
                  sx={{
                    width: 56,
                    height: 56,
                    mr: 2,
                  }}
                />

                <Box>
                  <Typography variant="h6">
                    {contato.nome}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {contato.cargo ||
                      'Cargo não informado'}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {contato.instituicao?.nome ||
                      'Instituição não informada'}
                  </Typography>

                  <Typography
                    component="a"
                    href={`https://mail.google.com/mail/?view=cm&to=${contato.email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="body1"
                    sx={{
                      mt: 1,
                      fontWeight: 'bold',
                      color: '#1976d2',
                      textDecoration: 'none',
                    }}
                  >
                    {contato.email}
                  </Typography>

                  {contato.telefone && (
                    <Typography sx={{ display: 'block' }}>
                      📞 {contato.telefone}
                    </Typography>
                  )}
                </Box>
              </Box>

              <button
                type="button"
                className="save-button"
                onClick={() => {
                  console.log('clicou');
                  handleAbrirChat(contato);
                }}
              >
                Conversar
              </button>
            </Paper>
          ))}
        </Box>
      </Paper>

      <Dialog
        open={chatAberto}
        onClose={() => setChatAberto(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '18px',
            height: '80vh',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderBottom: '1px solid #ddd',
              bgcolor: '#1976d2',
              color: 'white',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Avatar src={conversaAtiva?.foto} />

              <Typography variant="h6">
                {conversaAtiva?.nome}
              </Typography>
            </Box>

            <button
              onClick={() => setChatAberto(false)}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'white',
                fontSize: '1.2rem',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              overflow: 'hidden',
            }}
          >
            {conversaAtiva && (
              <ChatWindow
                conversaId={conversaAtiva.id}
                usuarioLogadoId={usuarioLogadoId}
              />
            )}
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default EntrarEmContato;