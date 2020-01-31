import { DOCUMENT } from '@angular/common';
import {
    Inject,
    Injectable,
    OnDestroy
} from '@angular/core';

import { addAriaReferencedId, getAriaReferenceIds, removeAriaReferencedId } from './aria-reference';


/**
 * Interface used to register message elements and keep a count of how many registrations have
 * the sa me  messag'rxjs'the reference to the message element used for the `aria-describedby`.
 */
// tslint:disable-next-line naming-convention
export interface RegisteredMessage {
    /** The element containing the message. */
    messageElement: Element;

    /** The number of elements that reference this message element via `aria-describedby`. */
    referenceCount: number;
}

/** ID used for the body container where all messages are appended. */
export const MESSAGES_CONTAINER_ID = 'cdk-describedby-message-container';

/** ID prefix used for each created message element. */
export const CDK_DESCRIBEDBY_ID_PREFIX = 'cdk-describedby-message';

/** Attribute given to each host element that is described by a message element. */
export const CDK_DESCRIBEDBY_HOST_ATTRIBUTE = 'cdk-describedby-host';

/** Global incremental identifier for each registered message element. */
let nextId = 0;

/** Global map of all registered message elements that have been placed into the document. */
const messageRegistry = new Map<string, RegisteredMessage>();

/** Container for all registered messages. */
let messagesContainer: HTMLElement | null = null;

/**
 * Utility that creates visually hidden elements with a message content. Useful for elements that
 * want to use aria-describedby to further describe themselves without adding additional visual
 * content.
 * @docs-private
 */
@Injectable({providedIn: 'root'})
export class AriaDescriber implements OnDestroy {
    private document: Document;

    constructor(@Inject(DOCUMENT) document: any) {
        this.document = document;
    }

    /**
     * Adds to the host element an aria-describedby reference to a hidden element that contains
     * the message. If the same message has already been registered, then it will reuse the created
     * message element.
     */
    describe(hostElement: Element, message: string) {
        if (!this.canBeDescribed(hostElement, message)) {
            return;
        }

        if (!messageRegistry.has(message)) {
            this.createMessageElement(message);
        }

        if (!this.isElementDescribedByMessage(hostElement, message)) {
            this.addMessageReference(hostElement, message);
        }
    }

    /** Removes the host element's aria-describedby reference to the message element. */
    removeDescription(hostElement: Element, message: string) {
        if (!this.isElementNode(hostElement)) {
            return;
        }

        if (this.isElementDescribedByMessage(hostElement, message)) {
            this.removeMessageReference(hostElement, message);
        }

        const registeredMessage = messageRegistry.get(message);
        if (registeredMessage && registeredMessage.referenceCount === 0) {
            this.deleteMessageElement(message);
        }

        if (messagesContainer && messagesContainer.childNodes.length === 0) {
            this.deleteMessagesContainer();
        }
    }

    /** Unregisters all created message elements and removes the message container. */
    ngOnDestroy() {
        const describedElements =
            Array.from(this.document.querySelectorAll(`[${CDK_DESCRIBEDBY_HOST_ATTRIBUTE}]`));

        describedElements.forEach((element) => {
            this.removeCdkDescribedByReferenceIds(element);
            element.removeAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE);
        });

        if (messagesContainer) {
            this.deleteMessagesContainer();
        }

        messageRegistry.clear();
    }

    /**
     * Creates a new element in the visually hidden message container element with the message
     * as its content and adds it to the message registry.
     */
    private createMessageElement(message: string) {
        const messageElement = this.document.createElement('div');
        messageElement.setAttribute('id', `${CDK_DESCRIBEDBY_ID_PREFIX}-${nextId++}`);
        messageElement.appendChild(this.document.createTextNode(message));

        this.createMessagesContainer();
        messagesContainer!.appendChild(messageElement);

        messageRegistry.set(message, {messageElement, referenceCount: 0});
    }

    /** Deletes the message element from the global messages container. */
    private deleteMessageElement(message: string) {
        const registeredMessage = messageRegistry.get(message);
        const messageElement = registeredMessage && registeredMessage.messageElement;
        if (messagesContainer && messageElement) {
            messagesContainer.removeChild(messageElement);
        }
        messageRegistry.delete(message);
    }

    /** Creates the global container for all aria-describedby messages. */
    private createMessagesContainer() {
        if (!messagesContainer) {
            const preExistingContainer = this.document.getElementById(MESSAGES_CONTAINER_ID);

            // When going from the server to the client, we may end up in a situation where there's
            // already a container on the page, but we don't have a reference to it. Clear the
            // old container so we don't get duplicates. Doing this, instead of emptying the previous
            // container, should be slightly faster.
            if (preExistingContainer) {
                preExistingContainer.parentNode!.removeChild(preExistingContainer);
            }

            messagesContainer = this.document.createElement('div');
            messagesContainer.id = MESSAGES_CONTAINER_ID;
            messagesContainer.setAttribute('aria-hidden', 'true');
            messagesContainer.style.display = 'none';
            this.document.body.appendChild(messagesContainer);
        }
    }

    /** Deletes the global messages container. */
    private deleteMessagesContainer() {
        if (messagesContainer && messagesContainer.parentNode) {
            messagesContainer.parentNode.removeChild(messagesContainer);
            messagesContainer = null;
        }
    }

    /** Removes all cdk-describedby messages that are hosted through the element. */
    private removeCdkDescribedByReferenceIds(element: Element) {
        // Remove all aria-describedby reference IDs that are prefixed by CDK_DESCRIBEDBY_ID_PREFIX
        const originalReferenceIds = getAriaReferenceIds(element, 'aria-describedby')
            .filter((id) => id.indexOf(CDK_DESCRIBEDBY_ID_PREFIX) !== 0);
        element.setAttribute('aria-describedby', originalReferenceIds.join(' '));
    }

    /**
     * Adds a message reference to the element using aria-describedby and increments the registered
     * message's reference count.
     */
    private addMessageReference(element: Element, message: string) {
        const registeredMessage = messageRegistry.get(message)!;

        // Add the aria-describedby reference and set the
        // describedby_host attribute to mark the element.
        addAriaReferencedId(element, 'aria-describedby', registeredMessage.messageElement.id);
        element.setAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE, '');

        registeredMessage.referenceCount++;
    }

    /**
     * Removes a message reference from the element using aria-describedby
     * and decrements the registered message's reference count.
     */
    private removeMessageReference(element: Element, message: string) {
        const registeredMessage = messageRegistry.get(message)!;
        registeredMessage.referenceCount--;

        removeAriaReferencedId(element, 'aria-describedby', registeredMessage.messageElement.id);
        element.removeAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE);
    }

    /** Returns true if the element has been described by the provided message ID. */
    private isElementDescribedByMessage(element: Element, message: string): boolean {
        const referenceIds = getAriaReferenceIds(element, 'aria-describedby');
        const registeredMessage = messageRegistry.get(message);
        const messageId = registeredMessage && registeredMessage.messageElement.id;

        return !!messageId && referenceIds.indexOf(messageId) !== -1;
    }

    /** Determines whether a message can be described on a particular element. */
    private canBeDescribed(element: Element, message: string): boolean {
        if (!this.isElementNode(element)) {
            return false;
        }

        const trimmedMessage = message == null ? '' : `${message}`.trim();
        const ariaLabel = element.getAttribute('aria-label');

        // We shouldn't set descriptions if they're exactly the same as the `aria-label` of the element,
        // because screen readers will end up reading out the same text twice in a row.
        return trimmedMessage ? (!ariaLabel || ariaLabel.trim() !== trimmedMessage) : false;
    }

    /** Checks whether a node is an Element node. */
    private isElementNode(element: Node): element is Element {
        return element.nodeType === this.document.ELEMENT_NODE;
    }
}
