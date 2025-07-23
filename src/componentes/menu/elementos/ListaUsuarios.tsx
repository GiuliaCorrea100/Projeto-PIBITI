import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { 
    Box, 
    Typography, 
    Avatar, 
    Paper, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    TextField 
} from "@mui/material";

import { getUsuarios, Usuario } from '../../../api/usuarioService.ts';
import defaultAvatarImg from '../img/defaultAvatar.jpg';

interface ListaUsuariosProps {
  usuarioLogadoId: number;
}

const DEFAULT_AVATAR = defaultAvatarImg;

const generateUsuarioName = (userId: number): string => {
  if (!userId) return 'Usuário';
  const userNumber = 100 + (userId % 900);
  return `Usuario${userNumber}`;
};

const getColumns = (
  usuarioLogadoId: number, 
  onSolicitarClick: (usuario: Usuario) => void
): GridColDef<Usuario>[] => [
  {
    field: 'avatar',
    headerName: 'Foto',
    flex: 0.5,
    sortable: false,
    filterable: false,
    renderCell: (params: GridRenderCellParams<Usuario>) => (
      <Avatar
        src={params.row.fotoUrl || DEFAULT_AVATAR}
        alt={params.row.nome}
        sx={{ width: 40, height: 40 }}
      />
    )
  },
  {
    field: 'nome',
    headerName: 'Nome',
    flex: 1,
    renderCell: (params: GridRenderCellParams<Usuario>) => (
      <Typography>
        {params.row.id === usuarioLogadoId 
          ? params.row.nome 
          : generateUsuarioName(params.row.id)}
      </Typography>
    )
  },
  {
    field: 'instituicaoAtual',
    headerName: 'Instituição',
    flex: 1,
    renderCell: (params: GridRenderCellParams<Usuario>) => (
      <Typography>
        {params.row.instituicao?.nome || 'Não informado'}
      </Typography>
    )
  },
  {
    field: 'acoes',
    headerName: 'Ações',
    flex: 0.5,
    sortable: false,
    renderCell: (params: GridRenderCellParams<Usuario>) => (
      <Button
        onClick={() => onSolicitarClick(params.row)}
        variant="outlined"
        size="small"
        sx={{ borderRadius: '20px', textTransform: 'none' }}
      >
        Mandar Solicitação
      </Button>
    )
  }
];

export default function ListaUsuarios({ usuarioLogadoId }: ListaUsuariosProps) {
  const [busca, setBusca] = useState('');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleSolicitarClick = (usuario: Usuario) => {
    setUsuarioSelecionado(usuario);
    setOpenModal(true);
  };

  const handleConfirmarSolicitacao = async () => {
    if (!usuarioSelecionado) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3000/solicitacoes',
        {
          usuarioId_alvo: usuarioSelecionado.id,
          usuarioId_solicitante: usuarioLogadoId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOpenModal(false);
      setAlertMessage('Solicitação enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      setAlertMessage('Erro ao enviar solicitação. Tente novamente.');
    } finally {
        setTimeout(() => setAlertMessage(null), 2500);
    }
  };

  const handleCancelarSolicitacao = () => {
    setOpenModal(false);
    setUsuarioSelecionado(null);
  };

  useEffect(() => {
    const carregarUsuarios = async () => {
      try {
        setLoading(true);
        const dados = await getUsuarios();
        const usuariosComFoto = dados.map(usuario => ({
          ...usuario,
          fotoUrl: usuario.fotoUrl || DEFAULT_AVATAR
        }));
        setUsuarios(usuariosComFoto);
        setError(null);
      } catch (err: any) {
        console.error("Erro ao carregar usuários:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('Não foi possível carregar os dados. Tente novamente mais tarde.');
        }
      } finally {
        setLoading(false);
      }
    };

    carregarUsuarios();
  }, [navigate]);

  const columns = getColumns(usuarioLogadoId, handleSolicitarClick);

  const dadosFiltrados = usuarios
    .filter(usuario => usuario.id !== usuarioLogadoId)
    .filter(usuario =>
      generateUsuarioName(usuario.id).toLowerCase().includes(busca.toLowerCase()) ||
      (usuario.instituicao?.nome && usuario.instituicao.nome.toLowerCase().includes(busca.toLowerCase()))
    );

  return (
    <Box sx={{ p: 3, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, width: '90%', maxWidth: '1200px', borderRadius: '12px' }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
          Usuários Disponíveis para Permuta
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <TextField
            label="Buscar por nome ou instituição"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ width: '100%', maxWidth: '600px', '& .MuiOutlinedInput-root': { borderRadius: '20px' } }}
          />
        </Box>

        {error && <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>{error}</Typography>}

        <Box sx={{ height: 600, width: '100%', '& .MuiDataGrid-root': { borderRadius: '12px' } }}>
          <DataGrid
            rows={dadosFiltrados}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.id}
            autoHeight
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            pageSizeOptions={[5, 10, 20, 50]}
            sx={{
              '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' },
              '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' },
              '& .MuiDataGrid-columnHeaders': { borderRadius: '12px 12px 0 0' }
            }}
          />
        </Box>
      </Paper>

      <Dialog open={openModal} onClose={handleCancelarSolicitacao}>
        <DialogTitle>Confirmar Envio de Solicitação</DialogTitle>
        <DialogContent>
          <Typography variant="body1" align="center">
            Deseja mesmo enviar uma solicitação para:
          </Typography>
          <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 'bold', mt: 2 }}>
            {generateUsuarioName(usuarioSelecionado?.id || 0)}
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center' }}>
            {usuarioSelecionado?.instituicao?.nome || 'Instituição não informada'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelarSolicitacao} color="primary">Não</Button>
          <Button onClick={handleConfirmarSolicitacao} color="primary" autoFocus>Sim</Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={!!alertMessage} onClose={() => setAlertMessage(null)}>
        <DialogTitle>{alertMessage}</DialogTitle>
        <DialogActions>
          <Button onClick={() => setAlertMessage(null)}>OK</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}