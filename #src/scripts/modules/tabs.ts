import { sleep, elementIsExistWithLog } from "./general.js";

interface TabArgs {
	/**
		Selector for buttons that open some tab content element.
		Must contain `data-toggle-elem-number="numberOfContentElement"`
		`(note, the count starts from zero)`
	*/
	btnsSelector: string
	/** Selector of blocks that contain some tab content.	*/
	contentBlocksSelector: string
	fadeEffect?: boolean
	buttonsActiveClass?: string
	contentActiveClass?: string
	autoHeight?: boolean
	animationDuration?: number
}

export default class Tab {
	private buttons: NodeListOf<HTMLElement>
	private contentElements: NodeListOf<HTMLElement>
	private parentOfContentElements: HTMLElement
	private animationDuration: number
	private isToggling: boolean = false
	private autoHeight: boolean = false
	private containerheight: number = 0
	public buttonsActiveClass: string = 'active'
	public contentActiveClass: string = 'active'

	constructor(arg: TabArgs) {
		if (!elementIsExistWithLog('Tab', arg.btnsSelector, arg.contentBlocksSelector))
			return

		this.buttons = document.querySelectorAll(arg.btnsSelector)
		this.contentElements = document.querySelectorAll(arg.contentBlocksSelector)

		if (this.buttons.length != this.contentElements.length) {
			console.log('[Tab] The count of buttons and content-elements is not equal.')
			return
		}

		if (arg.buttonsActiveClass)
			this.buttonsActiveClass = arg.buttonsActiveClass
		if (arg.contentActiveClass)
			this.contentActiveClass = arg.contentActiveClass

		this.buttons[0].classList.add(this.buttonsActiveClass)
		this.contentElements[0].classList.add(this.contentActiveClass)

		if (arg.autoHeight)
			this.autoHeight = arg.autoHeight

		let someTabElement = document.querySelector<HTMLElement>(arg.contentBlocksSelector)
		this.parentOfContentElements = someTabElement.parentElement

		if (arg.animationDuration) {
			this.animationDuration = arg.animationDuration
		} else {
			this.animationDuration = parseFloat(getComputedStyle(someTabElement)
				.getPropertyValue('transition-duration')) * 1000
		}


		if (arg.fadeEffect) {
			this.setFadeTabs()

			for (let tabButton of this.buttons) {
				tabButton.addEventListener('click', () =>
					this.toggleTabsFade(tabButton)
				)
			}
		} else {
			this.setDefaultTabs()

			for (let tabButton of this.buttons) {
				tabButton.addEventListener('click', () =>
					this.toggleTabs(tabButton)
				)
			}
		}
	}

	private setFadeTabs() {
		let marginForCurrentElement = 0

		for (let contentElement of this.contentElements) {
			if (!this.autoHeight && contentElement.clientHeight > this.containerheight) {
				this.containerheight = contentElement.clientHeight
			} else if (this.autoHeight && this.containerheight <= 0) {
				this.containerheight = this.contentElements[0].clientHeight
			}

			if (contentElement.classList.contains(this.contentActiveClass) == false)
				contentElement.style.opacity = '0'

			contentElement.style.transform = `translateY(-${marginForCurrentElement}px)`
			marginForCurrentElement += contentElement.clientHeight
		}

		this.parentOfContentElements.style.display = 'flex'
		this.parentOfContentElements.style.flexDirection = 'column'
		this.parentOfContentElements.style.overflow = 'hidden'

		this.setContainerHeight(this.containerheight)
		this.parentOfContentElements.style.transition = `height ${this.animationDuration}ms`

		for (let contentElement of this.contentElements) {
			contentElement.style.transition = `opacity ${this.animationDuration}ms`
		}
	}
	private setDefaultTabs() {
		for (let contentElement of this.contentElements) {
			if (contentElement.classList.contains(this.contentActiveClass) == false) {
				contentElement.setAttribute('hidden', '')
				contentElement.style.display = 'none'
				contentElement.style.opacity = '0'
			}
			contentElement.style.transition = `opacity ${this.animationDuration}ms`

			this.setContainerHeight()
			this.parentOfContentElements.style.transition = `height ${this.animationDuration}ms`
		}
	}

	private toggleTabsFade(activeTabButton: HTMLElement) {
		if (this.toggleTogglingStateIfPossible(activeTabButton) == false) {
			return
		}
		this.toggleTabButtons(activeTabButton)

		let currentActiveElement = this.getCurrentActiveTab()
		let nextContentElement = this.getTabByPressedButton(activeTabButton)

		currentActiveElement.style.opacity = '0'
		if (this.autoHeight) {
			this.setContainerHeight(nextContentElement.clientHeight)
		}
		nextContentElement.style.opacity = '1'

		currentActiveElement.classList.remove(this.contentActiveClass)
		nextContentElement.classList.add(this.contentActiveClass)

		setTimeout(() => {
			this.isToggling = false
		}, this.animationDuration)
	}
	private async toggleTabs(activeTabButton: HTMLElement) {
		if (this.toggleTogglingStateIfPossible(activeTabButton) == false) {
			return
		}
		this.toggleTabButtons(activeTabButton)

		let currentActiveElement = this.getCurrentActiveTab()
		let nextContentElement = this.getTabByPressedButton(activeTabButton)

		currentActiveElement.classList.remove(this.contentActiveClass)
		currentActiveElement.style.opacity = '0'
		await sleep(this.animationDuration)
		currentActiveElement.setAttribute('hidden', '')
		currentActiveElement.style.display = 'none'


		nextContentElement.removeAttribute('hidden')
		nextContentElement.style.display = ''
		this.setContainerHeight(nextContentElement.clientHeight)

		await sleep(20)
		nextContentElement.style.opacity = '1'
		nextContentElement.classList.add(this.contentActiveClass)

		setTimeout(() => {
			this.isToggling = false
		}, this.animationDuration)
	}

	private toggleTabButtons(activeTabButton: HTMLElement) {
		for (let accordBtn of this.buttons) {
			if (accordBtn != activeTabButton) {
				accordBtn.classList.remove(this.buttonsActiveClass)
			} else {
				accordBtn.classList.add(this.buttonsActiveClass)
			}
		}
	}
	private toggleTogglingStateIfPossible(activeTabButton: HTMLElement): boolean {
		if (activeTabButton.classList.contains(this.buttonsActiveClass) || this.isToggling) {
			return false
		} else {
			this.isToggling = true;
			return true
		}
	}
	private getCurrentActiveTab(): HTMLElement {
		for (let contElem of this.contentElements) {
			if (contElem.classList.contains(this.contentActiveClass)) {
				return contElem
			}
		}
	}
	private getTabByPressedButton(activeTabButton: HTMLElement): HTMLElement {
		return this.contentElements[activeTabButton.dataset.toggleElemNumber]
	}
	private setContainerHeight(height?: number) {
		if (height) {
			this.parentOfContentElements.style.height = `${height}px`
		} else {
			this.parentOfContentElements.style.height = `${this.contentElements[0].clientHeight}px`
		}
	}
}