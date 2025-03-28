import React, { useState } from "react";
import "../style.css";
import { useNavigate } from "react-router-dom";

function CadastroContinuacao() {

    const [aceitaProximas, setAceitaProximas] = useState(false);

    const navigate = useNavigate();
    const handleVoltarParaLogin = () => {
        navigate("/");
    }
    
    return (
        <div className="center-container">
            <div className="form-container">
                <h2>Complete seu Cadastro</h2>

                <div className="input-wrapper">
                <input 
                    type="text" 
                    placeholder="Cargo" 
                />
                </div>

                <div className="input-wrapper">
                    <input 
                        type="text" 
                        placeholder="Instituição Atual"
                    />
                </div>

                <div className="checkbox-container">
                    <label>
                        <input
                            type="checkbox"
                            checked={aceitaProximas}
                            onChange={(e) => setAceitaProximas(e.target.checked)}
                        />
                        Aceito receber sugestões de instituições próximas
                    </label>
                </div>
                <button>Finalizar Cadastro</button>
                <button 
                    onClick={handleVoltarParaLogin} 
                    className="voltar-login">
                    Voltar para tela de login
                </button>
            </div>
        </div>
    );
}

export default CadastroContinuacao;