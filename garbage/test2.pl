use strict;
use warnings;
use Playwright;

# Function for taking URLs from XML string
sub parseSitemap {
    my ($xml) = @_;
    my @urls;
    XML::Simple::XMLin($xml)->{urlset}->{url}->[0]->{loc} foreach $xml;
    return @urls;
}

# Filtering urls from sitemap
sub filterSitemapURLs {
    my (@urls) = @_;
    my @filtered_urls;
    foreach my $url (@urls) {
        push @filtered_urls, $url if $url =~ m{/sitemap} || $url =~ m{\.xml};
    }
    return @filtered_urls;
}

my $playwright = Playwright->new();
my $browser = $playwright->chromium->launch(headless => 1);
my $context = $browser->new_context();
my $page = $context->new_page();

# List of URLs, it could be simple URL, or sitemap.xml for taking URLs
my @URLs = (
    # 'https://hostiserver.com/sitemap.xml', # URL WITH SITEMAP 
    'https://devil.hsdevops.net/sitemap.xml',
    # 'http://193.84.17.52/content-loader/sitemap.xml', # this is for TESTs
    # 'https://devil.hsdevops.net/community/articles/how-chrome-68-release-affects-http-website', # this is for TESTs
    # 'https://test.hsdevops.net/sitemap/', # this is for TESTs
    # 'http://193.84.17.52/content-loader/second-page' # this is for TESTs
);

# Filtering URLs on sitemaps
my @sitemapURLs = filterSitemapURLs(@URLs);

# Check URLs
foreach my $url (@sitemapURLs) {
    print "Opening page: $url\n";
    eval {
        # If URL is sitemap, we'll take URLs from sitemap
        if ($url =~ m{/sitemap} || $url =~ m{\.xml}) {
            my $response = HTTP::Tiny->new->get($url);
            my $sitemapXml = $response->{content};
            my @urls = parseSitemap($sitemapXml);
            # Checking URLs from sitemap
            foreach my $sitemapUrl (@urls) {
                print "Opening page from sitemap: $sitemapUrl\n";
                eval {
                    $page->goto($sitemapUrl, waitUntil => "load");
                    print "Download is OK: $sitemapUrl\n";
                } or do {
                    print "ERROR due opening URL from sitemap: $sitemapUrl, $@\n";
                };
            }
        } else { # If URL is not for sitemap
            $page->goto($url, waitUntil => "load");
            print "Download is OK: $url\n";
        }
    } or do {
        print "ERROR while opening URL: $url, $@\n";
    };
}

$browser->close();
