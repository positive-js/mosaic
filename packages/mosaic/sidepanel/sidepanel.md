`McSidepanelService` используется для открытия боковых панелей.
Эти панели появляются из за границы экрана. Их можно использовать для отображения дополнительной информации без потери контекста
или для выполнения каких-либо действий.

Боковую панель можно вызвать методом `open`, передав в него шаблон:
 
<!-- example(sidepanel-overview) -->

 или компонент для загрузки, а также объект конфигурации, если нужно. 
 
<!-- example(sidepanel-component) -->

Метод `open` возвращает экземпляр класса `McSidepanelRef`:

```ts
const sidepanelRef = sidepanelService.open(ExampleSidepanelComponent, {
    hasBackdrop: false
});
```

`McSidepanelRef` - это ссылка на открытую боковую панель. Она используется для закрытия панели 
и для получения уведомлений при открытии/закрытии панели.

```ts
sidepanelRef.afterClosed().subscribe((result) => {
    console.log(`Sidepanel result: ${result}`); // I was closed
});

sidepanelRef.close('I was closed');
```

Заметьте, что за раз можно открыть несколько боковых панелей. Любой компонент, содержащийся внутри боковой панели
также может использовать `McSidepanelRef`.

###Specifying global configuration defaults
Свойства боковых панелей по-умолчанию можно определить передав экземпляра класса `McSidepanelConfig`
в `MC_SIDEPANEL_DEFAULT_OPTIONS` в корневом модуле вашего приложения.

```ts
@NgModule({
    providers: [
        { provide: MC_SIDEPANEL_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } }
    ]
})
```

###Sharing data with the sidepanel component
Если вы хотите передать некоторые данные в боковую панель, нужно использовать в конфигурации свойство `data`:

```ts
const sidepanelRef = sidepanelService.open(ExampleSidepanelComponent, {
    data: { items: ['One', 'Two', 'Three'] }
});
```

После этого вы можете получить доступ к переданным данным с помощью токена `MC_SIDEPANEL_DATA`:

```ts
import { Component, Inject } from '@angular/core';
import { MC_SIDEPANEL_DATA } from '@ptsecurity/mosaic';

@Component({
    template: 'passed in {{ data.items }}'
})
export class ExampleSidepanelComponent {
    constructor(@Inject(MC_SIDEPANEL_DATA) public data: any) {}
}
```

### Configuring sidepanel content via `entryComponents`
`McSidepanelService` создает экземпляры компонентов во время выполнения. Чтобы это работало,
кампилятору Angular нужна дополнительная информация для создания `ComponentFactory`
для вашего компонента контента боковой панели.

Все компоненты, использующиеся в боковой панели нужно добавить в `entryComponents` в `NgModule`.

```ts
@NgModule({
  imports: [
    // ...
    McSidepanelModule
  ],

  declarations: [
    AppComponent,
    ExampleSidepanelComponent
  ],

  entryComponents: [
    ExampleSidepanelComponent
  ],

  bootstrap: [AppComponent]
})
export class AppModule {}
```

### Sidepanel content
Для структуризации контента боковой панели можно использовать несколько директив:
`<mc-sidepanel-header>`, `<mc-sidepanel-body>`, `<mc-sidepanel-footer>` 
и `<mc-sidepanel-actions>`.

Также, вы можете обозначить кнопку закрытия боковой панели с помощью директивы `mc-sidepanel-close`. Например, кнопка отмены в футере.

```html
<mc-sidepanel-header [closeable]="true">
    Sidepanel Header
</mc-sidepanel-header>
<mc-sidepanel-body class="layout-padding">
    Sidepanel Body
</mc-sidepanel-body>
<mc-sidepanel-footer>
    <mc-sidepanel-actions align="left">
        <button mc-button color="primary" (click)="doAnotherAction()">
            <span>Another Action</span>
        </button>
    </mc-sidepanel-actions>
    <mc-sidepanel-actions align="right">
        <button mc-button color="primary" (click)="doAction()">
            <span>Action</span>
        </button>

        <button mc-button color="second" mc-sidepanel-close>
            <span>Close</span>
        </button>
    </mc-sidepanel-actions>
</mc-sidepanel-footer>
```

#### Keyboard interaction
По-умолчанию, нажатие ESC закроет боковую панел. Хотя это поведение можно отключить с помощью свойства `disableClose`,
этого стоит избегать, чтобы не сломать ожидаемые пользователями паттерны поведения.