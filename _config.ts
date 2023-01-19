import lume from "lume/mod.ts";
import basePath from "lume/plugins/base_path.ts";
import blog from "https://raw.githubusercontent.com/uta8a/theme-simple-blog-for-me/for-infinite-uta8a-net/mod.ts";
import imagick from "lume/plugins/imagick.ts";

const site = lume({
  location: new URL("https://infinite.uta8a.net/")
});

site.use(blog());
site.use(basePath());
site.use(imagick());

export default site;
