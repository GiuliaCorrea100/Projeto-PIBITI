import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginCadastro from "./LoginCadastro";
import CadastroContinuacao from "./CadastroContinuacao";

function App() {
    return (
        <Router>
            <Routes>
                {/* Rota para a tela de login/cadastro */}
                <Route path="/" element={<LoginCadastro />} />

                {/* Rota para a tela de continuação do cadastro */}
                <Route path="/cadastro-continuacao" element={<CadastroContinuacao />} />
            </Routes>
        </Router>
    );
}

export default App;