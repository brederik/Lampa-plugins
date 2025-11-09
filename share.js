(function () {
    const plugin_name = 'share_extension_plus';

    function startPlugin() {
        if (!window.Lampa) return;

        console.log(`[${plugin_name}] Инициализация...`);

        Lampa.Listener.follow('full', function (event) {
            if (event.type === 'complite') {
                const data = event.data;
                const id = data.id || data.imdb_id || data.tmdb_id;
                const title = data.name || data.title || 'Фильм';
                const type = data.movie ? 'movie' : 'tv';
                const url = `https://www.lampa.app/${type}/${id}`;
                const text = `🎬 Смотри "${title}" на Lampa!\n${url}`;

                // Удаляем старую кнопку
                $('.share-button').remove();

                // Создаем кнопку
                const btn = $(`
                    <div class="simple-button selector share-button">
                        <svg style="width:18px;height:18px;margin-right:6px;fill:currentColor" viewBox="0 0 24 24">
                            <path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.7 17.21 8 18 8C19.66 8 21 6.66 21 5S19.66 2 18 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.3 6.79 9 6 9C4.34 9 3 10.34 3 12S4.34 15 6 15C6.79 15 7.5 14.7 8.04 14.19L15.16 18.36C15.11 18.57 15.08 18.79 15.08 19C15.08 20.66 16.42 22 18.08 22C19.74 22 21.08 20.66 21.08 19C21.08 17.34 19.74 16 18.08 16Z"/>
                        </svg>
                        <span>Поделиться</span>
                    </div>
                `);

                $('.full-start').append(btn);

                btn.on('hover:enter', function () {
                    if (navigator.share) {
                        // Современные устройства
                        navigator.share({
                            title: title,
                            text: text,
                            url: url
                        }).catch(err => console.log('Share canceled or failed:', err));
                    } else {
                        // Для браузеров без Web Share API — кастомное меню
                        showShareMenu(title, url, text);
                    }
                });
            }
        });

        console.log(`[${plugin_name}] Расширение успешно загружено.`);
    }

    function showShareMenu(title, url, text) {
        const list = [
            { title: '📱 Telegram', url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
            { title: '💬 WhatsApp', url: `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}` },
            { title: '📞 Viber', url: `viber://forward?text=${encodeURIComponent(text)}` },
            { title: '📘 Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
            { title: '🐦 Twitter', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}` },
            { title: '📋 Скопировать ссылку', copy: true }
        ];

        const items = list.map(item => ({
            title: item.title,
            icon: false,
            onclick: function () {
                if (item.copy) {
                    copyToClipboard(url);
                    Lampa.Noty.show('Ссылка скопирована в буфер обмена');
                } else {
                    window.open(item.url, '_blank');
                }
                Lampa.Modal.close();
            }
        }));

        Lampa.Modal.open({
            title: 'Поделиться',
            size: 'medium',
            html: $('<div class="share-menu"></div>'),
            onBack: Lampa.Modal.close,
            buttons: items
        });
    }

    function copyToClipboard(text) {
        const input = document.createElement('textarea');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', e => {
        if (e.type === 'ready') startPlugin();
    });

})();

