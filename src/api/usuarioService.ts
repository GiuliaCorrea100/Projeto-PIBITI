import axios from 'axios';

export interface Instituicao {
  id: number;
  nome: string;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  fotoUrl?: string;
  instituicao?: {
    id: number;
    nome: string;
  };
  instituicaoDestino?: Array<{
    instituicao: Instituicao;
  }>;
}

const API_URL = 'http://localhost:3000/usuarios';

export const getUsuarios = async (): Promise<Usuario[]> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await axios.get(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    throw error;
  }
};