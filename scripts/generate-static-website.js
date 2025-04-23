const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');

/**
 * Generate HTML template
 */
function createTemplate(title, content) {
    return `<!DOCTYPE html>
        <html lang="fr">
          <head>
          <meta charset="UTF-8">
          <meta content="width=device-width, initial-scale=1.0" name="viewport">
          <title>${title} - CodeChronicle</title>
        <style>
          body {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: system-ui, -apple-system, sans-serif;
        }
          nav { margin-bottom: 2rem; }
          article { margin-bottom: 2rem; }
        </style>
        </head>
        <body>
        <nav><a href="/">← Retour à l'accueil</a></nav>
        ${content}
        </body>
        </html>`;
}

/**
 * Create index page
 */
function createIndexPage(articles) {
  const content = `
    <h1>CodeChronicle</h1>
    ${articles.map(article => `
      <article>
        <h2>${article.title}</h2>
        <p>${article.summary}</p>
        <p><a href="${article.slug}.html">Lire l'article</a></p>
      </article>
    `).join('')}
  `;
  return createTemplate('Accueil', content);
}

/**
 * Generate static website
 */
/**
 * Generate static website
 */
async function generateWebsite() {
  try {
    // Create public directory
    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    // Read blog directory
    const blogDir = path.join(__dirname, '../blog');
    const files = fs.readdirSync(blogDir)
      .filter(file => file.endsWith('.md'));

    const articles = [];

    // Process each markdown file
    for (const file of files) {
      const filePath = path.join(blogDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const { data, content: markdown } = matter(content);
      const htmlContent = marked(markdown);
      const slug = path.basename(file, '.md');

      // Vérifier si title et summary existent dans le frontmatter
      const title = data.title ? data.title.replace(/^["'](.*)["']$/, '$1') : slug;
      const summary = data.summary ? data.summary.trim() : '';

      articles.push({
        title: title,
        summary: summary,
        slug: slug
      });

      // Save article HTML
      const articleHtml = createTemplate(title, htmlContent);
      fs.writeFileSync(
        path.join(publicDir, `${slug}.html`),
        articleHtml
      );
    }

    // Create index page
    const indexHtml = createIndexPage(articles);
    fs.writeFileSync(
      path.join(publicDir, 'index.html'),
      indexHtml
    );

    console.log('Site generated successfully!');
  } catch (error) {
    console.error('Error generating site:', error);
    process.exit(1);
  }
}

// Run the generator
generateWebsite().then(r => {
    console.log('Static website generated successfully!');
});