import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginCadastro from "./loginCadastro/LoginCadastro.tsx";
import TelaMenu from "./menu/TelaMenu.tsx";
import '../../src/style.css';
import Forum from "./menu/elementos/Forum.tsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginCadastro />} />
                <Route path="/TelaPrincipal" element={<TelaMenu />} />
                <Route path="/forum" element={<Forum />} />
            </Routes>
        </Router>
    );
}

export default App;
