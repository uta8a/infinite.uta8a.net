import { parse } from 'https://deno.land/std@0.166.0/flags/mod.ts';
import * as eta from 'https://deno.land/x/eta@v1.6.0/mod.ts';
import dayjs from 'https://cdn.skypack.dev/dayjs@v1.11.5';
import utc from 'https://cdn.skypack.dev/dayjs@v1.11.5/plugin/utc';
import timezone from 'https://cdn.skypack.dev/dayjs@v1.11.5/plugin/timezone';
import duration from 'https://cdn.skypack.dev/dayjs@v1.11.5/plugin/duration';
import relativeTime from 'https://cdn.skypack.dev/dayjs@v1.11.5/plugin/relativeTime';
import { extract, test } from 'https://deno.land/std@0.172.0/encoding/front_matter/yaml.ts';
import { parse as yamlParse, stringify } from 'https://deno.land/std@0.172.0/encoding/yaml.ts';
import { expandGlob } from 'https://deno.land/std@0.172.0/fs/expand_glob.ts';
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm.ts";
import { download } from 'https://deno.land/x/download@v1.0.1/mod.ts'
import { cryptoRandomString } from "https://deno.land/x/crypto_random_string@1.0.0/mod.ts"

// (空行)@[link](post.yml)(空行)
const embedYamlRegex = new RegExp(/\n(@\[link\]\(.+?\))\n\n/g);

const dataYamlRegex = new RegExp(/^@\[link\]\((.+?)\)$/);

type Metas = {
  title: string | undefined;
  description: string | undefined;
  image: string | undefined;
  message: string | undefined;
}

interface Data {
  title: string;
  date: string;
}
async function isExists(filepath: string): Promise<boolean> {
  try {
    const file = await Deno.stat(filepath);
    return file.isFile || file.isDirectory;
  } catch (_e) {
    return false;
  }
}

const getMetas = (html: string): Metas => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  if (doc === null) {
    return {
      title: "",
      description: "",
      image: "",
      message: "リンクにアクセスできないかもしれません",
    }
  }
  const title = doc.head.querySelector('[property="og:title"]')?.getAttribute("content");
  const description = doc.head.querySelector('[property="og:description"]')?.getAttribute("content");
  const image = doc.head.querySelector('[property="og:image"]')?.getAttribute("content");
  return {
    title: title === null ? undefined : title,
    description: description === null ? undefined : description,
    image: image === null ? undefined : image,
    message: undefined,
  }
}
const dlImage = async (url: string | undefined, entry: string) => {
  if (url === undefined) return undefined;
  const name: string = cryptoRandomString({ length: 32, type: 'alphanumeric' });
  try {
    const img = await download(url, { dir: './img' });
    let ext = img.file.split("?")[0].split(".").slice(-1)[0];
    if (ext.length >= 5) {
      ext = 'png';
    }
    Deno.rename(img.fullPath, `./img/ogp-${entry}-${name}.${ext}`);
    return `/img/ogp-${entry}-${name}.webp`; // webp link is embed
  } catch (err) {
    console.log(err);
  }
  return undefined;
}

const parseBody = async (body: string, entry: string) => {
  const raw = body.split(embedYamlRegex);
  const content = [];
  for (const line of raw) {
    if (dataYamlRegex.test(line)) {
      const dataUrl = line.replace(dataYamlRegex, '$1');
      // TODO: 直列なので並列でfetchした方がいい
      // TODO: prodのみfetchして、dev時にはfetchしない
      const rawHtml = await fetch(dataUrl);
      const html = await rawHtml.text();
      const metas = getMetas(html);
      const imageUrl = await dlImage(metas.image, entry);
      content.push(`\n<custom-ogp url="${dataUrl}" ${imageUrl ? `image="${imageUrl}"` : ''} ${metas.title ? `title="${metas.title.replace("\n", "")}"` : ''} ${metas.description ? `description="${metas.description.replaceAll("\n", "")}"` : ''}></custom-ogp>\n`);
    } else {
      content.push(line);
    }
  }
  const res = content.join("\n");
  return res;
}

// main
for await (const entry of expandGlob('./_content/*.md')) {
  // initialize img, posts directory
  const existsPosts = await isExists('./posts');
  const existsImg = await isExists('./img');
  if (existsPosts) {
    await Deno.remove('./posts', { recursive: true });
  }
  if (existsImg) {
    await Deno.remove('./img', { recursive: true });
  }
  await Deno.mkdir('./posts', { recursive: true });
  await Deno.mkdir('./img', { recursive: true });
  await Deno.copyFile('_img/_data.yml', 'img/_data.yml');
  await Deno.copyFile('_img/top-ogp-1.png', 'img/top-ogp-1.png');
  await Deno.copyFile('_img/none.png', 'img/none.png');

  // read & write md -> md
  const raw = await Deno.readTextFile(entry.path);
  const { frontMatter, body, attrs: _ } = extract<Data>(raw);
  const bodyContent = await parseBody(body, entry.name.split('.')[0]); // 2023-01-20.md => 2023-01-20
  const content = '---\n' + frontMatter + '\n---\n\n' + bodyContent;
  await Deno.writeTextFile(`./posts/${entry.name}`, content);
}

