document.addEventListener('DOMContentLoaded', () => {
    const ssidInput = document.getElementById('ssid');
    const passwordInput = document.getElementById('password');
    const encryptionSelect = document.getElementById('encryption');
    const hiddenSsidCheckbox = document.getElementById('hiddenSsid');
    const hidePasswordOnCardCheckbox = document.getElementById('hidePasswordOnCard'); // New checkbox
    const generateBtn = document.getElementById('generateBtn');
    const resetBtn = document.getElementById('resetBtn'); // New reset button
    const wifiCardContainer = document.getElementById('wifiCardContainer');
    const qrcodeDiv = document.getElementById('qrcode');
    const cardSsidSpan = document.getElementById('cardSsid');
    const cardPasswordSpan = document.getElementById('cardPassword');
    const downloadBtn = document.getElementById('downloadBtn');
    const captureArea = document.getElementById('captureArea');

    let qrCodeInstance = null;

    function resetForm() {
        ssidInput.value = '';
        passwordInput.value = '';
        encryptionSelect.value = 'WPA'; // Default encryption
        hiddenSsidCheckbox.checked = false;
        hidePasswordOnCardCheckbox.checked = false; // Reset new checkbox

        wifiCardContainer.style.display = 'none';
        downloadBtn.style.display = 'none';
        qrcodeDiv.innerHTML = ''; // Clear QR code
        cardSsidSpan.textContent = '';
        cardPasswordSpan.textContent = '';

        // Reset password visibility toggle if it was changed
        if (passwordInput.type === 'text') {
            togglePasswordVisibility(); // This will set it back to 'password' and update icon
        }
        ssidInput.focus();
    }

    resetBtn.addEventListener('click', resetForm);

    generateBtn.addEventListener('click', () => {
        const ssid = ssidInput.value.trim();
        const password = passwordInput.value;
        const encryption = encryptionSelect.value;
        const isHidden = hiddenSsidCheckbox.checked;
        const hidePasswordDisplay = hidePasswordOnCardCheckbox.checked; // Get state of new checkbox

        if (!ssid) {
            alert('Nama Wi-Fi (SSID) tidak boleh kosong!');
            ssidInput.focus();
            return;
        }

        if (encryption !== 'nopass' && !password && (encryption === 'WPA' || encryption === 'WEP')) {
            alert('Password tidak boleh kosong untuk tipe enkripsi WPA/WEP!');
            passwordInput.focus();
            return;
        }

        const escape = (value) => {
            if (typeof value !== 'string') return '';
            return value.replace(/\\/g, '\\\\')
                        .replace(/;/g, '\\;')
                        .replace(/,/g, '\\,')
                        .replace(/"/g, '\\"')
                        .replace(/:/g, '\\:');
        };

        const S = escape(ssid);
        const P = encryption === 'nopass' ? '' : escape(password);
        const T = encryption;
        const H = isHidden ? 'true' : 'false';

        let wifiString;
        if (T === 'nopass') {
            wifiString = `WIFI:S:${S};T:nopass;`;
            if (isHidden) {
                wifiString += `H:true;`;
            }
            wifiString += ';';
        } else {
            wifiString = `WIFI:T:${T};S:${S};P:${P};`;
            if (isHidden) {
                wifiString += `H:true;`;
            }
            wifiString += ';';
        }

        qrcodeDiv.innerHTML = '';
        try {
            qrCodeInstance = new QRCode(qrcodeDiv, {
                text: wifiString,
                width: 200,
                height: 200,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (error) {
            console.error("Error generating QR Code:", error);
            alert("Gagal membuat kode QR. Periksa konsol untuk detail.");
            return;
        }

        cardSsidSpan.textContent = ssid; // Display original SSID

        // Logic for displaying password on the card
        if (encryption === 'nopass' || !password) {
            cardPasswordSpan.textContent = 'Tidak Ada';
        } else if (hidePasswordDisplay) {
            cardPasswordSpan.textContent = 'Tersembunyi (tetap di QR)';
        } else {
            cardPasswordSpan.textContent = password; // Display original password
        }

        wifiCardContainer.style.display = 'block';
        downloadBtn.style.display = 'inline-block';
        wifiCardContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    downloadBtn.addEventListener('click', () => {
        if (!captureArea || wifiCardContainer.style.display === 'none') {
            alert("Silakan buat kartu Wi-Fi terlebih dahulu.");
            return;
        }

        const originalStyles = {
            margin: captureArea.style.margin,
            boxShadow: captureArea.style.boxShadow
        };
        captureArea.style.margin = '0 auto';
        captureArea.style.boxShadow = 'none';

        html2canvas(captureArea, {
            scale: 2.5,
            useCORS: true,
            backgroundColor: '#ffffff',
            onclone: (documentClone) => {
                const qrClone = documentClone.getElementById('qrcode');
                if (qrClone && qrClone.innerHTML === '' && qrCodeInstance && qrCodeInstance._el.firstChild) {
                    qrClone.appendChild(qrCodeInstance._el.firstChild.cloneNode(true));
                }
            }
        }).then(canvas => {
            const link = document.createElement('a');
            const safeSsid = (ssidInput.value.trim() || 'wifi').replace(/[^a-z0-9]/gi, '_').toLowerCase();
            link.download = `kartu-wifi-${safeSsid}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            captureArea.style.margin = originalStyles.margin;
            captureArea.style.boxShadow = originalStyles.boxShadow;
        }).catch(err => {
            console.error("Error generating image: ", err);
            alert("Gagal mengunduh kartu Wi-Fi.");
            captureArea.style.margin = originalStyles.margin;
            captureArea.style.boxShadow = originalStyles.boxShadow;
        });
    });
});

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.toggle-password');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleIcon.textContent = '👁️';
    }
}