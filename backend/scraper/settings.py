BOT_NAME = "aqi_scraper"

SPIDER_MODULES = ["scraper"] # Assuming running from inside backend/
NEWSPIDER_MODULE = "scraper"

# Validate robots.txt?
ROBOTSTXT_OBEY = True

ITEM_PIPELINES = {
   "scraper.pipelines.SaveToPostgresPipeline": 300,
}

# Request delay to be polite
DOWNLOAD_DELAY = 2
