const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

module.exports = {
  siteUrl: siteUrl,
  generateRobotsTxt: true,
  sitemapSize: 7000,
  robotsTxtOptions: {
    additionalSitemaps: [`${siteUrl}/server-sitemap.xml`],
  },
}
