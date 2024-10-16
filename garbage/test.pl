#!/usr/bin/env perl
use strict;
use warnings;
use Playwright;

# Function for taking URLs from XML string
sub parseSitemap {
    my ($xml) = @_;
    my $parsed_result = Playwright::XML2JS($xml);
    my $urls = $parsed_result->{urlset}{url};
    my @result = map { $_->{loc} } @$urls;
    return \@result;
}

# Filtering urls from sitemap
sub filterSitemapURLs {
    my ($urls) = @_;
    return [grep { $_ =~ /\/sitemap|\.xml$/ } @$urls];
}

my $handle = Playwright->new();
my $browser = $handle->launch();
my $context = $browser->newContext();
my $page = $context->newPage();

# set errors to console
$page->on('response', sub {
    my ($response) = @_;
    unless ($response->ok()) {
        my $url = $response->url();
        my $status = $response->status();
        print STDERR "ERROR during checking: $url, status ($status)\n";
    }
});

# List of URL`s, it could be simple URL, or sitemap.xml for taking URLs
my @URLs = (
    # 'https://hostiserver.com/sitemap.xml', # URL WITH SITEMAP
    'https://test.hsdevops.net/sitemap.xml',
    # 'http://193.84.17.52/content-loader/sitemap.xml', # this is for TESTs
    # 'https://devil.hsdevops.net/community/articles/how-chrome-68-release-affects-http-website', # this is for TESTs
    # 'https://test.hsdevops.net/sitemap/', # this is for TESTs
    # 'http://193.84.17.52/content-loader/second-page' # this is for TESTs
);

# filtering urls on sitemaps
my $sitemapURLs = filterSitemapURLs(\@URLs);

# check URL`s
for my $url (@$sitemapURLs) {
    print "Opening page: $url\n";
    eval {
        # if URL - is sitemap, we`ll taking urls from sitemap
        if ($url =~ /\/sitemap|\.xml$/) {
            my $response = Playwright::Sync::network()->fetch($url);
            my $sitemapXml = $response->{body};
            my $urls = parseSitemap($sitemapXml);
            # checking URLs from sitemap
            for my $sitemapUrl (@$urls) {
                print "Opening page from sitemap: $sitemapUrl\n";
                eval {
                    $page->goto($sitemapUrl, { waitUntil => "load" });
                    print "Download is OK: $sitemapUrl\n";
                };
                if ($@) {
                    my $error_message = $@;
                    print STDERR "ERROR due opening URL from sitemap: $sitemapUrl, $error_message\n";
                }
            }
        } else { # if URL is not for sitemap
            $page->goto($url, { waitUntil => "load" });
            print "Download is OK: $url\n";
        }
    };
    if ($@) {
        my $error_message = $@;
        print STDERR "ERROR while opening URL: $url, $error_message\n";
    }
}

$browser->close();
