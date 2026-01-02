/* public/widget-uzo.js */
(function () {
    const script = document.currentScript;
    const roomId = script.getAttribute('data-room-id') || 'r1';
    const baseUrl = 'http://localhost:5173/login'; // Canlıya çıkınca burası render/vercel linki olacak

    // Widget Konteyneri
    const container = document.createElement('div');
    container.id = 'chatuzo-widget-root';
    container.style.cssText = 'position:fixed; bottom:20px; right:20px; z-index:2147483647; font-family: sans-serif;';

    // Iframe
    const iframe = document.createElement('iframe');
    iframe.src = `${baseUrl}/embed/chat/${roomId}`;
    iframe.style.cssText = 'width:380px; height:550px; border:none; border-radius:16px; box-shadow:0 12px 40px rgba(0,0,0,0.15); display:none; transition: all 0.3s ease;';

    // Aç/Kapat Butonu
    const button = document.createElement('button');
    button.innerHTML = '💬'; // Buraya kendi logonun SVG'sini koyabilirsin
    button.style.cssText = 'width:60px; height:60px; border-radius:30px; background:#4f46e5; color:white; border:none; cursor:pointer; float:right; margin-top:15px; font-size:28px; shadow:0 4px 12px rgba(0,0,0,0.2);';

    let isOpen = false;
    button.onclick = () => {
        isOpen = !isOpen;
        iframe.style.display = isOpen ? 'block' : 'none';
        button.innerHTML = isOpen ? '✕' : '💬';
    };

    container.appendChild(iframe);
    container.appendChild(button);
    document.body.appendChild(container);
})();