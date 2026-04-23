import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Card,
  CardContent,
  Typography,
  IconButton,
  CircularProgress,
  Box,
  Divider,
  Chip,
  MenuItem,
  Checkbox,
  FormControlLabel
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
  _count: {
    comentarios: number;
  };
}

const categorias = [
  'Remoção',
  'Dúvidas',
  'Transferência',
  'Experiências',
  'Documentação',
  'Off-topic'
];

const Forum: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [topicos, setTopicos] = useState<Topico[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [topicoSelecionado, setTopicoSelecionado] = useState<Topico | null>(null);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [novoTopico, setNovoTopico] = useState({
    nome: '',
    categoria: '',
    descricao: ''
  });
  const [novoComentario, setNovoComentario] = useState('');
  const [usuarioLogadoId, setUsuarioLogadoId] = useState<number | null>(null);
  const [anonimoTopico, setAnonimoTopico] = useState(false);
  const [anonimoComentario, setAnonimoComentario] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');

  const fetchMe = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:3000/autorizacoes/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarioLogadoId(res.data.id);
    } catch {
      navigate('/');
    }
  }, [navigate, token]);

  const fetchTopicos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3000/foruns', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTopicos(res.data);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchComentarios = async (id: number) => {
    const res = await axios.get(`http://localhost:3000/foruns/comentarios/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setComentarios(res.data);
  };

  useEffect(() => {
    fetchMe();
    fetchTopicos();
  }, [fetchMe, fetchTopicos]);

  const handleCreateTopico = async () => {
    if (!usuarioLogadoId) return;
    if (!novoTopico.nome || !novoTopico.categoria || !novoTopico.descricao) return;

    await axios.post(
      'http://localhost:3000/foruns',
      {
        nome: novoTopico.nome,
        categoria: novoTopico.categoria,
        descricao: novoTopico.descricao,
        id_usuario: usuarioLogadoId,
        anonimo: anonimoTopico
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    setNovoTopico({
      nome: '',
      categoria: '',
      descricao: ''
    });
    setAnonimoTopico(false);
    setOpenModal(false);
    fetchTopicos();
  };

  const handleSendComentario = async () => {
    if (!usuarioLogadoId || !topicoSelecionado || !novoComentario) return;

    await axios.post(
      'http://localhost:3000/foruns/comentario',
      {
        id_topico: topicoSelecionado.id,
        id_usuario: usuarioLogadoId,
        descricao: novoComentario,
        anonimo: anonimoComentario
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    setNovoComentario('');
    setAnonimoComentario(false);
    fetchComentarios(topicoSelecionado.id);
    fetchTopicos();
  };

  const topicosFiltrados = categoriaSelecionada
    ? topicos.filter((item) => item.categoria === categoriaSelecionada)
    : topicos;

  const totalPorCategoria = (categoria: string) =>
    topicos.filter((item) => item.categoria === categoria).length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 950, margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() =>
              topicoSelecionado
                ? setTopicoSelecionado(null)
                : navigate('/TelaPrincipal')
            }
          >
            <ArrowBackIcon />
          </IconButton>

          <Typography variant="h4" fontWeight="bold">
            {topicoSelecionado ? 'Discussão' : 'Fórum'}
          </Typography>
        </Box>

        {!topicoSelecionado && (
          <Button variant="contained" onClick={() => setOpenModal(true)}>
            Novo Tópico
          </Button>
        )}
      </Box>

      {!topicoSelecionado ? (
        <>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
            {categorias.map((cat) => (
              <Chip
                key={cat}
                label={`${cat} (${totalPorCategoria(cat)})`}
                clickable
                color={categoriaSelecionada === cat ? 'primary' : 'default'}
                onClick={() => setCategoriaSelecionada(cat)}
              />
            ))}

            <Chip
              label="Todas"
              clickable
              color={!categoriaSelecionada ? 'primary' : 'default'}
              onClick={() => setCategoriaSelecionada('')}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {topicosFiltrados.map((topico) => (
              <Card
                key={topico.id}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 4 }
                }}
                onClick={() => {
                  setTopicoSelecionado(topico);
                  fetchComentarios(topico.id);
                }}
              >
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    {topico.categoria} • {topico.anonimo ? 'Anônimo' : topico.usuario.nome}
                  </Typography>

                  <Typography variant="h6" sx={{ mt: 1, mb: 1 }}>
                    {topico.nome}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ChatBubbleOutlineIcon fontSize="small" />
                    <Typography variant="body2">
                      {topico._count.comentarios} comentários
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}

            {topicosFiltrados.length === 0 && (
              <Typography align="center">
                Nenhum tópico encontrado.
              </Typography>
            )}
          </Box>
        </>
      ) : (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5">{topicoSelecionado.nome}</Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {topicoSelecionado.categoria}
              </Typography>
            </CardContent>
          </Card>

          <Typography variant="h6" sx={{ mb: 2 }}>
            Respostas
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
            {comentarios.map((c) => (
              <Box key={c.id} sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" color="primary">
                    {c.anonimo ? 'Anônimo' : `${c.usuario.nome} - ${c.usuario.cargo}`}
                  </Typography>

                  <Typography variant="caption">
                    {new Date(c.createdAt).toLocaleString('pt-BR')}
                  </Typography>
                </Box>

                <Typography>{c.descricao}</Typography>
              </Box>
            ))}
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Escreva uma resposta..."
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={anonimoComentario}
                  onChange={(e) => setAnonimoComentario(e.target.checked)}
                />
              }
              label="Responder como anônimo"
            />

            <Button variant="contained" onClick={handleSendComentario}>
              <SendIcon />
            </Button>
          </Box>
        </>
      )}

      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Criar Novo Tópico</DialogTitle>

        <DialogContent dividers>
          <TextField
            fullWidth
            label="Título"
            sx={{ mb: 2 }}
            value={novoTopico.nome}
            onChange={(e) =>
              setNovoTopico({ ...novoTopico, nome: e.target.value })
            }
          />

          <TextField
            select
            fullWidth
            label="Categoria"
            sx={{ mb: 2 }}
            value={novoTopico.categoria}
            onChange={(e) =>
              setNovoTopico({ ...novoTopico, categoria: e.target.value })
            }
          >
            {categorias.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Conteúdo"
            sx={{ mb: 2 }}
            value={novoTopico.descricao}
            onChange={(e) =>
              setNovoTopico({ ...novoTopico, descricao: e.target.value })
            }
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={anonimoTopico}
                onChange={(e) => setAnonimoTopico(e.target.checked)}
              />
            }
            label="Publicar como anônimo"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>
            Cancelar
          </Button>

          <Button variant="contained" onClick={handleCreateTopico}>
            Publicar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Forum;