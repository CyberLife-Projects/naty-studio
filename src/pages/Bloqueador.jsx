import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import './Bloqueador.css';

const Bloqueador = () => {
  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const { isPaginaBloqueada, bloquearPagina, desbloquearPagina } = useApp();

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (token === 'cyberlife') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Token inválido!');
    }
  };

  const handleBloquear = () => {
    bloquearPagina();
    alert('Página bloqueada com sucesso!');
  };

  const handleDesbloquear = () => {
    desbloquearPagina();
    alert('Página desbloqueada com sucesso!');
  };

  if (!isAuthenticated) {
    return (
      <div className="bloqueador-container">
        <div className="bloqueador-login-box">
          <h1>Painel de Bloqueio - Admin</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Token de Acesso:</label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Digite o token"
                className="token-input"
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="login-btn">
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bloqueador-container">
      <div className="bloqueador-painel">
        <h1>Painel de Controle de Bloqueio</h1>
        <div className="status-box">
          <h2>Status da Página Profissional:</h2>
          <p className={isPaginaBloqueada ? 'status bloqueada' : 'status desbloqueada'}>
            {isPaginaBloqueada ? '🔒 BLOQUEADA' : '🔓 DESBLOQUEADA'}
          </p>
        </div>
        <div className="botoes-controle">
          <button 
            onClick={handleBloquear} 
            className="btn-bloquear"
            disabled={isPaginaBloqueada}
          >
            🔒 Bloquear Página
          </button>
          <button 
            onClick={handleDesbloquear} 
            className="btn-desbloquear"
            disabled={!isPaginaBloqueada}
          >
            🔓 Desbloquear Página
          </button>
        </div>
      </div>
    </div>
  );
};

export default Bloqueador;
