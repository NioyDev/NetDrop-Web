/**
 * NetDrop-Web - Calculadora de Chunks y Asistente de Problemas
 */

// 1. Calculadora de Fragmentos (2 MB)
export function initChunkCalculator() {
  const slider = document.getElementById('chunk-size-slider');
  const sizeDisplay = document.getElementById('chunk-size-display');
  const countDisplay = document.getElementById('chunk-count-display');
  const ramDisplay = document.getElementById('chunk-ram-display');

  if (!slider || !sizeDisplay || !countDisplay) return;

  function update() {
    const mb = parseInt(slider.value, 10);
    const chunks = Math.ceil(mb / 2);
    sizeDisplay.textContent = `${mb} MB`;
    countDisplay.textContent = `${chunks} fragmentos`;
    if (ramDisplay) {
      ramDisplay.textContent = 'Máx 2 MB en RAM móvil';
    }
  }

  slider.addEventListener('input', update);
  update();
}

// 2. Asistente Interactivo de Solución de Problemas
export function initTroubleshootWizard() {
  const container = document.getElementById('troubleshoot-wizard');
  if (!container) return;

  const state = {
    sameWifi: null,
    firewallOk: null,
    vpnActive: null,
    ipCorrect: null
  };

  const questionEl = container.querySelector('.wizard-question');
  const btnYes = container.querySelector('.wizard-btn-yes');
  const btnNo = container.querySelector('.wizard-btn-no');
  const btnReset = container.querySelector('.wizard-btn-reset');
  const resultBox = container.querySelector('.wizard-result-box');
  const resultTitle = container.querySelector('.wizard-result-title');
  const resultText = container.querySelector('.wizard-result-text');

  let currentQ = 1;

  function renderQuestion() {
    if (resultBox) resultBox.style.display = 'none';

    if (currentQ === 1) {
      questionEl.textContent = '1. ¿Están ambos dispositivos conectados exactamente a la misma red Wi-Fi?';
    } else if (currentQ === 2) {
      questionEl.textContent = '2. ¿El Firewall de tu PC tiene permitido el puerto TCP 5000?';
    } else if (currentQ === 3) {
      questionEl.textContent = '3. ¿Tienes alguna VPN activa en el celular o en la computadora?';
    } else if (currentQ === 4) {
      questionEl.textContent = '4. ¿La dirección IP mostrada (ej. 192.168.x.x) coincide con la de tu adaptador Wi-Fi?';
    }
  }

  function showResult(title, text) {
    if (resultBox && resultTitle && resultText) {
      resultTitle.textContent = title;
      resultText.innerHTML = text;
      resultBox.style.display = 'block';
    }
  }

  if (btnYes && btnNo) {
    btnYes.addEventListener('click', () => {
      if (currentQ === 1) {
        currentQ = 2;
        renderQuestion();
      } else if (currentQ === 2) {
        currentQ = 3;
        renderQuestion();
      } else if (currentQ === 3) {
        // VPN activa es causa de error
        showResult('Solución: Desactiva la VPN', 'Las VPN desvían el tráfico fuera de tu red local e impiden que el teléfono alcance la IP privada de la PC. Desactiva la VPN temporalmente.');
      } else if (currentQ === 4) {
        showResult('Conexión Verificada', 'Tu configuración de red es correcta. Si aún no carga, es posible que el router tenga activo el "Aislamiento de clientes Wi-Fi (AP Isolation)". Usa la zona Wi-Fi portátil de tu celular o PC.');
      }
    });

    btnNo.addEventListener('click', () => {
      if (currentQ === 1) {
        showResult('Solución: Conéctate a la misma red', 'NetDrop funciona únicamente dentro de la misma red local. Conecta tanto la PC como el teléfono a la misma red Wi-Fi o crea una zona portátil.');
      } else if (currentQ === 2) {
        showResult('Solución: Habilita el puerto 5000', 'En Windows, pulsa "Permitir acceso" en el aviso del Firewall o ejecuta en Linux: <code>sudo ufw allow 5000/tcp</code>.');
      } else if (currentQ === 3) {
        currentQ = 4;
        renderQuestion();
      } else if (currentQ === 4) {
        showResult('Solución: Selecciona la IP correcta', 'Si tienes adaptadores virtuales (como VirtualBox, WSL o Docker), NetDrop puede haber detectado la IP equivocada. En los ajustes de NetDrop, selecciona tu adaptador Wi-Fi físico.');
      }
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      currentQ = 1;
      renderQuestion();
    });
  }

  renderQuestion();
}

document.addEventListener('DOMContentLoaded', () => {
  initChunkCalculator();
  initTroubleshootWizard();
});
