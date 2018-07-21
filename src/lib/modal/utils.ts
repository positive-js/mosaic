export interface IClickPosition {
    x: number;
    y: number;
}

export class ModalUtil {

    private lastPosition: IClickPosition;

    constructor(private document: Document) {
        this.listenDocumentClick();
    }

    getLastClickPosition(): IClickPosition {
        return this.lastPosition;
    }

    listenDocumentClick(): void {
        this.document.addEventListener('click', (event: MouseEvent) => {
            this.lastPosition = { x: event.clientX, y: event.clientY };
        });
    }
}

export default new ModalUtil(document);
