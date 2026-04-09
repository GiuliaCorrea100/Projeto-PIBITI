import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Button, TextField, Dialog, DialogActions, 
  DialogContent, DialogTitle, Card, CardContent, 
  Typography, IconButton, CircularProgress, Box, Divider 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';

interface Usuario {
  id: number;
  nome: string;
  cargo: string;
  email: string;
}

interface Comentario {
  id: number;
  descricao: string;
  createdAt: string;
  usuario: Usuario;
  anonimo: boolean;
}

interface Topico {
  id: number;
  nome: string;
  categoria: string;
  createdAt: string;
  usuario: Usuario;
  anonimo: boolean;
  _count: { comentarios: number };
}

const Forum: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [topicos, setTopicos] = useState<Topico[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [topicoSelecionado, setTopicoSelecionado] = useState<Topico | null>(null);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  
  const [novoTopico, setNovoTopico] = useState({ nome: '', categoria: '', descricao: '' });
  const [novoComentario, setNovoComentario] = useState('');
  const [usuarioLogadoId, setUsuarioLogadoId] = useState<number | null>(null);
  const [anonimo, setAnonimo] = useState(false);

  const fetchMe = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:3000/autorizacoes/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarioLogadoId(res.data.id);
    } catch (err) {
      console.error("Sessão expirada ou inválida");
      navigate('/');
    }
  }, [token, navigate]);

  const fetchTopicos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3000/foruns', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTopicos(res.data);
    } catch (err) {
      console.error("Erro ao buscar tópicos", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchComentarios = async (id: number) => {
    try {
      const res = await axios.get(`http://localhost:3000/foruns/comentarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComentarios(res.data);
    } catch (err) {
      console.error("Erro ao buscar comentários", err);
    }
  };

  useEffect(() => {
    fetchMe();
    fetchTopicos();
  }, [fetchMe, fetchTopicos]);

  const handleCreateTopico = async () => {
    if (!usuarioLogadoId || !novoTopico.nome || !novoTopico.descricao) return;
    try {
      await axios.post('http://localhost:3000/foruns', {
        nome: novoTopico.nome,
        categoria: novoTopico.categoria,
        descricao: novoTopico.descricao,
        id_usuario: usuarioLogadoId,
        anonimo: anonimo
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setOpenModal(false);
      setNovoTopico({ nome: '', categoria: '', descricao: '' });
      setAnonimo(false);
      fetchTopicos(); 
    } catch (err) {
      alert("Erro ao criar tópico");
    }
  };

  const handleSendComentario = async () => {
    if (!topicoSelecionado || !novoComentario || !usuarioLogadoId) return;
    try {
      await axios.post('http://localhost:3000/foruns/comentario', {
        id_topico: topicoSelecionado.id,
        id_usuario: usuarioLogadoId,
        descricao: novoComentario,
        anonimo: anonimo
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setNovoComentario('');
      setAnonimo(false);
      fetchComentarios(topicoSelecionado.id); 
      fetchTopicos(); 
    } catch (err) {
      alert("Erro ao enviar comentário");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 900, margin: '0 auto' }}>
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => topicoSelecionado ? setTopicoSelecionado(null) : navigate('/TelaPrincipal')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {topicoSelecionado ? 'Discussão' : 'Fórum'}
          </Typography>
        </Box>
        
        {!topicoSelecionado && (
          <Button variant="contained" size="large" onClick={() => setOpenModal(true)} sx={{ borderRadius: 2 }}>
            Novo Tópico
          </Button>
        )}
      </Box>

      {!topicoSelecionado ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {topicos.map((topico) => (
            <Card 
              key={topico.id} 
              onClick={() => {
                setTopicoSelecionado(topico);
                fetchComentarios(topico.id);
              }}
              sx={{ 
                cursor: 'pointer', 
                transition: '0.2s',
                '&:hover': { backgroundColor: '#f9f9f9', transform: 'translateY(-2px)', boxShadow: 2 } 
              }}
            >
              <CardContent>
                <Typography color="textSecondary" variant="caption" sx={{ display: 'block', mb: 1 }}>
                  {topico.categoria.toUpperCase()} • Postado por {topico.anonimo ? 'Anônimo' : topico.usuario.nome}
                </Typography>
                <Typography variant="h6" sx={{ color: '#1976d2', mb: 1 }}>{topico.nome}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                  <ChatBubbleOutlineIcon sx={{ fontSize: 18, mr: 0.5 }} />
                  <Typography variant="body2">{topico._count.comentarios} comentários</Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
          {topicos.length === 0 && <Typography align="center">Nenhum tópico criado ainda.</Typography>}
        </Box>
      ) : (
        <Box>
          <Card sx={{ mb: 3, backgroundColor: '#f0f4f8', borderLeft: '5px solid #1976d2' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>{topicoSelecionado.nome}</Typography>
              <Typography variant="body2" color="text.secondary">
                Iniciado por <strong>{topicoSelecionado.anonimo ? 'Anônimo' : topicoSelecionado.usuario.nome}</strong> em {new Date(topicoSelecionado.createdAt).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>

          <Typography variant="h6" sx={{ mb: 2 }}>Respostas</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
            {comentarios.map((c) => (
              <Box key={c.id} sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" color="primary">
                    {c.anonimo ? 'Anônimo' : `${c.usuario.nome} — ${c.usuario.cargo}`}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(c.createdAt).toLocaleString('pt-BR')}
                  </Typography>
                </Box>
                <Typography variant="body1">{c.descricao}</Typography>
              </Box>
            ))}
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <TextField 
                fullWidth 
                multiline
                rows={2}
                placeholder="Escreva uma resposta..." 
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
              />
              <Button 
                variant="contained" 
                sx={{ height: 56 }} 
                onClick={handleSendComentario}
                disabled={!novoComentario.trim()}
              >
                <SendIcon />
              </Button>
            </Box>
            <Box>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={anonimo}
                  onChange={(e) => setAnonimo(e.target.checked)}
                />
                Postar como anônimo
              </label>
            </Box>
          </Box>
        </Box>
      )}

      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Criar Novo Tópico</DialogTitle>
        <DialogContent dividers>
          <TextField 
            autoFocus margin="dense" label="Título do Tópico" fullWidth variant="outlined"
            sx={{ mb: 2 }}
            value={novoTopico.nome}
            onChange={(e) => setNovoTopico({...novoTopico, nome: e.target.value})}
          />
          <TextField 
            margin="dense" label="Categoria (Ex: Remoção, Dúvidas)" fullWidth variant="outlined"
            sx={{ mb: 2 }}
            value={novoTopico.categoria}
            onChange={(e) => setNovoTopico({...novoTopico, categoria: e.target.value})}
          />
          <TextField 
            margin="dense" label="Conteúdo/Pergunta Inicial" fullWidth multiline rows={4} variant="outlined"
            value={novoTopico.descricao}
            onChange={(e) => setNovoTopico({...novoTopico, descricao: e.target.value})}
          />
          <Box sx={{ mt: 2 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={anonimo}
                onChange={(e) => setAnonimo(e.target.checked)}
              />
              Postar como anônimo
            </label>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => { setOpenModal(false); setAnonimo(false); }} color="inherit">Cancelar</Button>
          <Button onClick={handleCreateTopico} variant="contained">Publicar Tópico</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Forum;