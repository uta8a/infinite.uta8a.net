class Ogp extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    const wrapper = document.createElement('a');
    const img = document.createElement('img');
    const title = document.createElement('h3');
    const desc = document.createElement('span');
    const url = document.createElement('span');
    wrapper.setAttribute('class', 'wrapper');
    img.setAttribute('class', 'image');
    title.setAttribute('class', 'title');
    desc.setAttribute('class', 'desc');
    url.setAttribute('class', 'url');

    // style
    style.textContent = `
      .wrapper {
        display: flex;
        flex-wrap: wrap;
        flex-direction: column;
        margin: auto;
        padding: 10px;
        text-decoration: none;
        border: 2px solid var(--color-link);
        border-radius: 10px;
        background-color: var(--color-line);
        width: 80%;
      }
      .wrapper:hover {
        background-color: var(--color-link-hover);
      }
      .image {
        display: block;
        margin: auto;
        border-style: none;
        max-width: 80%;
        box-sizing: content-box;
      }
      .title {
        color: var(--color-link);
        font-size: 1.1rem;
        letter-spacing: 1px;
        margin: 0px;
      }
      .url {
        color: var(--color-link);
        font-size: 1.1rem;
        letter-spacing: 1px;
        margin: 0px;
      }
    `;

    // a
    wrapper.href = this.getAttribute('url');
    wrapper.setAttribute("target", "_blank");
    wrapper.setAttribute("rel", "noreferrer noopener nofollow ");

    // image
    let imgUrl;
    if (this.hasAttributes('image') && this.getAttribute('image') !== null) {
      imgUrl = this.getAttribute('image');
    }
    img.src = imgUrl;

    // h3
    title.textContent = this.getAttribute('title');
    console.log("title = ", this.getAttribute('title'));

    // span
    // desc.textContent = this.getAttribute('description');

    url.textContent = this.getAttribute('url').split('/')[2].split('?')[0]

    // append elements
    shadow.appendChild(style);
    shadow.appendChild(wrapper);
    if (this.hasAttributes('image') && this.getAttribute('image') !== null) {
      wrapper.appendChild(img);
    }
    wrapper.appendChild(title);
    // wrapper.appendChild(desc); // TODO: 自動生成されるdescriptionの質が悪いので、いい感じにする方法を考える。現時点では自分の要約の方が良いと判断してappendを避ける
    wrapper.appendChild(url);
  }
}

/* 
<a href="url">
  <img src="image" />
  <h3>title</h3>
  <span>description</span>
  <span>url</span>
</a>
*/

customElements.define("custom-ogp", Ogp);
