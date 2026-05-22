import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { 
  Box, Card, CardContent, TextField, Button, Typography, InputAdornment, IconButton 
} from '@mui/material';
import { Person, Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';

interface ErrorResponse {
    message: string;
}

interface FormData {
    nome: string;
    email: string;
    senha: string;
    confirmarSenha: string;
}

interface FormErrors {
    nome: string;
    email: string;
    senha: string;
    confirmarSenha: string;
    geral: string;
}

function LoginCadastro() {
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState<boolean>(true);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [formData, setFormData] = useState<FormData>({
        nome: "",
        email: "",
        senha: "",
        confirmarSenha: "",
    });

    const [errors, setErrors] = useState<FormErrors>({
        nome: "",
        email: "",
        senha: "",
        confirmarSenha: "",
        geral: "",
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: "",
            geral: "",
        }));
    };

    const validateFields = (): boolean => {
        let valid = true;
        let newErrors: FormErrors = {
            nome: "",
            email: "",
            senha: "",
            confirmarSenha: "",
            geral: "",
        };

        if (!isLogin && !formData.nome.trim()) {
            newErrors.nome = "Por favor, insira seu nome completo.";
            valid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = "Por favor, insira um e-mail válido.";
            valid = false;
        }

        if (formData.senha.length < 8) {
            newErrors.senha = "A senha deve ter pelo menos 8 caracteres.";
            valid = false;
        }

        if (!isLogin && formData.senha !== formData.confirmarSenha) {
            newErrors.confirmarSenha = "As senhas não coincidem.";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async () => {
        if (!validateFields()) return;

        setIsLoading(true);
        try {
            if (isLogin) {
                const response = await axios.post("http://localhost:3000/autorizacoes/login", {
                    email: formData.email.trim(),
                    senha: formData.senha.trim(),
                });

                if (response.data && response.data.access_token) {
                    localStorage.setItem('token', response.data.access_token);
                }

                navigate("/TelaPrincipal", {
                    state: {
                        userName: response.data.nome,
                        userId: response.data.id,
                        userEmail: formData.email,
                        userPassword: formData.senha 
                    },
                });
            } else {
                await axios.post("http://localhost:3000/autorizacoes/register", {
                    nome: formData.nome,
                    email: formData.email,
                    senha: formData.senha,
                    cargo: "usuario",
                });

                setIsLogin(true);
                setFormData({
                    nome: "",
                    email: formData.email,
                    senha: "",
                    confirmarSenha: "",
                });
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    geral: "Cadastro realizado com sucesso! Faça login.",
                }));
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<ErrorResponse>;
                if (axiosError.response && axiosError.response.data?.message) {
                    setErrors((prevErrors) => ({
                        ...prevErrors,
                        geral: axiosError.response!.data.message,
                    }));
                } else {
                    setErrors((prevErrors) => ({
                        ...prevErrors,
                        geral: axiosError.message || "Erro de conexão.",
                    }));
                }
            } else {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    geral: "Ocorreu um erro inesperado.",
                }));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleAuthMode = () => {
        setIsLogin((prevIsLogin) => !prevIsLogin);
        setFormData({ nome: "", email: "", senha: "", confirmarSenha: "" });
        setErrors({ nome: "", email: "", senha: "", confirmarSenha: "", geral: "" });
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleSubmit();
        }
    };

    return (
        <Box sx={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            minHeight: '100vh', bgcolor: '#f5f7fa' 
        }}>
            <Card sx={{ maxWidth: 400, width: '100%', borderRadius: 3, boxShadow: 3 }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
                        {isLogin ? "ENTRAR" : "CADASTRE-SE"}
                    </Typography>
                    
                    <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 3 }}>
                        Sistema de Permuta de Servidores
                    </Typography>

                    {!isLogin && (
                        <TextField
                            fullWidth label="Nome Completo" name="nome"
                            value={formData.nome} onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            margin="normal" variant="outlined"
                            error={!!errors.nome} helperText={errors.nome}
                            InputProps={{ 
                                startAdornment: <InputAdornment position="start"><Person /></InputAdornment> 
                            }}
                        />
                    )}

                    <TextField
                        fullWidth label="E-mail" name="email" type="email"
                        value={formData.email} onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        margin="normal" variant="outlined"
                        error={!!errors.email} helperText={errors.email}
                        InputProps={{ 
                            startAdornment: <InputAdornment position="start"><Email /></InputAdornment> 
                        }}
                    />

                    <TextField
                        fullWidth label="Senha" name="senha" 
                        type={showPassword ? "text" : "password"}
                        value={formData.senha} onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        margin="normal" variant="outlined"
                        error={!!errors.senha} helperText={errors.senha}
                        InputProps={{ 
                            startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    {!isLogin && (
                        <TextField
                            fullWidth label="Confirme sua Senha" name="confirmarSenha" 
                            type={showPassword ? "text" : "password"}
                            value={formData.confirmarSenha} onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            margin="normal" variant="outlined"
                            error={!!errors.confirmarSenha} helperText={errors.confirmarSenha}
                            InputProps={{ 
                                startAdornment: <InputAdornment position="start"><Lock /></InputAdornment> 
                            }}
                        />
                    )}

                    {errors.geral && (
                        <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                            {errors.geral}
                        </Typography>
                    )}

                    <Button
                        fullWidth variant="contained" size="large"
                        onClick={handleSubmit} disabled={isLoading}
                        sx={{ mt: 3, mb: 2, borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                    >
                        {isLoading ? "Carregando..." : isLogin ? "Acessar Sistema" : "Criar Conta"}
                    </Button>

                    <Box textAlign="center">
                        <Button onClick={handleToggleAuthMode} sx={{ textTransform: 'none' }}>
                            {isLogin ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Faça login"}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

export default LoginCadastro;
