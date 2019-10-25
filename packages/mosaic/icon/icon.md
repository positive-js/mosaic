### Установка
Обратите внимание, что Mosaic Icons - это необязательный пакет, и его следует установить вручную.

##### NPM
```
npm install @ptsecurity/mosaic-icons --save
```

##### Yarn
```
yarn add @ptsecurity/mosaic-icons
```

Затем вы должны импортировть стили:
```
@import "~@ptsecurity/mosaic-icons/dist/styles/mc-icons.css";
```

И импортируйте McIconModule в ваш модуль.

```
import { McIconModule } from '@ptsecurity/mosaic';
```

Если *.css не используется вашем проекте, вы также можете добавить:

- mc-icons.less;
- mc-icons.scss;
- mc-icons-embed.css (включает встроенные шрифты)

### Примеры использования

Есть два варианта использования иконок:

1. Добавить атрибут `[color]`, используя следующие значения: *primary*, *second*, *error*.

```
<i mc-icon="mc-gear_16" color="primary"></i>
```

2. Более простой способ
```
<i class="mc mc-gear_16"></i>
```