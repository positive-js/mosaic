Checkboxes определяются с помощью элемента `<mc-checkbox>`.
Нажатие на checkbox или его label переключает состояние checkbox, может быть отмечен, снят или не установлен.

### Label

Label описывает значение, которое будет выбрано. Label является частью элемента `<mc-checkbox>`.

### Label позиционирование

Чтобы разместить Label до или после checkbox, используйте атрибут `[labelPosition]` с
возможными значениями `'before'` и `'after'`. Положение по умолчанию - `'after'`.

```
`<mc-checkbox [labelPosition]="'before'">Left side label</mc-checkbox>`
```

Если вы не хотите, чтобы label отображался рядом с checkbox, вы можете использовать
[`aria-label`](https://www.w3.org/TR/wai-aria/states_and_properties#aria-label) или 
[`aria-labelledby`](https://www.w3.org/TR/wai-aria/states_and_properties#aria-labelledby).

### Использование с `@angular/forms`
`<mc-checkbox>` совместим `@angular/forms` и поддерживает `FormsModule` 
и `ReactiveFormsModule`.

### Dual-state

Dual-state применяется с использованием логического атрибута `[checked]`, чтобы показать,
установлен checkbox или нет.

<!-- example(checkbox-overview) -->

### Indeterminate state (частичный выбор)

Состояние indeterminate применяется с использованием логического атрибута «[indeterminate]» и может использоваться,
когда у вас есть группа параметров, а checkbox более высокого уровня должен отобразить их состояние:
+ если выбраны только некоторые параметры в группе, флажок более высокого уровня отображается частично выбранным (`[indeterminate] =" true "`).
+ если выбраны все, отображается checkbox более высокого уровня.
+ Если ни один не выбран, checkbox более высокого уровня появляется не установленным.

<Можно пример с группой чекбоксов?>
<!-- example(checkbox-indeterminate) -->

### Disabled checkboxes

Вы можете использовать логический атрибут `[disabled]`, чтобы сделать флажок неактивным.

`<mc-checkbox [disabled]="true">Disabled</mc-checkbox>`

### Click action config

Когда пользователь кликает на `mc-checkbox`, поведение по умолчанию переводит в значение `checked` и `indeterminate` to `false`.
Это поведение может быть настроено [добавлением нового значения] (https://angular.io/guide/dependency-injection)
`MC_CHECKBOX_CLICK_ACTION` на checkbox.

```
providers: [
    { provide: MC_CHECKBOX_CLICK_ACTION, useValue: 'check' }
]
```

Возможные значения:

#### `noop`

#### `check`

#### `check-indeterminate`

### Theming  
Цвет `<mc-checkbox>` можно изменить с помощью свойства `color`. По умолчанию checkboxes
имеют цвет акцента темы. Это значение может быть изменено на `'primary'` или `'error'`.

### Accessibility
`<mc-checkbox>` использует `<input type="checkbox">` для обеспечения Accessibility.

Checkboxes без текста или label должны иметь метку `aria-label` или `aria-labelledby`.
