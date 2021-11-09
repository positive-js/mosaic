`<mc-progress-spinner>` - компонент, отображающий индикатор загрузки в виде спиннера.

### Simple progress spinner

Элемент `<mc-progress-spinner>` может быть использован отдельно для создания сектора прогресса с темой Mosaic.

```html
<mc-progress-spinner></mc-progress-spinner>
```
<!-- example(progress-spinner-overview) -->

### Props

#### `value`
Степень заполнения сектора, определяющая прогресс, зависит от свойства value. 
Его значение может меняться в диапазоне [0, 100].
Значение по-умолчанию: 0

```html
Такое значение заполнит 30% сектора
<mc-progress-spinner [value]="30"></mc-progress-spinner>
```

#### `mode`
Возможные значения: 'determinate', 'indeterminate'.
Значение по-умолчанию: 'determinate'.

```html
Для отображения неопределенного по завершенности прогресса:
<mc-progress-spinner [mode]="'indeterminate'"></mc-progress-spinner>
Для отображения определенного по завершенности прогресса:
<mc-progress-spinner [mode]="'determinate'" [value]="30"></mc-progress-spinner>
```
<!-- example(progress-spinner-indeterminate) -->

#### `color`
Возможные значения: 'primary', 'second', 'error'.
Значение по-умолчанию: 'primary'.
Это свойство задает тему элемента.

```html
<mc-progress-spinner [color]="'primary'"></mc-progress-spinner>
<mc-progress-spinner [color]="'second'"></mc-progress-spinner>
<mc-progress-spinner [color]="'error'"></mc-progress-spinner>
```

### Theming
Цвет `<mc-progress-spinner>` можно менять с помощью свойства `color`. 
По умолчанию используется установленный в теме цвет `primary`. Его можно изменить на `'second'` или `'error'`.
