import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";

// Interface da resposta esperada do backend
interface ErrorResponse {
    message: string;
}

// Definição da interface para o estado 'formData'
interface FormData {
    nome: string;
    email: string;
    senha: string;
    confirmarSenha: string;
}

// Definição da interface para o estado 'errors'
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

                console.log("Login realizado:", response.data);

                navigate("/TelaPrincipal", {
                    state: {
                        userName: response.data.nome,
                        userId: response.data.id,
                        userEmail: formData.email,
                        userPassword: formData.senha 
                    },
                });
            } else {
                const response = await axios.post("http://localhost:3000/autorizacoes/register", {
                    nome: formData.nome,
                    email: formData.email,
                    senha: formData.senha,
                    cargo: "usuario",
                });

                console.log("Cadastro realizado:", response.data);

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
                        geral: axiosError.message || "Erro de conexão com o servidor. Tente novamente mais tarde.",
                    }));
                }
            } else {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    geral: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
                }));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleAuthMode = () => {
        setIsLogin((prevIsLogin) => !prevIsLogin);
        setFormData({
            nome: "",
            email: "",
            senha: "",
            confirmarSenha: "",
        });
        setErrors({
            nome: "",
            email: "",
            senha: "",
            confirmarSenha: "",
            geral: "",
        });
    };

    return (
        <div className="center-container">
            <div className="form-container">
                <h2>{isLogin ? "Entrar" : "Cadastre-se"}</h2>

                {!isLogin && (
                    <div className="input-wrapper">
                        <input
                            type="text"
                            placeholder="Nome completo"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            className={errors.nome ? "input-erro" : ""}
                        />
                        {errors.nome && <p className="erro">{errors.nome}</p>}
                    </div>
                )}

                <div className="input-wrapper">
                    <input
                        type="email"
                        placeholder="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? "input-erro" : ""}
                        autoComplete="email"
                    />
                    {errors.email && <p className="erro">{errors.email}</p>}
                </div>

                <div className="input-wrapper">
                    <input
                        type="password"
                        placeholder="Senha"
                        name="senha"
                        value={formData.senha}
                        onChange={handleChange}
                        className={errors.senha ? "input-erro" : ""}
                        autoComplete={isLogin ? "current-password" : "new-password"}
                    />
                    {errors.senha && <p className="erro">{errors.senha}</p>}
                </div>

                {!isLogin && (
                    <div className="input-wrapper">
                        <input
                            type="password"
                            placeholder="Confirme sua senha"
                            name="confirmarSenha"
                            value={formData.confirmarSenha}
                            onChange={handleChange}
                            className={errors.confirmarSenha ? "input-erro" : ""}
                            autoComplete="new-password"
                        />
                        {errors.confirmarSenha && <p className="erro">{errors.confirmarSenha}</p>}
                    </div>
                )}

                {errors.geral && <p className="erro-geral">{errors.geral}</p>}

                <button type="button" onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? "Aguarde..." : isLogin ? "Entrar" : "Cadastrar"}
                </button>

                {isLogin && (
                    <button type="button" className="link-like">
                        Esqueci a senha
                    </button>
                )}

                <p>
                    {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
                    <button type="button" onClick={handleToggleAuthMode}>
                        {isLogin ? "Cadastre-se" : "Faça login"}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default LoginCadastro;
