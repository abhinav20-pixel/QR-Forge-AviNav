document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu Toggle ---
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('show');
            const icon = mobileBtn.querySelector('i');
            if (navLinks.classList.contains('show')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    }

    // --- Stats Counter Animation (Home Page) ---
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length > 0) {
        const animateCounters = () => {
            statValues.forEach(stat => {
                const target = +stat.getAttribute('data-target');
                const duration = 2000;
                const increment = target / (duration / 16);

                let current = 0;
                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        stat.innerText = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        stat.innerText = target + (target > 500 ? '+' : '');
                    }
                };
                updateCounter();
            });
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statValues.forEach(stat => observer.observe(stat));
    }


    // --- Global QR Code Generation Logic ---
    const qrContainer = document.getElementById('qrcode');
    let qrInstance = null;

    window.triggerGenerateQR = function (dataStr, fgColor = "#000000", bgColor = "#ffffff") {
        if (!qrContainer) return;

        qrContainer.innerHTML = ''; // clear previous

        if (!dataStr || dataStr.trim() === '') {
            qrContainer.innerHTML = '<div style="color:var(--text-muted); text-align:center;">Enter data to generate QR</div>';
            return;
        }

        qrInstance = new QRCode(qrContainer, {
            text: dataStr,
            width: 220,
            height: 220,
            colorDark: fgColor,
            colorLight: bgColor,
            correctLevel: QRCode.CorrectLevel.H
        });

        // Add copyable data dynamically to copyBtn
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) {
            copyBtn.setAttribute('data-clipboard', dataStr);
        }
    }

    if (qrContainer) {
        qrContainer.innerHTML = '<div style="color:var(--text-muted); text-align:center;">Enter data to generate QR</div>';
    }


    // --- Page Specific Generators logic ---

    // 1. UPI Generator
    const generateUpiBtn = document.getElementById('generateUpiBtn');
    if (generateUpiBtn) {
        generateUpiBtn.addEventListener('click', () => {
            const upiId = document.getElementById('upiId').value.trim();
            const payeeName = document.getElementById('payeeName').value.trim();
            const amount = document.getElementById('amount').value.trim();
            const note = document.getElementById('note').value.trim();

            if (!upiId || !payeeName) {
                alert("Please properly fill out the UPI ID and Payee Name.");
                return;
            }

            // upi://pay?pa=ab@cd&pn=Name&am=10.00&cu=INR&tn=Message
            let params = new URLSearchParams();
            params.append('pa', upiId);
            params.append('pn', payeeName);
            if (amount) params.append('am', amount);
            params.append('cu', 'INR');
            if (note) params.append('tn', note);

            // Using pure string concatenation avoiding URLSearchParams encoding full uri prefix nicely
            let upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}`;
            if (amount) upiString += `&am=${encodeURIComponent(amount)}`;
            upiString += `&cu=INR`;
            if (note) upiString += `&tn=${encodeURIComponent(note)}`;

            triggerGenerateQR(upiString);
        });

        // Live preview trigger on input change for dynamic feel
        document.querySelectorAll('#upiForm input').forEach(input => {
            input.addEventListener('input', () => {
                // optional: trigger live generation only if required fields valid
                if (document.getElementById('upiId').value && document.getElementById('payeeName').value) {
                    generateUpiBtn.click();
                }
            });
        });
    }

    // 2. WhatsApp Generator
    const generateWaBtn = document.getElementById('generateWaBtn');
    if (generateWaBtn) {
        generateWaBtn.addEventListener('click', () => {
            const waPhone = document.getElementById('waPhone').value.trim();
            const waMessage = document.getElementById('waMessage').value.trim();

            if (!waPhone) {
                alert("Phone Number is required.");
                return;
            }

            // Format: https://wa.me/1234567890?text=message
            let waString = `https://wa.me/${encodeURIComponent(waPhone)}`;
            if (waMessage) {
                waString += `?text=${encodeURIComponent(waMessage)}`;
            }
            triggerGenerateQR(waString);
        });

        document.querySelectorAll('#waForm input, #waForm textarea').forEach(input => {
            input.addEventListener('input', () => {
                if (document.getElementById('waPhone').value) {
                    generateWaBtn.click();
                }
            });
        });
    }

    // 3. WiFi Generator
    const generateWifiBtn = document.getElementById('generateWifiBtn');
    if (generateWifiBtn) {
        generateWifiBtn.addEventListener('click', () => {
            const ssid = document.getElementById('wifiSsid').value.trim();
            const password = document.getElementById('wifiPassword').value.trim();
            const security = document.getElementById('wifiSecurity').value;
            const hidden = document.getElementById('wifiHidden').checked;

            if (!ssid) {
                alert("SSID (Network Name) is required.");
                return;
            }

            // Format: WIFI:T:WPA;S:mynetwork;P:mypass;;
            let escapeString = (str) => str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/:/g, '\\:');

            let wifiString = `WIFI:T:${security};S:${escapeString(ssid)};`;
            if (security !== 'nopass' && password) {
                wifiString += `P:${escapeString(password)};`;
            } else if (security !== 'nopass' && !password) {
                wifiString += `P:;`;
            }
            if (hidden) wifiString += `H:true;`;
            wifiString += `;`;

            triggerGenerateQR(wifiString);
        });

        document.querySelectorAll('#wifiForm input, #wifiForm select').forEach(input => {
            input.addEventListener('input', () => {
                if (document.getElementById('wifiSsid').value) {
                    generateWifiBtn.click();
                }
            });
        });
    }

    // 4. Universal Generator
    const generateUniBtn = document.getElementById('generateUniBtn');
    if (generateUniBtn) {
        // Tab system
        const tabs = document.querySelectorAll('.tab-btn');
        const contents = document.querySelectorAll('.tab-content');

        let activeTab = 'tab-text';

        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));

                tab.classList.add('active');
                const targetId = tab.getAttribute('data-tab');
                document.getElementById(targetId).classList.add('active');
                activeTab = targetId;

                // Regenerate on tab switch to keep state fresh
                generateUniBtn.click();
            });
        });

        generateUniBtn.addEventListener('click', () => {
            let dataStr = "";
            if (activeTab === 'tab-text') {
                dataStr = document.getElementById('uniText').value.trim();
            } else if (activeTab === 'tab-url') {
                dataStr = document.getElementById('uniUrl').value.trim();
            } else if (activeTab === 'tab-image') {
                dataStr = document.getElementById('uniImage').value.trim();
            }

            const fgColor = document.getElementById('qrColor').value;
            const bgColor = document.getElementById('qrBgColor').value;

            if (!dataStr) {
                qrContainer.innerHTML = '<div style="color:var(--text-muted); text-align:center;">Enter data to generate QR</div>';
                const copyBtn = document.getElementById('copyBtn');
                if (copyBtn) copyBtn.removeAttribute('data-clipboard');
                return;
            }

            triggerGenerateQR(dataStr, fgColor, bgColor);
        });

        document.querySelectorAll('#uniForm input, #uniForm textarea').forEach(input => {
            input.addEventListener('input', () => {
                generateUniBtn.click();
            });
        });
    }

    // --- Action Buttons ---
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (qrContainer && qrContainer.querySelector('img')) {
                const imgUrl = qrContainer.querySelector('img').src;
                if (imgUrl) {
                    const link = document.createElement('a');
                    link.href = imgUrl;
                    link.download = `QR_Forge_AviNav_${new Date().getTime()}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            } else {
                alert("Please generate a QR code to download.");
            }
        });
    }

    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const dataToCopy = copyBtn.getAttribute('data-clipboard');
            if (dataToCopy) {
                navigator.clipboard.writeText(dataToCopy).then(() => {
                    const icon = copyBtn.querySelector('i');
                    const originalClass = icon.className;
                    icon.className = 'fa-solid fa-check';
                    setTimeout(() => { icon.className = originalClass; }, 2000);
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                });
            } else {
                alert("Generate a QR code first to copy its contents.");
            }
        });
    }
});
