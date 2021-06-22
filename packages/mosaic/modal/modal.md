`McModalService` позволяет создавать и управлять модальными окнами.


### Simple modal

С помощью McModalService можно открывать модальные окна трех стандартных типов: `confirm`, `success` и `delete`.
<!-- example(modal-overview) -->

Также можно открыть модальное окно типа `custom` при помощи метода `open()` или создать модальное окно нужного типа методом `create()`.

В методах `McModalService` можно настраивать заголовок, контент и футер модального окна
при помощи свойств: `mcTitle`, `mcContent` и `mcFooter` (за исключением метода `confirm()` с предустановленным `mcFooter`).
Все они могут принимают на вход строку или `TemplateRef`, а в `mcFooter` можно передавать массив параметров кнопок, например:
```
mcFooter: [{
    label: 'button 1',
    type: 'primary',
    loading: () => isLoading,
    onClick: (componentInstance: any) => {
        componentInstance.title = 'title in inner component is changed';
    }
}, {
    label: 'button 2',
    type: 'primary',
    autoFocus: true,
    show: () => isShown,
    onClick: (componentInstance: any) => {
        componentInstance.title = 'title in inner component is changed';
    }
}]
```

### Template modal

<!-- example(modal-template) -->

### Modal with custom component

Свойство mcComponent позволяет передавать в методы `McModalService` кастомный компонент. 
Входные параметры с декоратором Input, определенные в копоненте модального окна, можно передать из методов `open()` и др.
при помощи свойства `mcComponentParams`.

McModalService позволяет подписаться на события при помощи параметров `mcAfterOpen`, `mcAfterClose`, `mcOnOk` и `mcOnCancel`,
или способом, показанным ниже: 

<!-- example(modal-component) -->


### Modal sizes

<!-- example(modal-sizes) -->

### Modal with scrollable body

<!-- example(modal-scroll) -->

### Modal with focused content

<!-- example(modal-focus-content) -->
