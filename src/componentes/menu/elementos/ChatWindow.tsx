import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Box, TextField, IconButton, Paper, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface Mensagem {
  id: number;
  content: string;
  author_id: number;
  conversation_id: number;
  author?: {
    nome: string;
  };
}

interface ChatWindowProps {
  conversaId: number;
  usuarioLogadoId: number;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversaId, usuarioLogadoId }) => {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novoTexto, setNovoTexto] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagens]);

  const carregarMensagens = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await axios.get(
        `http://localhost:3000/conversas/${conversaId}/mensagens`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (Array.isArray(res.data)) {
        setMensagens(res.data);
      }
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
    }
  };

  const enviarMensagem = async () => {
    if (!novoTexto.trim()) return;

    try {
      const token = localStorage.getItem('token');

      await axios.post(
        'http://localhost:3000/messages',
        {
          authorId: usuarioLogadoId.toString(),
          conversationId: conversaId.toString(),
          content: novoTexto,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNovoTexto('');
      carregarMensagens();
    } catch (err) {
      console.error('Erro ao enviar:', err);
    }
  };

  useEffect(() => {
    carregarMensagens();

    const interval = setInterval(carregarMensagens, 3000);

    return () => clearInterval(interval);
  }, [conversaId]);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f5f5f5',
      }}
    >
      <Box
        ref={scrollRef}
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {mensagens.map((msg) => {
          const isMe = Number(msg.author_id) === Number(usuarioLogadoId);

          return (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                justifyContent: isMe ? 'flex-end' : 'flex-start',
              }}
            >
              <Paper
                sx={{
                  p: 1.5,
                  maxWidth: '70%',
                  borderRadius: 3,
                  bgcolor: isMe ? '#1976d2' : 'white',
                  color: isMe ? 'white' : 'black',
                  boxShadow: 1,
                }}
              >
                {!isMe && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 'bold',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    {msg.author?.nome}
                  </Typography>
                )}

                <Typography variant="body2">{msg.content}</Typography>
              </Paper>
            </Box>
          );
        })}
      </Box>

      <Box
        sx={{
          p: 2,
          borderTop: '1px solid #ddd',
          bgcolor: 'white',
          display: 'flex',
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          placeholder="Digite uma mensagem..."
          value={novoTexto}
          onChange={(e) => setNovoTexto(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && enviarMensagem()}
        />

        <IconButton color="primary" onClick={enviarMensagem}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatWindow;