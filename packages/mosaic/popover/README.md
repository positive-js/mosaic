# Popover component

## API

| Property               | Description                                                                                                                                                                              | Type                  | Default |
|------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------|---------|
| mcPlacement            | Место для показа относительно элемента, к которому он привязан. Возможные значения: top, bottom, left, right                                                                             | string                | bottom  |
| mcTrigger              | Триггер для показа Возможные значения: hover, manual, click, focus                                                                                                                       | string                | hover   |
| mcVisible              | Ручное управление показом, используется только при mcTrigger="manual"                                                                                                             | boolean               | false   |
| mcPopoverHeader        | Содержимое шапки Обрати  внимание: если используешь строку, то используй аккуратно, желательно  предварительно сделать escape строки, чтобы избежать потенциальной XSS  уязвимости.      | string | ng-template  | –       |
| mcPopoverContent       | Содержимое компонента Обрати  внимание: если используешь строку, то используй аккуратно, желательно  предварительно сделать escape строки, чтобы избежать потенциальной XSS  уязвимости. | string | ng-template  | –       |
| mcPopoverFooter        | Содержимое подвала Обрати  внимание: если используешь строку, то используй аккуратно, желательно  предварительно сделать escape строки, чтобы избежать потенциальной XSS  уязвимости.    | string | ng-template  | –       |
| mcPopoverDisabled      | Флаг для запрета показа                                                                                                                                                                  | boolean               | false   |
| mcPopoverClass         | Добавление своих классов                                                                                                                                                                 | string | string[]     | –       |
| mcVisibleChange        | Callback на изменение видимости компонента                                                                                                                                               | EventEmitter<boolean> | –       |

## Example

```html
<ng-template #customContent>
    Э́йяфьядлайё̀кюдль — шестой по величине ледник Исландии. Расположен на юге Исландии в 125 км к востоку от Рейкьявика. Под этим ледником находится одноимённый вулкан конической формы.
</ng-template>
 
<button
    mcPopover
    mcTrigger="hover"
    mcPlacement="top"
    mcPopoverHeader="Это header"
    [mcPopoverContent]="customContent">
    Найти Эйяфьядлайёкюдль
</button>
```
