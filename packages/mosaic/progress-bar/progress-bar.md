`<mc-progress-bar>` - компонент, отображающий индикатор выполнения.

### Simple progress bar

Элемент `<mc-progress-bar>` может быть использован отдельно для создания горизонтальной линии прогресса с темой Mosaic.

```html
<mc-progress-bar></mc-progress-bar>
```

### Props

#### `value`
Степень заполнения линии, определяющая прогресс, зависит от свойства value.
Его значение может меняться в диапазоне [0, 100].
Значение по-умолчанию: 0

```html
Такое значение заполнит 30% линии
<mc-progress-bar value="30"></mc-progress-bar>
```
<!-- example(progress-bar-overview) -->

#### `mode`
Возможные значения: 'determinate', 'indeterminate'.
Значение по-умолчанию: 'determinate'.  

```html
Для отображения неопределенного по завершенности прогресса:
<mc-progress-bar mode="indeterminate"></mc-progress-bar>
Для отображения определенного по завершенности прогресса:
<mc-progress-bar mode="determinate" value="30"></mc-progress-bar>
```
<!-- example(progress-bar-indeterminate) -->


#### `color`
Возможные значения: 'primary', 'second', 'error'.
Значение по-умолчанию: 'primary'.
Это свойство задает тему элемента.

```html
<mc-progress-bar [color]="'primary'"></mc-progress-bar>
<mc-progress-bar [color]="'second'"></mc-progress-bar>
<mc-progress-bar [color]="'error'"></mc-progress-bar>
```

### Theming
Цвет `<mc-progress-bar>` можно менять с помощью свойства `color`. 
По умолчанию используется установленный в теме цвет `primary`. Его можно изменить на `'second'` или `'error'`.
