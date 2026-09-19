import { Head } from 'vite-react-ssg';

interface SeoProps {
    title: string;
    description: string;
    canonical?: string;
    ogImage?: string;
    ogType?: 'website' | 'article' | 'profile';
    twitterCard?: 'summary' | 'summary_large_image';
    keywords?: string[];
    schema?: Record<string, unknown>;
    noindex?: boolean;
}

// `canonical` NO tiene valor por defecto a propósito: si lo tuviera (la portada),
// cualquier página que no lo pase — el 404 incluido — se declararía canónica a la
// home. Cada página declara el suyo; las que no deben indexarse no declaran ninguno.
const Seo = ({
    title,
    description,
    canonical,
    ogImage = 'https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-2-scaled.webp',
    ogType = 'website',
    twitterCard = 'summary_large_image',
    keywords = [],
    schema,
    noindex = false
}: SeoProps) => {
    const siteTitle = 'Touza - Cocktail Bar Premium en Crevillente';
    const fullTitle = title === siteTitle ? title : `${title} | Touza Cocktail Bar`;

    return (
        <Head>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords.join(', ')} />
            {noindex && <meta name="robots" content="noindex, nofollow" />}
            {canonical && <link rel="canonical" href={canonical} />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            {canonical && <meta property="og:url" content={canonical} />}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:site_name" content="Touza Cocktail Bar" />
            <meta property="og:locale" content="es_ES" />

            {/* Twitter */}
            <meta name="twitter:card" content={twitterCard} />
            {canonical && <meta name="twitter:url" content={canonical} />}
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            {/* Schema.org Structured Data */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Head>
    );
};

export default Seo;
