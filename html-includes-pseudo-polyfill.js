{
	class HTMLTemplateElement extends HTMLElement {
		#template = document.createElement('template')

		get innerHTML() {
			return this.#template.innerHTML
		}

		set innerHTML(html) {
			this.#template.innerHTML = html
		}

		get content() {
			return this.#template.content
		}

		get shadowRootMode() {
			const val = this.getAttribute('shadowrootmode')
			return ['open', 'closed'].includes(val) ? val : ''
		}

		set shadowRootMode(value) {
			this.setAttribute('shadowrootmode', value)
		}

		get inlined() {
			return this.hasAttribute('inlined')
		}

		set inlined(value) {
			if (value) this.setAttribute('inlined', '')
			else this.removeAttribute('inlined')
		}

		get src() {
			return this.getAttribute('src') || ''
		}

		set src(value) {
			this.setAttribute('src', value)
		}

		get #nativeInnerHTML() {
			return super.innerHTML // get the native innerHTML of our custom element
		}

		#fetchOrGetHtml() {
			return this.src ? fetchHTMLSync(this.src) : this.#nativeInnerHTML
		}

		connectedCallback() {
			if (this.inlined) {
				// inlined template

				if (this.shadowRootMode) throw new Error('A shadowroot template cannot also be an inlined template.')

				// Use a mostly benign comment as an insertion point for where
				// to insert the HTML content so that the <template> is not
				// visible to included content (f.e. any inserted scripts or
				// custom elements).
				const commentNode = document.createComment('html-include-insertion-point')
				this.parentNode.insertBefore(commentNode, this)
				this.remove() // Remove the <template> element itself to avoid it being interacted with by inserted scripts or custom elements.

				this.#template.innerHTML = this.#fetchOrGetHtml()

				// Append the content of the template to the parent of this element.
				while (this.content.firstChild) {
					let element = this.content.firstChild

					if (element.tagName === 'SCRIPT') {
						const script = document.createElement('script')
						script.text = element.textContent
						element.remove()
						element = script // replace the element with a new script element to execute it.
					}

					commentNode.parentNode.insertBefore(element, commentNode)
				}

				commentNode.remove() // Clean up the comment node after includes
			} else if (this.shadowRootMode) {
				// shadowroot template

				const parent = this.parentElement
				this.remove()
				const root = (() => {
					try {
						console.log('Attaching shadow root with mode:', this.shadowRootMode)
						return parent.attachShadow({mode: this.shadowRootMode})
					} catch (e) {
						console.error('A second declarative shadow root cannot be created on a host.')
					}
				})()
				if (!root) return

				root.innerHTML = this.#fetchOrGetHtml()

				// This is as close as we can get to native <template> without access to parsing (afaik). Synchronous script tags will not see template content, they should wait for DOMContentLoaded.
				if (!this.src) requestAnimationFrame(() => (root.innerHTML = this.#nativeInnerHTML))
			} else {
				// inert template

				this.#template.innerHTML = this.#fetchOrGetHtml()

				// This is as close as we can get to native <template> without access to parsing (afaik). Synchronous script tags will not see template content, they should wait for DOMContentLoaded.
				if (!this.src) requestAnimationFrame(() => (this.#template.innerHTML = this.#nativeInnerHTML))
			}
		}
	}

	customElements.define('x-template', HTMLTemplateElement)
}

function fetchHTMLSync(url) {
	const xhr = new XMLHttpRequest()
	xhr.open('GET', url, false)
	xhr.send()
	if (xhr.status !== 200) {
		console.error(`Failed to fetch template src ${url}: ${xhr.status} ${xhr.statusText}`)
		return ''
	}
	return xhr.responseText
}
