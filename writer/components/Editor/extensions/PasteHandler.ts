import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

/**
 * Sanitizes pasted HTML by removing external styling while keeping structural formatting.
 * This prevents the #1 Word problem: garbage formatting from pasted content.
 */
function sanitizePastedHTML(html: string): string {
  // Remove Microsoft Office conditional comments and tags
  let cleaned = html
    .replace(/<!--\[if[\s\S]*?endif\]-->/gi, '')
    .replace(/<o:p[\s\S]*?<\/o:p>/gi, '')
    .replace(/<v:[\s\S]*?<\/v:[\s\S]*?>/gi, '')
    .replace(/<w:[\s\S]*?<\/w:[\s\S]*?>/gi, '')
    .replace(/<m:[\s\S]*?<\/m:[\s\S]*?>/gi, '')
    .replace(/<!\[if !supportLists\]>[\s\S]*?<!\[endif\]>/gi, '')

  const doc = new DOMParser().parseFromString(cleaned, 'text/html')

  // Allowed structural tags
  const allowedTags = new Set([
    'p', 'br', 'div',
    'strong', 'b', 'em', 'i', 'u', 's', 'del', 'strike',
    'sub', 'sup',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'table', 'thead', 'tbody', 'tr', 'td', 'th',
    'blockquote', 'pre', 'code',
    'a', 'img', 'hr',
    'span',
  ])

  function cleanNode(node: Node): void {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      const tagName = el.tagName.toLowerCase()

      // Remove <font> tags but keep children
      if (tagName === 'font') {
        const fragment = document.createDocumentFragment()
        while (el.firstChild) {
          fragment.appendChild(el.firstChild)
        }
        el.parentNode?.replaceChild(fragment, el)
        return
      }

      // Normalize b/i to strong/em
      if (tagName === 'b' && el.parentNode) {
        const strong = document.createElement('strong')
        while (el.firstChild) strong.appendChild(el.firstChild)
        el.parentNode.replaceChild(strong, el)
        cleanNode(strong)
        return
      }
      if (tagName === 'i' && el.parentNode) {
        const em = document.createElement('em')
        while (el.firstChild) em.appendChild(el.firstChild)
        el.parentNode.replaceChild(em, el)
        cleanNode(em)
        return
      }

      // Remove all attributes except structural ones
      const attrsToRemove: string[] = []
      for (let i = 0; i < el.attributes.length; i++) {
        const attr = el.attributes[i].name
        // Keep href on links, src/alt/width/height on images
        if (tagName === 'a' && attr === 'href') continue
        if (tagName === 'img' && ['src', 'alt', 'width', 'height'].includes(attr)) continue
        // Keep colspan/rowspan on table cells
        if (['td', 'th'].includes(tagName) && ['colspan', 'rowspan'].includes(attr)) continue
        attrsToRemove.push(attr)
      }
      attrsToRemove.forEach(attr => el.removeAttribute(attr))

      // Remove non-allowed tags but keep their children
      if (!allowedTags.has(tagName)) {
        const fragment = document.createDocumentFragment()
        while (el.firstChild) {
          fragment.appendChild(el.firstChild)
        }
        el.parentNode?.replaceChild(fragment, el)
        // Process the children that were moved
        const children = Array.from(fragment.childNodes)
        children.forEach(child => cleanNode(child))
        return
      }

      // Remove empty spans
      if (tagName === 'span' && !el.hasAttributes()) {
        const fragment = document.createDocumentFragment()
        while (el.firstChild) {
          fragment.appendChild(el.firstChild)
        }
        el.parentNode?.replaceChild(fragment, el)
        return
      }
    }

    // Recursively clean children (iterate backwards since we may modify the list)
    const children = Array.from(node.childNodes)
    children.forEach(child => cleanNode(child))
  }

  cleanNode(doc.body)

  return doc.body.innerHTML
}

export const PasteHandler = Extension.create({
  name: 'pasteHandler',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('pasteHandler'),
        props: {
          transformPastedHTML(html: string) {
            return sanitizePastedHTML(html)
          },
          handlePaste(view, event) {
            // Shift+V: paste as plain text only
            if (event.shiftKey) {
              const text = event.clipboardData?.getData('text/plain')
              if (text) {
                const { tr } = view.state
                tr.insertText(text)
                view.dispatch(tr)
                return true
              }
            }
            return false // Let transformPastedHTML handle it
          },
        },
      }),
    ]
  },
})
