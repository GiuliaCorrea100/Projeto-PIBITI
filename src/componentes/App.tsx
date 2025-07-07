import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginCadastro from "./loginCadastro/LoginCadastro.tsx";
import TelaMenu from "./menu/TelaMenu.tsx";
import '../../src/style.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginCadastro />} />
                <Route path="/TelaPrincipal" element={<TelaMenu />} />
            </Routes>
        </Router>
    );
}

export default App;
