import React, { useState } from "react";
import CadastroContinuacao from "./CadastroContinuacao"; // Importe o componente de continuação

function LoginCadastro() {
    const [isLogin, setIsLogin] = useState(false);
    const [mostrarContinuacaoCadastro, setMostrarContinuacaoCadastro] = useState(false);

    const handleCriarContaClick = () => {
        setMostrarContinuacaoCadastro(true); // Mostra a continuação do cadastro
    };

    const handleAlternarLoginCadastro = () => {
        setIsLogin(!isLogin); // Alterna entre login e cadastro
    };

    return (
        <div className="center-container">
            <div className="form-container">
                {mostrarContinuacaoCadastro ? (
                    // Exibe a continuação do cadastro
                    <CadastroContinuacao />
                ) : (
                    // Exibe o formulário de login/cadastro
                    <>
                        <h2>{isLogin ? "Entrar" : "Cadastre-se"}</h2>
                        <input type="email" placeholder="Email" />
                        <input type="password" placeholder="Senha" />
                        {!isLogin && (
                            <input type="password" placeholder="Confirme sua senha" />
                        )}
                        <button onClick={!isLogin ? handleCriarContaClick : undefined}>
                            {isLogin ? "Entrar" : "Criar Conta"}
                        </button>
                        <a href="#">Esqueci minha senha</a>
                        <p>
                            {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
                            <button onClick={handleAlternarLoginCadastro}>
                                {isLogin ? "Cadastre-se" : "Faça login"}
                            </button>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

export default LoginCadastro;