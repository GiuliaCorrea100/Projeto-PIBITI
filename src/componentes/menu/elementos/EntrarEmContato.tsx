import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { Delete as DeleteIcon } from '@mui/icons-material';
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
  const [contatoParaExcluir, setContatoParaExcluir] = useState<Contato | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);

  useEffect(() => {
    buscarContatos();
  }, [usuarioLogadoId]);

  const buscarContatos = async () => {
    try {
      setLoading(true);
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

  const abrirDialogExclusao = (contato: Contato) => {
    setContatoParaExcluir(contato);
    setDialogAberto(true);
  };

  const fecharDialog = () => {
    setDialogAberto(false);
    setContatoParaExcluir(null);
  };

  const excluirContato = async () => {
    if (!contatoParaExcluir) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/solicitacoes/contato/${usuarioLogadoId}/${contatoParaExcluir.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setContatos(prev => prev.filter(contato => contato.id !== contatoParaExcluir.id));
      
      fecharDialog();
    } catch (err) {
      console.error('Erro ao excluir contato:', err);
      setError('Erro ao excluir contato.');
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
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <Avatar
                  src={fotosUsuarios[contato.id] || DEFAULT_AVATAR}
                  alt={contato.nome}
                  sx={{ width: 56, height: 56, mr: 2 }}
                />
                <Box sx={{ flexGrow: 1 }}>
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
              
              <IconButton
                onClick={() => abrirDialogExclusao(contato)}
                color="error"
                sx={{ ml: 2 }}
                title="Remover contato"
              >
                <DeleteIcon />
              </IconButton>
            </Paper>
          ))}
        </Box>
      </Paper>

      <Dialog open={dialogAberto} onClose={fecharDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja remover {contatoParaExcluir?.nome} da sua lista de contatos?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharDialog}>Cancelar</Button>
          <Button onClick={excluirContato} color="error" variant="contained">
            Remover
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EntrarEmContato;