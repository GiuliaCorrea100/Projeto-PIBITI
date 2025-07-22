import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, TextField, Button, Typography, Avatar, Paper } from "@mui/material";
import { getUsuarios, Usuario } from '../../../api/usuarioService.ts';
import defaultAvatarImg from '../img/defaultAvatar.jpg';

interface ListaUsuariosProps {
  usuarioLogadoId: number;
}

const DEFAULT_AVATAR = defaultAvatarImg;

// MODIFICAÇÃO 1: Nova função para gerar nomes no formato "usuarioXXX"
// Usa o ID do usuário como base para o número, garantindo consistência
const generateUsuarioName = (userId: number): string => {
  // Gera um número entre 100 e 999 baseado no ID do usuário
  const userNumber = 100 + (userId % 900); // Garante número de 3 dígitos
  return `usuario${userNumber}`;
};

// MODIFICAÇÃO 2: Transformamos as colunas em uma função que recebe o ID do usuário logado
const getColumns = (usuarioLogadoId: number): GridColDef<Usuario>[] => [
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
    // MODIFICAÇÃO 3: Renderização condicional do nome
    // Mostra o nome real apenas para o usuário logado, "usuarioXXX" para os outros
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
    headerName: 'Instituição Atual',
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
        component={Link}
        to={`/usuarios/${params.row.id}`}
        variant="outlined"
        size="small"
        sx={{
          borderRadius: '20px',
          textTransform: 'none'
        }}
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
  const navigate = useNavigate();

  // MODIFICAÇÃO 4: Usamos a função getColumns passando o usuarioLogadoId
  const columns = getColumns(usuarioLogadoId);

  useEffect(() => {
    const carregarUsuarios = async () => {
      try {
        setLoading(true);
        const dados = await getUsuarios();
        console.log('Dados recebidos:', dados);
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

  // MODIFICAÇÃO 5: Mantemos a filtragem original, mas agora os nomes serão exibidos conforme a renderização personalizada
  const dadosFiltrados = usuarios
    .filter(usuario => usuario.id !== usuarioLogadoId)
    .filter(usuario =>
      usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (usuario.instituicao?.nome && usuario.instituicao.nome.toLowerCase().includes(busca.toLowerCase()))
    );

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
          Usuários Disponíveis para Permuta
        </Typography>

        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 3,
          width: '100%',
          maxWidth: '600px'
        }}>
          <TextField
            label="Buscar por nome ou instituição"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            variant="outlined"
            fullWidth
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
              }
            }}
          />
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box sx={{
          height: 600,
          width: '100%',
          '& .MuiDataGrid-root': {
            borderRadius: '12px',
          }
        }}>
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
              },
              '& .MuiDataGrid-columnHeaders': {
                borderRadius: '12px 12px 0 0',
              }
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}