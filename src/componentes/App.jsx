import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TelaPrincipal from "./menu/TelaPrincipal";

import LoginCadastro from "./LoginCadastro";

function App() {
    return (
        <Router>
            <Routes>
                {/* Rota para a tela de login/cadastro */}
                <Route path="/" element={<LoginCadastro />} />

                {/*Menu*/}
                <Route path="/TelaPrincipal" element={<TelaPrincipal />} />
            </Routes>
        </Router>
    );
}

export default App;