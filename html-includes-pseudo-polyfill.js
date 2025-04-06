{
	class HTMLLinkElement extends HTMLElement {
		connectedCallback() {
			if (this.rel === 'include') {
				// Use a benign insertion point for where to insert the HTML
				// content so that the <link> is not visible (including to any
				// inserted scripts or custom elements).
				const commentNode = document.createComment('html-include-insertion-point')
				this.parentNode.insertBefore(commentNode, this)
				this.remove() // Remove the <link> element itself to avoid it being interacted with by inserted scripts or custom elements.

				if (this.href) {
					const xhr = new XMLHttpRequest()
					xhr.open('GET', this.href, false)
					xhr.send()
					const html = xhr.responseText

					// This method will not run script tags.
					// this.insertAdjacentHTML('afterend', html)
					// this.remove()

					// This also does not execute scripts.
					// this.setHTMLUnsafe(html)

					const template = document.createElement('template')
					template.innerHTML = html
					// Append the content of the template to the parent of this element.
					while (template.content.firstChild) {
						let element = template.content.firstChild

						if (element.tagName === 'SCRIPT') {
							const script = document.createElement('script')
							script.text = element.textContent
							element.remove()
							element = script // replace the element with a new script element to execute it.
						}

						commentNode.parentNode.insertBefore(element, commentNode)
					}
				}

				// this.remove()
				commentNode.remove() // Clean up the comment node after includes
			}
		}

		get rel() {
			return this.getAttribute('rel') || ''
		}

		set rel(value) {
			this.setAttribute('rel', value)
		}

		get href() {
			return this.getAttribute('href') || ''
		}

		set href(value) {
			this.setAttribute('href', value)
		}
	}

	customElements.define('x-link', HTMLLinkElement)
}
