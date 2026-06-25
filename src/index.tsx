import ReactDOM from 'react-dom/client';
import '@fortawesome/fontawesome-svg-core/styles.css'; 

import App from "./componentes/App.tsx";
import "./style.css";

const rootElement = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootElement);

root.render(<App />);