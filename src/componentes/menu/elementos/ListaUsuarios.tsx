import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, TextField, Button, Typography, Avatar } from "@mui/material";
import { getUsuarios, Usuario } from '../../../api/usuarioService.ts';
import defaultAvatarImg from '../img/defaultAvatar.jpg';

interface ListaUsuariosProps {
  usuarioLogadoId: number;
}

// Importe a imagem padrão ou defina o caminho para ela
const DEFAULT_AVATAR = defaultAvatarImg;

const columns: GridColDef<Usuario>[] = [
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
    flex: 1 
  },
  {
    field: 'acoes',
    headerName: 'Ações',
    flex: 0.5,
    sortable: false,
    renderCell: (params: GridRenderCellParams<Usuario>) => (
      <Button
        component={Link}
        to={`/usuarios/${params.row.id}`}
        variant="outlined"
        size="small" 
      >
        Solicitar Permuta
      </Button>
    )
  }
];

export default function ListaUsuarios({ usuarioLogadoId }: ListaUsuariosProps) {
  const [busca, setBusca] = useState('');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const carregarUsuarios = async () => {
      try {
        setLoading(true);
        const dados = await getUsuarios();
        // Adiciona a URL da foto para cada usuário
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

  const dadosFiltrados = usuarios
    .filter(usuario => usuario.id !== usuarioLogadoId)
    .filter(usuario =>
      usuario.nome.toLowerCase().includes(busca.toLowerCase())
    );

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Usuários Disponíveis para Permuta
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <TextField
          label="Buscar por nome"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          variant="outlined"
          sx={{ width: '50%' }}
          size="small"
        />
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={dadosFiltrados}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          autoHeight
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5, page: 0 },
            },
          }}
          pageSizeOptions={[5, 10, 20, 50]}
          sx={{
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 'bold',
            }
          }}
        />
      </Box>
    </Box>
  );
}