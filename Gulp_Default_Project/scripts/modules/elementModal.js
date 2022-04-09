import { isNullOrWhiteSpaces, sleep } from "./general.js";
export default class ElementModal {
    constructor(arg) {
        if (isNullOrWhiteSpaces(arg.contentElementsSelector, arg.modalElementSelector)
            || arg.animationDuration < 0) {
            throw '[ELEMENT-MODAL] Some selector is null or white spaces!';
        }
        this.contentElements = document.querySelectorAll(arg.contentElementsSelector);
        this.modalElement = document.querySelector(arg.modalElementSelector);
        for (let contentEl of this.contentElements) {
            contentEl.addEventListener('mouseenter', () => this.appendModalMenu(contentEl, this.modalElement));
            contentEl.addEventListener('mouseleave', () => this.removeModalMenu(contentEl, arg.animationDuration));
            if (contentEl.tabIndex != -1) {
                contentEl.addEventListener('focus', () => this.appendModalMenu(contentEl, this.modalElement));
                contentEl.addEventListener('blur', () => this.removeModalMenu(contentEl, arg.animationDuration));
            }
        }
    }
    async appendModalMenu(contentElement, modalElement) {
        let modalElementClone = modalElement.cloneNode(true);
        contentElement.append(modalElementClone);
        await sleep(30);
        modalElementClone.classList.remove('_non-active');
    }
    async removeModalMenu(contentElement, animationDuration) {
        // Try to get modal block.
        let modalMenu = contentElement.lastElementChild;
        if (modalMenu) {
            modalMenu.classList.add('_non-active');
            await sleep(animationDuration + 100);
            modalMenu.remove();
        }
    }
}
