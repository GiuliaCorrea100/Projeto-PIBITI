import React, { useState } from "react";
import "../style.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LoginCadastro() {
    const [isLogin, setIsLogin] = useState(true);
    const [nome, setNome] = useState("");

    // Estados para login/cadastro
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    
    // Estados de erro
    const [erroNome, setErroNome] = useState("");
    const [erroEmail, setErroEmail] = useState("");
    const [erroSenha, setErroSenha] = useState("");
    const [erroConfirmarSenha, setErroConfirmarSenha] = useState("");
    const [erroGeral, setErroGeral] = useState("");

    const navigate = useNavigate();

    const validarCampos = () => {
        let valido = true;
        setErroGeral("");

        if (!isLogin && !nome.trim()) {
            setErroNome("Por favor, insira seu nome.");
            valido = false;
        } else {
            setErroNome("");
        }

        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(email)) {
            setErroEmail("Por favor, insira um e-mail válido.");
            valido = false;
        } else {
            setErroEmail("");
        }

        if (senha.length < 6) {
            setErroSenha("A senha deve ter pelo menos 6 caracteres.");
            valido = false;
        } else {
            setErroSenha("");
        }

        if (!isLogin && senha !== confirmarSenha) {
            setErroConfirmarSenha("As senhas não coincidem.");
            valido = false;
        } else {
            setErroConfirmarSenha("");
        }

        return valido;
    };

    const handleSubmit = async () => {
        if (validarCampos()) {
            try {
                if (isLogin) {
                    const response = await axios.post('http://localhost:3000/autorizacoes/login', {
                        email,
                        senha
                    });
                    console.log("Login realizado:", response.data);
                    
                    // Redireciona para o menu
                    navigate("/TelaPrincipal");
                } else {
                    const response = await axios.post('http://localhost:3000/autorizacoes/register', {
                        nome,
                        email,
                        senha,
                        cargo: "usuario"
                    });
                    console.log("Cadastro realizado:", response.data);
                    setIsLogin(true);
                    setEmail(email);
                    setNome("");
                    setSenha("");
                    setConfirmarSenha("");
                    setErroGeral("Cadastro realizado com sucesso! Faça login.");
                }
            } catch (error) {
                if (error.response) {
                    setErroGeral(error.response.data.message || "Erro ao processar a requisição");
                } else {
                    setErroGeral("Erro de conexão com o servidor");
                }
            }
        }
    };

    const handleAlternarLoginCadastro = () => {
        setIsLogin(!isLogin);
        setErroNome("");
        setErroEmail("");
        setErroSenha("");
        setErroConfirmarSenha("");
        setErroGeral("");
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
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            className={erroNome ? "input-erro" : ""}
                        />
                        {erroNome && <p className="erro">{erroNome}</p>}
                    </div>
                )}
                
                <div className="input-wrapper">
                    <input 
                        type="email" 
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={erroEmail ? "input-erro" : ""}
                    />
                    {erroEmail && <p className="erro">{erroEmail}</p>}
                </div>
                
                <div className="input-wrapper">
                    <input 
                        type="password" 
                        placeholder="Senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className={erroSenha ? "input-erro" : ""}
                    />
                    {erroSenha && <p className="erro">{erroSenha}</p>}
                </div>

                {!isLogin && (
                    <div className="input-wrapper">
                        <input 
                            type="password" 
                            placeholder="Confirme sua senha"
                            value={confirmarSenha}
                            onChange={(e) => setConfirmarSenha(e.target.value)}
                            className={erroConfirmarSenha ? "input-erro" : ""}
                        />
                        {erroConfirmarSenha && <p className="erro">{erroConfirmarSenha}</p>}
                    </div>
                )}

                {erroGeral && <p className="erro-geral">{erroGeral}</p>}

                <button onClick={handleSubmit}>
                    {isLogin ? "Entrar" : "Cadastrar"}
                </button>

                {isLogin && (
                    <a href="#">Esqueci a senha</a>
                )}

                <p>
                    {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
                    <button onClick={handleAlternarLoginCadastro}>
                        {isLogin ? "Cadastre-se" : "Faça login"}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default LoginCadastro;