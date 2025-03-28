import React, { useState } from "react";
import CadastroContinuacao from "./CadastroContinuacao";
import "../style.css";
import { useNavigate } from "react-router-dom";

function LoginCadastro() {
    const [isLogin, setIsLogin] = useState(true);
    const [mostrarContinuacaoCadastro, setMostrarContinuacaoCadastro] = useState(false);

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [erroEmail, setErroEmail] = useState("");
    const [erroSenha, setErroSenha] = useState("");
    const [erroConfirmarSenha, setErroConfirmarSenha] = useState("");

    const navigate = useNavigate();

    const validarCampos = () => {
        let valido = true;

        // Validação do email
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(email)) {
            setErroEmail("Por favor, insira um e-mail válido.");
            valido = false;
        } else {
            setErroEmail("");
        }

        // Validação da senha
        if (senha.length < 6) {
            setErroSenha("A senha deve ter pelo menos 6 caracteres.");
            valido = false;
        } else {
            setErroSenha("");
        }

        // Validação da confirmação de senha (apenas na tela de cadastro)
        if (!isLogin && senha !== confirmarSenha) {
            setErroConfirmarSenha("As senhas não estão iguais.");
            valido = false;
        } else {
            setErroConfirmarSenha("");
        }

        return valido;
    };

    const handleCriarContaClick = () => {
        if (!isLogin && validarCampos()) {
            navigate("/cadastro-continuacao");
        }
    };

    const handleAlternarLoginCadastro = () => {
        setIsLogin(!isLogin);
    };

    return (
        <div className="center-container">
            <div className="form-container">
                        <h2>{isLogin ? "Entrar" : "Cadastre-se"}</h2>
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
                            <>
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
                            </>
                        )}

                        <button onClick={!isLogin ? handleCriarContaClick : null}>
                            {isLogin ? "Entrar" : "Criar Conta"}
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