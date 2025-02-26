import React, { useState } from "react";

function LoginCadastro() {

    const [isLogin, setIsLogin] = useState(true);

    return (
        <div>
            <h2>{isLogin ? "Login" : "Cadastre-se"}</h2>
            <input type="email" placeholder="Email"/>
            <input type="password" placeholder="Senha"/>
            {!isLogin && (
                <input type="password" placeholder="Confirme sua senha"/>
            )}
            <button>
                {isLogin ? "Entrar" : "Criar Conta"}
            </button>
            <a href="#">Esqueci minha senha</a>
            <p>
                {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
                <button onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? "Cadastre-se" : "Faça login"}
                </button>
            </p>
        </div>
    );
}

export default LoginCadastro;