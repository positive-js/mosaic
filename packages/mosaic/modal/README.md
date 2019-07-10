The dialog is currently divided into 3 modes - `default`, `confirm box`, `custom`.


#### Using service to create Confirm Mode

```ts
showConfirm() {
    this.modalService.success({
        mcContent   : 'Save changes made to the request "All assets with Windows"?',
        mcOkText    : 'Save',
        mcCancelText: 'Cancel',
        mcOnOk      : () => console.log('OK')
    });
}
```

#### Using service to open modal Custom Mode

```ts
let dialogRef = modalService.open({
    mcComponent: CustomComponent
});
```

```ts
@Component({/* ... */})
export class CustomComponent {
    constructor(private dialogRef: McModalRef) { }

    closeDialog() {
        this.modal.destroy({ data: 'this the result data' });
    }
}
```