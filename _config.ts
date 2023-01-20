import lume from "lume/mod.ts";
import basePath from "lume/plugins/base_path.ts";
import blog from "https://raw.githubusercontent.com/uta8a/theme-simple-blog-for-me/81ed37fd0643dd794a6955379928b2a2735037cf/mod.ts";
import imagick from "lume/plugins/imagick.ts";

const markdown = {
  options: {
    html: true,
    breaks: true,
    typographer: true,
  },
};

const site = lume({
  location: new URL("https://infinite.uta8a.net/")
}, { markdown });

site.use(blog());
site.use(basePath());
site.use(imagick());

export default site;
