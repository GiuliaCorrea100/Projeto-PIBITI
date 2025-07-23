import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import axios from 'axios';
import defaultAvatarImg from '../img/defaultAvatar.jpg';

const DEFAULT_AVATAR = defaultAvatarImg;

interface Solicitacao {
  id: number;
  usuarioSolicitante: {
    id: number;
    nome: string;
    fotoUrl?: string;
    cargo?: string;
    instituicao?: {
      nome: string;
    };
  };
}

interface ListaSolicitacoesProps {
  usuarioLogadoId: number;
}

const ListaSolicitacoes: React.FC<ListaSolicitacoesProps> = ({ usuarioLogadoId }) => {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<Solicitacao | null>(null);
  const [fotosUsuarios, setFotosUsuarios] = useState<{ [id: number]: string }>({});


  useEffect(() => {
    const fetchSolicitacoes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3000/solicitacoes/${usuarioLogadoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const solicitacoesRecebidas = response.data;
        setSolicitacoes(solicitacoesRecebidas);

        // Buscar fotos dos solicitantes
        solicitacoesRecebidas.forEach(s => {
          carregarFotoUsuario(s.usuarioSolicitante.id);
        });
      } catch (err) {
        console.error('Erro ao buscar solicitações:', err);
        setError('Não foi possível carregar as solicitações.');
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitacoes();
  }, [usuarioLogadoId]);

  const handleAceitar = async () => {
    if (!solicitacaoSelecionada) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/solicitacoes/${solicitacaoSelecionada.id}`, {
        status: 'Aceita'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Atualiza a lista removendo a solicitação aceita
      setSolicitacoes(solicitacoes.filter(s => s.id !== solicitacaoSelecionada.id));
      setOpenDialog(false);
    } catch (err) {
      console.error('Erro ao aceitar solicitação:', err);
      setError('Não foi possível aceitar a solicitação.');
    }
  };

  const handleRejeitar = async () => {
    if (!solicitacaoSelecionada) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/solicitacoes/${solicitacaoSelecionada.id}`, {
        status: 'Rejeitada'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Atualiza a lista removendo a solicitação rejeitada
      setSolicitacoes(solicitacoes.filter(s => s.id !== solicitacaoSelecionada.id));
      setOpenDialog(false);
    } catch (err) {
      console.error('Erro ao rejeitar solicitação:', err);
      setError('Não foi possível rejeitar a solicitação.');
    }
  };

  const carregarFotoUsuario = async (usuarioId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/usuarios/${usuarioId}/foto`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const blob = response.data;
      if (blob.size > 0) {
        const imageUrl = URL.createObjectURL(blob);
        setFotosUsuarios(prev => ({ ...prev, [usuarioId]: imageUrl }));
      } else {
        setFotosUsuarios(prev => ({ ...prev, [usuarioId]: DEFAULT_AVATAR }));
      }
    } catch (error) {
      console.warn(`Erro ao carregar imagem do usuário ${usuarioId}`, error);
      setFotosUsuarios(prev => ({ ...prev, [usuarioId]: DEFAULT_AVATAR }));
    }
  };

  return (
    <Box sx={{
      p: 3,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Paper elevation={3} sx={{
        p: 4,
        width: '90%',
        maxWidth: '1200px',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <Typography variant="h4" component="h1" sx={{
          mb: 3,
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          Solicitações Recebidas
        </Typography>

        {loading && <Typography>Carregando...</Typography>}
        {error && <Typography color="error">{error}</Typography>}

        {!loading && !error && solicitacoes.length === 0 && (
          <Typography>Nenhuma solicitação recebida</Typography>
        )}

        {!loading && !error && solicitacoes.length > 0 && (
          <Box sx={{ width: '100%' }}>
            {solicitacoes.map((solicitacao) => (
              <Paper key={solicitacao.id} sx={{
                p: 2,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    src={fotosUsuarios[solicitacao.usuarioSolicitante.id] || DEFAULT_AVATAR}
                    alt={solicitacao.usuarioSolicitante.nome}
                    sx={{ width: 56, height: 56, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="h6">{solicitacao.usuarioSolicitante.nome}</Typography>
                    <Typography variant="body2">
                      {solicitacao.usuarioSolicitante.cargo || 'Cargo não informado'}
                    </Typography>
                    <Typography variant="body2">
                      {solicitacao.usuarioSolicitante.instituicao?.nome || 'Instituição não informada'}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Button
                    variant="contained"
                    color="success"
                    sx={{ mr: 1 }}
                    onClick={() => {
                      setSolicitacaoSelecionada(solicitacao);
                      setOpenDialog(true);
                    }}
                  >
                    Aceitar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      setSolicitacaoSelecionada(solicitacao);
                      setOpenDialog(true);
                    }}
                  >
                    Rejeitar
                  </Button>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmar ação</DialogTitle>
        <DialogContent>
          <Typography>
            Deseja aceitar ou rejeitar a solicitação de {solicitacaoSelecionada?.usuarioSolicitante.nome}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            handleRejeitar();
            setOpenDialog(false);
          }}>
            Rejeitar
          </Button>
          <Button onClick={() => {
            handleAceitar();
            setOpenDialog(false);
          }} color="primary" autoFocus>
            Aceitar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ListaSolicitacoes;