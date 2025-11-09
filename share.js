(function () {
    // Название расширения
    const plugin_name = 'share_extension';

    function startPlugin() {
        // Проверяем, что Lampa загружена
        if (!window.Lampa) return;

        console.log(`[${plugin_name}] Загружается расширение...`);

        // Добавляем кнопку "Поделиться" в карточку фильма
        Lampa.Listener.follow('full', function (event) {
            if (event.type === 'complite') {
                const data = event.data;
                const id = data.id || data.imdb_id || data.tmdb_id;
                const title = data.name || data.title || 'Фильм';
                const type = data.movie ? 'movie' : 'tv';

                // Убираем старую кнопку, если есть
                $('.share-button').remove();

                // Создаем кнопку
                const btn = $('<div class="simple-button selector share-button"><span>Поделиться</span></div>');
                $('.full-start').append(btn);

                // Обработчик клика
                btn.on('hover:enter', function () {
                    const url = `https://www.lampa.app/${type}/${id}`;
                    const shareText = `🎬 Смотри "${title}" на Lampa!\n${url}`;

                    // Проверка поддержки Web Share API
                    if (navigator.share) {
                        navigator.share({
                            title: title,
                            text: `🎬 ${title}`,
                            url: url
                        }).catch(err => console.log('Share canceled or failed:', err));
                    } else {
                        // Альтернатива — копирование ссылки
                        copyToClipboard(url);
                        Lampa.Noty.show('Ссылка скопирована в буфер обмена');
                    }
                });
            }
        });

        console.log(`[${plugin_name}] Расширение успешно загружено.`);
    }

    // Функция копирования в буфер обмена
    function copyToClipboard(text) {
        const input = document.createElement('textarea');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
    }

    // Запуск
    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') startPlugin();
    });

})();
