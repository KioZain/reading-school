import {createRoot} from 'react-dom/client';import App from './App';import './styles.css';
document.addEventListener('keydown',()=>{document.documentElement.dataset.input='keyboard'});
document.addEventListener('pointerdown',()=>{document.documentElement.dataset.input='pointer'},{capture:true});createRoot(document.getElementById('root')!).render(<App/>);
