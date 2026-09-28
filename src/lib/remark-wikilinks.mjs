import { compileLinks } from './knowledge.mjs';
import { readArticles } from './content-index.mjs';

export default function remarkWikilinks() {
  return (tree, file) => {
    compileLinks(tree, readArticles(), file.path || 'content');
  };
}
