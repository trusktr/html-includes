# HTML Includes

An ultra simple proposal to allow composition of HTML files in web browsers,
allowing for out-of-the-box organization of HTML code.

# Pseudo Polyfill

[Live example](https://trusktr.github.io/html-includes/)

See `index.html`.

Run `npm clean-install && npm start` (or start any local static server of your
choosing) to try the example locally.

> [!Note]
> It's a "pseudo polyfill" because an `<x-link rel="html">` custom element is used
> in place of `<link rel="html">` to demo the desired feature behavior. As far as
> I'm aware, it is not possible to implement a synchronous polyfill (especially
> after the removal of DOM Mutation Events).

# Why?

There is currently no way to write an HTML file (or send one to a browser from a
backend) and have that HTML file load other HTML files to compose them into the
overall HTML that the browser will render.

Here's a sample HTML file located at the hypothetical location `example.com/page1.html`:

```html
<!-- example.com/page1.html -->
<body>
  <style>
    #header {
      /* ... styles for the header ... */
    }
  </style>

  <header id="header">
    <h1>My Site</h1>
    <nav>
      <a href="/page1.html">Page 1</a>
      <a href="/page2.html">Page 2</a>
      ... etc, f.e. more links to other pages ...
    </nav>
  </header>

  <script>
    doSomethingWith(header) // maybe there is special header logic
  </script>

  <p>This is some page1 content.</p>
</body>
```

When we access `example.com/page1.html` in our browser, that HTML "file" gets sent
to our browser and rendered.

Now imagine that we want to write multiple HTML pages as simply separate `.html`
files, and we want to re-use this `<header>` across all the pages. Here's a
hypothetical HTML file located at `example.com/page2.html`:

```html
<!-- example.com/page2.html -->
<body>
  <style>
    #header {
      /* ... styles for the header ... */
    }
  </style>

  <header id="header">
    <h1>My Site</h1>
    <nav>
      <a href="/page1.html">Page 1</a>
      <a href="/page2.html">Page 2</a>
      ... etc, f.e. more links to other pages ...
    </nav>
  </header>

  <script>
    doSomethingWith(header) // maybe there is special header logic
  </script>

  <p>This is some page2 content.</p>
</body>
```

Note that we have duplicated the `<header>` code across both the `page1.html` and
`page2.html` files (i.e. pages).

As our app grows, this is a problem: we don't want to be duplicating code across
files, as that's more work, plus we have to update multiple locations if we want
to update the header which can be error-prone, or we have to import separate
JavaScript files (or JS frameworks like React, Vue, Svelte, etc) just to have a
way to split HTML (DOM) into separate files for organization of our website.

HTML Includes offers a very simple mechanism for browsers to give web developers
the smallest possible feature to compose HTML files together, allowing for code
organization for even the most basic of web apps (without requiring JavaScript,
frameworks (React/Vue/Svelte/etc), or build tools).

With HTML Includes, we would be able to put the `<header>` HTML into its own
file at `example.com/header.html`,

```html
<!-- example.com/header.html -->
<style>
  #header {
    /* ... styles for the header ... */
  }
</style>

<header id="header">
  <h1>My Site</h1>
  <nav>
    <a href="/page1.html">Page 1</a>
    <a href="/page2.html">Page 2</a>
    ... etc, f.e. more links to other pages ...
  </nav>
</header>

<script>
  doSomethingWith(header) // maybe there is special header logic
</script>
```

and then import it into any other files that need it. Here are the updated
`page1.html` and `page2.html` files (i.e. web pages):

```html
<!-- example.com/page1.html -->
<body>
  <link rel="html" href="./header.html" />

  <p>This is some page1 content.</p>
</body>
```

```html
<!-- example.com/page2.html -->
<body>
  <link rel="html" href="./header.html" />

  <p>This is some page2 content.</p>
</body>
```

The `header.html` file could later be updated to further include content from another file (or 3rd party library):

```html
<!-- example.com/header.html -->
<link rel="html" href="awesome-header.com/styles.css" />

<style>
  #header {
    /* ... styles for the header ... */
  }
</style>

<header id="header" class="awesome-header">
  <h1>My Site</h1>
  <nav>
    <a href="/page1.html">Page 1</a>
    <a href="/page2.html">Page 2</a>
    ... etc, f.e. more links to other pages ...
  </nav>
</header>

<script>
  doSomethingWith(header) // maybe there is special header logic
</script>
```

# Workarounds

Before describing the benefits of HTML Includes, let's first talk about the workaround and the downsides of those:

- If we have a static website (i.e. the server is "dumb", it only serves files,
  there is no backend logic) then our only option is to use JavaScript (including
  but not limited to the JS-based Custom Elements API) to fetch separate HTML
  files (or JS files containing DOM generated with JavaScript) and piece them
  together. In fact, this is how a polyfill for HTML Includes is crafted.
  **Downsides:**

  - Requires JavaScript, which does not always work (for example when JavaScript is disabled on the client).
  - The author has to implement a
    non-standard JavaScript implementation of fetching and "include" other HTML files into the
    resulting overall HTML. If other authors want to do this, they have to implement
    something too, or import a library. Having a standard way to do it would make it a commonality in web development.
  - Search engines, AIs, and other bots that read websites, cannot rely on
    arbitrary JavaScript implementations in order to see the finalized HTML result,
    therefore a JavaScript approach is not reliable for SEO. Plus, only _some_ search engines, let alone AIs, run
    JavaScript, and if they do, it is not reliably (they might cut off a result if it times out).

- If we have a dynamic server (a smart one that can run logic, such as with PHP
  or Node.js with backend templating), the backend can concatenate multiple HTML
  strings together to generate the final HTML result (whether from separate files,
  other network endpoints, or generated from code logic).
  - Although this is good for SEO because bots (search engines and AIs) can
    receive the finalized HTML result as a single "file" (a single payload), not
    everyone has the resources to create, host, and maintain a backend smart
    server, let alone do that for what is otherwise just a simple static website.

# Benefits

- Better out-of-the-box developer experience using default web APIs.
- Easier to maintain a variety of websites without JS, frameworks, or build tools.
- Bots (search engines, AIs, etc) would have a standard they can rely on for
  composing the final result of an HTML page, without having to run JavaScript.
- No need for developers to spend resources making dynamic servers just for code
  organization of what are otherwise simple static websites.
- CSS and JS both already have a way to organize code in separate files with
  `@import`, `<script type="module">` and `import`, and `<script>`. Now HTML would
  finally be up to par.

# Use cases besides code organization

- Organizing code without JavaScript so that a website still has essential
  functionality when JavaScript is disabled, still without needing frameworks or
  build tools.

# Future Benefits

- When other proposals like `Declarative Custom Elements` (DCE) become a reality,
  JavaScript-less custom elements can be defined and organized in separate files,
  included into the main file (or from other files).

  - Expanding the earlier page1 and page2 examples:

    ```html
    <!-- example.com/page1.html -->
    <body>
      <link rel="html" href="./header.html" />

      <!-- some-option is used for page1 -->
      <my-header some-option="doit"></my-header>

      <p>This is some page1 content.</p>
    </body>
    ```

    ```html
    <!-- example.com/page2.html -->
    <body>
      <link rel="html" href="./header.html" />

      <!-- some-option is not used for page2 -->
      <my-header></my-header>

      <p>This is some page2 content.</p>
    </body>
    ```

    ```html
    <!-- example.com/header.html -->
    <!-- This is a contrived example, the DCE may look different. -->
    <customelement tag="my-header" shadowroot="open">
      <attribute name="some-option" prop />

      <link rel="html" href="awesome-header.com/styles.css" />

      <style>
        #header {
          /* ... styles for the header ... */
        }
      </style>

      <header id="header">
        <h1>My Site</h1>
        <nav>
          <a href="/page1.html">Page 1</a>
          <a href="/page2.html">Page 2</a>
          ... etc, f.e. more links to other pages ...
        </nav>
      </header>

      <script>
        // This is a contrived example, we don't know what *exactly* the mechanics
        // for custom elements JS are yet.
        class MyEl extends HTMLElement {
          attributeChangedCallback(attr) {
            // maybe there is special header logic
            if (attr === 'some-option') {
              if (this.someOption === 'doit') doSomethingWith(this.idrefs.header)
              else undoSomethingWith(this.idrefs.header)
            }
          }
        }
      </script>
    </customelement>
    ```

    When we finally land a template binding syntax, it could be possible to
    include custom elements from HTML files that do not have any JavaScript but
    that could dynamically update based on attributes interpolated into their
    templates, allowing for dynamic HTML even without a single line of
    JavaScript.

- Secure HTML delivered provided by the end users of a website. This would allow, for example,
  users to specify HTML for content (such as user profiles on a social network
  site that allows customized profiles (remember MySpace?)).
  - A special attribute could disable JS, global-modifying elements like `<base>`, enable style scoping via ShadowDOM, and enable strict css containment: `<link rel="html" href="./user/123.html" isolated>`
    - For example if JS or other forbidden items are included, an error or warning is shown
      in console (or nothing at all, but messages are helpful), and those items are
      effectively removed and have no impact.
  - Maybe later there could be attributes for specifying a list of allowed or
    disallowed elements, allowed or disallowed stylable elements, allowed or
    disallowed style properties, and allowed or disallowed attributes.
    - This is not necessary for a first MVP, just an idea that is _possible_
      to add later.

# Downsides

- As with separate JS scripts and CSS stylesheets loaded with `<script>` and
  `<link rel="stylesheet">`, this means more network requests for multiple HTML
  files. However when the performance hit matters, developers will be able to take
  tools that have been built to handle the new HTML Includes system and
  concatenate files together into single HTML "bundles".
  - The gain in developer utility is worth the cost. Keep in mind that we can
    make very badly performaing websites today with separate JS and CSS files, and
    we can optimize these with build tools when it is worth it, so there's no need
    to block developer productivity based on the idea that HTML Includes could add
    more network requests, and for a wide variety of use cases the performance
    cost won't matter.
  - Browsers also have caching abilities, so subsequent changes to a single
    HTML file will not mean that when a page is re-visited all
    HTML files need to be re-downloaded.
  - Modern HTTP/3 static web servers with server push will also be able to send multiple HTML

# Semantics

The design of HTML Includes (at least the first version) is meant to be as
minimal as possible: the result of including an HTML file should be effectively
the same as if the included HTML had been written directly inline instead of
being included. This simplicity makes the mental model simple and immediately
useful, and it also makes it easy for future build tools to easily optimize web
apps by bundling HTML from external files into a single file for production
using standard semantics (bundlers like Parcel would be updated to support
this).

This example,

```html
<!-- hello.html -->
<h1 id="title">hello</h1>
<style>
  /*...*/
</style>
<script>
  /*...*/
</script>
... any other HTML elements of any kind ...
```

```html
<!-- index.html -->
<link rel="html" href="./hello.html" />
<p>content</p>
```

would be as similar as possible to having written a single file like this:

```html
<!-- index.html -->
<!-- hello.html -->
<h1 id="title">hello</h1>
<style>
  /*...*/
</style>
<script>
  /*...*/
</script>
... any other HTML elements of any kind ...
<p>content</p>
```

- Features like `document.querySelector('#title')` would work the same either
  way. The `#title` element in the previous example would be queryable regardless
  if it were included vs written inline.
- The first version would default to synchronous, just like traditional non-module
  `<script>`s, `<link rel="stylesheet">`, and CSS `@import`.
  - In the future, we could expand this to add attributes for making it async if
    that would be desirable, but in the interest of making the simplest possible
    initial version that could benefit a wide variety of vanilla web API users, this would be left for a future addition.
    - If browser implementors all believe they would have no issue adding
      additional features such as async capabilities (and the additional semantics
      those features require), then by all means, but the goal here is to give the
      great utiility to end vanilla web API users sooner, while leaving the MVP
      design expandable for addons.
- With this simple design, future features like Declarative Custom Elements or
  reactive bindigs for `<template>`s would entirely decoupled, and would work with
  HTML Includes. A person including DCEs or binded templates from external files
  would simply experience the same behavior as if they wrote thos things inline
  instead of including them.

  Hypothetically, this,

  ```html
  <!-- stuff.html -->
  <!-- (contrived example, API shape could be very different, but still declarative) -->
  <customelement tag="my-el">
    ... element definition ...

    <template inlined shadowroot="open"> Name: {{name}} </template>
  </customelement>

  <template inlined> some value: {{value}} </template>
  ```

  ```html
  <!-- index.html -->
  <body>
    <link rel="html" href="./stuff.html" />
    <my-el name="Joe"></my-el>
  </body>
  ```

  would be exactly as having written everything inline like this:

  ```html
  <!-- index.html -->
  <body>
    <!-- stuff.html -->
    <!-- (contrived example, API shape could be very different, but still declarative) -->
    <customelement tag="my-el">
      ... element definition ...

      <template inlined shadowroot="open"> Name: {{name}} </template>
    </customelement>

    <template inlined> some value: {{value}} </template>
    <my-el name="Joe"></my-el>
  </body>
  ```

  _In the future_, we could possibly add more semantics such as when a custom
  element is included into a ShadowRoot document it automatically being
  registered in the root's scoped custom element registry via an opt-in feature
  (such as an attribute on the include element), but the value proposition is to
  not delay the utility of a simple includes mechanism for advanced ideas like
  custom element scoping.

## Questions to iron out:

1. How does the include mechanism replace/append/show/reveal the included HTML
   content in the importing document?
   1. Do we replace the include elements (whether `<link>`, `<include>` or
      something else, see below) with their content, so the end result is simply
      the DOM as it would have been written if everything were inline?
   1. Or do we leave the element there, with user agent `display:contents` styling, and
      append the included content as children of the element (this might not work with
      `<link>`, but a new `<include>` element could have this feature, some bike shedding
      below).
      - This would be similar to how `<template shadowroot>` is replaced with a `ShadowRoot`.
      - Would it make sense then to add a new `<template include="./foo.html">` that
        similarly removes itself? (some bike shedding below)
   1. Or do we not replace or append to children, and instead provide a new properly
      in the include element (whether `<link>`, `<include>` or something else) for
      accessing the included DOM (and APIs like `document.querySelector` are updated
      so that they include finding references via this new property, and unlike with
      ShadowDOM this new property would not block such APIs from seeing included
      elements)?
      - f.e. `el.included` could be a `NodeList`.
2. What cross-origin security semantics are needed?
   - Because the HTML Includes in its simplest form should be effectively the
     same as inling HTML, the same security features (CORS) that apply to linked
     style sheets or scripts would simply be the same as before.
   - Maybe the only new aspect to add here is CORS for included HTML files (one
     origin could disallow their HTML from being included into other origins,
     which would be similar to an origin blocking their HTML from being iframed in
     other origins).
3. What should happen when someone tries to include a file with a non-HTML mime type?
4. What else? (with simplicity in mind)

# Bike shedding

There are various ways to make the HTML interface:

```html
<!-- Add the functionality to the <link> element? This would align with the existing way that style sheets are "included" -->
<link rel="html" href="./header.html" />

<!-- Or make a new element for it? -->
<include src="./header.html" />

<!-- Or augment the template interface? This might be tricky, as there are
already multiple ways to use a <template>.
    
For type safe environments (JSX, Vue, Svelte, etc) it is nicer from a developer
experience perspective to have separate elements with their own
attributes/props, as a logical organizational unit, and the following approach
(or the <link> approach) does not fit nicely with that idea. 

This can also conflict with future ideas like template binding syntax (we would
then have to answer the question how does binding work on a template that also
includes?). Perhaps it is better to keep those features separated, and people
can put `<template>`s in separate HTML files instead of HTML files also being
templates. -->
<template include="./header.html"></template>
```

Why don't we have `<style src>` like `<script src>`? The following would bring
about some consistency in patterns:

```html
<style src="./style.css"></style>
<include src="./header.html" />
<script src="./script.js"></script>
```

Perhaps the element should be non-void, and it would have fallback content (plus this would align with the approach of appending included children to the include element, if we went with that approach):

```html
<!-- Assuming here that we went with append-included-children-to-the-element -->
<include id="headerContent" src="./header.html"></include>

<script>
  console.log(...headerContent.children) // logs all the included children.
</script>
```

# Alternatives

## HTML Modules

The concept of HTML Modules is very different from HTML Includes. HTML Modules
are designed to be a way to import (from HTML files) into JavaScript modules,
and they provide semantics that expose various types of DOM objects to
JavaScript via `import`. This does not simply "include" HTML content from one
HTML file into another HTML file.

HTML Modules work something like this:

```html
<!-- stuff.html -->

<style export="someStyle">
  .foo {
    /*... some styles ...*/
  }
</style>

<template export-default> <p>some content</p> </template>

<div export="someDiv">... some div with some content ...</div>

<!-- In the future, we could also export DCEs, but HTML Modules could in
theory come out before DCEs are out. -->
<customelement tag="my-el" export="MyEl"> ... element definition ... </customelement>
```

```js
// index.js

import template, {someStyle, someDiv} from './stuff.html'

console.log(template, someStyle, someDiv)

// logs something like: HTMLTemplateElement, HTMLStyleElement, HTMLDivElement (semantics still to be figured out)
```

As you can see from this example, although HTML Modules could be useful,

- they are more complicated and will take a longer time to design and spec,
- they rely on JavaScript, meaning that they only work with JavaScript enabled
  (unless we come up with some sort of semantics to use HTML Modules in HTML files
  without JavaScript, or maybe HTML Modulization could be an addon to HTML
  Includes for later)
- they could be released later while HTML Includes could be released sooner to give web developers a simple and effective way to start organizing web apps _without javascript being required_.
  - HTML Modules could exist (later) independently from HTML Imports.

## HTML Imports (Discontinued)

The discontinued HTML Imports may _seem_ similar to HTML Includes, but they are
different: HTML Imports are a concept [from
2011](https://webmasters.stackexchange.com/a/127491/6010) ([draft published
2013](https://www.w3.org/TR/2013/WD-html-imports-20130514/)) before JavaScript
modules were designed in ES6 in 2015 (ES2015), crafted as a method for importing DOM
references into JavaScript (just like the purpose of HTML Modules). HTML Imports
worked by means of creating a `Document` instance from an imported HTML file,
from which JavaScript code could then pluck DOM reference out of.

Now that we have JavaScript modules, it makes much more sense to define a new
HTML Modules spec that allows JavaScript to import DOM references from
separate HTML files using standard `import` syntax.

This code,

```html
<!-- index.html -->
<script type="module" src="./index.js"></script>
```

```js
// index.js
import doSomething from 'somewhere'
// (see stuff.html from the example above)
import template, {someStyle, someDiv} from './stuff.html'

doSomething(template, someStyle, someDiv)
```

is much cleaner than the following code for obvious reasons:

```html
<!-- index.html -->
<!-- (see stuff.html from the example above) -->
<link rel="import" href="./stuff.html" id="stuff-import" />
<script type="module" src="./index.js"></script>
```

```js
// index.js
import doSomething from 'somewhere'

const link = document.querySelector('#stuff-import')
const someStyle = link.import.querySelector('[export="someStyle"]')
const someDiv = link.import.querySelector('[export="someDiv"]')
const template = link.import.querySelector('[export-default]')

doSomething(template, someStyle, someDiv)
```

The second example is a _second_ way to import things into JS from separate
(HTML) files. We definitely do not want multiple _entirely different_ ways of
importing things into JavaScript, we want a single consistent standard way using
`import` syntax. Not only are the two methods very different in code form, but
they differ significatly in runtime semantics as well: for example the `href`
attribute on the `<link>` element is relative to the HTML document (the URL in
the browser address bar) while the `import` path in the JS module is relative to
the JS module (much more intuitive and convenient, as well very flexibly
overridable using JS module import maps).
