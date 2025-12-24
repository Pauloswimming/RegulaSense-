import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer-container" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-section footer-logo" aria-label="Logo e redes sociais">
          <div className="ciia-logo brand">
            <a href="https://ciia.com.br" target="_blank" rel="noopener noreferrer" aria-label="Ir para site CIIA">
              <img src="/CIIA_CENTRO.png" alt="CIIA - Centro Integrado de Inteligência Artificial" />
            </a>
          </div>
          <div className="ailab-logo brand">
            <a href="https://ailab.unb.br" target="_blank" rel="noopener noreferrer" aria-label="Ir para site AiLab">
              <img src="/ailab.png" alt="AiLab" />
            </a>
          </div>

          <div className="social-media" aria-label="Redes sociais">
            <a href="https://discord.com/invite/YCrgBzuYhb" target="_blank" rel="noopener noreferrer" aria-label="Discord" title="Discord">
              <i className="fab fa-discord" aria-hidden="true"></i>
            </a>
            <a href="https://www.instagram.com/hbr_ciia/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram">
              <i className="fab fa-instagram" aria-hidden="true"></i>
            </a>
            <a href="https://br.linkedin.com/company/hbr-ciia/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn">
              <i className="fab fa-linkedin-in" aria-hidden="true"></i>
            </a>
            <a href="https://www.youtube.com/@HBR_CIIA" target="_blank" rel="noopener noreferrer" aria-label="YouTube" title="YouTube">
              <i className="fab fa-youtube" aria-hidden="true"></i>
            </a>
          </div>
        </div>

        <div className="footer-section footer-contact" aria-label="Contato">
          <h3>Contato</h3>
          <p><strong>Email:</strong> <a href="mailto:ciia@hardware.org.br">ciia@hardware.org.br</a></p>
          <p><strong>Site:</strong> <a href="https://ciia.com.br" target="_blank" rel="noopener noreferrer">ciia.com.br</a></p>
          <div><span className="badge">Centro Integrado • Brasília</span></div>
        </div>

        <div className="footer-section footer-partners" aria-label="Parcerias">
          <h3>Parceria</h3>
          <ul>
            <li><a href="https://www.df.gov.br/" target="_blank" rel="noopener noreferrer">GDF</a></li>
            <li><a href="https://ailab.unb.br" target="_blank" rel="noopener noreferrer">AiLab</a></li>
            <li><a href="https://www.fap.df.gov.br/" target="_blank" rel="noopener noreferrer">FAPDF</a></li>
            <li><a href="https://www.bioticsa.com.br/" target="_blank" rel="noopener noreferrer">BIOTIC</a></li>
            <li><a href="https://universidade.df.gov.br/" target="_blank" rel="noopener noreferrer">UnDF</a></li>
          </ul>
          <p><a href="https://ciia.com.br/ciia/" target="_blank" rel="noopener noreferrer">HBR (saiba mais)</a></p>
        </div>
      </div>

      <div className="footer-bottom" role="note">
        <div>&copy; {new Date().getFullYear()} CIIA — Centro Integrado de Inteligência Artificial. Todos os direitos reservados.</div>
        <div>
          <a href="/politica-de-privacidade" aria-label="Política de Privacidade">Política de Privacidade</a>{" • "}
          <a href="/termos" aria-label="Termos de Uso">Termos de Uso</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
