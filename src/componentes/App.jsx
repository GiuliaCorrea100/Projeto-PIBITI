import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginCadastro from "./LoginCadastro";
import CadastroContinuacao from "./CadastroContinuacao";

function App() {
    return (
        <div>
        <LoginCadastro />
        <CadastroContinuacao />
        </div>
    );
}

export default App;