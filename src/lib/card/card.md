Mosaic cards are controls to display statuses/states/messages.

<!-- example(card-overview) -->

### Properties
There are four properties to interact with control:

| Property           | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| `[status]`        |  Enum value Status(Info, Success, Warning, Error). Default value is Status.Info. It set color visual state of control.|
| `[mode]`        |  There are two values 'color' and 'white'. This affects how the background is displayed. Default value is 'color' |
| `[readonly]`        |  When set to 'true' control is switched to not interactive mode. It can't be focused or selected |
| `[selected]`        |  It switch control to the selected visual state. |

### Events
There is one output event:

| Event           | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| `(selectedChange)`        |  It happens when user click on control and and [readonly] set to 'false'|

### Content
It is possible to add additional content on the left and on the right side from main content
by using attributes 'content-left' and 'content-right'.

### Theming

### Accessibility