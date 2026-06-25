import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginCadastro from "./loginCadastro/LoginCadastro.tsx";
import TelaMenu from "./menu/TelaMenu.tsx";
import Forum from "./menu/elementos/Forum.tsx";
import ChatWindow from './menu/elementos/Chat.tsx';
import '../../src/style.css';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginCadastro />} />
                <Route path="/TelaPrincipal" element={<TelaMenu />} />
                <Route path="/forum" element={<Forum />} />
                <Route path="/chat" element={<ChatWindow conversaId={1} usuarioLogadoId={1} />} />
            </Routes>
        </Router>
    );
}

export default App;
