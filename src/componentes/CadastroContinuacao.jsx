import React, { useState } from "react";

function CadastroContinuacao() {

    const [aceitaProximas, setAceitaProximas] = useState(false);
    return (
        <div className="center-container">
            <div className="form-container">
                <h2>Complete seu Cadastro</h2>

                <div className="profile-picture-container">
                    <div className="profile-picture">
                        <span>+</span>
                        <input type="file" accept="image/*" style={{ display: "none" }} />
                    </div>
                </div>

                <input type="text" placeholder="Cargo" />

                <div className="institution-container">
                    <input type="text" placeholder="Instituição Atual" />
                    <div className="arrow">→</div>
                    <input type="text" placeholder="Instituição Destino" />
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
            </div>
        </div>
    );
}

export default CadastroContinuacao;