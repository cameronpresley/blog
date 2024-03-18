---
draft: false
date: 2024-03-19
authors:
  - cameronpresley
description: >
  Learning the difference between Bubble and Capture for Events

categories:
  - Today I Learned

hide:
  - toc
---

# Today I Learned – The Difference Between Bubble and Capture for Events

I've recently been spending some time learning about [Svelte](https://learn.svelte.dev/tutorial/welcome-to-svelte) and have been going through the tutorials.

When I made it to the [event modifiers](https://learn.svelte.dev/tutorial/event-modifiers) section, I saw that there's a modifier for `capture` where it mentions firing the handler during the _capture_ phase instead of the _bubbling_ phase.

I'm not an expert on front-end development, but I'm not familiar with either of these concepts. Thankfully, the Svelte docs refer out to [MDN](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_capture) for a better explanation of the two.

### What is Event Bubbling?
Long story short, by default, when an event happens, the element that's been interacted with will fire first and then each parent will receive the event.

So if we have the following HTML structure where there's a `body` that has a `div` that has a `button`

```html
<body>
  <div id="container">
    <button>Click me!</button>
  </div>
  <pre id="output"></pre>
</body>
```

With the an event listener at each level:

```js
// Setting up adding string to the pre element
const output = document.querySelector("#output");
const handleClick = (e)=> output.textContent += `You clicked on a ${e.currentTarget.tagName} element\n`;

const container = document.querySelector("#container");
const button = document.querySelector("button");

// Wiring up the event listeners
document.body.addEventListener("click", handleClick);
container.addEventListener("click", handleClick);
button.addEventListener("click", handleClick);
```

And we click the button, our `<pre>` element will have:

```
You clicked on a BUTTON element
You clicked on a DIV element
You clicked on a BODY element
```
### What is Event Capturing?

Event Capturing is the opposite of Event Bubbling where the root parent receives the event and then each inner parent will receive the event, finally making it to the innermost child of the element that started the event.

Let's see what happens with our example when we use the capture approach.

```js
// Wiring up the event listeners
document.body.addEventListener("click", handleClick, {capture:true});
container.addEventListener("click", handleClick, {capture:true});
button.addEventListener("click", handleClick, {capture:true});
```

After clicking the button, we'll see the following messages:

```
You clicked on a BODY element
You clicked on a DIV element
You clicked on a BUTTON element
```

### Why Would You Use Capture?

By default, events will work in a _bubbling_ fashion and this intuitively makes sense to me since the element that was interacted with is most likely the right element to handle the event.

One case that comes to mind is if you finding yourself attaching the same event listener to every child element. Instead, we could move that up.

For example, let's say that we had the following layout

```html
<div>
    <ul style="list-style-type: none; padding: 0px; margin:0px; float:left">
      <li><a id="one">Click on 1</a></li>
      <li><a id="two">Click on 2</a></li>
      <li><a id="three">Click on 3</a></li>
    </ul>
  </div>
```
```css

li {
  list-style-type: none;
  padding: 0px;
  margin:0px;
  float:left
}

li a {
  color:black;
  background:#eee;
  border: 1px solid #ccc;
  padding: 10px 15px;
  display:block
}
```
Which gives us the following layout

<!-- <body> -->
  <div>
    <ul>
      <li style="list-style-type: none; padding: 0px; margin:0px; float:left"><a style="color:black; background:#eee; border: 1px solid #ccc; padding: 10px 15px; display:block" id="one">Click on 1</a></li>
      <li style="list-style-type: none; padding: 0px; margin:0px; float:left"><a style="color:black; background:#eee; border: 1px solid #ccc; padding: 10px 15px; display:block" id="two">Click on 2</a></li>
      <li style="list-style-type: none; padding: 0px; margin:0px; float:left"><a style="color:black; background:#eee; border: 1px solid #ccc; padding: 10px 15px; display:block" id="three">Click on 3</a></li>
    </ul>
  </div>

With this layout, let's say that we need to do some business rules for when any of those buttons are clicked. If we used the bubble down approach, we would have the following code:

```js
// Stand-in for real business rules
function handleClick(e) {
  console.log(`You clicked on ${e.target.id}`);
}
// Get all the a elements
const elements = document.querySelectorAll("a");
// Wire up the click handler
for (const e of elements) {
  e.addEventListener("click", handleClick);
}
```

This isn't a big deal with three elements, but let's pretend that you had a list with tens of items, or a hundred items. You may run into a performance hit because of the overhead of wiring up that many event listeners.

Instead, we can use one event listener, bound to the common parent. This can accomplish the same affect, without as much complexity.

Let's revisit our JavaScript and make the necessary changes.

```js
// Stand-in for real business rules
function handleClick(e) {
  // NEW: To handle the space of the unordered list, we'll return early
  // if the currentTarget is the same as the original target
  if (e.currentTarget === e.target) {
    return;
  }
  console.log(`You clicked on ${e.target.id}`);
}
// NEW: Getting the common parent
const parent = document.querySelector("ul");
// NEW setting the eventListener to be capture based
parent.addEventListener("click", handleClick, {capture:true});
```

With this change, we're now only wiring up a single listener instead of having multiple wirings.

### Wrapping Up

In this post, we looked at two different event propagation models, _bubble_ and _capture_, the differences between the two and when you might want to use _capture_.
