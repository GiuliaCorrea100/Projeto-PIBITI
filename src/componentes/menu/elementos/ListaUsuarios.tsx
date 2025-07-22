import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, TextField, Button, Typography } from "@mui/material";
import { getUsuarios, Usuario } from '../../../api/usuarioService.ts';

interface ListaUsuariosProps {
  usuarioLogadoId: number;
}

// Definição das colunas para o DataGrid
const columns: GridColDef<Usuario>[] = [
  { 
    field: 'nome', 
    headerName: 'Nome', 
    flex: 1 
  },
  { 
    field: 'email',
    headerName: 'Email', 
    flex: 1 
  },
  {
    field: 'cargo',
    headerName: 'Cargo',
    flex: 1,
    valueGetter: (value) => value || 'Não informado',
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
        Solicitar
        Permuta
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
        setUsuarios(dados);
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
    .filter(usuario => usuario.id !== usuarioLogadoId) // 👈 remove o logado
    .filter(usuario =>
      usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
      usuario.email.toLowerCase().includes(busca.toLowerCase()) ||
      (usuario.cargo && usuario.cargo.toLowerCase().includes(busca.toLowerCase()))
    );

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        .
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <TextField
          label="Buscar por nome, email ou cargo"
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
