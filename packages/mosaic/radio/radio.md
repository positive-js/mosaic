`<mc-radio>` обеспечивает ту же функциональность, что и нативный `<input type="radio">`.

<!-- example(radio-overview) -->

### Radio группы
Radio-buttons обычно должны располагаться внутри `<mc-radio-group>`, если это позволяет структура DOM
(например, radio-buttons внутри ячеек таблицы). Радио-группа имеет
свойство `value`, которое отражает выбранный в данный момент переключатель внутри группы.

Отдельные radio-buttons внутри радиогруппы унаследуют «имя» группы.


### Использование с `@angular/forms`
`<mc-radio-group>` совместимо с `@angular/forms` и поддерживает `FormsModule`
и `ReactiveFormsModule`.

### Accessibility

Для обеспечения accessible `<mc-radio-button>` использует тип radio `<input type ="radio">`.
Эта внутренняя radio button получает фокус и автоматически помечается текстовым содержимым
`<mc-radio-button>`.